/**
 * HMAX-Lite: TypeScript Type Definitions
 * ======================================
 * 
 * Type definitions for train telemetry, stations, system status, scenarios,
 * operational events, and guided operator prompts.
 * Mirrors the Pydantic models in the backend.
 */

export type MetroLine = 'line1' | 'line2' | 'line3';

export type ScenarioMode = 
  | 'normal'
  | 'rush_hour'
  | 'tunnel_degraded'
  | 'bchop_peak'
  | 'dwell_delay'
  | 'signal_hold';

export type SpeedPhase = 'accelerate' | 'cruise' | 'brake' | 'dwell';

export type EventType = 
  | 'departed'
  | 'braking'
  | 'energy_recovery'
  | 'tunnel_entry'
  | 'tunnel_exit'
  | 'dwell_complete'
  | 'headway_compressed'
  | 'headway_restored'
  | 'bchop_active'
  | 'comms_handoff'
  | 'station_approach';

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

export interface OperationalEvent {
  id: string;
  timestamp: number;
  type: EventType;
  train_id: string;
  line: MetroLine;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  station_id?: string;
}

export interface OperatorPrompt {
  id: string;
  timestamp: number;
  train_id?: string;
  line: MetroLine | 'all';
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  acknowledged: boolean;
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
  // Frontend-derived rich states
  speed_phase: SpeedPhase;
  current_segment_name: string;
  block_occupancy: number; // 0-1, how full the block is
  dwell_countdown_seconds: number;
  braking_phase: 'none' | 'initial' | 'heavy' | 'regen';
  tunnel_phase: 'none' | 'approach' | 'inside' | 'exit';
  recent_events: OperationalEvent[];
  energy_recovered_session: number;
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

// Scenario configuration
export interface ScenarioConfig {
  id: ScenarioMode;
  label: string;
  description: string;
  icon: string;
  train_spacing_factor: number;
  event_frequency_multiplier: number;
  tunnel_highlight_intensity: number;
  braking_pulse_enabled: boolean;
  dwell_variance_enabled: boolean;
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

export const SCENARIO_CONFIG: Record<ScenarioMode, ScenarioConfig> = {
  normal: {
    id: 'normal',
    label: 'Normal Service',
    description: 'Standard operations across all lines',
    icon: 'activity',
    train_spacing_factor: 1.0,
    event_frequency_multiplier: 1.0,
    tunnel_highlight_intensity: 1.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: false,
  },
  rush_hour: {
    id: 'rush_hour',
    label: 'Rush Hour Compression',
    description: 'Compressed headways, higher frequency',
    icon: 'zap',
    train_spacing_factor: 0.6,
    event_frequency_multiplier: 1.5,
    tunnel_highlight_intensity: 1.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: true,
  },
  tunnel_degraded: {
    id: 'tunnel_degraded',
    label: 'Tunnel Relay Degraded',
    description: 'Reduced comms capacity in tunnel zone',
    icon: 'radio',
    train_spacing_factor: 1.3,
    event_frequency_multiplier: 2.0,
    tunnel_highlight_intensity: 2.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: false,
  },
  bchop_peak: {
    id: 'bchop_peak',
    label: 'B-CHOP Peak Recovery',
    description: 'Maximized regenerative braking events',
    icon: 'battery-charging',
    train_spacing_factor: 1.0,
    event_frequency_multiplier: 2.5,
    tunnel_highlight_intensity: 1.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: false,
  },
  dwell_delay: {
    id: 'dwell_delay',
    label: 'Station Dwell Delay',
    description: 'Extended station stops system-wide',
    icon: 'clock',
    train_spacing_factor: 1.1,
    event_frequency_multiplier: 1.8,
    tunnel_highlight_intensity: 1.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: true,
  },
  signal_hold: {
    id: 'signal_hold',
    label: 'Signal Block Hold',
    description: 'Controlled block occupancy management',
    icon: 'shield',
    train_spacing_factor: 1.4,
    event_frequency_multiplier: 1.2,
    tunnel_highlight_intensity: 1.0,
    braking_pulse_enabled: true,
    dwell_variance_enabled: false,
  },
};

export const EVENT_TYPE_META: Record<EventType, { label: string; color: string; icon: string }> = {
  departed: { label: 'Departed', color: '#34d399', icon: 'arrow-right' },
  braking: { label: 'Braking', color: '#fbbf24', icon: 'alert-triangle' },
  energy_recovery: { label: 'Energy Recovery', color: '#d7ff5f', icon: 'zap' },
  tunnel_entry: { label: 'Tunnel Entry', color: '#22d3ee', icon: 'radio' },
  tunnel_exit: { label: 'Tunnel Exit', color: '#22d3ee', icon: 'radio' },
  dwell_complete: { label: 'Dwell Complete', color: '#60a5fa', icon: 'check' },
  headway_compressed: { label: 'Headway Compressed', color: '#fbbf24', icon: 'minimize-2' },
  headway_restored: { label: 'Headway Restored', color: '#34d399', icon: 'maximize-2' },
  bchop_active: { label: 'B-CHOP Active', color: '#d7ff5f', icon: 'battery-charging' },
  comms_handoff: { label: 'Comms Handoff', color: '#22d3ee', icon: 'wifi' },
  station_approach: { label: 'Approaching', color: '#60a5fa', icon: 'map-pin' },
};
