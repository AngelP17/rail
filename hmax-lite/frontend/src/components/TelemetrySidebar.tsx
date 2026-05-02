import type { ReactNode } from 'react';
import { X, Clock, RadioTower, Route, Zap } from 'lucide-react';
import type { TrainStatus, TelemetryHistoryPoint, Station } from '../types/train';
import { SpeedGauge } from './SpeedGauge';
import { EnergyChart, TempGauge } from './EnergyChart';
import { formatEta, formatEnergy } from '../utils/api';

interface TelemetrySidebarProps {
  train: TrainStatus | null;
  history: TelemetryHistoryPoint[];
  stations: Station[];
  onClose: () => void;
}

function EmptyState() {
  return (
    <div className="relative h-full overflow-hidden bg-[#08101d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(96,165,250,0.16),transparent_32%)]" />
      <div className="relative flex h-full flex-col items-start justify-center gap-5 px-8 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/12 bg-white/[0.07]">
        <RadioTower className="h-7 w-7 text-white/55" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-black tracking-[-0.05em] text-white">Awaiting selection</p>
        <p className="mt-3 max-w-[220px] font-mono text-xs leading-relaxed text-white/42">
          Select a train from the fleet list or click a marker on the map.
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/38">{label}</span>
      <span
        className="font-mono text-sm font-bold tabular-nums"
        style={{ color: accent ?? '#f8fafc' }}
      >
        {value}
      </span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-white/10 px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        {icon ? <span className="text-white/36">{icon}</span> : null}
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/40">{title}</p>
      </div>
      {children}
    </section>
  );
}

export function TelemetrySidebar({ train, history, stations, onClose }: TelemetrySidebarProps) {
  if (!train) return <EmptyState />;

  const statusColor = train.is_in_tunnel
    ? '#22d3ee'
    : train.telemetry.b_chop_status
    ? '#fbbf24'
    : '#34d399';

  const statusText = train.is_in_tunnel
    ? 'TUNNEL MODE'
    : train.telemetry.b_chop_status
    ? 'REGEN BRAKING'
    : train.at_station
    ? 'AT STATION'
    : 'NOMINAL';

  const currentStation = stations.find(s => s.id === train.position.current_station_id);
  const nextStation = stations.find(s => s.id === train.position.next_station_id);

  return (
    <div className="relative h-full overflow-hidden bg-[#08101d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_5%,rgba(52,211,153,0.16),transparent_32%),radial-gradient(circle_at_0%_68%,rgba(96,165,250,0.1),transparent_34%)]" />
      <div className="relative h-full flex flex-col">

      {/* Header — train identity */}
      <div className="px-5 py-5 border-b border-white/10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-4 w-4 rounded-full flex-shrink-0 animate-pulse"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 28px ${statusColor}` }}
          />
          <div>
            <p className="font-mono text-2xl font-black tracking-[-0.05em] text-white">
              {train.id}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.26em]" style={{ color: statusColor }}>
              {statusText}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.055] hover:border-white/20 hover:bg-white/10 flex items-center justify-center transition-all duration-150 active:scale-[0.96] flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-white/52" strokeWidth={1.5} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Speed gauge */}
        <Section title="Velocity" icon={<Zap className="h-3.5 w-3.5" strokeWidth={1.5} />}>
          <SpeedGauge speed={train.telemetry.speed_kmh} isBraking={train.telemetry.b_chop_status} />
        </Section>

        {/* Route */}
        <Section title="Route thread" icon={<Route className="h-3.5 w-3.5" strokeWidth={1.5} />}>
          <div className="flex items-stretch gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4">
            <div className="flex flex-col items-center gap-0 pt-1">
              <div className="w-2 h-2 rounded-full border-2" style={{ borderColor: statusColor }} />
              <div className="w-px flex-1 bg-white/14 my-1" />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-mono text-[9px] text-white/36 uppercase tracking-[0.2em] mb-0.5">From</p>
                <p className="font-mono text-xs text-white/68 truncate">
                  {currentStation?.name ?? train.position.current_station_id}
                </p>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${train.position.progress * 100}%`, backgroundColor: statusColor }}
                />
              </div>
              <div>
                <p className="font-mono text-[9px] text-white/36 uppercase tracking-[0.2em] mb-0.5">To</p>
                <p className="font-mono text-xs text-white truncate">
                  {nextStation?.name ?? train.position.next_station_id}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white/38" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-white/38 uppercase tracking-[0.22em]">ETA</span>
            </div>
            <span className="font-mono text-3xl font-black tabular-nums" style={{ color: statusColor }}>
              {formatEta(train.next_station_eta_seconds)}
            </span>
          </div>
        </Section>

        {/* B-CHOP energy */}
        <Section title="B-CHOP Recovery" icon={<RadioTower className="h-3.5 w-3.5" strokeWidth={1.5} />}>
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-mono text-[10px] text-white/38 uppercase tracking-[0.2em]">Total recovered</span>
            <span className="font-mono text-xl font-semibold text-status-normal tabular-nums">
              {formatEnergy(train.telemetry.energy_recovered_kwh)}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-mono text-[10px] text-white/38 uppercase tracking-[0.2em]">B-CHOP status</span>
            <span
              className="font-mono text-xs font-medium uppercase tracking-widest"
              style={{ color: train.telemetry.b_chop_status ? '#fbbf24' : '#34d399' }}
            >
              {train.telemetry.b_chop_status ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
          <EnergyChart history={history} />
        </Section>

        {/* Brake temp */}
        <Section title="Brake Temperature">
          <TempGauge temp={train.telemetry.regen_braking_temp} />
        </Section>

        {/* System data */}
        <Section title="Systems">
          <div className="grid gap-2">
            <DataRow
              label="Direction"
              value={train.direction}
            />
            <DataRow
              label="Mode"
              value={train.operating_mode}
            />
            <DataRow
              label="Doors"
              value={train.telemetry.door_status}
              accent={train.telemetry.door_status === 'OPEN' ? '#fbbf24' : train.telemetry.door_status === 'FAULT' ? '#f87171' : '#34d399'}
            />
            <DataRow
              label="Motor"
              value={`${Math.round(train.telemetry.motor_current_amps)} A`}
            />
            <DataRow
              label="Comms"
              value={train.comms_mode}
              accent={train.comms_mode === 'TUNNEL_RELAY' ? '#22d3ee' : undefined}
            />
          </div>
        </Section>

      </div>

      {/* Footer — last update */}
      <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/38 uppercase tracking-[0.24em]">Updated</span>
        <span className="font-mono text-[10px] text-white/48 tabular-nums">
          {new Date(train.timestamp).toLocaleTimeString()}
        </span>
      </div>
      </div>
    </div>
  );
}
