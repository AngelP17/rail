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
  const size = isSelected ? 42 : 32;
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
      <rect x="4" y="6" width="24" height="18" rx="6" 
            fill="#07101d" 
            stroke="${isSelected ? '#ffffff' : color}" 
            stroke-width="${borderWidth}"
            filter="url(#glow)"/>
      
      <!-- Windows -->
      <rect x="7" y="9" width="5" height="5" rx="1.5" fill="${color}"/>
      <rect x="13.5" y="9" width="5" height="5" rx="1.5" fill="${color}"/>
      <rect x="20" y="9" width="5" height="5" rx="1.5" fill="${color}"/>
      
      <!-- Door line -->
      <line x1="16" y1="15" x2="16" y2="21" stroke="${color}" stroke-width="1" stroke-opacity="0.55"/>
      
      <!-- Wheels -->
      <circle cx="9" cy="25" r="2.5" fill="#07101d" stroke="${color}" stroke-width="1.5"/>
      <circle cx="23" cy="25" r="2.5" fill="#07101d" stroke="${color}" stroke-width="1.5"/>
      
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
        <div className="relative min-w-[300px] overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#07101d]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(96,165,250,0.2),transparent_36%)]" />
          <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ 
                backgroundColor: statusColor,
                boxShadow: `0 0 24px ${statusColor}` 
              }}
            />
            <div>
              <span className="font-mono font-black text-2xl tracking-[-0.06em] text-white block leading-tight">
                {train.id}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">{train.name}</span>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <div 
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-bold"
              style={{ 
                backgroundColor: `${lineColor}18`,
                borderColor: `${lineColor}55`,
                color: lineColor
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lineColor }} />
              {LINE_CONFIG[train.line].label}
            </div>

            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-bold ${statusInfo.className}`}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
              {statusInfo.label}
            </div>
          </div>
          
          {/* Telemetry grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
              <span className="text-[10px] text-white/36 block uppercase tracking-[0.2em] mb-2">Speed</span>
              <span className="font-mono text-lg text-white font-black">
                {formatSpeed(train.telemetry.speed_kmh)}
              </span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
              <span className="text-[10px] text-white/36 block uppercase tracking-[0.2em] mb-2">Direction</span>
              <span className="font-mono text-lg text-white font-black">
                {train.direction}
              </span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4 col-span-2">
              <span className="text-[10px] text-white/36 block uppercase tracking-[0.2em] mb-2">Next Station</span>
              <span className="font-mono text-lg text-white font-black">
                {train.position.next_station_id}
              </span>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-center justify-between py-4 border-t border-white/10 mb-3">
            <span className="text-xs text-white/36 font-mono uppercase tracking-[0.22em]">ETA</span>
            <span className="font-mono text-3xl text-status-info font-black tracking-[-0.05em]">
              {formatEta(train.next_station_eta_seconds)}
            </span>
          </div>
          
          {/* Action button */}
          <button
            onClick={() => onSelect(train.id)}
            className="w-full rounded-full bg-white py-3 text-sm font-black text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            View Details
          </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
