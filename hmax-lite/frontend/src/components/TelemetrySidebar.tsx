/**
 * TelemetrySidebar — Train Dossier Inspector
 * ===========================================
 *
 * True operational inspector: identity, route strip, speed phase,
 * telemetry instruments, block risk, event memory.
 */

import {
  X,
  Zap,
  Radio,
  Thermometer,
  Clock,
  Route,
  Gauge,
  Activity,
  BatteryCharging,
  Wifi,
  AlertTriangle,
} from 'lucide-react';
import type { TrainStatus, TelemetryHistoryPoint, Station, OperationalEvent } from '../types/train';
import { LINE_CONFIG } from '../types/train';
import { SpeedGauge } from './SpeedGauge';
import { EnergyChart } from './EnergyChart';
import { OperationalMetric } from './primitives';
import { formatEta } from '../utils/api';
import { getTrainStatusColor, getTrainStatusText } from '../utils/sharedStyling';

interface TelemetrySidebarProps {
  train: TrainStatus | null;
  history: TelemetryHistoryPoint[];
  stations: Station[];
  onClose: () => void;
  allTrains: TrainStatus[];
  events: OperationalEvent[];
  onSelectTrain?: (id: string) => void;
}

function EmptyState({ allTrains, onSelect }: { allTrains: TrainStatus[]; onSelect?: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Radio className="h-6 w-6 text-white/30" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/60">Awaiting selection</p>
          <p className="mt-1 text-xs text-white/30">
            Select a train from the playfield or choose a suggested unit below.
          </p>
        </div>
        {allTrains.length > 0 && (
          <div className="w-full space-y-1.5">
            <p className="text-3xs font-mono uppercase tracking-wider text-white/20">Suggested</p>
            {allTrains.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect?.(t.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getTrainStatusColor(t) }} />
                <span className="text-xs font-semibold text-white/70">{t.id}</span>
                <span className="ml-auto text-3xs font-mono text-white/30">{Math.round(t.telemetry.speed_kmh)} km/h</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Compact network context */}
      <div className="border-t border-scada-border p-4">
        <div className="flex items-center justify-between text-3xs font-mono text-white/20">
          <span>{allTrains.length} units active</span>
          <span>{allTrains.filter((t) => t.is_in_tunnel).length} in tunnel</span>
        </div>
      </div>
    </div>
  );
}

function PhaseBadge({ phase, color }: { phase: string; color: string }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-3xs font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      {phase}
    </span>
  );
}

