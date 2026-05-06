/**
 * HMAX-Lite: Portfolio Landing Layer
 * ===================================
 *
 * Editorial entry point for the OCC console. The page uses the same
 * rail, tunnel, and energy language as the live system so it does not
 * feel like a detached marketing wrapper.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  CircuitBoard,
  Gauge,
  Github,
  Map as MapIcon,
  Play,
  Radio,
  TrainFront,
  Zap,
} from 'lucide-react';
import { SectionSurface } from './primitives';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onEnterConsole: () => void;
  onRunScenario: () => void;
}

const linePath = 'M38 196 C150 188 174 116 286 132 C398 148 420 78 540 92 C644 104 674 46 790 54';
const proofWords = [
  'moving-block',
  'dispatch',
  'tunnel',
  'energy',
  'telemetry',
  'events',
  'scenario',
  'map',
  'simulation',
];

function RoutePill() {
  return (
    <div className="landing-hero-text inline-flex items-center gap-3 rounded-full border border-white/[0.10] bg-black/30 px-3 py-2 backdrop-blur-xl">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand/15">
        <TrainFront className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
      </span>
      <span className="text-2xs font-mono uppercase tracking-[0.18em] text-white/55">Line 3 Balboa Relay</span>
      <svg aria-hidden="true" viewBox="0 0 130 20" className="hidden h-5 w-32 sm:block">
        <path d="M4 11 C31 5 42 16 64 10 C86 4 95 16 126 8" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="42" cy="12" r="3" fill="#22d3ee" />
        <circle cx="92" cy="10" r="3" fill="#d7ff5f" />
      </svg>
    </div>
  );
}

function HeroNetworkPreview() {
  return (
    <div className="landing-hero-preview pointer-events-none absolute left-1/2 top-16 z-0 h-[520px] w-[min(1180px,92vw)] -translate-x-1/2 opacity-95">
      <div className="absolute inset-0 rounded-lg border border-white/[0.06] bg-[#05080d]/80 shadow-[0_30px_120px_rgba(0,0,0,0.55)]" />
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.20) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.20) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-scada-bg via-scada-bg/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-scada-bg via-scada-bg/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-scada-bg to-transparent" />
        <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-scada-bg to-transparent" />
        <svg aria-hidden="true" viewBox="0 0 840 260" className="absolute left-1/2 top-[210px] h-[270px] w-[920px] -translate-x-1/2">
          <path d="M36 212 C160 198 184 170 280 178 C350 184 388 122 472 128 C552 134 584 94 660 82 C718 72 746 58 804 50" fill="none" stroke="#1f2937" strokeWidth="18" strokeLinecap="round" />
          <path d={linePath} fill="none" stroke="#07111f" strokeWidth="17" strokeLinecap="round" />
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
          <path d="M286 132 C398 148 420 78 540 92" fill="none" stroke="#22d3ee" strokeWidth="16" strokeLinecap="round" strokeDasharray="10 13" opacity="0.18" />
          <path d="M286 132 C398 148 420 78 540 92" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 13" opacity="0.9" />
          {[38, 168, 286, 420, 540, 674, 790].map((x, index) => (
            <g key={x}>
              <circle cx={x} cy={[196, 162, 132, 112, 92, 66, 54][index]} r={index === 4 ? 10 : 6} fill="#05080d" stroke={index === 4 ? '#d7ff5f' : '#60a5fa'} strokeWidth="2" />
              <circle cx={x} cy={[196, 162, 132, 112, 92, 66, 54][index]} r={index === 4 ? 4 : 2.5} fill={index === 4 ? '#d7ff5f' : '#60a5fa'} />
            </g>
          ))}
          <g transform="translate(520 76)">
            <rect x="-28" y="-11" width="56" height="22" rx="7" fill="#0b1220" stroke="#d7ff5f" strokeWidth="1.5" />
            <rect x="-20" y="-4" width="26" height="8" rx="4" fill="#d7ff5f" />
            <rect x="10" y="-4" width="10" height="8" rx="2" fill="#3b82f6" />
          </g>
          <g transform="translate(280 132)" opacity="0.78">
            <circle r="22" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 7" />
            <circle r="34" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 10" opacity="0.45" />
          </g>
        </svg>
        <div className="absolute left-8 top-8 hidden rounded-md border border-white/[0.08] bg-black/45 px-3 py-2 font-mono text-3xs uppercase tracking-[0.18em] text-white/45 md:block">
          Panama Pacific corridor, live simulation frame
        </div>
        <div className="absolute bottom-9 right-8 hidden w-56 rounded-md border border-brand/20 bg-black/55 p-3 md:block">
          <div className="mb-2 flex items-center justify-between text-3xs font-mono uppercase tracking-[0.16em] text-white/40">
            <span>B-CHOP Recovery</span>
            <span className="text-brand">23%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-[62%] rounded-full bg-brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSimulationVisual() {
  return (
    <svg aria-hidden="true" viewBox="0 0 460 160" className="h-40 w-full">
      <path d="M22 110 C92 74 144 104 206 74 C280 38 330 64 438 32" fill="none" stroke="#111827" strokeWidth="18" strokeLinecap="round" />
      <path d="M22 110 C92 74 144 104 206 74 C280 38 330 64 438 32" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 93 C164 100 180 88 206 74" fill="none" stroke="#22d3ee" strokeWidth="11" strokeLinecap="round" strokeDasharray="6 8" opacity="0.28" />
      {[58, 135, 206, 286, 366, 438].map((x, index) => (
        <circle key={x} cx={x} cy={[92, 94, 74, 56, 45, 32][index]} r="6" fill="#05080d" stroke="#60a5fa" strokeWidth="2" />
      ))}
      <rect x="266" y="43" width="54" height="22" rx="7" fill="#0b1220" stroke="#d7ff5f" />
      <rect x="278" y="50" width="24" height="8" rx="4" fill="#d7ff5f" />
      <circle cx="318" cy="58" r="18" fill="none" stroke="#d7ff5f" strokeDasharray="3 7" opacity="0.45" />
    </svg>
  );
}

function MiniMapVisual() {
  return (
    <div className="relative h-40 overflow-hidden rounded-md border border-white/[0.06] bg-[#05070b]">
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(24deg, transparent 46%, rgba(255,255,255,0.34) 48%, transparent 50%), linear-gradient(118deg, transparent 44%, rgba(255,255,255,0.22) 47%, transparent 49%)',
          backgroundSize: '86px 64px',
        }}
      />
      <svg aria-hidden="true" viewBox="0 0 420 150" className="absolute inset-0 h-full w-full">
        <path d="M-20 118 C72 94 126 110 184 76 C240 44 286 78 440 28" fill="none" stroke="#3b82f6" strokeWidth="4" />
        <path d="M164 88 C222 42 282 78 332 58" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="8 8" opacity="0.22" />
        <circle cx="183" cy="76" r="6" fill="#22d3ee" />
        <circle cx="264" cy="67" r="7" fill="#d7ff5f" />
      </svg>
    </div>
  );
}

function EnergyBars() {
  return (
    <div className="mt-5 grid grid-cols-8 gap-1.5">
      {[42, 58, 76, 69, 91, 64, 37, 55].map((value, index) => (
        <div key={index} className="flex h-24 items-end rounded-sm bg-white/[0.035] p-1">
          <div className="w-full rounded-sm bg-brand/80" style={{ height: `${value}%` }} />
        </div>
      ))}
    </div>
  );
}

function RelayStrip() {
  return (
    <div className="mt-6 flex items-center gap-1.5">
      {['CBTC', 'RF', 'TUNNEL', 'RELAY', 'BALBOA'].map((label, index) => (
        <div
          key={label}
          className={`flex h-9 min-w-0 flex-1 items-center justify-center rounded-sm border font-mono text-[9px] uppercase tracking-wider ${
            index === 2 || index === 3
              ? 'border-status-tunnel/35 bg-status-tunnel/10 text-status-tunnel'
              : 'border-white/[0.08] bg-white/[0.035] text-white/35'
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function TelemetryGrid() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {[
        ['68', 'km/h'],
        ['312', 'A'],
        ['42', 'deg C'],
        ['0.82', 'occ'],
      ].map(([value, unit]) => (
        <div key={`${value}-${unit}`} className="rounded-md border border-white/[0.07] bg-black/20 p-3">
          <div className="font-mono text-lg font-semibold tabular-nums text-white">{value}</div>
          <div className="mt-1 font-mono text-3xs uppercase tracking-[0.16em] text-white/35">{unit}</div>
        </div>
      ))}
    </div>
  );
}

export function LandingPage({ onEnterConsole, onRunScenario }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.landing-hero-preview', { y: 28, opacity: 0, duration: 1.1 })
        .from('.landing-hero-text', { y: 34, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.75')
        .from('.landing-hero-cta', { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 }, '-=0.35');

      gsap.to('.reveal-word', {
        color: '#f8fafc',
        opacity: 1,
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.landing-desire',
          start: 'top 72%',
          end: 'bottom 46%',
          scrub: true,
        },
      });

      ScrollTrigger.create({
        trigger: '.landing-stack',
        start: 'top 12%',
        end: 'bottom 74%',
        pin: '.landing-stack-title',
        pinSpacing: false,
      });

      gsap.utils.toArray<HTMLElement>('.landing-stack-card').forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 72, scale: 0.94, opacity: 0 },
          {
            y: index * 14,
            scale: 1 - index * 0.018,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              end: 'top 42%',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = containerRef.current?.querySelector('.marquee-track');
    if (!el) return;
    gsap.to(el, {
      xPercent: -50,
      duration: 38,
      repeat: -1,
      ease: 'none',
    });
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-x-hidden bg-scada-bg text-white font-sans">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.07)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(215,255,95,0.04)_0%,transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.26) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.26) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <nav className="relative z-50 flex h-16 items-center justify-between border-b border-white/[0.06] bg-scada-bg/82 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dim">
            <TrainFront className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold tracking-tight">HMAX-Lite</span>
        </div>
        <a
          href="https://github.com/AngelP17/rail"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-2xs font-mono uppercase tracking-wider text-white/50 transition-colors hover:text-white"
        >
          <Github className="h-3.5 w-3.5" strokeWidth={1.5} />
          Source
        </a>
      </nav>

      <SectionSurface className="relative z-10 flex min-h-[calc(100vh-132px)] flex-col items-center justify-center px-6 pb-12 pt-12">
        <HeroNetworkPreview />
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <RoutePill />

          <h1 className="landing-hero-text mx-auto mt-7 max-w-6xl text-[clamp(3rem,6vw,6.1rem)] font-black leading-[0.94] tracking-tight">
            Panama Metro
            <br />
            live operations twin
          </h1>

          <p className="landing-hero-text mx-auto mt-7 max-w-3xl text-base leading-relaxed text-white/58 md:text-lg">
            A realistic OCC simulation for Lines 1, 2, and 3 with moving train capsules, CBTC blocks,
            Line 3 tunnel relay degradation, B-CHOP energy recovery, and event-derived operator prompts.
          </p>

          <div className="landing-hero-cta mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onEnterConsole}
              className="group flex items-center gap-2.5 rounded-lg bg-brand px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Enter OCC Console
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
            <button
              onClick={onRunScenario}
              className="flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-black/35 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              <Play className="h-4 w-4 text-brand" strokeWidth={2} />
              Run Flagship Scenario
            </button>
          </div>
        </div>
      </SectionSurface>

      <SectionSurface className="landing-desire relative z-10 px-6 py-28 md:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="max-w-5xl text-[clamp(2rem,5vw,5.4rem)] font-black leading-[0.98] tracking-tight text-white/16">
            {proofWords.map((word) => (
              <span key={word} className="reveal-word mr-[0.22em] inline-block opacity-25">
                {word}
              </span>
            ))}
          </p>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/48 md:text-base">
            The console is built around consequential state: trains occupy blocks, braking creates recoverable energy,
            tunnel segments change communications mode, and every visual mark has an operational reason to exist.
          </p>
        </div>
      </SectionSurface>

      <SectionSurface className="landing-stack relative z-10 px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.74fr_1.26fr]">
          <div className="landing-stack-title self-start pt-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-7 bg-white/20" />
              <span className="text-2xs font-mono uppercase tracking-[0.2em] text-white/35">System Capabilities</span>
            </div>
            <h2 className="max-w-md text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Portfolio proof that runs like an OCC.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/45">
              Each module mirrors the live console, so the landing page previews the product instead of decorating around it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-flow-dense">
            <article className="landing-stack-card md:col-span-7">
              <div className="rounded-lg border border-white/[0.08] bg-scada-surface/70 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.30)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircuitBoard className="h-4 w-4 text-brand" strokeWidth={1.5} />
                    <h3 className="text-base font-bold tracking-tight">Simulation Board</h3>
                  </div>
                  <span className="font-mono text-3xs uppercase tracking-[0.16em] text-brand/70">Default view</span>
                </div>
                <MiniSimulationVisual />
                <p className="mt-4 text-sm leading-6 text-white/45">
                  Signal block heat, tunnel rings, energy pulses, station dwell state, and keyboard-selectable train capsules share the same language as the console.
                </p>
              </div>
            </article>

            <article className="landing-stack-card md:col-span-5">
              <div className="rounded-lg border border-white/[0.08] bg-scada-surface/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-status-tunnel" strokeWidth={1.5} />
                  <h3 className="text-base font-bold tracking-tight">Geographic Mode</h3>
                </div>
                <MiniMapVisual />
                <p className="mt-4 text-sm leading-6 text-white/45">
                  Leaflet remains a credible Panama context layer, visually aligned with the custom board rather than falling back to the old rail style.
                </p>
              </div>
            </article>

            <article className="landing-stack-card md:col-span-4">
              <div className="rounded-lg border border-white/[0.08] bg-scada-surface/70 p-5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-status-warning" strokeWidth={1.5} />
                  <h3 className="text-base font-bold tracking-tight">B-CHOP Recovery</h3>
                </div>
                <EnergyBars />
                <p className="mt-4 text-sm leading-6 text-white/45">Braking trains feed live recovery pulses into the network battery model.</p>
              </div>
            </article>

            <article className="landing-stack-card md:col-span-4">
              <div className="rounded-lg border border-white/[0.08] bg-scada-surface/70 p-5">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-status-tunnel" strokeWidth={1.5} />
                  <h3 className="text-base font-bold tracking-tight">Tunnel Relay</h3>
                </div>
                <RelayStrip />
                <p className="mt-4 text-sm leading-6 text-white/45">Line 3 tunnel sections expose degraded comms, handoff, and recovery phases.</p>
              </div>
            </article>

            <article className="landing-stack-card md:col-span-4">
              <div className="rounded-lg border border-white/[0.08] bg-scada-surface/70 p-5">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-status-info" strokeWidth={1.5} />
                  <h3 className="text-base font-bold tracking-tight">Train Dossier</h3>
                </div>
                <TelemetryGrid />
                <p className="mt-4 text-sm leading-6 text-white/45">Speed, motor current, thermal state, occupancy risk, and event memory stay visible for dispatch decisions.</p>
              </div>
            </article>
          </div>
        </div>
      </SectionSurface>

      <div className="relative z-10 overflow-hidden border-y border-white/[0.06] bg-scada-surface/40 py-4">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-8">
              {['CBTC moving block', 'B-CHOP regenerative braking', 'Line 3 tunnel relay', 'headway compression', 'signal block occupancy', 'dwell delay scenarios'].map((text) => (
                <span key={text + setIdx} className="flex items-center gap-3 text-2xs font-mono uppercase tracking-wider text-white/24">
                  <span className="h-1 w-1 rounded-full bg-white/24" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-dim">
              <TrainFront className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold tracking-tight">HMAX-Lite</span>
            <span className="text-2xs font-mono text-white/20">v2.0.0</span>
          </div>
          <p className="text-2xs font-mono text-white/20">
            Panama Metro Digital Twin, built with FastAPI, React, Leaflet, GSAP, and SVG simulation.
          </p>
        </div>
      </footer>
    </div>
  );
}
