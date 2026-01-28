"""
HMAX-Lite: Pydantic Models for API Schemas
==========================================

Defines the data structures for train telemetry, stations, and system status.
"""

from datetime import datetime
from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field


class StationSchema(BaseModel):
    """Station data schema."""
    id: str = Field(..., description="Station identifier (e.g., ST-01)")
    name: str = Field(..., description="Station name")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    station_type: str = Field(..., description="Station type: At-Grade, Underground, Elevated, Terminal")
    is_tunnel_boundary: bool = Field(default=False, description="Whether this station marks a tunnel boundary")
    line: str = Field(..., description="Metro line: line1, line2, or line3")


class LineInfo(BaseModel):
    """Metro line information."""
    id: str = Field(..., description="Line identifier")
    name: str = Field(..., description="Line name")
    color: str = Field(..., description="Line color (hex code)")
    description: str = Field(..., description="Line route description")
    station_count: int = Field(..., description="Number of stations on this line")


class TelemetryData(BaseModel):
    """Real-time telemetry data from a train."""
    speed_kmh: float = Field(..., ge=0, le=100, description="Current speed in km/h")
    b_chop_status: bool = Field(..., description="Brake Chopper active status (True = braking)")
    energy_recovered_kwh: float = Field(..., ge=0, description="Energy recovered via regenerative braking")
    regen_braking_temp: float = Field(..., ge=20, le=120, description="Regenerative braking system temperature in °C")
    motor_current_amps: float = Field(..., description="Traction motor current draw")
    door_status: Literal["CLOSED", "OPEN", "FAULT"] = Field(default="CLOSED", description="Door status")


class TrainPosition(BaseModel):
    """Train position data."""
    lat: float = Field(..., description="Current latitude")
    lng: float = Field(..., description="Current longitude")
    heading: float = Field(..., ge=0, lt=360, description="Heading in degrees")
    current_station_id: str = Field(..., description="ID of the station the train departed from")
    next_station_id: str = Field(..., description="ID of the next station")
    progress: float = Field(..., ge=0, le=1, description="Progress between stations (0 to 1)")


class TrainStatus(BaseModel):
    """Complete train status including position and telemetry."""
    id: str = Field(..., description="Train identifier (e.g., T-001)")
    name: str = Field(..., description="Train name/designation")
    line: str = Field(..., description="Metro line: line1, line2, or line3")
    position: TrainPosition
    telemetry: TelemetryData
    is_in_tunnel: bool = Field(default=False, description="Whether train is in the Canal tunnel section")
    comms_mode: Literal["NORMAL", "TUNNEL_RELAY"] = Field(default="NORMAL", description="Communication mode")
    operating_mode: Literal["REVENUE", "NON_REVENUE", "MAINTENANCE"] = Field(default="REVENUE")
    direction: Literal["WESTBOUND", "EASTBOUND", "NORTHBOUND", "SOUTHBOUND"] = Field(..., description="Travel direction")
    next_station_eta_seconds: int = Field(..., ge=0, description="ETA to next station in seconds")
    at_station: bool = Field(default=False, description="Whether train is currently at a station")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Telemetry timestamp")


class SystemStatus(BaseModel):
    """Overall system status."""
    active_trains: int = Field(..., description="Number of active trains")
    total_energy_recovered_kwh: float = Field(..., description="Total energy recovered across all trains")
    trains_in_tunnel: int = Field(..., description="Number of trains currently in tunnel section")
    system_health: Literal["NORMAL", "DEGRADED", "CRITICAL"] = Field(default="NORMAL")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TrainListResponse(BaseModel):
    """Response schema for train list endpoint."""
    trains: List[TrainStatus]
    system_status: SystemStatus


class StationListResponse(BaseModel):
    """Response schema for station list endpoint."""
    stations: List[StationSchema]
    route_coordinates: List[List[float]] = Field(..., description="Route as [[lat, lng], ...] for polyline")
    line: LineInfo = Field(..., description="Line information")


class AllLinesResponse(BaseModel):
    """Response schema for all lines endpoint."""
    lines: List[LineInfo]
    all_stations: List[StationSchema]
    all_route_coordinates: Dict[str, List[List[float]]] = Field(..., description="Route coordinates for each line")
