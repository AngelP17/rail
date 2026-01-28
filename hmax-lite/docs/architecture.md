# HMAX-Lite Architecture Documentation

## System Overview

HMAX-Lite is a real-time Digital Twin simulation for the Panama Metro Line 3 monorail system. It demonstrates SCADA-style monitoring capabilities for transit operations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HMAX-Lite Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Browser (Client)                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │   Map View   │  │  Train List  │  │   Telemetry Sidebar      │  │   │
│  │  │   (Leaflet)  │  │              │  │   - Speed Gauge          │  │   │
│  │  │              │  │   5 Active   │  │   - Energy Chart         │  │   │
│  │  │  • Route     │  │   Trains     │  │   - Temp Gauge           │  │   │
│  │  │  • Stations  │  │              │  │   - Route Info           │  │   │
│  │  │  • Trains    │  │              │  │                          │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  │                                                                      │   │
│  │                  React 18 + TypeScript + Tailwind CSS                │   │
│  │                          TanStack Query (Polling)                    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │ HTTP/SSE                                 │
│                                  │ (1s polling)                             │
│  ┌───────────────────────────────▼─────────────────────────────────────┐   │
│  │                         Backend (FastAPI)                            │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │                   Train Simulator Engine                       │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │  │   │
│  │  │  │ Physics Model  │  │ Telemetry Gen  │  │   Geofencing   │  │  │   │
│  │  │  │                │  │                │  │                │  │  │   │
│  │  │  │ • Haversine    │  │ • Speed        │  │ • Tunnel       │  │  │   │
│  │  │  │ • Interpolate  │  │ • B-CHOP       │  │ • Comms Mode   │  │  │   │
│  │  │  │ • Accel/Decel  │  │ • Energy       │  │ • Boundaries   │  │  │   │
│  │  │  └────────────────┘  └────────────────┘  └────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  Station Data: 11 stations from Albrook to Ciudad del Futuro   │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  Endpoints:                                                          │   │
│  │  • GET  /api/trains     → All train statuses                        │   │
│  │  • GET  /api/trains/:id → Single train                              │   │
│  │  • GET  /api/stations   → Route data                                │   │
│  │  • GET  /api/stream     → SSE telemetry stream                      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                            Docker Compose                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Backend: Train Simulator (`simulator.py`)

The physics engine simulates realistic train behavior:

**Position Interpolation:**
- Uses Haversine formula for accurate GPS distance calculations
- Linear interpolation between station coordinates
- Heading calculated from movement direction

**Speed Profile (Trapezoidal Velocity):**
```
Speed
  ^
  │    ┌─────────────────┐
80│    │   CRUISE @80    │
  │   /│                 │\
  │  / │                 │ \
  │ /  │                 │  \
  │/   │                 │   \
0 └────┴─────────────────┴────►
  0%  25%               75%  100%
       Station Progress
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
- React 18 with TypeScript
- TanStack Query for data fetching and caching
- Leaflet + React-Leaflet for mapping
- Recharts for data visualization
- Tailwind CSS for styling

**Component Hierarchy:**
```
App
├── QueryClientProvider
└── Dashboard
    ├── Header (system status)
    ├── TrainList (left sidebar)
    ├── Map (center)
    │   ├── TileLayer (CartoDB Dark Matter)
    │   ├── Polyline (route)
    │   ├── CircleMarker[] (stations)
    │   └── TrainMarker[] (trains)
    └── TelemetrySidebar (right)
        ├── SpeedGauge
        ├── EnergyChart
        └── TempGauge
```

**Data Flow:**
1. `useTrains` hook polls `/api/trains` every 1 second
2. Train positions update on map
3. Selected train telemetry displays in sidebar
4. History accumulated for charts (60 data points max)

## Key Engineering Decisions

### 1. Polling vs WebSockets
Chose polling for simplicity and reliability. The 1-second interval provides sufficient real-time feel for a demonstration while being easier to debug and deploy.

### 2. State Management
TanStack Query handles server state with automatic caching and background updates. Local state (selection, history) managed with React hooks.

### 3. Map Library
Leaflet chosen for:
- Lightweight footprint
- Extensive customization options
- React bindings available
- Works well offline/with dark tiles

### 4. Styling Approach
Tailwind CSS with custom SCADA color palette provides:
- Consistent industrial aesthetic
- Dark mode optimized for control room environments
- Easy customization via config

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

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up -d
```

Access points:
- Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs
