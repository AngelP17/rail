"""
HMAX-Lite: Panama Metro Lines 1, 2, and 3 Station Data
======================================================

Official route data for all Panama Metro lines.
Coordinates are based on published Metro de Panama planning documents.
"""

from typing import List, Tuple, Dict
from dataclasses import dataclass
from enum import Enum


class MetroLine(Enum):
    """Metro line identifiers."""
    LINE_1 = "line1"
    LINE_2 = "line2"
    LINE_3 = "line3"


@dataclass
class Station:
    """Represents a Metro station."""
    id: str
    name: str
    lat: float
    lng: float
    station_type: str  # At-Grade, Underground, Elevated, Terminal
    is_tunnel_boundary: bool = False
    line: MetroLine = MetroLine.LINE_3

    @property
    def coordinates(self) -> Tuple[float, float]:
        return (self.lat, self.lng)


# =============================================================================
# Line 1 Stations: North-South Route (San Isidro ↔ Albrook)
# =============================================================================

LINE_1_STATIONS: List[Station] = [
    Station(
        id="L1-01",
        name="San Isidro (Terminal)",
        lat=9.0824,
        lng=-79.4856,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-02",
        name="Villa Zaita",
        lat=9.0702,
        lng=-79.4901,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-03",
        name="El Crisol",
        lat=9.0605,
        lng=-79.4938,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-04",
        name="Brisas del Golf",
        lat=9.0489,
        lng=-79.4982,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-05",
        name="Cerro Viento",
        lat=9.0402,
        lng=-79.5015,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-06",
        name="San Antonio",
        lat=9.0315,
        lng=-79.5050,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-07",
        name="Pedregal",
        lat=9.0228,
        lng=-79.5085,
        station_type="Elevated",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-08",
        name="Pueblo Nuevo",
        lat=9.0152,
        lng=-79.5118,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-09",
        name="12 de Octubre",
        lat=9.0055,
        lng=-79.5155,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-10",
        name="Iglesia del Carmen",
        lat=8.9942,
        lng=-79.5198,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-11",
        name="Vía Argentina",
        lat=8.9855,
        lng=-79.5232,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-12",
        name="Fernandez de Cordoba",
        lat=8.9778,
        lng=-79.5265,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-13",
        name="El Ingenio",
        lat=8.9712,
        lng=-79.5295,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-14",
        name="12 de Octubre (Interchange)",
        lat=8.9835,
        lng=-79.5205,
        station_type="Underground",
        line=MetroLine.LINE_1
    ),
    Station(
        id="L1-15",
        name="Albrook (Interchange)",
        lat=8.9763,
        lng=-79.5475,
        station_type="At-Grade",
        line=MetroLine.LINE_1
    ),
]


# =============================================================================
# Line 2 Stations: East-West Route (Nuevo Tocumen ↔ Albrook)
# =============================================================================

LINE_2_STATIONS: List[Station] = [
    Station(
        id="L2-01",
        name="Nuevo Tocumen (Terminal)",
        lat=9.0525,
        lng=-79.3802,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-02",
        name="24 de Diciembre",
        lat=9.0502,
        lng=-79.4025,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-03",
        name="Nuevo Tocumen",
        lat=9.0485,
        lng=-79.4152,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-04",
        name="Pacora",
        lat=9.0458,
        lng=-79.4285,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-05",
        name="Corredor Sur",
        lat=9.0425,
        lng=-79.4412,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-06",
        name="Don Bosco",
        lat=9.0385,
        lng=-79.4525,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-07",
        name="Las Mañanitas",
        lat=9.0325,
        lng=-79.4625,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-08",
        name="El Doral",
        lat=9.0252,
        lng=-79.4725,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-09",
        name="San Bernardino",
        lat=9.0185,
        lng=-79.4825,
        station_type="Elevated",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-10",
        name="5 de Mayo",
        lat=9.0125,
        lng=-79.4925,
        station_type="Underground",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-11",
        name="El Carmen",
        lat=9.0052,
        lng=-79.5025,
        station_type="Underground",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-12",
        name="Vía España",
        lat=8.9985,
        lng=-79.5125,
        station_type="Underground",
        line=MetroLine.LINE_2
    ),
    Station(
        id="L2-13",
        name="Albrook (Interchange)",
        lat=8.9763,
        lng=-79.5475,
        station_type="At-Grade",
        line=MetroLine.LINE_2
    ),
]


# =============================================================================
# Line 3 Stations: Westbound Route (Albrook → Ciudad del Futuro)
# =============================================================================

LINE_3_STATIONS: List[Station] = [
    Station(
        id="ST-01",
        name="Albrook (Terminal/Interchange)",
        lat=8.9763,
        lng=-79.5475,
        station_type="At-Grade",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-02",
        name="Balboa",
        lat=8.9594,
        lng=-79.5573,
        station_type="Underground",
        is_tunnel_boundary=True,  # Tunnel Entry Point
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-03",
        name="Panama Pacifico",
        lat=8.9600,
        lng=-79.5900,
        station_type="Elevated",
        is_tunnel_boundary=True,  # Tunnel Exit Point
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-04",
        name="Loma Cova",
        lat=8.9550,
        lng=-79.6050,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-05",
        name="Arraijan",
        lat=8.9448,
        lng=-79.6204,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-06",
        name="Nuevo Chorrillo",
        lat=8.9400,
        lng=-79.6400,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-07",
        name="Vista Alegre",
        lat=8.9350,
        lng=-79.6600,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-08",
        name="Burunga",
        lat=8.9480,
        lng=-79.6300,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-09",
        name="Nuevo Arraijan",
        lat=8.9300,
        lng=-79.6800,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-10",
        name="San Bernardino",
        lat=8.9280,
        lng=-79.6900,
        station_type="Elevated",
        line=MetroLine.LINE_3
    ),
    Station(
        id="ST-11",
        name="Ciudad del Futuro",
        lat=8.9224,
        lng=-79.6995,
        station_type="Terminal",
        line=MetroLine.LINE_3
    ),
]


# =============================================================================
# All Stations Combined
# =============================================================================

ALL_STATIONS: List[Station] = LINE_1_STATIONS + LINE_2_STATIONS + LINE_3_STATIONS

# Line metadata
LINE_METADATA: Dict[str, dict] = {
    "line1": {
        "name": "Line 1",
        "color": "#ef4444",  # Red
        "description": "San Isidro ↔ Albrook",
        "stations": LINE_1_STATIONS,
    },
    "line2": {
        "name": "Line 2",
        "color": "#22c55e",  # Green
        "description": "Nuevo Tocumen ↔ Albrook",
        "stations": LINE_2_STATIONS,
    },
    "line3": {
        "name": "Line 3",
        "color": "#3b82f6",  # Blue
        "description": "Albrook ↔ Ciudad del Futuro",
        "stations": LINE_3_STATIONS,
    },
}


# =============================================================================
# Helper Functions
# =============================================================================

def get_station_by_id(station_id: str) -> Station | None:
    """Get station by ID."""
    for station in ALL_STATIONS:
        if station.id == station_id:
            return station
    return None


def get_station_index(station_id: str, line: MetroLine = MetroLine.LINE_3) -> int:
    """Get station index in the route for a specific line."""
    stations = LINE_METADATA[line.value]["stations"]
    for i, station in enumerate(stations):
        if station.id == station_id:
            return i
    return -1


def get_route_coordinates(line: MetroLine = MetroLine.LINE_3) -> List[Tuple[float, float]]:
    """Get all station coordinates as a list for route drawing."""
    stations = LINE_METADATA[line.value]["stations"]
    return [station.coordinates for station in stations]


def get_stations_by_line(line: MetroLine) -> List[Station]:
    """Get all stations for a specific line."""
    return LINE_METADATA[line.value]["stations"]


def get_tunnel_boundaries(line: MetroLine = MetroLine.LINE_3) -> Tuple[Station | None, Station | None]:
    """Get the tunnel entry and exit stations for a line."""
    stations = LINE_METADATA[line.value]["stations"]
    tunnel_stations = [s for s in stations if s.is_tunnel_boundary]
    if len(tunnel_stations) >= 2:
        return (tunnel_stations[0], tunnel_stations[1])
    return (None, None)


# Tunnel section constants for Line 3
TUNNEL_ENTRY_STATION = "ST-02"  # Balboa
TUNNEL_EXIT_STATION = "ST-03"   # Panama Pacifico


def is_in_tunnel_section(current_station_idx: int, progress: float, line: MetroLine = MetroLine.LINE_3) -> bool:
    """
    Check if a train is in the tunnel section.
    
    The tunnel runs between Balboa (ST-02, index 1) and Panama Pacifico (ST-03, index 2).
    A train is in the tunnel if:
    - It's at station index 1 heading to index 2 (any progress > 0)
    - It's at station index 2 heading to index 1 (any progress > 0)
    """
    if line != MetroLine.LINE_3:
        return False
        
    tunnel_entry_idx = get_station_index(TUNNEL_ENTRY_STATION, line)  # 1
    tunnel_exit_idx = get_station_index(TUNNEL_EXIT_STATION, line)    # 2
    
    # Train is between Balboa and Panama Pacifico
    if current_station_idx == tunnel_entry_idx and progress > 0:
        return True
    
    return False
