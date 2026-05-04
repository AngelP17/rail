/**
 * HMAX-Lite: Train Marker Component - OCC Edition
 * =================================================
 *
 * Custom Leaflet marker for train visualization.
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

function createTrainIcon(
  isInTunnel: boolean,
  isBraking: boolean,
  isSelected: boolean,
  lineColor: string
): L.DivIcon {
  const color = getStatusColor(isInTunnel, isBraking);
  const size = isSelected ? 36 : 28;

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
      ${isSelected ? `
        <circle cx="16" cy="16" r="15" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.3"/>
      ` : ''}
      <circle cx="16" cy="16" r="14" fill="none" stroke="${lineColor}" stroke-width="2"/>
      <rect x="5" y="7" width="22" height="16" rx="5" fill="#0a0e14" stroke="${isSelected ? '#ffffff' : color}" stroke-width="2" filter="url(#glow)"/>
      <rect x="8" y="10" width="4" height="4" rx="1" fill="${color}"/>
      <rect x="14" y="10" width="4" height="4" rx="1" fill="${color}"/>
      <rect x="20" y="10" width="4" height="4" rx="1" fill="${color}"/>
      <line x1="16" y1="15" x2="16" y2="19" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
      <circle cx="10" cy="22" r="2" fill="#0a0e14" stroke="${color}" stroke-width="1.5"/>
      <circle cx="22" cy="22" r="2" fill="#0a0e14" stroke="${color}" stroke-width="1.5"/>
      <circle cx="26" cy="9" r="1.5" fill="#ffffff"/>
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

function getStatusInfo(train: TrainStatus): { label: string; color: string } {
  if (train.is_in_tunnel) return { label: 'TUNNEL', color: '#22d3ee' };
  if (train.telemetry.b_chop_status) return { label: 'BRAKING', color: '#fbbf24' };
  if (train.at_station) return { label: 'STATION', color: '#60a5fa' };
  return { label: 'MOVING', color: '#34d399' };
}

export function TrainMarker({ train, isSelected, onSelect }: TrainMarkerProps) {
  const lineColor = LINE_CONFIG[train.line].color;
  const icon = createTrainIcon(train.is_in_tunnel, train.telemetry.b_chop_status, isSelected, lineColor);
  const statusColor = getStatusColor(train.is_in_tunnel, train.telemetry.b_chop_status);
  const statusInfo = getStatusInfo(train);

  return (
    <Marker
      position={[train.position.lat, train.position.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(train.id) }}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      <Popup className="train-popup">
        <div className="relative min-w-[260px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0e14]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="h-3 w-3 animate-pulse rounded-full"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 16px ${statusColor}` }}
            />
            <div>
              <span className="block font-mono text-lg font-black tracking-tight text-white">{train.id}</span>
              <span className="text-[10px] text-white/30">{train.name}</span>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold"
              style={{
                backgroundColor: `${lineColor}15`,
                borderColor: `${lineColor}40`,
                color: lineColor,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: lineColor }} />
              {LINE_CONFIG[train.line].label}
            </div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold"
              style={{
                backgroundColor: `${statusInfo.color}15`,
                borderColor: `${statusInfo.color}40`,
                color: statusInfo.color,
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: statusInfo.color }} />
              {statusInfo.label}
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <span className="text-[10px] text-white/30">Speed</span>
              <p className="font-mono text-sm font-bold text-white">{formatSpeed(train.telemetry.speed_kmh)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <span className="text-[10px] text-white/30">Direction</span>
              <p className="font-mono text-sm font-bold text-white">{train.direction}</p>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <span className="text-[10px] text-white/30">ETA</span>
            <span className="font-mono text-xl font-black text-[#60a5fa]">{formatEta(train.next_station_eta_seconds)}</span>
          </div>

          <button
            onClick={() => onSelect(train.id)}
            className="w-full rounded-lg bg-white py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
