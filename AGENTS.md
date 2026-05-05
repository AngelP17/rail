# Repository Guidance for Codex

## Read First

- This repository contains `hmax-lite`, a Panama Metro digital twin demo with a FastAPI simulator backend and a React/Vite operations dashboard frontend.
- Inspect the repo before editing. Derive commands and conventions from local files rather than inventing workflows.
- Do not change application behavior unless the user explicitly asks for an implementation change. For documentation-only tasks, keep edits to Markdown and guidance files.

## Project Layout

- `hmax-lite/backend/`: FastAPI app, Pydantic models, station data, and train simulation engine.
- `hmax-lite/frontend/`: React 18, TypeScript, Vite, Tailwind, Leaflet, Recharts, TanStack Query, GSAP dashboard.
- `hmax-lite/docs/`: setup, architecture notes, and dashboard screenshots.
- `hmax-lite/docker-compose.yml`: local two-service stack.
- Root `README.md`: project overview that points into `hmax-lite`.

## Commands

Run commands from `hmax-lite/` unless a command says otherwise.

### Full Stack

```bash
docker-compose up --build
```

Access:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Backend

```bash
cd hmax-lite/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

Verification:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/trains
python3 -m compileall .
```

Testing:

```bash
cd hmax-lite/backend
source venv/bin/activate
pytest -v
```

### Frontend

```bash
cd hmax-lite/frontend
npm install
npm run dev
npm run build
npm run lint
npm run format       # Prettier formatting
npm run format:check # Prettier check (CI)
npm run analyze      # Bundle size visualizer
```

Useful environment variables:

- `VITE_API_URL`: backend URL, default `http://localhost:8000`.
- `VITE_USE_MOCK=true`: force frontend mock telemetry fallback.

### Task Runner (Makefile)

```bash
make help          # Show all available commands
make up            # Docker Compose full stack
make dev-backend   # Backend dev server
make dev-frontend  # Frontend dev server
make verify        # Full CI pipeline (lint + compile + build + test)
make test          # Run all tests
make clean         # Clean build artifacts
```

## Conventions and Constraints

- Backend schemas in `hmax-lite/backend/models.py` mirror frontend types in `hmax-lite/frontend/src/types/train.ts`; keep them aligned when API payloads change.
- Route and station data live in both `hmax-lite/backend/stations.py` and the frontend mock data in `hmax-lite/frontend/src/utils/mockData.ts`; update both only when route data intentionally changes.
- The frontend should remain an operations-control dashboard, not a generic marketing page. Preserve readable telemetry, line filtering, map context, train selection, and B-CHOP/tunnel states.
- For visual frontend work, keep the dashboard realistic: train markers should move, telemetry should be plausible, line colors should remain Line 1 red, Line 2 green, Line 3 blue, and tunnel relay state should be visible for Line 3 between Balboa and Panama Pacifico.
- Existing design direction uses dark industrial SCADA styling, Tailwind utility classes, lucide icons, Leaflet map surfaces, Recharts telemetry, and GSAP motion.
- Avoid cheap meta labels such as `SECTION 01`, `QUESTION 05`, or filler status chips that do not carry real operational meaning.
- Do not edit generated or dependency folders: `node_modules/`, `dist/`, `backend/venv/`, `__pycache__/`, `.DS_Store`, screenshots unless intentionally refreshing documentation assets.
- The root `.gitignore` intentionally allows `hmax-lite/.claude/skills`; do not remove that exception unless asked.
- The frontend supports two view modes: **Simulation Board** (custom SVG, default) and **Map** (Leaflet). Preserve both when making visual changes.
- `ErrorBoundary` wraps the entire dashboard. Any new feature that might throw during render should be tested against it.
- Interactive SVG elements in `RailSimulationBoard` must have `role`, `aria-label`, `tabIndex`, and keyboard handlers (`Enter`/`Space`).
- Backend uses structured logging via `logging.basicConfig()`. Use the module logger (`logger = logging.getLogger(__name__)`) for new log statements.
- CI runs via GitHub Actions (`.github/workflows/ci.yml`). The workflow lints frontend, builds frontend, compiles backend, and runs backend tests.

## Documentation Expectations

- Keep setup, build, test/lint, and verification commands in docs whenever they are discoverable.
- If a command is unknown or absent, say so explicitly rather than inventing one.
- Note blockers and uncertainty in the final response.

## Done When

- The requested behavior or documentation change is implemented in the smallest reasonable scope.
- Relevant docs or AGENTS guidance are updated when the change affects future agents.
- Frontend changes pass `npm run build` and `npm run lint` from `hmax-lite/frontend` when possible.
- Backend changes pass at least `python3 -m compileall .` from `hmax-lite/backend` when possible.
- Manual verification steps are documented when browser or Docker checks cannot be run.
