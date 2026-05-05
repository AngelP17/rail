import type { TrainStatus, OperationalEvent, EventType, MetroLine } from '../types/train';
import { EVENT_TYPE_META } from '../types/train';

let eventIdCounter = 0;

export function createEvent(
  type: EventType,
  trainId: string,
  line: MetroLine,
  message: string,
  severity: OperationalEvent['severity'] = 'info',
  stationId?: string,
): OperationalEvent {
  return {
    id: `evt-${++eventIdCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    train_id: trainId,
    line,
    message,
    severity,
    station_id: stationId,
  };
}

export function deriveEvents(prev: TrainStatus[] | null, curr: TrainStatus[]): OperationalEvent[] {
  if (!prev || prev.length === 0) return [];
  const events: OperationalEvent[] = [];

  const prevMap = new Map(prev.map(t => [t.id, t]));

  for (const train of curr) {
    const p = prevMap.get(train.id);
    if (!p) continue;

    // Departed station
    if (p.at_station && !train.at_station) {
      events.push(createEvent('departed', train.id, train.line, `${train.id} departed ${p.position.current_station_id}`, 'info', p.position.current_station_id));
    }

    // Station approach
    if (!p.at_station && train.position.progress > 0.7 && p.position.progress <= 0.7) {
      events.push(createEvent('station_approach', train.id, train.line, `${train.id} approaching ${train.position.next_station_id}`, 'info', train.position.next_station_id));
    }

    // Braking start
    if (!p.telemetry.b_chop_status && train.telemetry.b_chop_status) {
      events.push(createEvent('braking', train.id, train.line, `${train.id} entering braking phase`, 'info'));
      if (Math.random() < 0.4) {
        events.push(createEvent('bchop_active', train.id, train.line, `B-CHOP active on ${train.id}`, 'info'));
      }
    }

    // Energy recovery
    const energyDelta = train.telemetry.energy_recovered_kwh - p.telemetry.energy_recovered_kwh;
    if (energyDelta > 0.15) {
      events.push(createEvent('energy_recovery', train.id, train.line, `${train.id} recovered ${energyDelta.toFixed(2)} kWh`, 'info'));
    }

    // Tunnel entry
    if (!p.is_in_tunnel && train.is_in_tunnel) {
      events.push(createEvent('tunnel_entry', train.id, train.line, `${train.id} entered tunnel relay zone`, 'warning'));
      events.push(createEvent('comms_handoff', train.id, train.line, `Comms handoff for ${train.id} to tunnel relay`, 'warning'));
    }

    // Tunnel exit
    if (p.is_in_tunnel && !train.is_in_tunnel) {
      events.push(createEvent('tunnel_exit', train.id, train.line, `${train.id} exited tunnel relay zone`, 'info'));
    }

    // Dwell complete
    if (p.at_station && !train.at_station) {
      events.push(createEvent('dwell_complete', train.id, train.line, `Dwell complete at ${p.position.current_station_id}`, 'info', p.position.current_station_id));
    }

    // Headway compression
    if (train.speed_phase === 'brake' && Math.random() < 0.03) {
      events.push(createEvent('headway_compressed', train.id, train.line, `Headway compressed on ${train.line}`, 'warning'));
    }
  }

  return events;
}

export function getEventColor(type: EventType): string {
  return EVENT_TYPE_META[type]?.color ?? '#94a3b8';
}

export function getEventLabel(type: EventType): string {
  return EVENT_TYPE_META[type]?.label ?? type;
}
