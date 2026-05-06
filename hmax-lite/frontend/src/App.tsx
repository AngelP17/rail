/**
 * HMAX-Lite: Flagship App Shell
 * ==============================
 *
 * Two surfaces:
 * - Landing: portfolio presentation layer
 * - Console: live OCC simulation dashboard
 *
 * Unified design language, shared primitives, no generic cards.
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
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
  ArrowLeft,
} from 'lucide-react';
import { useTrains } from './hooks/useTrains';
import { RailSimulationBoard } from './components/simulation/RailSimulationBoard';
import { Map } from './components/Map';
import { TelemetrySidebar } from './components/TelemetrySidebar';
import { EventTimeline } from './components/EventTimeline';
import { ScenarioDirector } from './components/ScenarioDirector';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { HudPanel, ModeToggle, OperationalMetric, StatusRail } from './components/primitives';
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

type AppMode = 'landing' | 'console';
type ViewMode = 'board' | 'map';

function Console({ onBack, autoStartDemo = false }: { onBack: () => void; autoStartDemo?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);
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

  useEffect(() => {
    if (!autoStartDemo || autoStartedRef.current || isDemoRunning) return;
    autoStartedRef.current = true;
    startDemo();
  }, [autoStartDemo, isDemoRunning, startDemo]);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('.console-panel', {
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
    () =>
      deriveSimulationFrame(
        trains,
        systemStatus || {
          active_trains: 0,
          total_energy_recovered_kwh: 0,
          trains_in_tunnel: 0,
          system_health: 'NORMAL',
          timestamp: new Date().toISOString(),
        },
        scenario,
      ),
    [trains, systemStatus, scenario],
  );

  const signalBlocks = useMemo(() => deriveSignalBlocks(trains), [trains]);

  const movingTrains = trains.filter((t) => !t.at_station).length;
  const brakingTrains = trains.filter((t) => t.telemetry.b_chop_status).length;
  const tunnelTrains = trains.filter((t) => t.is_in_tunnel).length;
  const dwellTrains = trains.filter((t) => t.at_station).length;

  const apiStatus = useMemo(() => {
    if (error) return { state: 'error' as const, label: 'API Error', color: '#ef4444', icon: AlertCircle };
    if (import.meta.env.VITE_USE_MOCK === 'true') return { state: 'mock' as const, label: 'Mock Data', color: '#fbbf24', icon: WifiOff };
    return { state: 'live' as const, label: 'Live API', color: '#34d399', icon: Wifi };
  }, [error]);

  const StatusIcon = apiStatus.icon;

  return (
    <main ref={rootRef} className="relative h-screen w-full overflow-hidden bg-scada-bg text-white font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.02)_0%,transparent_50%)]" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="console-panel relative z-50 flex h-14 items-center justify-between border-b border-scada-border bg-scada-bg/90 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Back to landing"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dim">
              <TrainFront className="h-4 w-4 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">HMAX-Lite</span>
              <span className="block text-3xs text-white/40 font-mono uppercase tracking-wider">OCC Console</span>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-normal" />
            <span className="text-3xs font-mono uppercase tracking-wider text-status-normal">
              {systemStatus?.system_health ?? 'OFFLINE'}
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-scada-border bg-white/[0.03] px-2.5 py-1 md:flex">
            <Zap className="h-3 w-3 text-white/30" strokeWidth={1.5} />
            <span className="text-3xs font-mono uppercase tracking-wider text-white/40">
              {scenario.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="hidden items-center gap-1.5 rounded-md border border-scada-border bg-white/[0.03] px-2.5 py-1 lg:flex"
            title={apiStatus.label}
          >
            <StatusIcon className="h-3 w-3" style={{ color: apiStatus.color }} strokeWidth={1.5} />
            <span className="text-3xs font-mono uppercase tracking-wider" style={{ color: apiStatus.color }}>
              {apiStatus.label}
            </span>
          </div>

          <ModeToggle
            modes={[
              { value: 'board' as const, icon: <CircuitBoard className="h-3.5 w-3.5" strokeWidth={1.5} />, label: 'Simulation Board' },
              { value: 'map' as const, icon: <MapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />, label: 'Geographic Map' },
            ]}
            active={viewMode}
            onChange={setViewMode}
          />

          <div className="hidden items-center gap-4 text-xs text-white/40 lg:flex">
            <span className="flex items-center gap-1.5 font-mono text-3xs">
              <Zap className="h-3 w-3 text-brand" strokeWidth={1.5} />
              {Math.round(simulationFrame.networkBatteryLevel)}%
            </span>
            <span className="flex items-center gap-1.5 font-mono text-3xs">
              <Radio className="h-3 w-3 text-status-tunnel" strokeWidth={1.5} />
              {tunnelTrains}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-3xs">
              <Thermometer className="h-3 w-3 text-status-warning" strokeWidth={1.5} />
              {brakingTrains}
            </span>
            <span className="font-mono tabular-nums text-3xs">
              <Clock className="inline h-3 w-3 mr-1" strokeWidth={1.5} />
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="font-mono text-3xs text-white/20">UTC-5</span>
          </div>

          <button
            onClick={refreshTrains}
            aria-label="Refresh train data"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-status-normal/20 text-3xs font-bold text-brand">
            OP
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="relative z-10 flex h-[calc(100vh-56px)]">
        {/* Left HUD — Command Clusters */}
        <aside className="console-panel flex w-[260px] flex-col border-r border-scada-border bg-scada-bg/80 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Branding */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-3xs font-mono uppercase tracking-[0.2em] text-brand">Live Simulation</span>
              </div>
              <h1 className="text-2xl font-black leading-[0.95] tracking-[-0.04em] text-white">
                Dispatch
                <br />
                Playfield
              </h1>
            </div>

            {/* Scenario Director Cluster */}
            <HudPanel dense title="Scenario Director" titleIcon={<Zap className="h-3 w-3" strokeWidth={1.5} />}>
              <div className="p-2">
                <ScenarioDirector
                  currentScenario={scenario}
                  onScenarioChange={setScenarioMode}
                  isDemoRunning={isDemoRunning}
                  onDemoStart={startDemo}
                  onDemoStop={stopDemo}
                  onDemoStep={applyDemoStep}
                />
              </div>
            </HudPanel>

            {/* Corridor Selector Cluster */}
            <HudPanel dense title="Corridor" titleIcon={<TrainFront className="h-3 w-3" strokeWidth={1.5} />}>
              <div className="p-2 space-y-0.5">
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
                    <span className="ml-auto font-mono text-3xs text-white/30">
                      {line === 'all' ? trains.length : trains.filter((t) => t.line === line).length}
                    </span>
                  </button>
                ))}
              </div>
            </HudPanel>

            {/* Service Load Rail */}
            <StatusRail
              items={[
                { label: 'Moving', value: movingTrains, color: '#34d399' },
                { label: 'Braking', value: brakingTrains, color: '#fbbf24' },
                { label: 'Tunnel', value: tunnelTrains, color: '#22d3ee' },
                { label: 'Dwell', value: dwellTrains, color: '#60a5fa' },
              ]}
            />

            {/* Energy Rail */}
            <OperationalMetric
              label="Network Battery"
              value={Math.round(simulationFrame.networkBatteryLevel)}
              unit="%"
              accent="#d7ff5f"
              icon={<Zap className="h-3.5 w-3.5" strokeWidth={1.5} />}
            >
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${simulationFrame.networkBatteryLevel}%` }}
                />
              </div>
            </OperationalMetric>
          </div>

          {/* Footer */}
          <div className="border-t border-scada-border p-4">
            <div className="flex items-center gap-2 text-3xs text-white/30">
              <div className="h-1.5 w-1.5 rounded-full bg-status-normal" />
              <span>System Normal</span>
            </div>
            <p className="mt-1 text-3xs text-white/20">HMAX-Lite v2.0.0</p>
          </div>
        </aside>

        {/* Center — Simulation Board or Map */}
        <div className="console-panel relative flex-1 overflow-hidden">
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

        {/* Right HUD — Train Inspector */}
        <aside className="console-panel flex w-[320px] flex-col border-l border-scada-border bg-scada-bg/80 backdrop-blur-sm">
          <TelemetrySidebar
            train={selectedTrain}
            history={selectedTrainHistory}
            stations={allStations}
            onClose={() => selectTrain(null)}
            allTrains={trains}
            events={events}
            onSelectTrain={selectTrain}
          />
        </aside>
      </div>

      {/* Bottom HUD — Event Timeline */}
      <div className="console-panel absolute bottom-0 left-[260px] right-[320px] z-40 h-[120px] border-t border-scada-border bg-scada-bg/90 backdrop-blur-xl">
        <EventTimeline
          events={events}
          selectedTrainId={selectedTrainId}
          onSelectTrain={selectTrain}
        />
      </div>
    </main>
  );
}

function Dashboard() {
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [autoStartDemo, setAutoStartDemo] = useState(false);

  const enterConsole = () => {
    setAutoStartDemo(false);
    setAppMode('console');
  };

  const handleRunScenario = () => {
    setAutoStartDemo(true);
    setAppMode('console');
  };

  if (appMode === 'landing') {
    return <LandingPage onEnterConsole={enterConsole} onRunScenario={handleRunScenario} />;
  }

  return (
    <Console
      autoStartDemo={autoStartDemo}
      onBack={() => {
        setAutoStartDemo(false);
        setAppMode('landing');
      }}
    />
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
