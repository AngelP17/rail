/**
 * HMAX-Lite: Telemetry Sidebar Component - Enterprise Edition
 * ===========================================================
 * 
 * Side panel showing detailed telemetry for the selected train.
 * Enhanced with enterprise-level styling, animations, and data visualization.
 */

import {
  X,
  Train,
  Gauge,
  Zap,
  Thermometer,
  MapPin,
  Clock,
  Radio,
  AlertTriangle,
  Navigation,
  DoorOpen,
  Activity,
  Battery,
} from 'lucide-react';
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

/**
 * Empty state component when no train is selected
 */
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-scada-card border border-scada-border/50 flex items-center justify-center">
          <Train className="w-10 h-10 text-scada-muted" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-scada-surface border-2 border-scada-border flex items-center justify-center">
          <Activity className="w-3 h-3 text-scada-muted" />
        </div>
      </div>
      
      <h3 className="text-xl font-display font-bold text-white mb-2">
        Select a Train
      </h3>
      <p className="text-sm text-scada-muted max-w-[200px] leading-relaxed">
        Click on a train marker on the map or select from the fleet list to view detailed telemetry
      </p>

      {/* Decorative elements */}
      <div className="mt-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-scada-border animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-scada-border animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-scada-border animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

/**
 * Status banner component
 */
function StatusBanner({ train }: { train: TrainStatus }) {
  const getStatusConfig = () => {
    if (train.is_in_tunnel) {
      return {
        icon: Radio,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
        label: 'TUNNEL MODE',
        description: `Comms: ${train.comms_mode}`,
      };
    }
    if (train.telemetry.b_chop_status) {
      return {
        icon: Zap,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        label: 'REGENERATIVE BRAKING',
        description: 'Energy recovery active',
      };
    }
    if (train.at_station) {
      return {
        icon: DoorOpen,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        label: 'AT STATION',
        description: 'Passenger boarding in progress',
      };
    }
    return {
      icon: Activity,
      color: '#00ff9d',
      bgColor: 'rgba(0, 255, 157, 0.1)',
      label: 'NORMAL OPERATION',
      description: 'All systems nominal',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className="p-4 rounded-xl border flex items-start gap-3 animate-slide-in-up"
      style={{
        borderColor: `${config.color}30`,
        backgroundColor: config.bgColor,
      }}
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <span 
          className="font-mono text-sm font-semibold block"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <p className="text-xs text-scada-muted mt-0.5">
          {config.description}
        </p>
      </div>
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
        style={{ 
          backgroundColor: config.color,
          boxShadow: `0 0 8px ${config.color}` 
        }}
      />
    </div>
  );
}

/**
 * Route info card component
 */
function RouteInfo({ train, stations }: { train: TrainStatus; stations: Station[] }) {
  const currentStation = stations.find(s => s.id === train.position.current_station_id);
  const nextStation = stations.find(s => s.id === train.position.next_station_id);
  const progress = train.position.progress;

  return (
    <div className="bg-scada-card/50 rounded-xl p-4 border border-scada-border/30 animate-slide-in-up stagger-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-scada-surface rounded-md">
          <MapPin className="w-4 h-4 text-scada-muted" />
        </div>
        <span className="text-xs font-mono text-scada-muted uppercase tracking-wider">Route Progress</span>
      </div>
      
      {/* Route visualization */}
      <div className="space-y-4">
        {/* From station */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-status-info" />
            <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-scada-border/50 -translate-x-1/2" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-scada-muted block uppercase tracking-wider">From</span>
            <span className="font-mono text-sm text-white truncate block">
              {currentStation?.name || train.position.current_station_id}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pl-1.5">
          <div className="h-2 bg-scada-border/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-status-info to-status-normal"
              style={{
                width: `${progress * 100}%`,
                boxShadow: '0 0 8px rgba(0, 255, 157, 0.4)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-scada-muted font-mono">
              {Math.round(progress * 100)}%
            </span>
            <span className="text-[10px] text-scada-muted font-mono">
              {train.direction}
            </span>
          </div>
        </div>

        {/* To station */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-status-normal" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-scada-muted block uppercase tracking-wider">To</span>
            <span className="font-mono text-sm text-white truncate block">
              {nextStation?.name || train.position.next_station_id}
            </span>
          </div>
        </div>
      </div>

      {/* ETA */}
      <div className="mt-4 pt-4 border-t border-scada-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-scada-muted" />
            <span className="text-xs text-scada-muted font-mono uppercase tracking-wider">ETA</span>
          </div>
          <span className="font-mono text-2xl text-status-info font-bold tabular-nums">
            {formatEta(train.next_station_eta_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Additional telemetry info card
 */
function AdditionalInfo({ train }: { train: TrainStatus }) {
  const items = [
    { label: 'Direction', value: train.direction, icon: Navigation },
    { label: 'Mode', value: train.operating_mode, icon: Activity },
    { label: 'Doors', value: train.telemetry.door_status, icon: DoorOpen, isStatus: true },
    { label: 'Motor', value: `${Math.round(train.telemetry.motor_current_amps)} A`, icon: Battery },
  ];

  return (
    <div className="bg-scada-card/50 rounded-xl p-4 border border-scada-border/30 animate-slide-in-up stagger-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const getStatusColor = () => {
            if (!item.isStatus) return 'text-white';
            if (item.value === 'OPEN') return 'text-status-warning';
            if (item.value === 'FAULT') return 'text-status-danger';
            return 'text-status-normal';
          };

          return (
            <div key={item.label} className="flex items-start gap-2">
              <Icon className="w-4 h-4 text-scada-muted mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-scada-muted block uppercase tracking-wider">
                  {item.label}
                </span>
                <span className={`font-mono text-sm font-semibold ${getStatusColor()}`}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TelemetrySidebar({ train, history, stations, onClose }: TelemetrySidebarProps) {
  if (!train) {
    return <EmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-scada-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-scada-border/50 bg-scada-surface/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: train.is_in_tunnel 
                  ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                  : train.telemetry.b_chop_status
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #00ff9d 0%, #10b981 100%)',
                boxShadow: train.is_in_tunnel
                  ? '0 4px 14px rgba(168, 85, 247, 0.4)'
                  : train.telemetry.b_chop_status
                  ? '0 4px 14px rgba(245, 158, 11, 0.4)'
                  : '0 4px 14px rgba(0, 255, 157, 0.3)',
              }}
            >
              <Train className="w-5 h-5 text-white" />
            </div>
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-scada-surface animate-pulse"
              style={{
                backgroundColor: train.is_in_tunnel ? '#a855f7' : train.telemetry.b_chop_status ? '#f59e0b' : '#00ff9d',
              }}
            />
          </div>
          
          <div>
            <h2 className="font-display font-bold text-lg text-white">{train.id}</h2>
            <p className="text-xs text-scada-muted">{train.name}</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-scada-card rounded-lg transition-all duration-200 border border-transparent hover:border-scada-border/50 active:scale-95"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-scada-muted" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Banner */}
        <StatusBanner train={train} />

        {/* Speed Gauge */}
        <div className="bg-scada-card/50 rounded-xl p-4 border border-scada-border/30 animate-slide-in-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-scada-surface rounded-md">
              <Gauge className="w-4 h-4 text-scada-muted" />
            </div>
            <span className="text-xs font-mono text-scada-muted uppercase tracking-wider">Velocity</span>
          </div>
          <SpeedGauge
            speed={train.telemetry.speed_kmh}
            isBraking={train.telemetry.b_chop_status}
          />
        </div>

        {/* B-CHOP Status */}
        <div className="bg-scada-card/50 rounded-xl p-4 border border-scada-border/30 animate-slide-in-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-scada-surface rounded-md">
                <Zap className="w-4 h-4 text-scada-muted" />
              </div>
              <span className="text-xs font-mono text-scada-muted uppercase tracking-wider">B-CHOP System</span>
            </div>
            <div 
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase"
              style={{
                backgroundColor: train.telemetry.b_chop_status ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 255, 157, 0.1)',
                color: train.telemetry.b_chop_status ? '#f59e0b' : '#00ff9d',
                border: `1px solid ${train.telemetry.b_chop_status ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 255, 157, 0.3)'}`,
              }}
            >
              {train.telemetry.b_chop_status ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>
          
          {/* Energy recovered display */}
          <div className="flex items-center justify-between mb-4 p-3 bg-scada-surface/50 rounded-lg">
            <span className="text-xs text-scada-muted font-mono uppercase tracking-wider">Total Recovered</span>
            <span className="font-mono text-lg text-status-normal font-bold">
              {formatEnergy(train.telemetry.energy_recovered_kwh)}
            </span>
          </div>

          <EnergyChart history={history} />
        </div>

        {/* Temperature */}
        <div className="bg-scada-card/50 rounded-xl p-4 border border-scada-border/30 animate-slide-in-up stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-scada-surface rounded-md">
              <Thermometer className="w-4 h-4 text-scada-muted" />
            </div>
            <span className="text-xs font-mono text-scada-muted uppercase tracking-wider">Brake System</span>
          </div>
          <TempGauge temp={train.telemetry.regen_braking_temp} />
        </div>

        {/* Route Info */}
        <RouteInfo train={train} stations={stations} />

        {/* Additional Info */}
        <AdditionalInfo train={train} />

        {/* At Station Indicator */}
        {train.at_station && (
          <div className="bg-status-info/10 border border-status-info/30 rounded-xl p-4 flex items-center gap-3 animate-slide-in-up stagger-5">
            <div className="p-2 bg-status-info/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-status-info" />
            </div>
            <div>
              <span className="font-mono text-sm text-status-info font-semibold block">AT STATION</span>
              <p className="text-xs text-scada-muted">
                Passenger boarding in progress
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-scada-border/50 bg-scada-surface/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-scada-muted font-mono uppercase tracking-wider">
            Last Update
          </span>
          <span className="text-xs text-scada-text-secondary font-mono">
            {new Date(train.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
