# HMAX-Lite Architecture Documentation

## System Overview

HMAX-Lite is a real-time Digital Twin simulation for the Panama Metro system covering Lines 1, 2, and 3. It demonstrates SCADA-style monitoring capabilities for transit operations with 13 trains across 39 stations.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Docker["Docker Compose Environment"]
        subgraph Client["Browser (Client)"]
            subgraph UI["React 18 + TypeScript + Tailwind CSS"]
                HD["Header: System Status + Line Selector"]
                MV["Map View: Leaflet - 3 Lines, 39 Stations, 13 Trains"]
                TL["Train List: Grouped by Line with Status"]
                TS["Telemetry Sidebar: Speed Gauge, Energy Chart, Temp Gauge, Route Progress"]
            end
            TQ["TanStack Query (1s polling)"]
            MD["Mock Data Layer: Realistic offline telemetry"]
        end
        
        Client -->|"HTTP/SSE (1s polling)"| Backend
        MD -.->|"Fallback when API offline"| Client
        
        subgraph Backend["Backend (FastAPI)"]
            subgraph Engine["Train Simulator Engine"]
                PM["Physics Model: Haversine, Interpolation, Accel/Decel"]
                TGN["Telemetry Gen: Speed, B-CHOP, Energy, Temp"]
                GF["Geofencing: Tunnel Detection, Comms Mode"]
                ML["Multi-Line: Line 1 (4 trains), Line 2 (4 trains), Line 3 (5 trains)"]
            end
            SD["Station Data: 39 stations across 3 lines"]
            EP["API: /api/trains, /api/stations, /api/stream"]
        end
    end
    
    style Docker fill:#1a1a2e,stroke:#16213e,color:#fff
    style Client fill:#162447,stroke:#00d9ff,color:#fff
    style Backend fill:#0f3460,stroke:#e94560,color:#fff
    style Engine fill:#1f4068,stroke:#1b1b2f,color:#fff
    style UI fill:#1f4068,stroke:#00d9ff,color:#fff
```

## Component Details

### Backend: Train Simulator (`simulator.py`)

**Tech Stack:**
- **Python 3.14+**
- **FastAPI 0.128+**
- **Pydantic v2** (Strict data validation)
- **SSE-Starlette** (Real-time events)

The physics engine simulates realistic train behavior:

**Position Interpolation:**
- Uses Haversine formula for accurate GPS distance calculations
- Linear interpolation between station coordinates
- Heading calculated from movement direction

**Speed Profile (Trapezoidal Velocity):**

```mermaid
xychart-beta
    title "Trapezoidal Velocity Profile"
    x-axis "Station Progress %" [0, 25, 50, 75, 100]
    y-axis "Speed (km/h)" 0 --> 90
    line [0, 80, 80, 80, 0]
```

- 0-25%: Acceleration phase
- 25-75%: Cruise at 80 km/h
- 75-100%: Deceleration phase
- Station dwell: 15 seconds

**B-CHOP Regenerative Braking:**
- Activates when `progress > 75%` (approaching station)
- Energy recovery rate: ~0.15 kWh/second during braking
- Temperature increases during active braking (40°C - 90°C range)

**Tunnel Geofencing:**
- Tunnel section: Balboa (ST-02) to Panama Pacifico (ST-03)
- When in tunnel:
  - `is_in_tunnel: true`
  - `comms_mode: "TUNNEL_RELAY"`
  - UI shows purple indicators

### Frontend: Operations Dashboard

**Technology Stack:**
- **Node.js 18+**
- **Vite 5+** (Build tool)
- **React 18** with TypeScript
- **TanStack Query v5** for data fetching
- **Leaflet** + React-Leaflet for mapping
- **Recharts** for data visualization
- **Tailwind CSS 3.4** for styling

**Component Hierarchy:**

```mermaid
flowchart TB
    App --> QCP[QueryClientProvider]
    QCP --> Dashboard
    Dashboard --> Header["Header: System Status + Line Selector"]
    Dashboard --> TrainList["TrainList: Left sidebar, grouped by line"]
    Dashboard --> Map["Map: Center, Leaflet with 3 routes"]
    Dashboard --> Telemetry["TelemetrySidebar: Right panel"]
    
    Map --> TileLayer["TileLayer: CartoDB Dark Matter"]
    Map --> Polyline["Polyline: 3 route lines + tunnel"]
    Map --> CircleMarker["CircleMarker: 39 stations"]
    Map --> TrainMarker["TrainMarker: 13 trains with SVG icons"]
    
    Telemetry --> StatusBanner["Status Banner: Normal/Braking/Tunnel/Station"]
    Telemetry --> SpeedGauge["Speed Gauge: SVG circular 0-100 km/h"]
    Telemetry --> BChopPanel["B-CHOP Panel: Energy chart + stats"]
    Telemetry --> TempGauge["Temp Gauge: Brake system 40-90 C"]
    Telemetry --> RouteInfo["Route Info: Progress bar + ETA"]
    Telemetry --> AdditionalInfo["Additional Info: Direction, Mode, Doors, Motor"]
    
    style App fill:#1a1a2e,stroke:#e94560,color:#fff
    style Dashboard fill:#162447,stroke:#00d9ff,color:#fff
    style Map fill:#0f3460,stroke:#22c55e,color:#fff
    style Telemetry fill:#0f3460,stroke:#3b82f6,color:#fff
```

**Data Flow:**
1. `useTrains` hook polls `/api/trains` every 1 second
2. If API unavailable, mock data layer generates realistic telemetry automatically
3. Train positions update on map with animated SVG markers
4. Selected train telemetry displays in sidebar with speed gauge, energy chart, route progress
5. History accumulated for charts (60 data points max per train)
6. Line selector filters all views: map, fleet list, and system metrics

## Key Engineering Decisions

### 1. Polling vs WebSockets
Chose polling (1s interval) for simplicity and robust connection handling in MVP. SSE (Server-Sent Events) endpoint `/api/stream` is implemented for future real-time upgrades.

### 2. State Management
TanStack Query handles server state with automatic caching and background updates. Local state (selection, history) managed with React hooks.

### 3. Dependency Management
- **Backend:** Uses `venv` with unpinned `requirements.txt` to ensure compatibility with latest Python versions (tested on 3.14).
- **Frontend:** Standard `npm` workflow with modern Vite scaffolding.

## Performance Considerations

- **Frontend:** Uses `requestAnimationFrame` for smooth marker animations
- **Backend:** Single-threaded event loop handles multiple concurrent clients
- **Memory:** History limited to 60 points per train (~5KB per train)
- **Network:** ~2KB JSON payload per poll request

## Extension Points

1. **Authentication:** Add JWT-based auth for production
2. **Database:** Persist telemetry to TimescaleDB for historical analysis
3. **Alerts:** Add rule engine for anomaly detection
4. **Multi-line:** Extend simulator for additional metro lines
5. **MQTT:** Replace HTTP polling with MQTT for true real-time

## Deployment

### Local Development (Manual)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker (Optional)

```bash
docker-compose up --build
```

Access points:
- Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs
