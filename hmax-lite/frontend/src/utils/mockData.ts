import type {
  TrainStatus,
  TrainListResponse,
  AllLinesResponse,
  MetroLine,
  Station,
  LineInfo,
  TelemetryHistoryPoint,
  OperationalEvent,
  OperatorPrompt,
  ScenarioMode,
  SpeedPhase,
} from '../types/train';
import { SCENARIO_CONFIG } from '../types/train';

const STATIONS: Record<MetroLine, Station[]> = {
  line1: [
    { id: 'L1-01', name: 'San Isidro', lat: 9.0824, lng: -79.4856, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-02', name: 'Villa Zaita', lat: 9.0702, lng: -79.4901, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-03', name: 'El Crisol', lat: 9.0605, lng: -79.4938, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-04', name: 'Brisas del Golf', lat: 9.0489, lng: -79.4982, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-05', name: 'Cerro Viento', lat: 9.0402, lng: -79.5015, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-06', name: 'San Antonio', lat: 9.0315, lng: -79.5050, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-07', name: 'Pedregal', lat: 9.0228, lng: -79.5085, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-08', name: 'Pueblo Nuevo', lat: 9.0152, lng: -79.5118, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-09', name: '12 de Octubre', lat: 9.0055, lng: -79.5155, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-10', name: 'Iglesia del Carmen', lat: 8.9942, lng: -79.5198, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-11', name: 'Via Argentina', lat: 8.9855, lng: -79.5232, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-12', name: 'Fernandez de Cordoba', lat: 8.9778, lng: -79.5265, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-13', name: 'El Ingenio', lat: 8.9712, lng: -79.5295, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-14', name: '12 de Octubre', lat: 8.9835, lng: -79.5205, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-15', name: 'Albrook', lat: 8.9763, lng: -79.5475, station_type: 'At-Grade', is_tunnel_boundary: false, line: 'line1' },
  ],
  line2: [
    { id: 'L2-01', name: 'Nuevo Tocumen', lat: 9.0525, lng: -79.3802, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-02', name: '24 de Diciembre', lat: 9.0502, lng: -79.4025, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-03', name: 'Nuevo Tocumen', lat: 9.0485, lng: -79.4152, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-04', name: 'Pacora', lat: 9.0458, lng: -79.4285, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-05', name: 'Corredor Sur', lat: 9.0425, lng: -79.4412, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-06', name: 'Don Bosco', lat: 9.0385, lng: -79.4525, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-07', name: 'Las Mananitas', lat: 9.0325, lng: -79.4625, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-08', name: 'El Doral', lat: 9.0252, lng: -79.4725, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-09', name: 'San Bernardino', lat: 9.0185, lng: -79.4825, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-10', name: '5 de Mayo', lat: 9.0125, lng: -79.4925, station_type: 'Underground', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-11', name: 'El Carmen', lat: 9.0052, lng: -79.5025, station_type: 'Underground', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-12', name: 'Via Espana', lat: 8.9985, lng: -79.5125, station_type: 'Underground', is_tunnel_boundary: false, line: 'line2' },
    { id: 'L2-13', name: 'Albrook', lat: 8.9763, lng: -79.5475, station_type: 'At-Grade', is_tunnel_boundary: false, line: 'line2' },
  ],
  line3: [
    { id: 'ST-01', name: 'Albrook', lat: 8.9763, lng: -79.5475, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-02', name: 'Balboa', lat: 8.9594, lng: -79.5573, station_type: 'Underground', is_tunnel_boundary: true, line: 'line3' },
    { id: 'ST-03', name: 'Panama Pacifico', lat: 8.9600, lng: -79.5900, station_type: 'Elevated', is_tunnel_boundary: true, line: 'line3' },
    { id: 'ST-04', name: 'Loma Cova', lat: 8.9550, lng: -79.6050, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-05', name: 'Arraijan', lat: 8.9448, lng: -79.6204, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-06', name: 'Nuevo Chorrillo', lat: 8.9400, lng: -79.6400, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-07', name: 'Vista Alegre', lat: 8.9350, lng: -79.6600, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-08', name: 'Burunga', lat: 8.9480, lng: -79.6300, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-09', name: 'Nuevo Arraijan', lat: 8.9300, lng: -79.6800, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-10', name: 'San Bernardino', lat: 8.9280, lng: -79.6900, station_type: 'Elevated', is_tunnel_boundary: false, line: 'line3' },
    { id: 'ST-11', name: 'Ciudad del Futuro', lat: 8.9224, lng: -79.6995, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line3' },
  ],
};

const LINES: LineInfo[] = [
  { id: 'line1', name: 'Line 1', color: '#ef4444', description: 'San Isidro to Albrook', station_count: 15 },
  { id: 'line2', name: 'Line 2', color: '#22c55e', description: 'Nuevo Tocumen to Albrook', station_count: 13 },
  { id: 'line3', name: 'Line 3', color: '#3b82f6', description: 'Albrook to Ciudad del Futuro', station_count: 11 },
];

// Event log storage
let globalEvents: OperationalEvent[] = [];
let eventIdCounter = 0;
let activeScenario: ScenarioMode = 'normal';

export function setMockScenario(scenario: ScenarioMode) {
  activeScenario = scenario;
}

export function getMockScenario(): ScenarioMode {
  return activeScenario;
}

function genEventId() {
  return `evt-${++eventIdCounter}-${Date.now()}`;
}

function addEvent(event: Omit<OperationalEvent, 'id'>) {
  const fullEvent: OperationalEvent = { ...event, id: genEventId() };
  globalEvents.unshift(fullEvent);
  if (globalEvents.length > 100) globalEvents = globalEvents.slice(0, 100);
  return fullEvent;
}

export function getMockEvents(): OperationalEvent[] {
  return globalEvents;
}

export function clearMockEvents() {
  globalEvents = [];
  eventIdCounter = 0;
}

function speedPhaseFor(speed: number, atStation: boolean, isBraking: boolean): SpeedPhase {
  if (atStation) return 'dwell';
  if (isBraking) return 'brake';
  if (speed > 60) return 'cruise';
  return 'accelerate';
}

function tunnelPhaseFor(line: MetroLine, currentId: string, nextId: string, progress: number): TrainStatus['tunnel_phase'] {
  if (line !== 'line3') return 'none';
  const isTunnelSegment = (currentId === 'ST-02' && nextId === 'ST-03') || (currentId === 'ST-03' && nextId === 'ST-02');
  if (!isTunnelSegment) return 'none';
  if (progress < 0.15) return 'approach';
  if (progress > 0.85) return 'exit';
  return 'inside';
}

function brakingPhaseFor(progress: number, atStation: boolean): TrainStatus['braking_phase'] {
  if (atStation) return 'regen';
  if (progress > 0.88) return 'heavy';
  if (progress > 0.72) return 'initial';
  return 'none';
}

function segmentName(current: Station, next: Station): string {
  return `${current.name} → ${next.name}`;
}

function blockOccupancy(_line: MetroLine, _stationIdx: number, progress: number, scenario: ScenarioMode): number {
  const config = SCENARIO_CONFIG[scenario];
  const base = Math.min(1, progress + 0.1);
  const variance = scenario === 'rush_hour' ? 0.3 : scenario === 'signal_hold' ? 0.5 : 0.1;
  return Math.min(1, base + Math.random() * variance * config.train_spacing_factor);
}

function makeTrain(
  id: string,
  name: string,
  line: MetroLine,
  stationIdx: number,
  progress: number,
  speed: number,
  direction: 'WESTBOUND' | 'EASTBOUND' | 'NORTHBOUND' | 'SOUTHBOUND',
  isBraking: boolean,
  inTunnel: boolean,
  atStation: boolean,
  energy: number,
  temp: number,
): TrainStatus {
  const stations = STATIONS[line];
  const current = stations[stationIdx];
  const nextIdx = Math.min(stationIdx + 1, stations.length - 1);
  const next = stations[nextIdx];
  const lat = current.lat + (next.lat - current.lat) * progress;
  const lng = current.lng + (next.lng - current.lng) * progress;
  const phase = speedPhaseFor(speed, atStation, isBraking);
  const tunPhase = tunnelPhaseFor(line, current.id, next.id, progress);
  const brPhase = brakingPhaseFor(progress, atStation);
  const segName = segmentName(current, next);
  const blockOcc = blockOccupancy(line, stationIdx, progress, activeScenario);
  const dwellSec = atStation ? 15 + Math.round(Math.random() * 8) : 0;

  return {
    id,
    name,
    line,
    position: {
      lat,
      lng,
      heading: direction === 'NORTHBOUND' ? 0 : direction === 'SOUTHBOUND' ? 180 : direction === 'EASTBOUND' ? 90 : 270,
      current_station_id: current.id,
      next_station_id: next.id,
      progress,
    },
    telemetry: {
      speed_kmh: speed,
      b_chop_status: isBraking,
      energy_recovered_kwh: energy,
      regen_braking_temp: temp,
      motor_current_amps: speed * 8 + (Math.random() * 20 - 10),
      door_status: atStation ? 'OPEN' : 'CLOSED',
    },
    is_in_tunnel: inTunnel,
    comms_mode: inTunnel ? 'TUNNEL_RELAY' : 'NORMAL',
    operating_mode: 'REVENUE',
    direction,
    next_station_eta_seconds: atStation ? dwellSec : Math.round((1 - progress) * 120 + Math.random() * 30),
    at_station: atStation,
    timestamp: new Date().toISOString(),
    speed_phase: phase,
    current_segment_name: segName,
    block_occupancy: blockOcc,
    dwell_countdown_seconds: dwellSec,
    braking_phase: brPhase,
    tunnel_phase: tunPhase,
    recent_events: [],
    energy_recovered_session: energy,
  };
}

function directionFor(line: MetroLine, forward: boolean): TrainStatus['direction'] {
  if (line === 'line1') return forward ? 'SOUTHBOUND' : 'NORTHBOUND';
  return forward ? 'WESTBOUND' : 'EASTBOUND';
}

function isForwardDirection(line: MetroLine, direction: TrainStatus['direction']): boolean {
  if (line === 'line1') return direction === 'SOUTHBOUND';
  return direction === 'WESTBOUND';
}

function headingBetween(from: Station, to: Station): number {
  const dLng = to.lng - from.lng;
  const dLat = to.lat - from.lat;
  return ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
}

function speedForProgress(progress: number, atStation: boolean, scenario: ScenarioMode): number {
  if (atStation) return 0;
  const spacing = SCENARIO_CONFIG[scenario].train_spacing_factor;
  if (progress < 0.22) return (24 + progress * 190) * spacing;
  if (progress > 0.76) return Math.max(12, 78 * (1 - (progress - 0.76) / 0.24)) * spacing;
  return (70 + Math.sin(progress * Math.PI) * 8) * spacing;
}

function getSegment(line: MetroLine, currentStationId: string, direction: TrainStatus['direction']) {
  const stations = STATIONS[line];
  let currentIdx = Math.max(0, stations.findIndex((station) => station.id === currentStationId));
  let forward = isForwardDirection(line, direction);
  let nextIdx = currentIdx + (forward ? 1 : -1);

  if (nextIdx >= stations.length) {
    forward = false;
    nextIdx = currentIdx - 1;
  } else if (nextIdx < 0) {
    forward = true;
    nextIdx = currentIdx + 1;
  }

  currentIdx = Math.max(0, Math.min(stations.length - 1, currentIdx));
  nextIdx = Math.max(0, Math.min(stations.length - 1, nextIdx));

  return {
    current: stations[currentIdx],
    next: stations[nextIdx],
    direction: directionFor(line, forward),
  };
}

function createMockTrains(): TrainStatus[] {
  const now = Date.now();
  const jitter = (base: number, range: number) => Math.round((base + Math.sin(now / 5000) * range) * 10) / 10;
  return [
    makeTrain('LINE1-001', 'LINE1 Train 1', 'line1', 2, 0.45, 62, 'SOUTHBOUND', false, false, false, jitter(24.5, 2), 48.2),
    makeTrain('LINE1-002', 'LINE1 Train 2', 'line1', 7, 0.82, 28, 'SOUTHBOUND', true, false, false, jitter(31.8, 3), 62.5),
    makeTrain('LINE1-003', 'LINE1 Train 3', 'line1', 11, 0.15, 71, 'NORTHBOUND', false, false, false, 18.3, 44.1),
    makeTrain('LINE1-004', 'LINE1 Train 4', 'line1', 14, 0.0, 0, 'SOUTHBOUND', false, false, true, 12.7, 42.0),
    makeTrain('LINE2-001', 'LINE2 Train 1', 'line2', 1, 0.55, 55, 'WESTBOUND', false, false, false, jitter(19.2, 2), 46.8),
    makeTrain('LINE2-002', 'LINE2 Train 2', 'line2', 5, 0.30, 68, 'WESTBOUND', false, false, false, 22.1, 50.3),
    makeTrain('LINE2-003', 'LINE2 Train 3', 'line2', 9, 0.78, 35, 'EASTBOUND', true, false, false, 28.9, 58.7),
    makeTrain('LINE2-004', 'LINE2 Train 4', 'line2', 12, 0.0, 0, 'EASTBOUND', false, false, true, 15.4, 43.2),
    makeTrain('LINE3-001', 'LINE3 Train 1', 'line3', 0, 0.60, 52, 'WESTBOUND', false, false, false, 21.5, 47.5),
    makeTrain('LINE3-002', 'LINE3 Train 2', 'line3', 1, 0.50, 48, 'WESTBOUND', false, true, false, 26.8, 51.2),
    makeTrain('LINE3-003', 'LINE3 Train 3', 'line3', 4, 0.35, 64, 'WESTBOUND', false, false, false, 17.3, 45.9),
    makeTrain('LINE3-004', 'LINE3 Train 4', 'line3', 7, 0.88, 22, 'WESTBOUND', true, false, false, 33.1, 67.4),
    makeTrain('LINE3-005', 'LINE3 Train 5', 'line3', 10, 0.0, 0, 'EASTBOUND', false, false, true, 14.2, 41.8),
  ];
}

function detectEvents(prev: TrainStatus, curr: TrainStatus): OperationalEvent[] {
  const events: OperationalEvent[] = [];
  const config = SCENARIO_CONFIG[activeScenario];
  const freqMult = config.event_frequency_multiplier;

  // Station departure
  if (prev.at_station && !curr.at_station) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'departed',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} departed ${prev.position.current_station_id}`,
      severity: 'info',
      station_id: prev.position.current_station_id,
    }));
  }

  // Station approach
  if (!prev.at_station && curr.position.progress > 0.7 && prev.position.progress <= 0.7) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'station_approach',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} approaching ${curr.position.next_station_id}`,
      severity: 'info',
      station_id: curr.position.next_station_id,
    }));
  }

  // Braking start
  if (!prev.telemetry.b_chop_status && curr.telemetry.b_chop_status) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'braking',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} entering braking phase`,
      severity: 'info',
    }));
    if (Math.random() < 0.4 * freqMult) {
      events.push(addEvent({
        timestamp: Date.now(),
        type: 'bchop_active',
        train_id: curr.id,
        line: curr.line,
        message: `B-CHOP active on ${curr.id}`,
        severity: 'info',
      }));
    }
  }

  // Energy recovery spike
  const energyDelta = curr.telemetry.energy_recovered_kwh - prev.telemetry.energy_recovered_kwh;
  if (energyDelta > 0.15 * freqMult) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'energy_recovery',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} recovered ${energyDelta.toFixed(2)} kWh`,
      severity: 'info',
    }));
  }

  // Tunnel entry
  if (!prev.is_in_tunnel && curr.is_in_tunnel) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'tunnel_entry',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} entered tunnel relay zone`,
      severity: 'warning',
    }));
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'comms_handoff',
      train_id: curr.id,
      line: curr.line,
      message: `Comms handoff for ${curr.id} to tunnel relay`,
      severity: 'warning',
    }));
  }

  // Tunnel exit
  if (prev.is_in_tunnel && !curr.is_in_tunnel) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'tunnel_exit',
      train_id: curr.id,
      line: curr.line,
      message: `${curr.id} exited tunnel relay zone`,
      severity: 'info',
    }));
  }

  // Dwell complete
  if (prev.at_station && !curr.at_station) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'dwell_complete',
      train_id: curr.id,
      line: curr.line,
      message: `Dwell complete at ${prev.position.current_station_id}`,
      severity: 'info',
      station_id: prev.position.current_station_id,
    }));
  }

  // Headway compression (rush hour)
  if (activeScenario === 'rush_hour' && Math.random() < 0.05 * freqMult) {
    events.push(addEvent({
      timestamp: Date.now(),
      type: 'headway_compressed',
      train_id: curr.id,
      line: curr.line,
      message: `Headway compressed on ${curr.line}`,
      severity: 'warning',
    }));
  }

  return events;
}

function jitterTrain(train: TrainStatus): TrainStatus {
  const segment = getSegment(train.line, train.position.current_station_id, train.direction);

  if (train.at_station) {
    const dwellRemaining = Math.max(0, train.next_station_eta_seconds - 1);
    if (dwellRemaining > 0) {
      const updated: TrainStatus = {
        ...train,
        telemetry: {
          ...train.telemetry,
          speed_kmh: 0,
          motor_current_amps: Math.round((18 + Math.random() * 6) * 10) / 10,
          door_status: 'OPEN',
        },
        next_station_eta_seconds: dwellRemaining,
        dwell_countdown_seconds: dwellRemaining,
        speed_phase: 'dwell',
        braking_phase: 'regen',
        timestamp: new Date().toISOString(),
      };
      return updated;
    }
  }

  const baseProgress = train.at_station ? 0 : train.position.progress;
  const targetSpeed = speedForProgress(baseProgress, false, activeScenario);
  const newSpeed = Math.max(0, Math.min(85, targetSpeed + (Math.random() - 0.5) * 3.2));
  const isBraking = baseProgress > 0.76;
  const tempDelta = isBraking ? Math.random() * 1.5 : -Math.random() * 0.3;
  const newTemp = Math.max(40, Math.min(90, train.telemetry.regen_braking_temp + tempDelta));
  const energyDelta = isBraking ? 0.08 + Math.random() * 0.22 : 0;
  const progressDelta = Math.max(0.012, (newSpeed / 80) * 0.032);
  let newProgress = Math.min(1, baseProgress + progressDelta);

  let newAtStation = false;
  let newSpeedFinal = newSpeed;
  let nextSegment = segment;

  if (newProgress >= 0.99) {
    newAtStation = true;
    newProgress = 0;
    newSpeedFinal = 0;
    nextSegment = getSegment(train.line, segment.next.id, segment.direction);
  }

  const current = newAtStation ? segment.next : segment.current;
  const next = newAtStation ? nextSegment.next : segment.next;
  const lat = current.lat + (next.lat - current.lat) * newProgress;
  const lng = current.lng + (next.lng - current.lng) * newProgress;
  const inTunnel = train.line === 'line3' && !newAtStation && current.id === 'ST-02' && next.id === 'ST-03';

  const updated: TrainStatus = {
    ...train,
    direction: newAtStation ? nextSegment.direction : segment.direction,
    position: {
      lat,
      lng,
      heading: headingBetween(current, next),
      current_station_id: current.id,
      next_station_id: next.id,
      progress: newProgress,
    },
    telemetry: {
      speed_kmh: Math.round(newSpeedFinal * 10) / 10,
      b_chop_status: isBraking,
      energy_recovered_kwh: Math.round((train.telemetry.energy_recovered_kwh + energyDelta) * 100) / 100,
      regen_braking_temp: Math.round(newTemp * 10) / 10,
      motor_current_amps: Math.round((newSpeedFinal * 8 + (Math.random() * 20 - 10)) * 10) / 10,
      door_status: newAtStation ? 'OPEN' : 'CLOSED',
    },
    is_in_tunnel: inTunnel,
    comms_mode: inTunnel ? 'TUNNEL_RELAY' : 'NORMAL',
    at_station: newAtStation,
    next_station_eta_seconds: newAtStation ? 15 : Math.round((1 - newProgress) * 120 + Math.random() * 20),
    timestamp: new Date().toISOString(),
    speed_phase: speedPhaseFor(newSpeedFinal, newAtStation, isBraking),
    current_segment_name: segmentName(current, next),
    block_occupancy: blockOccupancy(train.line, STATIONS[train.line].findIndex(s => s.id === current.id), newProgress, activeScenario),
    dwell_countdown_seconds: newAtStation ? 15 : 0,
    braking_phase: brakingPhaseFor(newProgress, newAtStation),
    tunnel_phase: tunnelPhaseFor(train.line, current.id, next.id, newProgress),
    energy_recovered_session: train.energy_recovered_session + energyDelta,
  };

  // Detect and attach events
  const events = detectEvents(train, updated);
  updated.recent_events = events.slice(0, 5);

  return updated;
}

export function getMockTrainListResponse(): TrainListResponse {
  const trains = createMockTrains();
  const totalEnergy = trains.reduce((sum, t) => sum + t.telemetry.energy_recovered_kwh, 0);
  const tunnelCount = trains.filter(t => t.is_in_tunnel).length;

  return {
    trains,
    system_status: {
      active_trains: trains.length,
      total_energy_recovered_kwh: Math.round(totalEnergy * 100) / 100,
      trains_in_tunnel: tunnelCount,
      system_health: 'NORMAL',
      timestamp: new Date().toISOString(),
    },
  };
}

export function getMockTrainListResponseFromPrevious(prev: TrainStatus[]): TrainListResponse {
  if (prev.length === 0) return getMockTrainListResponse();
  const trains = prev.map(jitterTrain);
  const totalEnergy = trains.reduce((sum, t) => sum + t.telemetry.energy_recovered_kwh, 0);
  const tunnelCount = trains.filter(t => t.is_in_tunnel).length;

  return {
    trains,
    system_status: {
      active_trains: trains.length,
      total_energy_recovered_kwh: Math.round(totalEnergy * 100) / 100,
      trains_in_tunnel: tunnelCount,
      system_health: 'NORMAL',
      timestamp: new Date().toISOString(),
    },
  };
}

export function getMockAllLinesResponse(): AllLinesResponse {
  const allStations = [...STATIONS.line1, ...STATIONS.line2, ...STATIONS.line3];
  const allRouteCoordinates: Record<MetroLine, [number, number][]> = {
    line1: STATIONS.line1.map(s => [s.lat, s.lng] as [number, number]),
    line2: STATIONS.line2.map(s => [s.lat, s.lng] as [number, number]),
    line3: STATIONS.line3.map(s => [s.lat, s.lng] as [number, number]),
  };

  return {
    lines: LINES,
    all_stations: allStations,
    all_route_coordinates: allRouteCoordinates,
  };
}

export function generateMockHistory(): TelemetryHistoryPoint[] {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => ({
    timestamp: now - (30 - i) * 1000,
    speed_kmh: 40 + Math.sin(i / 3) * 30 + (Math.random() - 0.5) * 10,
    energy_recovered_kwh: i * 0.15 + Math.random() * 0.5,
    regen_braking_temp: 42 + Math.sin(i / 5) * 12 + Math.random() * 5,
  }));
}

// Generate operator prompts based on current state
export function generateMockPrompts(trains: TrainStatus[]): OperatorPrompt[] {
  const prompts: OperatorPrompt[] = [];
  
  trains.forEach(train => {
    if (train.is_in_tunnel && train.tunnel_phase === 'inside') {
      prompts.push({
        id: `prompt-${train.id}-tunnel`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `${train.id} in tunnel relay. Monitor comms handoff.`,
        action: 'Watch relay state',
        priority: 'medium',
        acknowledged: false,
      });
    }
    if (train.telemetry.b_chop_status && train.braking_phase === 'heavy') {
      prompts.push({
        id: `prompt-${train.id}-bchop`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `B-CHOP peak on ${train.id} approaching ${train.position.next_station_id}`,
        action: 'Verify regen temp',
        priority: 'high',
        acknowledged: false,
      });
    }
    if (train.at_station && train.dwell_countdown_seconds > 18) {
      prompts.push({
        id: `prompt-${train.id}-dwell`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `Extended dwell on ${train.id} at ${train.position.current_station_id}`,
        action: 'Check platform status',
        priority: 'low',
        acknowledged: false,
      });
    }
  });

  // Line-level prompts
  const line3Trains = trains.filter(t => t.line === 'line3');
  const tunnelTrains = line3Trains.filter(t => t.is_in_tunnel);
  if (tunnelTrains.length >= 2) {
    prompts.push({
      id: `prompt-line3-density`,
      timestamp: Date.now(),
      line: 'line3',
      message: `High tunnel density: ${tunnelTrains.length} trains in relay zone`,
      action: 'Adjust spacing',
      priority: 'high',
      acknowledged: false,
    });
  }

  return prompts.slice(0, 6);
}

// Demo script configuration
export interface DemoScriptStep {
  duration: number;
  description: string;
  selectLine?: MetroLine;
  selectTrainId?: string;
  setScenario?: ScenarioMode;
  zoomToTunnel?: boolean;
  showTelemetry?: boolean;
}

export const DEMO_SCRIPT: DemoScriptStep[] = [
  { duration: 3000, description: 'Initializing simulation...', selectLine: 'line3', setScenario: 'normal' },
  { duration: 5000, description: 'Line 3 selected. Following tunnel corridor...', selectTrainId: 'LINE3-002', showTelemetry: true },
  { duration: 6000, description: 'Signal blocks active. Train approaching Balboa...', zoomToTunnel: true },
  { duration: 7000, description: 'Entering tunnel relay zone. Comms handoff in progress...', setScenario: 'tunnel_degraded' },
  { duration: 5000, description: 'B-CHOP braking event detected near Albrook...', setScenario: 'bchop_peak' },
  { duration: 6000, description: 'Energy recovery flowing to network battery...', showTelemetry: true },
  { duration: 4000, description: 'System summary: all lines operational.', setScenario: 'normal' },
];
