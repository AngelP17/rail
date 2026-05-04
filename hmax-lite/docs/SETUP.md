# HMAX-Lite Setup Guide

> Panama Metro Digital Twin - Real-time SCADA Simulation

## 📋 Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Backend API server |
| **Node.js** | 18+ | Frontend dev server |
| **npm** | 9+ | Package management |
| **Docker + Docker Compose** *(optional)* | Docker 20+ / Compose v2 | Container deployment |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/AngelP17/rail.git
cd rail/hmax-lite
```

### 2. Start the Backend (Terminal 1)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Optional mock-only frontend mode:

```bash
VITE_USE_MOCK=true npm run dev
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Operations Control Center |
| **API Docs** | http://localhost:8000/docs | Swagger/OpenAPI |
| **Health Check** | http://localhost:8000/health | Server status |

---

## 🐳 Docker Deployment (Alternative)

For a one-command launch with Docker:

```bash
cd hmax-lite
docker-compose up --build
```

This will start both services automatically.

---

## 📦 Dependencies

### Backend (Python)

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server |
| `pydantic` | Data validation |
| `sse-starlette` | Server-Sent Events |
| `python-multipart` | CORS support |
| `python-dateutil` | Date utilities |

### Frontend (Node.js)

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `vite` | Build tool & dev server |
| `typescript` | Type safety |
| `leaflet` / `react-leaflet` | Interactive maps |
| `@tanstack/react-query` | Data fetching |
| `recharts` | Charts & gauges |
| `tailwindcss` | Styling |
| `lucide-react` | Icons |

---

## 🔧 Environment Variables (Optional)

Create a `.env` file in the backend directory if needed:

```bash
# backend/.env
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

---

## ✅ Verify Installation

1. **Backend Health:** `curl http://localhost:8000/health`
2. **API Response:** `curl http://localhost:8000/api/trains`
3. **Frontend:** Open http://localhost:3000 in browser

You should see the Operations Dashboard with a map displaying all three metro lines and live train telemetry.

---

## 🛠️ Development Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `/frontend` | Start dev server with HMR |
| `npm run build` | `/frontend` | Production build |
| `npm run lint` | `/frontend` | Run ESLint |
| `python3 -m uvicorn main:app --reload --port 8000` | `/backend` | Start API with auto-reload |
| `python3 -m compileall .` | `/backend` | Compile Python files and catch syntax errors |

---

## 📂 Project Structure

```
hmax-lite/
├── backend/
│   ├── main.py           # FastAPI app entry
│   ├── simulator.py      # Train physics engine
│   ├── models.py         # Pydantic schemas
│   ├── stations.py       # Route data (39 stations)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/   # React components
│   │   ├── hooks/        # Data fetching hooks
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── docs/
    └── SETUP.md          # This file
```

---

## 🆘 Troubleshooting

### Port already in use

```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Python venv issues

```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node modules issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Known Gaps

- No dedicated backend unit test command is present.
- No Prettier or formatter command is defined in `frontend/package.json`.
- CI configuration is not present in this repository.

---

## 👨‍💻 Author

**Angel Pinzon** - [apinzon.dev](https://apinzon.dev)
