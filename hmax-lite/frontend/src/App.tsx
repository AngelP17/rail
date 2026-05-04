import { useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  BatteryCharging,
  Gauge,
  MapPinned,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  TrainFront,
  Waves,
} from 'lucide-react';
import { useTrains } from './hooks/useTrains';
import { Map, TrainList, TelemetrySidebar } from './components';
import { LINE_CONFIG, type MetroLine } from './types/train';

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
      gsap.from('.hero-copy > *', {
        y: 34,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
      });

      gsap.utils.toArray<HTMLElement>('[data-motion-image]').forEach((element) => {
        gsap.fromTo(
          element,
          { scale: 0.86, opacity: 0.35, filter: 'brightness(0.62) saturate(0.7)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'brightness(1) saturate(1)',
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              end: 'bottom 18%',
              scrub: true,
            },
          },
        );
      });

      gsap.to('.marquee-track', {
        xPercent: -50,
        duration: 28,
        ease: 'none',
        repeat: -1,
      });

      const words = gsap.utils.toArray<HTMLElement>('.reveal-word');
      gsap.fromTo(
        words,
        { opacity: 0.14, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.045,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scrub-reveal',
            start: 'top 78%',
            end: 'bottom 42%',
            scrub: true,
          },
        },
      );

      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          ScrollTrigger.create({
            trigger: '.command-section',
            start: 'top top',
            end: 'bottom bottom',
            pin: '.pin-copy',
            pinSpacing: false,
          });
        },
      });

    },
    { scope: rootRef },
  );

  const activeTrains = systemStatus?.active_trains ?? trains.length;
  const recoveredEnergy = systemStatus?.total_energy_recovered_kwh ?? 0;
  const trainsInTunnel = systemStatus?.trains_in_tunnel ?? trains.filter((train) => train.is_in_tunnel).length;
  const averageSpeed =
    trains.length > 0
      ? trains.reduce((total, train) => total + train.telemetry.speed_kmh, 0) / trains.length
      : 0;

  const lineCards = (['line1', 'line2', 'line3'] as MetroLine[]).map((line) => ({
    line,
    trains: trains.filter((train) => train.line === line),
  }));

  const revealText =
    'A compact operations layer for Panama Metro telemetry, built to keep fleet motion, tunnel relay behavior, and B-CHOP recovery visible from the same control surface.';

  return (
    <main ref={rootRef} className="relative w-full max-w-full overflow-x-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(74,144,226,0.2),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(52,211,153,0.16),transparent_30%),linear-gradient(180deg,#07090d_0%,#0a0e14_45%,#050608_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 grain-overlay" />
      </div>

      <nav className="absolute left-1/2 top-5 z-50 w-[min(1120px,calc(100%-32px))] -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full border border-white/12 bg-black/45 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <button
            onClick={() => selectLine('all')}
            className="group flex items-center gap-3 rounded-full pr-4 transition-transform duration-500 hover:scale-[1.02]"
            aria-label="Show all lines"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <TrainFront className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold tracking-tight">HMAX-Lite</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                Panama control
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {(['all', 'line1', 'line2', 'line3'] as const).map((line) => {
              const isActive = selectedLine === line;
              const color = line === 'all' ? '#f8fafc' : LINE_CONFIG[line].color;

              return (
                <button
                  key={line}
                  onClick={() => onLineSelect(line, selectLine)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                    isActive ? 'bg-white text-black' : 'text-white/62 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {line === 'all' ? 'Network' : LINE_CONFIG[line].label}
                </button>
              );
            })}
          </div>

          <button
            onClick={refreshTrains}
            className="flex items-center gap-2 rounded-full bg-[#d7ff5f] px-4 py-2 text-sm font-bold text-black transition-transform duration-500 hover:scale-[1.04] active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            Sync
          </button>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen px-5 pb-24 pt-36 md:px-10 md:pb-36 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hero-copy">
            <p className="mb-8 max-w-lg font-mono text-xs uppercase tracking-[0.34em] text-[#d7ff5f]">
              Live rail digital twin for fleet, tunnel, and energy control
            </p>
            <h1 className="max-w-6xl text-[clamp(3.25rem,7vw,7.9rem)] font-black leading-[0.86] tracking-[-0.08em] text-white">
              Panama Metro digital twin.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/62 md:text-xl">
              A concise operations surface for live geospatial telemetry, B-CHOP recovery, train movement, and Line 3 tunnel relay behavior.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#operations"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-transform duration-500 hover:scale-[1.04]"
              >
                Open command view
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a
                href="#briefing"
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-4 text-sm font-bold text-white backdrop-blur-xl transition-colors duration-500 hover:bg-white/14"
              >
                View operating model
              </a>
            </div>
          </div>

          <div className="group relative min-h-[540px] overflow-hidden rounded-[2.4rem] border border-white/12 bg-white/[0.04] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
            <div
              data-motion-image
              className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-luminosity contrast-125"
              style={{ backgroundImage: "url('https://picsum.photos/seed/panama-rail-control/1920/1080')" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,transparent_0%,rgba(0,0,0,0.15)_28%,rgba(0,0,0,0.86)_78%)]" />
            <div className="absolute inset-x-7 top-7 flex items-center justify-between rounded-full border border-white/12 bg-black/35 px-4 py-3 backdrop-blur-xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Line 3 tunnel</span>
              <span className="h-2 w-2 rounded-full bg-[#d7ff5f] shadow-[0_0_24px_rgba(215,255,95,0.8)]" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="rounded-[1.8rem] border border-white/12 bg-black/45 p-6 backdrop-blur-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-2xl font-black tracking-[-0.04em]">Canal relay watch</p>
                  <RadioTower className="h-6 w-6 text-[#d7ff5f]" strokeWidth={1.5} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Fleet', activeTrains.toString()],
                    ['Tunnel', trainsInTunnel.toString()],
                    ['Avg km/h', averageSpeed.toFixed(0)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
                      <p className="mt-2 font-mono text-3xl font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="briefing" className="relative z-10 px-5 py-32 md:px-10 md:py-48 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-4xl text-[clamp(2.6rem,5vw,5.8rem)] font-black leading-[0.92] tracking-[-0.07em]">
              Every panel earns its place.
            </h2>
            <p className="max-w-md text-lg leading-8 text-white/58">
              The system keeps route state, train state, energy recovery, and communications mode visible without decorative console clutter.
            </p>
          </div>

          <div className="grid grid-flow-dense grid-cols-1 gap-5 lg:grid-cols-12">
            <FeatureCard
              className="lg:col-span-5"
              icon={<MapPinned />}
              title="Network map"
              body="Routes, stations, tunnel boundaries, and train positions share one readable map surface."
              imageSeed="metro-geospatial"
            />
            <FeatureCard
              className="lg:col-span-4"
              icon={<BatteryCharging />}
              title="B-CHOP recovery"
              body="Regenerative braking, recovered energy, and brake temperature remain visible during inspection."
              imageSeed="regenerative-braking"
            />
            <FeatureCard
              className="lg:col-span-3"
              icon={<Waves />}
              title="Tunnel relay"
              body="Line 3 trains expose tunnel mode and communications relay state as operational signals."
              imageSeed="canal-tunnel"
            />
            <FeatureCard
              className="lg:col-span-7"
              icon={<ShieldCheck />}
              title="Concise control surface"
              body="The design favors large telemetry, restrained color, and stable map context over decorative UI chrome."
              imageSeed="industrial-command"
            />
            <FeatureCard
              className="lg:col-span-5"
              icon={<Gauge />}
              title="Motion with purpose"
              body="Scroll motion supports orientation while the live control view keeps high-frequency information steady."
              imageSeed="motion-dashboard"
            />
          </div>
        </div>
      </section>

      <section className="scrub-reveal relative z-10 px-5 py-24 md:px-10 md:py-36 lg:px-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[clamp(2rem,4vw,4.7rem)] font-black leading-tight tracking-[-0.055em] text-white">
            {revealText.split(' ').map((word, index) => (
              <span key={`${word}-${index}`} className="reveal-word inline-block px-1">
                {word}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden py-10">
        <div className="marquee-track flex w-max gap-5 whitespace-nowrap font-mono text-[12vw] font-bold uppercase leading-none tracking-[-0.08em] text-white/10">
          {['Line 1', 'Line 2', 'Line 3', 'B-CHOP', 'CBTC', 'Tunnel relay', 'Live OCC', 'Panama Metro'].map((item) => (
            <span key={item} className="px-6">
              {item}
            </span>
          ))}
          {['Line 1', 'Line 2', 'Line 3', 'B-CHOP', 'CBTC', 'Tunnel relay', 'Live OCC', 'Panama Metro'].map((item) => (
            <span key={`${item}-repeat`} className="px-6">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section id="operations" className="command-section relative z-10 px-5 py-32 md:px-10 md:py-48 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="pin-copy h-fit">
            <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#d7ff5f]">Operations view</p>
            <h2 className="mt-6 text-[clamp(2.8rem,5.7vw,6.5rem)] font-black leading-[0.88] tracking-[-0.08em]">
              Map, fleet, telemetry.
            </h2>
            <p className="mt-7 max-w-md text-lg leading-8 text-white/56">
              Select a corridor, inspect fleet state, and drill into train telemetry without losing the broader network context.
            </p>

            <div className="mt-10 flex flex-col gap-3">
              {lineCards.map(({ line, trains: lineTrains }) => {
                const isActive = selectedLine === line;
                return (
                  <button
                    key={line}
                    onClick={() => selectLine(line)}
                    className={`group overflow-hidden rounded-[1.5rem] border p-4 text-left transition-all duration-500 ${
                      isActive
                        ? 'border-white/22 bg-white text-black'
                        : 'border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-5">
                      <span className="text-xl font-black tracking-[-0.04em]">{LINE_CONFIG[line].label}</span>
                      <span className="font-mono text-xs">{lineTrains.length} trains</span>
                    </div>
                    <div className="mt-5 h-16 overflow-hidden rounded-2xl">
                      <div
                        className="h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                        style={{ backgroundImage: `url('https://picsum.photos/seed/${line}-metro-line/900/320')` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <Kpi label="Active fleet" value={activeTrains.toString()} />
              <Kpi label="Recovered" value={`${recoveredEnergy.toFixed(1)} kWh`} />
              <Kpi label="Tunnel relay" value={trainsInTunnel.toString()} />
              <Kpi label="Health" value={systemStatus?.system_health ?? 'Offline'} />
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-black/35 p-3 shadow-[0_40px_140px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
              <div className="grid min-h-[820px] grid-cols-1 overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#090d13] lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_420px] 2xl:h-[820px] 2xl:grid-cols-[300px_minmax(0,1fr)_370px] 2xl:grid-rows-1">
                <div className="min-h-[340px] border-b border-white/10 lg:min-h-0 lg:border-b-0 lg:border-r">
                  <TrainList
                    trains={trains}
                    selectedTrainId={selectedTrainId}
                    onSelectTrain={selectTrain}
                    selectedLine={selectedLine}
                  />
                </div>

                <div className="relative min-h-[520px] min-w-0 lg:min-h-0">
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

                <div className="min-h-[420px] border-t border-white/10 lg:col-span-2 2xl:col-span-1 2xl:border-l 2xl:border-t-0">
                  <TelemetrySidebar
                    train={selectedTrain}
                    history={selectedTrainHistory}
                    stations={allStations}
                    onClose={() => selectTrain(null)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-12 pt-16 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-white/12 bg-white/[0.04] p-8 backdrop-blur-2xl md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/42">HMAX-Lite simulator</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2.4rem,4vw,4.8rem)] font-black leading-[0.9] tracking-[-0.07em]">
              A concise control surface for a living rail simulation.
            </h2>
          </div>
          <a
            href="#operations"
            className="inline-flex items-center justify-center rounded-full bg-[#d7ff5f] px-7 py-4 text-sm font-black text-black transition-transform duration-500 hover:scale-[1.04]"
          >
            Return to command
          </a>
        </div>
      </footer>
    </main>
  );
}

function onLineSelect(line: MetroLine | 'all', selectLine: (line: MetroLine | 'all') => void) {
  selectLine(line);
}

function FeatureCard({
  className,
  icon,
  title,
  body,
  imageSeed,
}: {
  className?: string;
  icon: ReactNode;
  title: string;
  body: string;
  imageSeed: string;
}) {
  return (
    <article
      className={`group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.045] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] ${className ?? ''}`}
    >
      <div
        data-motion-image
        className="absolute inset-0 bg-cover bg-center opacity-32 grayscale transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url('https://picsum.photos/seed/${imageSeed}/1200/800')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/58 to-black/92" />
      <div className="relative flex h-full min-h-[312px] flex-col justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
          {icon}
        </div>
        <div>
          <h3 className="max-w-xl text-3xl font-black leading-none tracking-[-0.055em]">{title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/62">{body}</p>
        </div>
      </div>
    </article>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">{label}</p>
      <p className="mt-3 truncate font-mono text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
