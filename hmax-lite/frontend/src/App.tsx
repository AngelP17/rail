import { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Activity,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  TrainFront,
  Zap,
} from 'lucide-react';
import { useTrains } from './hooks/useTrains';
import { Map, TelemetrySidebar } from './components';
import { LINE_CONFIG } from './types/train';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PANAMA_IMAGES = {
  controlRoom: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format',
  operator: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format',
};

function Dashboard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    trains,
    allStations,
    allRouteCoordinates,
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    selectedLine,
    selectLine,
    systemStatus,
    isLoading,
    refreshTrains,
  } = useTrains();

  useGSAP(
    () => {
      gsap.from('.occ-panel', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
      });
    },
    { scope: rootRef },
  );

  const activeTrains = systemStatus?.active_trains ?? trains.length;
  const recoveredEnergy = systemStatus?.total_energy_recovered_kwh ?? 0;
  const movingTrains = trains.filter((t) => !t.at_station).length;
  const performancePct = activeTrains > 0 ? Math.round((movingTrains / activeTrains) * 100) : 0;

  return (
    <main ref={rootRef} className="relative h-screen w-full overflow-hidden bg-[#0a0e14] text-white font-sans">
      {/* Subtle ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.04)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="occ-panel relative z-50 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0e14]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d7ff5f]/10">
              <TrainFront className="h-5 w-5 text-[#d7ff5f]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">HMAX-Lite</span>
              <span className="block text-[10px] text-white/40">Metro Operations Control Center</span>
            </div>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {(['Overview', 'Network', 'Operations', 'Rolling Stock', 'Alarms', 'Reports'] as const).map((tab) => (
              <button
                key={tab}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === 'Overview'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-4 text-xs text-white/40 lg:flex">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" strokeWidth={1.5} />
              24C
            </span>
            <span className="font-mono tabular-nums">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            <span className="font-mono text-[10px]">UTC-5</span>
          </div>

          <button
            onClick={refreshTrains}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d7ff5f]/20 to-[#34d399]/20 text-xs font-bold text-[#d7ff5f]">
            OP
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="relative z-10 flex h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <aside className="occ-panel flex w-[260px] flex-col justify-between border-r border-white/[0.06] bg-[#0a0e14]/80 p-5 backdrop-blur-sm">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff5f] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d7ff5f]">Live Network View</span>
            </div>

            <h1 className="mb-3 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white">
              Panama Metro<br />digital twin
            </h1>

            <p className="mb-6 text-sm leading-relaxed text-white/50">
              Real-time awareness. Smarter decisions. Safer journeys.
            </p>

            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-[#d7ff5f] px-4 py-2.5 text-xs font-bold text-black transition-transform hover:scale-[1.02]">
                <Activity className="h-4 w-4" strokeWidth={1.5} />
                Network Overview
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/[0.08]">
                <TrainFront className="h-4 w-4" strokeWidth={1.5} />
                Train Operations
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Corridor Filter</p>
              {(['all', 'line1', 'line2', 'line3'] as const).map((line) => (
                <button
                  key={line}
                  onClick={() => selectLine(line)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
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
                  <span className="ml-auto font-mono text-[10px] text-white/30">
                    {line === 'all' ? trains.length : trains.filter((t) => t.line === line).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span>System Normal</span>
            </div>
            <p className="text-[10px] text-white/20">HMAX-Lite v1.4.2</p>
          </div>
        </aside>

        {/* Center - Map */}
        <div className="occ-panel relative flex-1">
          <Map
            trains={trains}
            stations={[]}
            allStations={allStations}
            routeCoordinates={[]}
            allRouteCoordinates={allRouteCoordinates}
            lines={[]}
            selectedLine={selectedLine}
            selectedTrainId={selectedTrainId}
            onSelectTrain={selectTrain}
          />
        </div>

        {/* Right Sidebar - Telemetry */}
        <aside className="occ-panel flex w-[300px] flex-col border-l border-white/[0.06] bg-[#0a0e14]/80 backdrop-blur-sm">
          <TelemetrySidebar
            train={selectedTrain}
            history={selectedTrainHistory}
            stations={allStations}
            onClose={() => selectTrain(null)}
          />
        </aside>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="occ-panel absolute bottom-0 left-[260px] right-[300px] z-40 flex items-end gap-3 p-4">
        <div className="flex flex-1 gap-3">
          {/* Network Status */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#111827]/90 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#34d399]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Network Status</span>
            </div>
            <p className="text-2xl font-black text-white">Normal</p>
            <p className="mt-1 text-xs text-white/40">All systems operational</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#34d399]">
              <span className="h-1 w-1 rounded-full bg-[#34d399]" />
              No active alarms
            </div>
          </div>

          {/* Service Performance */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#111827]/90 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#60a5fa]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Service Performance</span>
            </div>
            <p className="text-2xl font-black text-white">{performancePct}%</p>
            <p className="mt-1 text-xs text-white/40">On-time performance</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#34d399]">
              <ArrowRight className="h-3 w-3 rotate-[-45deg]" strokeWidth={2} />
              +2.1% vs yesterday
            </div>
          </div>

          {/* Trains in Service */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#111827]/90 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <TrainFront className="h-4 w-4 text-[#fbbf24]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Trains in Service</span>
            </div>
            <p className="text-2xl font-black text-white">{movingTrains} / {activeTrains}</p>
            <p className="mt-1 text-xs text-white/40">{Math.round((movingTrains / activeTrains) * 100)}% of fleet deployed</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#fbbf24] transition-all duration-700"
                style={{ width: `${(movingTrains / activeTrains) * 100}%` }}
              />
            </div>
          </div>

          {/* Energy Efficiency */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#111827]/90 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#d7ff5f]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Energy Efficiency</span>
            </div>
            <p className="text-2xl font-black text-white">{Math.round((recoveredEnergy / 500) * 100)}%</p>
            <p className="mt-1 text-xs text-white/40">Regenerated vs total</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#d7ff5f]">
              <ArrowRight className="h-3 w-3 rotate-[-45deg]" strokeWidth={2} />
              +5% vs yesterday
            </div>
          </div>
        </div>

        {/* Control Room Image */}
        <div className="hidden h-[116px] w-[200px] overflow-hidden rounded-xl border border-white/[0.06] xl:block">
          <img
            src={PANAMA_IMAGES.controlRoom}
            alt="Operations control room"
            className="h-full w-full object-cover opacity-70"
            loading="lazy"
          />
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
