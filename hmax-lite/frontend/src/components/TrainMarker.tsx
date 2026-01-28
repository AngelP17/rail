/**
 * HMAX-Lite: Train Marker Component - Enterprise Edition
 * ======================================================
 * 
 * Custom Leaflet marker for train visualization on the map.
 * Enhanced with enterprise-level styling, animations, and state visualization.
 */

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { TrainStatus } from '../types/train';
import { formatSpeed, formatEta, getStatusColor } from '../utils/api';
import { LINE_CONFIG } from '../types/train';

interface TrainMarkerProps {
  train: TrainStatus;
  isSelected: boolean;
  onSelect: (trainId: string) => void;
}

/**
 * Create custom train icon based on state
 */
function createTrainIcon(
  isInTunnel: boolean, 
  isBraking: boolean, 
  isSelected: boolean,
  lineColor: string
): L.DivIcon {
  const color = getStatusColor(isInTunnel, isBraking);
  const size = isSelected ? 36 : 28;
  const borderWidth = isSelected ? 3 : 2;

  // Enhanced SVG train icon with enterprise styling
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Outer glow ring (selected state) -->
      ${isSelected ? `
        <circle cx="16" cy="16" r="14" 
                fill="none" 
                stroke="${color}" 
                stroke-width="1"
                stroke-opacity="0.3"
                style="animation: pulse 2s ease-in-out infinite"/>
      ` : ''}
      
      <!-- Line indicator ring -->
      <circle cx="16" cy="16" r="${isSelected ? 15 : 13}" 
              fill="none" 
              stroke="${lineColor}" 
              stroke-width="2"/>
      
      <!-- Main train body -->
      <rect x="4" y="6" width="24" height="18" rx="3" 
            fill="${color}" 
            stroke="${isSelected ? '#ffffff' : color}" 
            stroke-width="${borderWidth}"
            filter="url(#glow)"/>
      
      <!-- Windows -->
      <rect x="7" y="9" width="5" height="5" rx="1" fill="#0f172a"/>
      <rect x="13.5" y="9" width="5" height="5" rx="1" fill="#0f172a"/>
      <rect x="20" y="9" width="5" height="5" rx="1" fill="#0f172a"/>
      
      <!-- Door line -->
      <line x1="16" y1="15" x2="16" y2="21" stroke="#0f172a" stroke-width="1" stroke-opacity="0.5"/>
      
      <!-- Wheels -->
      <circle cx="9" cy="25" r="2.5" fill="${color}"/>
      <circle cx="23" cy="25" r="2.5" fill="${color}"/>
      
      <!-- Status indicator dot -->
      <circle cx="26" cy="8" r="2" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    className: 'train-marker',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Get status label and styling
 */
function getStatusInfo(train: TrainStatus): { label: string; className: string } {
  if (train.is_in_tunnel) {
    return { 
      label: 'TUNNEL MODE', 
      className: 'text-status-tunnel bg-status-tunnel/10 border-status-tunnel/30' 
    };
  }
  if (train.telemetry.b_chop_status) {
    return { 
      label: 'REGEN BRAKING', 
      className: 'text-status-warning bg-status-warning/10 border-status-warning/30' 
    };
  }
  if (train.at_station) {
    return { 
      label: 'AT STATION', 
      className: 'text-status-info bg-status-info/10 border-status-info/30' 
    };
  }
  return { 
    label: 'NORMAL', 
    className: 'text-status-normal bg-status-normal/10 border-status-normal/30' 
  };
}

export function TrainMarker({ train, isSelected, onSelect }: TrainMarkerProps) {
  const lineColor = LINE_CONFIG[train.line].color;
  
  const icon = createTrainIcon(
    train.is_in_tunnel,
    train.telemetry.b_chop_status,
    isSelected,
    lineColor
  );

  const statusColor = getStatusColor(train.is_in_tunnel, train.telemetry.b_chop_status);
  const statusInfo = getStatusInfo(train);

  return (
    <Marker
      position={[train.position.lat, train.position.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(train.id),
      }}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      <Popup className="train-popup">
        <div className="bg-scada-surface p-4 rounded-xl min-w-[220px] border border-scada-border/50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ 
                backgroundColor: statusColor,
                boxShadow: `0 0 10px ${statusColor}` 
              }}
            />
            <div>
              <span className="font-display font-bold text-lg text-white block leading-tight">
                {train.id}
              </span>
              <span className="text-xs text-scada-muted">{train.name}</span>
            </div>
          </div>

          {/* Line badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium mb-3"
            style={{ 
              backgroundColor: `${lineColor}20`,
              border: `1px solid ${lineColor}50`,
              color: lineColor
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lineColor }} />
            {LINE_CONFIG[train.line].label}
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium mb-4 ${statusInfo.className}`}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
            {statusInfo.label}
          </div>
          
          {/* Telemetry grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-scada-card/50 rounded-lg p-2.5">
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider mb-1">Speed</span>
              <span className="font-mono text-sm text-white font-semibold">
                {formatSpeed(train.telemetry.speed_kmh)}
              </span>
            </div>
            <div className="bg-scada-card/50 rounded-lg p-2.5">
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider mb-1">Direction</span>
              <span className="font-mono text-sm text-white font-semibold">
                {train.direction}
              </span>
            </div>
            <div className="bg-scada-card/50 rounded-lg p-2.5 col-span-2">
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider mb-1">Next Station</span>
              <span className="font-mono text-sm text-white font-semibold">
                {train.position.next_station_id}
              </span>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-center justify-between py-2 border-t border-scada-border/30 mb-3">
            <span className="text-xs text-scada-muted font-mono uppercase tracking-wider">ETA</span>
            <span className="font-mono text-lg text-status-info font-bold">
              {formatEta(train.next_station_eta_seconds)}
            </span>
          </div>
          
          {/* Action button */}
          <button
            onClick={() => onSelect(train.id)}
            className="w-full py-2.5 bg-gradient-to-r from-status-info to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
