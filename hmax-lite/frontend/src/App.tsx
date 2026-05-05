/**
 * HMAX-Lite: Flagship App - 2.5D OCC Simulation Console
 * ======================================================
 *
 * The dispatch playfield layout:
 * - Center: RailSimulationBoard (custom SVG hero surface) OR Leaflet Map
 * - Left HUD: Fleet selector + Scenario Director + line health
 * - Right HUD: Train Hero Inspector
 * - Bottom HUD: Live Event Timeline
 *
 * No generic KPI cards. No stock photos. No fake deltas.
 */

import { useRef, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Activity,
  RefreshCw,
  TrainFront,
  Zap,
  Radio,
  Thermometer,
  Clock,
  Map as MapIcon,
  CircuitBoard,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useTrains } from './hooks/useTrains';
import { RailSimulationBoard } from './components/simulation/RailSimulationBoard';
import { Map } from './components/Map';
import { TelemetrySidebar } from './components/TelemetrySidebar';
import { EventTimeline } from './components/EventTimeline';
import { ScenarioDirector } from './components/ScenarioDirector';
import { ErrorBoundary } from './components/ErrorBoundary';
import { deriveSignalBlocks } from './simulation/deriveSignalBlocks';
import { deriveSimulationFrame } from './simulation/deriveSimulationFrame';
import { LINE_CONFIG } from './types/train';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type ViewMode = 'board' | 'map';

