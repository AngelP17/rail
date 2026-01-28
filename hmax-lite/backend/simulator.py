"""
HMAX-Lite: Train Simulator Engine
==================================

Physics-based simulation of active trains on Panama Metro Lines 1, 2, and 3.
Generates realistic telemetry including:
- GPS position interpolation between stations
- Speed curves with acceleration/deceleration
- B-CHOP regenerative braking simulation
- Tunnel geofencing and communication mode switching
"""

import math
import random
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Tuple, Dict

from stations import (
    LINE_1_STATIONS,
    LINE_2_STATIONS,
    LINE_3_STATIONS,
    LINE_METADATA,
    MetroLine,
    get_station_index,
    is_in_tunnel_section,
    TUNNEL_ENTRY_STATION,
    TUNNEL_EXIT_STATION,
)
from models import TrainStatus, TrainPosition, TelemetryData


# =============================================================================
# Physics Constants
# =============================================================================

MAX_SPEED_KMH = 80.0           # Maximum speed on straightaways
STATION_DWELL_TIME = 15.0      # Seconds to wait at each station
ACCELERATION_RATE = 1.2        # m/s² (realistic for metro trains)
DECELERATION_RATE = 1.0        # m/s² (gentler braking for passenger comfort)

# Braking thresholds (percentage of route to next station)
BRAKE_START_PROGRESS = 0.75    # Start decelerating at 75% of segment
ACCEL_END_PROGRESS = 0.25      # Finish accelerating at 25% of segment

# Telemetry ranges
MIN_REGEN_TEMP = 40.0          # °C
MAX_REGEN_TEMP = 90.0          # °C
BASE_ENERGY_RECOVERY_RATE = 0.15  # kWh per second while braking


@dataclass
class TrainState:
    """Internal state for a simulated train."""
    train_id: str
    train_name: str
    line: MetroLine
    current_station_idx: int
    progress: float = 0.0  # 0 to 1 progress between stations
    direction: int = 1     # 1 = forward, -1 = reverse
    speed_kmh: float = 0.0
    at_station: bool = True
    station_dwell_remaining: float = 0.0
    total_energy_recovered: float = 0.0
    regen_temp: float = 45.0
    last_update_time: float = field(default_factory=time.time)


