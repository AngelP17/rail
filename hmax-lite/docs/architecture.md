# HMAX-Lite Architecture Documentation

## System Overview

HMAX-Lite is a real-time Digital Twin simulation for the Panama Metro system covering Lines 1, 2, and 3. It demonstrates SCADA-style monitoring capabilities for transit operations with 13 trains across 39 stations.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Runtime["Docker Compose or local dev"]
        subgraph Frontend["Frontend: React 18 + TypeScript"]
            App["App shell\nAIDA page + operations cockpit"]
            Query["TanStack Query\n1s polling, retry once"]
            Mock["Mock telemetry fallback\nroute progress, dwell, reversal, tunnel relay"]
            UI["Fleet rail + Leaflet map + telemetry sidebar"]
        end

        subgraph Backend["Backend: FastAPI"]
            API["REST endpoints\n/health, /api/lines, /api/trains, /api/stations, /api/stream"]
            Engine["Train simulator\nHaversine, interpolation, accel, decel"]
            Telemetry["Telemetry model\nspeed, motor current, B-CHOP, temp, doors"]
            Geofence["Line 3 tunnel geofence\nTUNNEL_RELAY mode"]
            Stations["Station data\n39 stations across 3 lines"]
        end
    end

    App --> Query --> UI
    Query -->|"HTTP"| API
    Query -.->|"API unavailable or VITE_USE_MOCK=true"| Mock
    Mock --> UI
    API --> Engine
    Engine --> Stations
    Engine --> Telemetry
    Engine --> Geofence
    Telemetry --> API
    Geofence --> API

    classDef shell fill:#0f172a,stroke:#22d3ee,color:#fff
    classDef service fill:#111827,stroke:#34d399,color:#fff
    classDef signal fill:#111827,stroke:#fbbf24,color:#fff
    class App,Query,UI,Mock shell
    class API,Engine,Stations service
    class Telemetry,Geofence signal
```

## Component Details

### Backend: Train Simulator (`simulator.py`)

**Tech Stack:**
- **Python 3.11+** (Docker uses `python:3.11-slim`)
- **FastAPI**
- **Pydantic** (Strict data validation)
- **SSE-Starlette** (Real-time events)

The physics engine simulates realistic train behavior:

**Position Interpolation:**
- Uses Haversine formula for accurate GPS distance calculations
- Linear interpolation between station coordinates
- Heading calculated from movement direction

**Speed Profile (Trapezoidal Velocity):**

```mermaid
xychart-beta
    title "Segment Velocity and Regeneration"
    x-axis "Station Progress %" [0, 25, 50, 75, 100]
    y-axis "Speed km/h / Regen %" 0 --> 100
    line "Speed" [0, 80, 80, 80, 0]
    line "B-CHOP" [0, 0, 0, 40, 100]
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
  - UI shows cyan tunnel indicators

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
flowchart LR
    Data["useTrains hook\nquery, selection, history"] --> Metrics["Hero and KPI metrics"]
    Data --> Lines["Line selector\nall, line1, line2, line3"]
    Data --> Fleet["TrainList\nstatus counts + train cards"]
    Data --> Map["Map\nroutes, stations, train markers"]
    Data --> Detail["TelemetrySidebar\nselected train details"]

    Lines --> Data
    Fleet -->|"select train"| Data
    Map -->|"select train"| Data
    Detail --> Gauges["Speed gauge\nEnergy chart\nBrake temperature"]

    classDef state fill:#111827,stroke:#22d3ee,color:#fff
    classDef view fill:#0f172a,stroke:#94a3b8,color:#fff
    classDef signal fill:#111827,stroke:#34d399,color:#fff
    class Data,Lines state
    class Metrics,Fleet,Map,Detail view
    class Gauges signal
```

**Mock telemetry loop:**

```mermaid
stateDiagram-v2
    [*] --> Moving
    Moving --> Braking: progress > 76%
    Braking --> AtStation: progress reaches 100%
    AtStation --> Moving: dwell countdown ends
    Moving --> TunnelRelay: Line 3, Balboa to Panama Pacifico
    TunnelRelay --> Moving: exits tunnel segment
    AtStation --> ReverseDirection: terminal reached
    ReverseDirection --> Moving
```

**Data Flow:**
1. `useTrains` hook polls `/api/trains` every 1 second
2. If API unavailable, mock data layer generates realistic telemetry automatically
3. Train positions update on map with animated SVG markers
4. Selected train telemetry displays in sidebar with speed gauge, energy chart, route progress
5. History accumulated for charts (60 data points max per train)
6. Line selector filters all views: map, fleet list, and system metrics

**Offline/mock mode:**
- The API client falls back to frontend mock data if the backend is unavailable.
- `VITE_USE_MOCK=true` forces mock telemetry for frontend-only demos.
- Mock trains advance through station segments, dwell at stations, reverse at terminals, and surface Line 3 tunnel relay state.

## Key Engineering Decisions

### 1. Polling vs WebSockets
Chose polling (1s interval) for simplicity and robust connection handling in MVP. SSE (Server-Sent Events) endpoint `/api/stream` is implemented for future real-time upgrades.

### 2. State Management
TanStack Query handles server state with automatic caching and background updates. Local state (selection, history) managed with React hooks.

### 3. Dependency Management
- **Backend:** Uses `venv` with unpinned `requirements.txt`; Docker builds on Python 3.11.
- **Frontend:** Standard `npm` workflow with modern Vite scaffolding.

### 4. Visual System
The frontend is intentionally styled as an operations-control surface rather than a generic SaaS landing page. Preserve large map context, readable telemetry, line-color semantics, GSAP scroll motion, and high-contrast controls.

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
