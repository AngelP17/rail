"""
HMAX-Lite: FastAPI Backend Application
======================================

Real-time train telemetry API for the Panama Metro Digital Twin.

Endpoints:
- GET /health          - Health check
- GET /api/lines       - All metro lines info
- GET /api/lines/{line_id}/stations - Stations for a specific line
- GET /api/trains      - All train statuses
- GET /api/trains/{id} - Single train status
- GET /api/stations    - All stations data
- GET /api/stream      - Server-Sent Events telemetry stream
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import AsyncGenerator

import orjson

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from models import (
    TrainStatus,
    TrainListResponse,
    StationListResponse,
    StationSchema,
    SystemStatus,
    LineInfo,
    AllLinesResponse,
)
from stations import (
    LINE_1_STATIONS, 
    LINE_2_STATIONS, 
    LINE_3_STATIONS,
    LINE_METADATA,
    MetroLine,
    get_stations_by_line,
    get_route_coordinates,
)
from simulator import get_simulator


# =============================================================================
# Application Configuration
# =============================================================================

app = FastAPI(
    title="HMAX-Lite API",
    description="Panama Metro Digital Twin - Train Telemetry Simulation",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Helper Functions
# =============================================================================

def get_line_info(line_id: str) -> LineInfo:
    """Get line info for a specific line."""
    if line_id not in LINE_METADATA:
        raise HTTPException(status_code=404, detail=f"Line {line_id} not found")
    
    metadata = LINE_METADATA[line_id]
    return LineInfo(
        id=line_id,
        name=metadata["name"],
        color=metadata["color"],
        description=metadata["description"],
        station_count=len(metadata["stations"]),
    )


def stations_to_schema(stations) -> list:
    """Convert station objects to schema."""
    return [
        StationSchema(
            id=s.id,
            name=s.name,
            lat=s.lat,
            lng=s.lng,
            station_type=s.station_type,
            is_tunnel_boundary=s.is_tunnel_boundary,
            line=s.line.value,
        )
        for s in stations
    ]


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for container orchestration."""
    return {
        "status": "healthy",
        "service": "hmax-lite-backend",
        "timestamp": datetime.utcnow().isoformat(),
    }


# =============================================================================
# Line Endpoints
# =============================================================================

@app.get("/api/lines", response_model=AllLinesResponse, tags=["Lines"])
async def get_all_lines():
    """
    Get all metro lines information.
    
    Returns information about Lines 1, 2, and 3 including station counts and colors.
    """
    lines = []
    all_stations = []
    all_route_coordinates = {}
    
    for line_id in ["line1", "line2", "line3"]:
        line_info = get_line_info(line_id)
        lines.append(line_info)
        
        stations = LINE_METADATA[line_id]["stations"]
        all_stations.extend(stations_to_schema(stations))
        all_route_coordinates[line_id] = [[s.lat, s.lng] for s in stations]
    
    return AllLinesResponse(
        lines=lines,
        all_stations=all_stations,
        all_route_coordinates=all_route_coordinates,
    )


@app.get("/api/lines/{line_id}/stations", response_model=StationListResponse, tags=["Lines"])
async def get_line_stations(line_id: str):
    """
    Get stations for a specific metro line.
    
    Args:
        line_id: Line identifier (line1, line2, or line3)
    """
    if line_id not in LINE_METADATA:
        raise HTTPException(status_code=404, detail=f"Line {line_id} not found")
    
    line_enum = MetroLine(line_id)
    stations = get_stations_by_line(line_enum)
    route_coordinates = get_route_coordinates(line_enum)
    
    return StationListResponse(
        stations=stations_to_schema(stations),
        route_coordinates=[[lat, lng] for lat, lng in route_coordinates],
        line=get_line_info(line_id),
    )


# =============================================================================
# Train Endpoints
# =============================================================================

@app.get("/api/trains", response_model=TrainListResponse, tags=["Trains"])
async def get_all_trains(line: str | None = None):
    """
    Get the current status of all active trains.
    
    Args:
        line: Optional line filter (line1, line2, or line3)
    
    Returns position, telemetry, and operational data for each train.
    """
    simulator = get_simulator()
    trains = simulator.get_all_trains()
    
    # Filter by line if specified
    if line:
        trains = [t for t in trains if t.line == line]
    
    # Calculate system-wide metrics
    total_energy = sum(t.telemetry.energy_recovered_kwh for t in trains)
    trains_in_tunnel = sum(1 for t in trains if t.is_in_tunnel)
    
    system_status = SystemStatus(
        active_trains=len(trains),
        total_energy_recovered_kwh=round(total_energy, 2),
        trains_in_tunnel=trains_in_tunnel,
        system_health="NORMAL",
        timestamp=datetime.utcnow(),
    )
    
    return TrainListResponse(trains=trains, system_status=system_status)


@app.get("/api/trains/{train_id}", response_model=TrainStatus, tags=["Trains"])
async def get_train(train_id: str):
    """
    Get the current status of a specific train.
    
    Args:
        train_id: Train identifier (e.g., T-001)
    """
    simulator = get_simulator()
    trains = simulator.get_all_trains()
    
    for train in trains:
        if train.id == train_id:
            return train
    
    raise HTTPException(status_code=404, detail=f"Train {train_id} not found")


# =============================================================================
# Station Endpoints
# =============================================================================

@app.get("/api/stations", response_model=AllLinesResponse, tags=["Stations"])
async def get_all_stations():
    """
    Get all stations across all lines for map rendering.
    
    Returns station information and route coordinates for all lines.
    """
    return await get_all_lines()


# =============================================================================
# Server-Sent Events Stream
# =============================================================================

logger = logging.getLogger(__name__)


async def generate_telemetry_stream() -> AsyncGenerator[str, None]:
    """Generate telemetry updates as Server-Sent Events."""
    simulator = get_simulator()

    while True:
        try:
            # Run CPU-bound simulation in thread to avoid blocking the event loop
            trains = await asyncio.to_thread(simulator.get_all_trains)

            # Calculate system status
            total_energy = sum(t.telemetry.energy_recovered_kwh for t in trains)
            trains_in_tunnel = sum(1 for t in trains if t.is_in_tunnel)

            data = {
                "trains": [t.model_dump(mode="json") for t in trains],
                "system_status": {
                    "active_trains": len(trains),
                    "total_energy_recovered_kwh": round(total_energy, 2),
                    "trains_in_tunnel": trains_in_tunnel,
                    "system_health": "NORMAL",
                    "timestamp": datetime.utcnow().isoformat(),
                }
            }

            yield orjson.dumps(data).decode()
        except Exception:
            logger.exception("Error generating telemetry frame")
            yield "{}"

        await asyncio.sleep(1)  # Update every second


@app.get("/api/stream", tags=["Telemetry"])
async def telemetry_stream():
    """
    Server-Sent Events stream for real-time telemetry updates.
    
    Provides train positions and telemetry data at 1Hz refresh rate.
    Connect using EventSource in the browser or any SSE-compatible client.
    
    Example:
        ```javascript
        const source = new EventSource('/api/stream');
        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.trains);
        };
        ```
    """
    return EventSourceResponse(
        generate_telemetry_stream(),
        media_type="text/event-stream",
    )


# =============================================================================
# Root Redirect
# =============================================================================

@app.get("/", tags=["System"])
async def root():
    """Redirect to API documentation."""
    return {
        "message": "HMAX-Lite API",
        "docs": "/docs",
        "health": "/health",
        "lines": "/api/lines",
        "trains": "/api/trains",
        "stations": "/api/stations",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