class LineSimulator:
    """
    Simulates trains operating on a single metro line.
    
    Physics Model:
    - Trains interpolate positions between station coordinates
    - Speed follows trapezoidal velocity profile (accel → cruise → decel)
    - Regenerative braking activates during deceleration
    - Tunnel geofencing triggers communication mode changes
    """

    def __init__(self, line: MetroLine, num_trains: int = 3):
        self.line = line
        self.num_trains = num_trains
        self.stations = LINE_METADATA[line.value]["stations"]
        self.trains: List[TrainState] = []
        self._initialize_trains()

    def _initialize_trains(self) -> None:
        """Initialize trains at distributed positions along the route."""
        num_stations = len(self.stations)
        
        # Distribute trains evenly across the route
        for i in range(self.num_trains):
            # Start at different stations
            start_station_idx = (i * 2) % max(1, num_stations - 1)
            
            # Alternate directions for realistic operation
            direction = 1 if i % 2 == 0 else -1
            
            # Randomize initial progress and dwell state
            if random.random() < 0.3:
                # Some trains start at stations
                progress = 0.0
                at_station = True
                dwell = random.uniform(0, STATION_DWELL_TIME)
            else:
                # Others are mid-route
                progress = random.uniform(0.1, 0.9)
                at_station = False
                dwell = 0.0

            train = TrainState(
                train_id=f"{self.line.value.upper()}-{(i + 1):03d}",
                train_name=f"{self.line.value.upper()} Train {i + 1}",
                line=self.line,
                current_station_idx=start_station_idx,
                progress=progress,
                direction=direction,
                speed_kmh=0.0 if at_station else random.uniform(40, 70),
                at_station=at_station,
                station_dwell_remaining=dwell,
                total_energy_recovered=random.uniform(0, 50),
                regen_temp=random.uniform(42, 55),
            )
            self.trains.append(train)

    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in km (Haversine formula)."""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def _interpolate_position(self, from_idx: int, to_idx: int, progress: float) -> Tuple[float, float]:
        """Interpolate GPS position between two stations."""
        from_station = self.stations[from_idx]
        to_station = self.stations[to_idx]
        
        lat = from_station.lat + (to_station.lat - from_station.lat) * progress
        lng = from_station.lng + (to_station.lng - from_station.lng) * progress
        
        return (lat, lng)

    def _calculate_heading(self, from_idx: int, to_idx: int) -> float:
        """Calculate heading in degrees from current to next station."""
        from_station = self.stations[from_idx]
        to_station = self.stations[to_idx]
        
        dlng = to_station.lng - from_station.lng
        dlat = to_station.lat - from_station.lat
        
        heading = math.degrees(math.atan2(dlng, dlat))
        return (heading + 360) % 360

    def _get_target_speed(self, progress: float, at_station: bool) -> float:
        """
        Calculate target speed based on position in segment.
        
        Implements trapezoidal velocity profile:
        - 0% to 25%: Accelerating
        - 25% to 75%: Cruising at max speed
        - 75% to 100%: Decelerating
        """
        if at_station:
            return 0.0
        
        if progress < ACCEL_END_PROGRESS:
            # Accelerating phase
            return MAX_SPEED_KMH * (progress / ACCEL_END_PROGRESS)
        elif progress > BRAKE_START_PROGRESS:
            # Decelerating phase
            decel_progress = (progress - BRAKE_START_PROGRESS) / (1.0 - BRAKE_START_PROGRESS)
            return MAX_SPEED_KMH * (1.0 - decel_progress)
        else:
            # Cruising phase
            return MAX_SPEED_KMH

    def _update_train(self, train: TrainState, dt: float) -> None:
        """Update a single train's state for the given time delta."""
        num_stations = len(self.stations)
        
        # Handle station dwell
        if train.at_station:
            if train.station_dwell_remaining > 0:
                train.station_dwell_remaining -= dt
                train.speed_kmh = 0.0
                return
            else:
                # Depart station
                train.at_station = False
                train.progress = 0.0
        
        # Calculate next station index
        next_station_idx = train.current_station_idx + train.direction
        
        # Handle end of line (reverse direction)
        if next_station_idx >= num_stations:
            train.direction = -1
            next_station_idx = train.current_station_idx - 1
        elif next_station_idx < 0:
            train.direction = 1
            next_station_idx = train.current_station_idx + 1
        
        # Get segment distance
        from_station = self.stations[train.current_station_idx]
        to_station = self.stations[next_station_idx]
        segment_distance_km = self._calculate_distance(
            from_station.lat, from_station.lng,
            to_station.lat, to_station.lng
        )
        
        # Calculate target speed and smoothly approach it
        target_speed = self._get_target_speed(train.progress, train.at_station)
        
        # Smooth speed transition
        speed_diff = target_speed - train.speed_kmh
        max_speed_change = ACCELERATION_RATE * dt * 3.6  # Convert m/s² to km/h per second
        
        if abs(speed_diff) <= max_speed_change:
            train.speed_kmh = target_speed
        elif speed_diff > 0:
            train.speed_kmh += max_speed_change
        else:
            train.speed_kmh -= max_speed_change
        
        # Add some realistic noise to speed
        train.speed_kmh += random.gauss(0, 0.5)
        train.speed_kmh = max(0, min(MAX_SPEED_KMH + 5, train.speed_kmh))
        
        # Update position
        if train.speed_kmh > 0 and segment_distance_km > 0:
            # Convert speed to progress per second
            progress_per_second = (train.speed_kmh / 3600) / segment_distance_km
            train.progress += progress_per_second * dt
        
        # Check if arrived at next station
        if train.progress >= 1.0:
            train.current_station_idx = next_station_idx
            train.progress = 0.0
            train.at_station = True
            train.station_dwell_remaining = STATION_DWELL_TIME
            train.speed_kmh = 0.0
        
        # Update regenerative braking telemetry
        is_braking = train.progress > BRAKE_START_PROGRESS and not train.at_station
        
        if is_braking:
            # Energy recovery spikes during braking
            train.total_energy_recovered += BASE_ENERGY_RECOVERY_RATE * dt * random.uniform(0.8, 1.2)
            # Temperature increases during braking
            train.regen_temp = min(MAX_REGEN_TEMP, train.regen_temp + dt * random.uniform(0.5, 2.0))
        else:
            # Temperature slowly decreases when not braking
            train.regen_temp = max(MIN_REGEN_TEMP, train.regen_temp - dt * random.uniform(0.1, 0.5))

    def update(self) -> None:
        """Update all trains for the current time step."""
        current_time = time.time()
        
        for train in self.trains:
            dt = current_time - train.last_update_time
            dt = min(dt, 1.0)  # Cap delta time to prevent large jumps
            
            self._update_train(train, dt)
            train.last_update_time = current_time

    def _get_direction_string(self, train: TrainState) -> str:
        """Get direction string based on line and train direction."""
        if self.line == MetroLine.LINE_1:
            return "NORTHBOUND" if train.direction == -1 else "SOUTHBOUND"
        else:  # LINE_2 and LINE_3
            return "EASTBOUND" if train.direction == -1 else "WESTBOUND"

    def get_train_status(self, train: TrainState) -> TrainStatus:
        """Convert internal train state to API response model."""
        num_stations = len(self.stations)
        
        # Calculate next station index
        next_station_idx = train.current_station_idx + train.direction
        if next_station_idx >= num_stations:
            next_station_idx = train.current_station_idx - 1
        elif next_station_idx < 0:
            next_station_idx = 1
        
        # Interpolate current position
        lat, lng = self._interpolate_position(
            train.current_station_idx,
            next_station_idx,
            train.progress
        )
        
        # Calculate heading
        heading = self._calculate_heading(train.current_station_idx, next_station_idx)
        
        # Check tunnel status (only for Line 3)
        in_tunnel = False
        if self.line == MetroLine.LINE_3:
            in_tunnel = is_in_tunnel_section(train.current_station_idx, train.progress)
        
        # Determine if braking
        is_braking = train.progress > BRAKE_START_PROGRESS and not train.at_station
        
        # Calculate ETA to next station
        if train.at_station:
            eta_seconds = int(train.station_dwell_remaining)
        elif train.speed_kmh > 0:
            from_station = self.stations[train.current_station_idx]
            to_station = self.stations[next_station_idx]
            remaining_distance = self._calculate_distance(
                lat, lng, to_station.lat, to_station.lng
            )
            # Estimate time at average speed
            avg_speed_kms = (train.speed_kmh + 40) / 2 / 3600
            eta_seconds = int(remaining_distance / avg_speed_kms) if avg_speed_kms > 0 else 999
        else:
            eta_seconds = 999
        
        # Build response
        position = TrainPosition(
            lat=lat,
            lng=lng,
            heading=heading,
            current_station_id=self.stations[train.current_station_idx].id,
            next_station_id=self.stations[next_station_idx].id,
            progress=train.progress,
        )
        
        telemetry = TelemetryData(
            speed_kmh=round(train.speed_kmh, 1),
            b_chop_status=is_braking,
            energy_recovered_kwh=round(train.total_energy_recovered, 2),
            regen_braking_temp=round(train.regen_temp, 1),
            motor_current_amps=round(train.speed_kmh * 8 + random.uniform(-20, 20), 1),
            door_status="OPEN" if train.at_station else "CLOSED",
        )
        
        return TrainStatus(
            id=train.train_id,
            name=train.train_name,
            line=self.line.value,
            position=position,
            telemetry=telemetry,
            is_in_tunnel=in_tunnel,
            comms_mode="TUNNEL_RELAY" if in_tunnel else "NORMAL",
            operating_mode="REVENUE",
            direction=self._get_direction_string(train),
            next_station_eta_seconds=min(eta_seconds, 999),
            at_station=train.at_station,
            timestamp=datetime.utcnow(),
        )

    def get_all_trains(self) -> List[TrainStatus]:
        """Get status of all trains on this line."""
        self.update()
        return [self.get_train_status(train) for train in self.trains]


class TrainSimulator:
    """
    Multi-line train simulator managing trains on all Panama Metro lines.
    """

    def __init__(self):
        self.line_simulators: Dict[MetroLine, LineSimulator] = {
            MetroLine.LINE_1: LineSimulator(MetroLine.LINE_1, num_trains=4),
            MetroLine.LINE_2: LineSimulator(MetroLine.LINE_2, num_trains=4),
            MetroLine.LINE_3: LineSimulator(MetroLine.LINE_3, num_trains=5),
        }

    def get_all_trains(self) -> List[TrainStatus]:
        """Get status of all trains across all lines."""
        all_trains = []
        for simulator in self.line_simulators.values():
            all_trains.extend(simulator.get_all_trains())
        return all_trains


# Global simulator instance
_simulator: TrainSimulator | None = None


def get_simulator() -> TrainSimulator:
    """Get or create the global simulator instance."""
    global _simulator
    if _simulator is None:
        _simulator = TrainSimulator()
    return _simulator
