import type {
  TrainStatus,
  TrainListResponse,
  AllLinesResponse,
  MetroLine,
  Station,
  LineInfo,
  TelemetryHistoryPoint,
} from '../types/train';

const STATIONS: Record<MetroLine, Station[]> = {
  line1: [
    { id: 'L1-01', name: 'San Isidro (Terminal)', lat: 9.0824, lng: -79.4856, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line1' },
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
    { id: 'L1-14', name: '12 de Octubre (Interchange)', lat: 8.9835, lng: -79.5205, station_type: 'Underground', is_tunnel_boundary: false, line: 'line1' },
    { id: 'L1-15', name: 'Albrook (Interchange)', lat: 8.9763, lng: -79.5475, station_type: 'At-Grade', is_tunnel_boundary: false, line: 'line1' },
  ],
  line2: [
    { id: 'L2-01', name: 'Nuevo Tocumen (Terminal)', lat: 9.0525, lng: -79.3802, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line2' },
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
    { id: 'L2-13', name: 'Albrook (Interchange)', lat: 8.9763, lng: -79.5475, station_type: 'At-Grade', is_tunnel_boundary: false, line: 'line2' },
  ],
  line3: [
    { id: 'ST-01', name: 'Albrook (Terminal/Interchange)', lat: 8.9763, lng: -79.5475, station_type: 'Terminal', is_tunnel_boundary: false, line: 'line3' },
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
    next_station_eta_seconds: atStation ? 12 : Math.round((1 - progress) * 120 + Math.random() * 30),
    at_station: atStation,
    timestamp: new Date().toISOString(),
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

function speedForProgress(progress: number, atStation: boolean): number {
  if (atStation) return 0;
  if (progress < 0.22) return 24 + progress * 190;
  if (progress > 0.76) return Math.max(12, 78 * (1 - (progress - 0.76) / 0.24));
  return 70 + Math.sin(progress * Math.PI) * 8;
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
  return [
    makeTrain('LINE1-001', 'LINE1 Train 1', 'line1', 2, 0.45, 62, 'SOUTHBOUND', false, false, false, 24.5 + Math.sin(now / 5000) * 2, 48.2),
    makeTrain('LINE1-002', 'LINE1 Train 2', 'line1', 7, 0.82, 28, 'SOUTHBOUND', true, false, false, 31.8 + Math.sin(now / 4000) * 3, 62.5),
    makeTrain('LINE1-003', 'LINE1 Train 3', 'line1', 11, 0.15, 71, 'NORTHBOUND', false, false, false, 18.3, 44.1),
    makeTrain('LINE1-004', 'LINE1 Train 4', 'line1', 14, 0.0, 0, 'SOUTHBOUND', false, false, true, 12.7, 42.0),
    makeTrain('LINE2-001', 'LINE2 Train 1', 'line2', 1, 0.55, 55, 'WESTBOUND', false, false, false, 19.2, 46.8),
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

function jitterTrain(train: TrainStatus): TrainStatus {
  const segment = getSegment(train.line, train.position.current_station_id, train.direction);

  if (train.at_station) {
    const dwellRemaining = Math.max(0, train.next_station_eta_seconds - 1);
    if (dwellRemaining > 0) {
      return {
        ...train,
        telemetry: {
          ...train.telemetry,
          speed_kmh: 0,
          motor_current_amps: Math.round((18 + Math.random() * 6) * 10) / 10,
          door_status: 'OPEN',
        },
        next_station_eta_seconds: dwellRemaining,
        timestamp: new Date().toISOString(),
      };
    }
  }

  const baseProgress = train.at_station ? 0 : train.position.progress;
  const targetSpeed = speedForProgress(baseProgress, false);
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

  return {
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
  };
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
    speed_kmh: 40 + Math.random() * 40,
    energy_recovered_kwh: i * 0.15 + Math.random() * 0.5,
    regen_braking_temp: 42 + Math.random() * 20,
  }));
}
