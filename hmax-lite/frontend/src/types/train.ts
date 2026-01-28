/**
 * HMAX-Lite: TypeScript Type Definitions
 * ======================================
 * 
 * Type definitions for train telemetry, stations, and system status.
 * These mirror the Pydantic models in the backend.
 */

export type MetroLine = 'line1' | 'line2' | 'line3';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  station_type: 'At-Grade' | 'Underground' | 'Elevated' | 'Terminal';
  is_tunnel_boundary: boolean;
  line: MetroLine;
}

export interface LineInfo {
  id: MetroLine;
  name: string;
  color: string;
  description: string;
  station_count: number;
}

export interface TelemetryData {
  speed_kmh: number;
  b_chop_status: boolean;
  energy_recovered_kwh: number;
  regen_braking_temp: number;
  motor_current_amps: number;
  door_status: 'CLOSED' | 'OPEN' | 'FAULT';
}

export interface TrainPosition {
  lat: number;
  lng: number;
  heading: number;
  current_station_id: string;
  next_station_id: string;
  progress: number;
}

export interface TrainStatus {
  id: string;
  name: string;
  line: MetroLine;
  position: TrainPosition;
  telemetry: TelemetryData;
  is_in_tunnel: boolean;
  comms_mode: 'NORMAL' | 'TUNNEL_RELAY';
  operating_mode: 'REVENUE' | 'NON_REVENUE' | 'MAINTENANCE';
  direction: 'WESTBOUND' | 'EASTBOUND' | 'NORTHBOUND' | 'SOUTHBOUND';
  next_station_eta_seconds: number;
  at_station: boolean;
  timestamp: string;
}

export interface SystemStatus {
  active_trains: number;
  total_energy_recovered_kwh: number;
  trains_in_tunnel: number;
  system_health: 'NORMAL' | 'DEGRADED' | 'CRITICAL';
  timestamp: string;
}

export interface TrainListResponse {
  trains: TrainStatus[];
  system_status: SystemStatus;
}

export interface StationListResponse {
  stations: Station[];
  route_coordinates: [number, number][];
  line: LineInfo;
}

export interface AllLinesResponse {
  lines: LineInfo[];
  all_stations: Station[];
  all_route_coordinates: Record<MetroLine, [number, number][]>;
}

// Historical data point for charts
export interface TelemetryHistoryPoint {
  timestamp: number;
  speed_kmh: number;
  energy_recovered_kwh: number;
  regen_braking_temp: number;
}

// Line configuration for UI
export const LINE_CONFIG: Record<MetroLine, { color: string; bgColor: string; borderColor: string; label: string }> = {
  line1: {
    color: '#ef4444', // Red
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    label: 'Line 1',
  },
  line2: {
    color: '#22c55e', // Green
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    label: 'Line 2',
  },
  line3: {
    color: '#3b82f6', // Blue
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    label: 'Line 3',
  },
};