function Dashboard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const {
    trains,
    allStations,
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    selectedLine,
    selectLine,
    scenario,
    setScenarioMode,
    systemStatus,
    isLoading,
    refreshTrains,
    events,
    isDemoRunning,
    startDemo,
    stopDemo,
    applyDemoStep,
    error,
    lines,
    allRouteCoordinates,
  } = useTrains();

  useGSAP(
    () => {
      gsap.from('.hud-panel', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
      });
    },
    { scope: rootRef },
  );

  const simulationFrame = useMemo(
    () => deriveSimulationFrame(trains, systemStatus || { active_trains: 0, total_energy_recovered_kwh: 0, trains_in_tunnel: 0, system_health: 'NORMAL', timestamp: new Date().toISOString() }, scenario),
    [trains, systemStatus, scenario],
  );

  const signalBlocks = useMemo(
    () => deriveSignalBlocks(trains),
    [trains],
  );

  const movingTrains = trains.filter((t) => !t.at_station).length;
  const brakingTrains = trains.filter((t) => t.telemetry.b_chop_status).length;
  const tunnelTrains = trains.filter((t) => t.is_in_tunnel).length;
  const dwellTrains = trains.filter((t) => t.at_station).length;

  // Determine API connection status
  const apiStatus = useMemo(() => {
    if (error) return { state: 'error' as const, label: 'API Error', color: '#ef4444', icon: AlertCircle };
    if (import.meta.env.VITE_USE_MOCK === 'true') return { state: 'mock' as const, label: 'Mock Data', color: '#fbbf24', icon: WifiOff };
    return { state: 'live' as const, label: 'Live API', color: '#34d399', icon: Wifi };
  }, [error]);

  const StatusIcon = apiStatus.icon;

  return (
    <main ref={rootRef} className="relative h-screen w-full overflow-hidden bg-[#06090f] text-white font-sans">
      {/* Subtle ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.02)_0%,transparent_50%)]" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="hud-panel relative z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#06090f]/90 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d7ff5f]/10">
              <TrainFront className="h-4 w-4 text-[#d7ff5f]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">HMAX-Lite</span>
              <span className="block text-[9px] text-white/40 font-mono uppercase tracking-wider">OCC Simulation</span>
            </div>
          </div>

          {/* Live system pulse */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#34d399]">
              {systemStatus?.system_health ?? 'OFFLINE'}
            </span>
          </div>

          {/* Scenario indicator */}
          <div className="hidden items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 md:flex">
            <Activity className="h-3 w-3 text-white/30" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              {scenario.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* API Status */}
          <div
            className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 lg:flex"
            title={apiStatus.label}
          >
            <StatusIcon className="h-3 w-3" style={{ color: apiStatus.color }} strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: apiStatus.color }}>
              {apiStatus.label}
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
            <button
              onClick={() => setViewMode('board')}
              aria-label="Switch to simulation board view"
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'board' ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <CircuitBoard className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              aria-label="Switch to geographic map view"
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'map' ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Compact metrics */}
          <div className="hidden items-center gap-4 text-xs text-white/40 lg:flex">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Zap className="h-3 w-3 text-[#d7ff5f]" strokeWidth={1.5} />
              {Math.round(simulationFrame.networkBatteryLevel)}%
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Radio className="h-3 w-3 text-[#22d3ee]" strokeWidth={1.5} />
              {tunnelTrains}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Thermometer className="h-3 w-3 text-[#fbbf24]" strokeWidth={1.5} />
              {brakingTrains}
            </span>
            <span className="font-mono tabular-nums text-[10px]">
              <Clock className="inline h-3 w-3 mr-1" strokeWidth={1.5} />
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="font-mono text-[9px] text-white/20">UTC-5</span>
          </div>

          <button
            onClick={refreshTrains}
            aria-label="Refresh train data"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#d7ff5f]/20 to-[#34d399]/20 text-[9px] font-bold text-[#d7ff5f]">
            OP
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="relative z-10 flex h-[calc(100vh-56px)]">
        {/* Left HUD */}
        <aside className="hud-panel flex w-[240px] flex-col border-r border-white/[0.06] bg-[#06090f]/80 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Branding */}
            <div className="mb-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff5f] animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#d7ff5f]">Live Simulation</span>
              </div>
              <h1 className="text-2xl font-black leading-[0.95] tracking-[-0.04em] text-white">
                Dispatch<br />Playfield
              </h1>
            </div>

            {/* Scenario Director */}
            <div className="mb-5">
              <ScenarioDirector
                currentScenario={scenario}
                onScenarioChange={setScenarioMode}
                isDemoRunning={isDemoRunning}
                onDemoStart={startDemo}
                onDemoStop={stopDemo}
                onDemoStep={applyDemoStep}
              />
            </div>

            {/* Corridor Filter */}
            <div className="mb-5 space-y-1">
              <p className="px-1 text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Corridor</p>
              {(['all', 'line1', 'line2', 'line3'] as const).map((line) => (
                <button
                  key={line}
                  onClick={() => selectLine(line)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    selectedLine === line
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: line === 'all' ? '#94a3b8' : LINE_CONFIG[line].color }}
                  />
                  {line === 'all' ? 'All Corridors' : LINE_CONFIG[line].label}
                  <span className="ml-auto font-mono text-[9px] text-white/30">
                    {line === 'all' ? trains.length : trains.filter((t) => t.line === line).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Fleet status mini-cards */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              {[
                { label: 'Moving', value: movingTrains, color: '#34d399' },
                { label: 'Braking', value: brakingTrains, color: '#fbbf24' },
                { label: 'Tunnel', value: tunnelTrains, color: '#22d3ee' },
                { label: 'Dwell', value: dwellTrains, color: '#60a5fa' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                  <div className="mb-1.5 h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
                  <p className="font-mono text-lg font-black text-white">{value}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">{label}</p>
                </div>
              ))}
            </div>

            {/* Energy meter */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">Network Battery</span>
                <span className="font-mono text-[10px] text-[#d7ff5f]">{Math.round(simulationFrame.networkBatteryLevel)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#d7ff5f] transition-all duration-700"
                  style={{ width: `${simulationFrame.networkBatteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span>System Normal</span>
            </div>
            <p className="mt-1 text-[9px] text-white/20">HMAX-Lite v2.0.0</p>
          </div>
        </aside>

        {/* Center - Simulation Board or Map */}
        <div className="hud-panel relative flex-1 overflow-hidden">
          {viewMode === 'board' ? (
            <RailSimulationBoard
              trains={trains}
              stations={allStations}
              selectedLine={selectedLine}
              selectedTrainId={selectedTrainId}
              onSelectTrain={selectTrain}
              signalBlocks={signalBlocks}
              scenarioIntensity={simulationFrame.scenario === 'normal' ? 1 : 1.5}
              showEnergyPulses={true}
            />
          ) : (
            <Map
              trains={trains}
              stations={allStations}
              allStations={allStations}
              routeCoordinates={[]}
              allRouteCoordinates={allRouteCoordinates}
              lines={lines}
              selectedLine={selectedLine}
              selectedTrainId={selectedTrainId}
              onSelectTrain={selectTrain}
            />
          )}
        </div>

        {/* Right HUD - Inspector */}
        <aside className="hud-panel flex w-[300px] flex-col border-l border-white/[0.06] bg-[#06090f]/80 backdrop-blur-sm">
          <TelemetrySidebar
            train={selectedTrain}
            history={selectedTrainHistory}
            stations={allStations}
            onClose={() => selectTrain(null)}
          />
        </aside>
      </div>

      {/* Bottom HUD - Event Timeline */}
      <div className="hud-panel absolute bottom-0 left-[240px] right-[300px] z-40 h-[110px] border-t border-white/[0.06] bg-[#06090f]/90 backdrop-blur-xl">
        <EventTimeline events={events} />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