function RouteStrip({ train, stations }: { train: TrainStatus; stations: Station[] }) {
  const currentStation = stations.find((s) => s.id === train.position.current_station_id);
  const nextStation = stations.find((s) => s.id === train.position.next_station_id);
  const lineColor = LINE_CONFIG[train.line].color;

  return (
    <div className="rounded-xl border border-scada-border bg-white/[0.03] p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <Route className="h-4 w-4 text-white/30" strokeWidth={1.5} />
        <span className="text-2xs font-mono uppercase tracking-wider text-white/40">Route Segment</span>
      </div>

      <div className="relative mb-3">
        <div className="flex items-center gap-0">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: lineColor }} />
            <div className="h-8 w-0.5" style={{ background: `linear-gradient(to bottom, ${lineColor}60, ${lineColor}20)` }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
          </div>
          <div className="flex-1 ml-3 space-y-3">
            <div>
              <p className="text-3xs text-white/30 uppercase tracking-wider">Current</p>
              <p className="text-xs font-semibold text-white/70">{currentStation?.name ?? train.position.current_station_id}</p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${train.position.progress * 100}%`, backgroundColor: lineColor }}
              />
            </div>
            <div>
              <p className="text-3xs text-white/30 uppercase tracking-wider">Next</p>
              <p className="text-xs font-semibold text-white">{nextStation?.name ?? train.position.next_station_id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5">
        <span className="font-mono text-2xs text-white/50">{train.current_segment_name}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-white/30" strokeWidth={1.5} />
          <span className="text-2xs text-white/30">ETA</span>
        </div>
        <span className="font-mono text-lg font-black" style={{ color: lineColor }}>
          {formatEta(train.next_station_eta_seconds)}
        </span>
      </div>
    </div>
  );
}

function EventMemory({ events, trainId }: { events: OperationalEvent[]; trainId: string }) {
  const trainEvents = events.filter((e) => e.train_id === trainId).slice(0, 6);
  if (trainEvents.length === 0) return null;

  return (
    <div className="rounded-xl border border-scada-border bg-white/[0.03] p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4 text-white/30" strokeWidth={1.5} />
        <span className="text-2xs font-mono uppercase tracking-wider text-white/40">Event Memory</span>
      </div>
      <div className="space-y-1.5">
        {trainEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-2 rounded-md bg-white/[0.02] px-2 py-1">
            <div
              className="h-1 w-1 flex-shrink-0 rounded-full"
              style={{
                backgroundColor:
                  event.severity === 'critical' ? '#ef4444' : event.severity === 'warning' ? '#fbbf24' : '#34d399',
              }}
            />
            <span className="truncate text-3xs text-white/50">{event.message}</span>
            <span className="ml-auto text-3xs font-mono text-white/20">
              {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TelemetrySidebar({ train, history, stations, onClose, allTrains, events, onSelectTrain }: TelemetrySidebarProps) {
  if (!train) {
    return <EmptyState allTrains={allTrains} onSelect={onSelectTrain} />;
  }

  const statusColor = getTrainStatusColor(train);
  const statusText = getTrainStatusText(train);
  const lineColor = LINE_CONFIG[train.line].color;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-scada-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/60">Train Dossier</span>
          <span className="flex items-center gap-1.5 rounded-full bg-status-normal/10 px-2 py-0.5 text-3xs font-mono text-status-normal">
            <span className="h-1 w-1 animate-pulse rounded-full bg-status-normal" />
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
      <div className="border-b border-scada-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 12px ${statusColor}` }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono text-lg font-black tracking-tight text-white">{train.id}</p>
              <PhaseBadge phase={train.speed_phase.toUpperCase()} color={lineColor} />
            </div>
            <p className="text-3xs font-mono uppercase tracking-wider" style={{ color: statusColor }}>
              {statusText}
            </p>
          </div>
        </div>

        {/* Speed phase strip */}
        <div className="mt-2.5 flex gap-1.5">
          {(['accelerate', 'cruise', 'brake', 'dwell'] as const).map((phase) => (
            <div
              key={phase}
              className="flex-1 rounded-md py-1 text-center"
              style={{
                backgroundColor: train.speed_phase === phase ? `${lineColor}25` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${train.speed_phase === phase ? `${lineColor}50` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span
                className="text-3xs font-mono uppercase tracking-wider font-bold"
                style={{ color: train.speed_phase === phase ? lineColor : 'rgba(255,255,255,0.25)' }}
              >
                {phase}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          {/* Speed Gauge */}
          <div className="rounded-xl border border-scada-border bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-brand" strokeWidth={1.5} />
                <span className="text-2xs font-mono uppercase tracking-wider text-white/40">Speed</span>
              </div>
              <span className="text-2xs text-white/30">{LINE_CONFIG[train.line].label}</span>
            </div>
            <SpeedGauge speed={train.telemetry.speed_kmh} isBraking={train.telemetry.b_chop_status} />
          </div>

          {/* Route Strip */}
          <RouteStrip train={train} stations={stations} />

          {/* Telemetry Instruments Grid */}
          <div className="grid grid-cols-2 gap-2">
            <OperationalMetric
              label="B-CHOP"
              value={Math.round(train.telemetry.energy_recovered_kwh * 10)}
              unit="kW"
              accent="#d7ff5f"
              icon={<Zap className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
            <OperationalMetric
              label="Session"
              value={train.energy_recovered_session.toFixed(1)}
              unit="kWh"
              accent="#34d399"
              icon={<BatteryCharging className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
            <OperationalMetric
              label="Comms"
              value={train.comms_mode === 'TUNNEL_RELAY' ? 'TUNNEL' : 'NORMAL'}
              accent={train.comms_mode === 'TUNNEL_RELAY' ? '#22d3ee' : '#94a3b8'}
              icon={<Radio className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
            <OperationalMetric
              label="Tunnel"
              value={train.tunnel_phase.toUpperCase()}
              accent={train.tunnel_phase !== 'none' ? '#22d3ee' : '#94a3b8'}
              icon={<Wifi className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
          </div>

          {/* Motor & Temp */}
          <div className="grid grid-cols-2 gap-2">
            <OperationalMetric
              label="Motor"
              value={Math.round(train.telemetry.motor_current_amps)}
              unit="A"
              accent="#60a5fa"
              icon={<Zap className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
            <OperationalMetric
              label="Brake Temp"
              value={Math.round(train.telemetry.regen_braking_temp)}
              unit="°C"
              accent={train.telemetry.regen_braking_temp > 70 ? '#ef4444' : train.telemetry.regen_braking_temp > 55 ? '#fbbf24' : '#34d399'}
              icon={<Thermometer className="h-3.5 w-3.5" strokeWidth={1.5} />}
            />
          </div>

          {/* Block Occupancy / Risk */}
          <OperationalMetric
            label="Block Occupancy"
            value={Math.round(train.block_occupancy * 100)}
            unit="%"
            accent={train.block_occupancy > 0.7 ? '#ef4444' : train.block_occupancy > 0.4 ? '#fbbf24' : '#34d399'}
            icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
          >
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${train.block_occupancy * 100}%`,
                  backgroundColor: train.block_occupancy > 0.7 ? '#ef4444' : train.block_occupancy > 0.4 ? '#fbbf24' : '#34d399',
                }}
              />
            </div>
          </OperationalMetric>

          {/* Braking Phase */}
          <div className="rounded-xl border border-scada-border bg-white/[0.03] p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" strokeWidth={1.5} />
              <span className="text-2xs font-mono uppercase tracking-wider text-white/40">Braking Phase</span>
            </div>
            <div className="flex gap-1">
              {(['none', 'initial', 'heavy', 'regen'] as const).map((phase) => (
                <div
                  key={phase}
                  className="flex-1 rounded py-1 text-center"
                  style={{
                    backgroundColor: train.braking_phase === phase ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${train.braking_phase === phase ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <span
                    className="text-3xs font-mono uppercase font-bold"
                    style={{ color: train.braking_phase === phase ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}
                  >
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Memory */}
          <EventMemory events={events} trainId={train.id} />

          {/* Energy Chart */}
          {history.length > 1 && (
            <div className="rounded-xl border border-scada-border bg-white/[0.03] p-4">
              <p className="mb-3 text-2xs font-mono uppercase tracking-wider text-white/40">Energy History</p>
              <EnergyChart history={history} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-scada-border px-4 py-3">
        <div className="flex items-center justify-between text-3xs font-mono text-white/20">
          <span>Block: {train.position.current_station_id}</span>
          <span>Line: {LINE_CONFIG[train.line].label}</span>
        </div>
      </div>
    </div>
  );
}
