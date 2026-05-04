import type { ReactNode } from 'react';
import { X, Zap, Radio, Thermometer, Clock, Route, Gauge, ArrowRight } from 'lucide-react';
import type { TrainStatus, TelemetryHistoryPoint, Station } from '../types/train';
import { LINE_CONFIG } from '../types/train';
import { SpeedGauge } from './SpeedGauge';
import { EnergyChart } from './EnergyChart';
import { formatEta } from '../utils/api';

interface TelemetrySidebarProps {
  train: TrainStatus | null;
  history: TelemetryHistoryPoint[];
  stations: Station[];
  onClose: () => void;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <Radio className="h-6 w-6 text-white/30" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/60">Awaiting selection</p>
        <p className="mt-1 text-xs text-white/30">Select a train from the fleet list or click a marker on the map.</p>
      </div>
    </div>
  );
}

function TelemetryCard({
  icon,
  label,
  value,
  unit,
  sublabel,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">{label}</span>
        </div>
        <span className="text-[10px] text-white/30">{sublabel}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="text-xs text-white/40">{unit}</span>}
      </div>
    </div>
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

  const currentStation = stations.find((s) => s.id === train.position.current_station_id);
  const nextStation = stations.find((s) => s.id === train.position.next_station_id);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/60">Train Telemetry</span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#34d399]/10 px-2 py-0.5 text-[10px] font-mono text-[#34d399]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-[#34d399]" />
            Live
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Train Identity */}
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 12px ${statusColor}` }}
          />
          <div>
            <p className="font-mono text-lg font-black tracking-tight text-white">{train.id}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: statusColor }}>
              {statusText}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          {/* Speed Gauge */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#d7ff5f]" strokeWidth={1.5} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Speed</span>
              </div>
              <span className="text-[10px] text-white/30">
                {LINE_CONFIG[train.line].label} / {train.name.split(' ').pop()}
              </span>
            </div>
            <SpeedGauge speed={train.telemetry.speed_kmh} isBraking={train.telemetry.b_chop_status} />
          </div>

          {/* B-CHOP Energy */}
          <TelemetryCard
            icon={<Zap className="h-4 w-4" strokeWidth={1.5} />}
            label="B-CHOP Energy Recovery"
            value={Math.round(train.telemetry.energy_recovered_kwh * 10).toString()}
            unit="kW"
            sublabel={`${LINE_CONFIG[train.line].label} / ${train.name.split(' ').pop()}`}
            accent="#d7ff5f"
          />

          {/* Tunnel Relay */}
          <TelemetryCard
            icon={<Radio className="h-4 w-4" strokeWidth={1.5} />}
            label="Tunnel Relay State"
            value={train.comms_mode === 'TUNNEL_RELAY' ? 'Active' : 'Closed'}
            sublabel={train.is_in_tunnel ? 'Relay 11A / Section T2-11' : 'Normal'}
            accent={train.comms_mode === 'TUNNEL_RELAY' ? '#22d3ee' : '#94a3b8'}
          />

          {/* Brake Temperature */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[#fbbf24]" strokeWidth={1.5} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Brake Temperature</span>
              </div>
              <span className="text-[10px] text-white/30">
                {LINE_CONFIG[train.line].label} / {train.name.split(' ').pop()}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#fbbf24]">{Math.round(train.telemetry.regen_braking_temp)}</span>
              <span className="text-xs text-white/40">C</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#fbbf24] transition-all duration-500"
                style={{ width: `${Math.min(100, ((train.telemetry.regen_braking_temp - 40) / 50) * 100)}%` }}
              />
            </div>
          </div>

          {/* Route Progress */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Route className="h-4 w-4 text-white/30" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Route Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="h-2 w-2 rounded-full border-2" style={{ borderColor: statusColor }} />
                <div className="h-8 w-px bg-white/10" />
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-[10px] text-white/30">From</p>
                  <p className="text-xs text-white/60">{currentStation?.name ?? train.position.current_station_id}</p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${train.position.progress * 100}%`, backgroundColor: statusColor }}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">To</p>
                  <p className="text-xs text-white">{nextStation?.name ?? train.position.next_station_id}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-white/30" strokeWidth={1.5} />
                <span className="text-[10px] text-white/30">ETA</span>
              </div>
              <span className="font-mono text-lg font-black" style={{ color: statusColor }}>
                {formatEta(train.next_station_eta_seconds)}
              </span>
            </div>
          </div>

          {/* Energy Chart */}
          {history.length > 1 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="mb-3 text-[10px] font-mono uppercase tracking-wider text-white/40">Energy History</p>
              <EnergyChart history={history} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white">
          View All Telemetry
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
