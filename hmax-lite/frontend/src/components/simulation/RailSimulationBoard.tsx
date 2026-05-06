/**
 * RailSimulationBoard - Custom SVG/DOM Rail Simulation Surface
 * =============================================================
 *
 * The hero visual component. Renders schematic rail corridors,
 * animated train capsules, signal blocks, tunnel zones, dwell rings,
 * and B-CHOP energy pulses. Replaces generic map as the main wow surface.
 */

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { TrainStatus, Station, MetroLine } from '../../types/train';
import { LINE_CONFIG } from '../../types/train';
import type { SignalBlock } from '../../simulation/deriveSignalBlocks';
import { deriveSignalBlocks } from '../../simulation/deriveSignalBlocks';
import {
  getBlockColor,
  getTrainStatusColor,
  buildStationMap,
  buildRouteCoords,
  groupStationsByLine,
  getFilteredTrains,
  getFilteredLines,
} from '../../utils/sharedStyling';

gsap.registerPlugin(useGSAP);

interface RailSimulationBoardProps {
  trains: TrainStatus[];
  stations: Station[];
  selectedLine: MetroLine | 'all';
  selectedTrainId: string | null;
  onSelectTrain: (id: string) => void;
  signalBlocks: SignalBlock[];
  scenarioIntensity: number;
  showEnergyPulses: boolean;
}

// SVG viewport dimensions
const VW = 1000;
const VH = 700;
const MAP_CENTER: [number, number] = [8.98, -79.52];
const MAP_ZOOM = 11;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Map geo bounds to SVG coords
function geoToSvg(lat: number, lng: number): [number, number] {
  const minLat = 8.91, maxLat = 9.09;
  const minLng = -79.71, maxLng = -79.36;
  const padding = 60;
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * (VW - padding * 2);
  const y = VH - (padding + ((lat - minLat) / (maxLat - minLat)) * (VH - padding * 2));
  return [x, y];
}

function StationNode({ station, isTerminal, isTunnel, isSelected }: {
  station: Station;
  isTerminal: boolean;
  isTunnel: boolean;
  isSelected: boolean;
}) {
  const [x, y] = geoToSvg(station.lat, station.lng);
  const color = isTunnel ? '#22d3ee' : LINE_CONFIG[station.line].color;
  const radius = isTerminal ? 8 : isTunnel ? 6 : 4;

  return (
    <g
      className="station-node"
      role="img"
      aria-label={`${station.name} station${isTerminal ? ' (terminal)' : ''}${isTunnel ? ' (tunnel boundary)' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Dwell ring for trains at this station */}
      {isSelected && (
        <circle cx={x} cy={y} r={radius + 10} fill="none" stroke={color} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values={`${radius + 8};${radius + 14};${radius + 8}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={isTerminal ? '#0a0e14' : color}
        stroke={color}
        strokeWidth={isTerminal ? 2.5 : 1.5}
        opacity={0.9}
      />
      {/* Terminal glow */}
      {isTerminal && (
        <circle cx={x} cy={y} r={radius + 4} fill="none" stroke={color} strokeWidth="1" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Tunnel boundary indicator */}
      {isTunnel && (
        <circle cx={x} cy={y} r={radius + 3} fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.6">
          <animate attributeName="r" values={`${radius + 2};${radius + 6};${radius + 2}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <text
        x={x}
        y={y + radius + 12}
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize="8"
        fontFamily="JetBrains Mono, monospace"
        style={{ pointerEvents: 'none' }}
      >
        {station.name.split(' ')[0]}
      </text>
    </g>
  );
}

function TrainCapsule({ train, isSelected, onClick, stationMap }: {
  train: TrainStatus;
  isSelected: boolean;
  onClick: () => void;
  stationMap: Map<string, Station>;
}) {
  const [x, y] = geoToSvg(train.position.lat, train.position.lng);
  const color = getTrainStatusColor(train);
  const capsuleWidth = isSelected ? 32 : 24;
  const capsuleHeight = isSelected ? 14 : 10;
  const currentStation = stationMap.get(train.position.current_station_id);
  const nextStation = stationMap.get(train.position.next_station_id);
  const canDrawTrail = currentStation && nextStation && !train.at_station;
  const [segmentStartX, segmentStartY] = currentStation ? geoToSvg(currentStation.lat, currentStation.lng) : [x, y];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Train trail (previous positions would need history, use a simple pulse for now)
  return (
    <g
      className="train-capsule"
      role="button"
      tabIndex={0}
      aria-label={`Train ${train.id} on ${LINE_CONFIG[train.line].label}, ${Math.round(train.telemetry.speed_kmh)} km/h${train.is_in_tunnel ? ', in tunnel' : ''}${train.telemetry.b_chop_status ? ', braking' : ''}`}
      style={{ cursor: 'pointer', transition: 'transform 0.3s ease-out' }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {canDrawTrail && (
        <g className={isSelected ? 'selected-train-shell' : undefined}>
          <line
            x1={segmentStartX}
            y1={segmentStartY}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth={isSelected ? 8 : 5}
            strokeLinecap="round"
            opacity={isSelected ? 0.22 : 0.11}
          />
          <line
            x1={segmentStartX}
            y1={segmentStartY}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth={isSelected ? 2.5 : 1.5}
            strokeLinecap="round"
            opacity={isSelected ? 0.82 : 0.42}
            strokeDasharray="3 7"
          >
            <animate attributeName="stroke-dashoffset" values="18;0" dur="1s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {isSelected && (
        <rect
          className="selected-train-shell"
          x={x - capsuleWidth / 2 - 4}
          y={y - capsuleHeight / 2 - 4}
          width={capsuleWidth + 8}
          height={capsuleHeight + 8}
          rx={capsuleHeight / 2 + 4}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" />
        </rect>
      )}
      <rect
        x={x - capsuleWidth / 2}
        y={y - capsuleHeight / 2}
        width={capsuleWidth}
        height={capsuleHeight}
        rx={capsuleHeight / 2}
        fill="#0a0e14"
        stroke={color}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 ${isSelected ? 8 : 4}px ${color}60)` }}
      />
      <circle
        cx={x + (train.direction === 'EASTBOUND' || train.direction === 'SOUTHBOUND' ? capsuleWidth / 2 - 4 : -capsuleWidth / 2 + 4)}
        cy={y}
        r={2}
        fill={color}
      />
      <rect
        x={x - capsuleWidth / 2 + 3}
        y={y + 2}
        width={(capsuleWidth - 6) * (train.telemetry.speed_kmh / 85)}
        height={2}
        rx={1}
        fill={color}
        opacity="0.7"
      />
      {train.telemetry.b_chop_status && (
        <circle cx={x} cy={y} r={capsuleWidth} fill="none" stroke="#d7ff5f" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values={`${capsuleWidth};${capsuleWidth + 20};${capsuleWidth}`} dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )}
      {train.is_in_tunnel && (
        <rect
          x={x - capsuleWidth / 2}
          y={y - capsuleHeight / 2}
          width={capsuleWidth}
          height={capsuleHeight}
          rx={capsuleHeight / 2}
          fill="rgba(6,182,212,0.15)"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      {isSelected && (
        <text
          x={x}
          y={y - capsuleHeight / 2 - 8}
          textAnchor="middle"
          fill={color}
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {train.id}
        </text>
      )}
    </g>
  );
}

function RailCorridor({ line, coordinates, isFiltered }: {
  line: MetroLine;
  coordinates: [number, number][];
  isFiltered: boolean;
}) {
  if (coordinates.length < 2) return null;

  const points = coordinates.map(([lat, lng]) => {
    const [x, y] = geoToSvg(lat, lng);
    return `${x},${y}`;
  }).join(' ');

  const color = LINE_CONFIG[line].color;
  const isLine3 = line === 'line3';

  // Find tunnel segment indices for line3
  let tunnelStart = -1, tunnelEnd = -1;
  if (isLine3) {
    tunnelStart = coordinates.findIndex(([lat, lng]) => Math.abs(lat - 8.9594) < 0.001 && Math.abs(lng - (-79.5573)) < 0.001);
    tunnelEnd = coordinates.findIndex(([lat, lng]) => Math.abs(lat - 8.9600) < 0.001 && Math.abs(lng - (-79.5900)) < 0.001);
  }

  const tunnelPoints = tunnelStart >= 0 && tunnelEnd >= 0
    ? coordinates.slice(tunnelStart, tunnelEnd + 1).map(([lat, lng]) => {
        const [x, y] = geoToSvg(lat, lng);
        return `${x},${y}`;
      }).join(' ')
    : '';

  return (
    <g opacity={isFiltered ? 1 : 0.25} style={{ transition: 'opacity 0.4s ease' }}>
      {/* Rail line glow */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.1"
      />
      {/* Main rail line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Tunnel segment - dashed cyan */}
      {tunnelPoints && (
        <>
          <polyline
            points={tunnelPoints}
            fill="none"
            stroke="#0891b2"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            strokeDasharray="8,4"
          />
          <polyline
            points={tunnelPoints}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
            strokeDasharray="6,3"
          />
          {/* Tunnel zone highlight */}
          <polyline
            points={tunnelPoints}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.05"
          />
        </>
      )}
    </g>
  );
}

function SignalBlockOverlay({
  blocks,
  selectedLine,
  stationMap,
}: {
  blocks: SignalBlock[];
  selectedLine: MetroLine | 'all';
  stationMap: Map<string, Station>;
}) {
  return (
    <g className="signal-block-layer">
      {blocks
        .filter(b => selectedLine === 'all' || b.line === selectedLine)
        .map(block => {
          const from = stationMap.get(block.fromStationId);
          const to = stationMap.get(block.toStationId);
          if (!from || !to) return null;

          const [x1, y1] = geoToSvg(from.lat, from.lng);
          const [x2, y2] = geoToSvg(to.lat, to.lng);
          const mx = x1 + (x2 - x1) * 0.5;
          const my = y1 + (y2 - y1) * 0.5;
          const statusColor = getBlockColor(block.status);
          const activeOpacity = block.status === 'clear' ? 0.08 : 0.42 + block.occupancy * 0.35;
          const railWidth = block.isTunnel ? 18 : 13;
          const showStatusLabel =
            block.status !== 'clear' &&
            (selectedLine !== 'all' || block.status === 'restricted' || block.isTunnel);

          return (
            <g key={block.id} opacity={selectedLine === 'all' ? 0.9 : 1}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={statusColor}
                strokeWidth={railWidth}
                strokeLinecap="round"
                opacity={activeOpacity}
                strokeDasharray={block.isTunnel ? '10 8' : undefined}
              />
              {block.status !== 'clear' && (
                <>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={statusColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  >
                    <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
                  </line>
                  {showStatusLabel && (
                    <g transform={`translate(${mx}, ${my - 16})`}>
                      <rect
                        x="-22"
                        y="-8"
                        width="44"
                        height="16"
                        rx="4"
                        fill="rgba(6,9,15,0.86)"
                        stroke={statusColor}
                        strokeWidth="1"
                        opacity="0.94"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={statusColor}
                        fontSize="7"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                      >
                        {block.status.toUpperCase()}
                      </text>
                    </g>
                  )}
                </>
              )}
            </g>
          );
        })}
    </g>
  );
}

function EnergyNetworkMeter({ level }: { level: number }) {
  return (
    <g transform={`translate(${VW - 140}, 20)`}>
      <rect x="0" y="0" width="120" height="24" rx="4" fill="rgba(10,14,20,0.8)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="6" y="16" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="JetBrains Mono, monospace">NETWORK BATTERY</text>
      <rect x="80" y="6" width="34" height="12" rx="2" fill="rgba(255,255,255,0.06)" />
      <rect x="80" y="6" width={34 * (level / 100)} height="12" rx="2" fill="#d7ff5f" opacity="0.8">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="115" y="15" fill="#d7ff5f" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="end">{Math.round(level)}%</text>
    </g>
  );
}

function GeoUnderlay({ routeCoords }: { routeCoords: Record<MetroLine, [number, number][]> }) {
  const map = useMap();

  useEffect(() => {
    const coords = Object.values(routeCoords).flat();
    if (coords.length > 0) {
      map.fitBounds(coords, {
        padding: [42, 42],
        maxZoom: 12,
        animate: false,
      });
    }
  }, [map, routeCoords]);

  return null;
}

export function RailSimulationBoard({
  trains,
  stations,
  selectedLine,
  selectedTrainId,
  onSelectTrain,
  signalBlocks,
  scenarioIntensity,
  showEnergyPulses,
}: RailSimulationBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const stationsByLine = useMemo(() => groupStationsByLine(stations), [stations]);
  const routeCoords = useMemo(() => buildRouteCoords(stations), [stations]);
  const stationMap = useMemo(() => buildStationMap(stations), [stations]);
  const filteredTrains = useMemo(() => getFilteredTrains(trains, selectedLine), [trains, selectedLine]);

  const boardSignalBlocks = useMemo(
    () => signalBlocks.length > 0 ? signalBlocks : deriveSignalBlocks(trains),
    [signalBlocks, trains],
  );

  const linesToShow = useMemo(() => getFilteredLines(selectedLine), [selectedLine]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(
      '.dispatch-scan',
      { xPercent: -120 },
      { xPercent: 120, duration: 4.8, repeat: -1, ease: 'none' },
    );

    gsap.to('.selected-train-shell', {
      opacity: 0.72,
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, { scope: rootRef, dependencies: [selectedTrainId, selectedLine] });

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-[#06090f]" style={{ borderRadius: 'inherit' }}>
      {/* Geographic context under the simulation layer. The SVG remains the operating surface. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.34]"
        style={{
          filter: 'saturate(0.45) contrast(1.2) brightness(0.78)',
        }}
        aria-hidden="true"
      >
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <GeoUnderlay routeCoords={routeCoords} />
        </MapContainer>
      </div>
      <div className="absolute inset-0 bg-[#06090f]/55" aria-hidden="true" />
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div
        className="dispatch-scan pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.08) 48%, rgba(215,255,95,0.13) 50%, rgba(34,211,238,0.08) 52%, transparent 100%)',
          filter: 'blur(10px)',
        }}
        aria-hidden="true"
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: 'none' }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="energyGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rail corridors */}
        {linesToShow.map(line => (
          <RailCorridor
            key={line}
            line={line}
            coordinates={routeCoords[line] || []}
            isFiltered={selectedLine === 'all' || selectedLine === line}
          />
        ))}

        {/* Signal blocks overlay */}
        <SignalBlockOverlay blocks={boardSignalBlocks} selectedLine={selectedLine} stationMap={stationMap} />

        {/* Stations */}
        {linesToShow.map(line =>
          stationsByLine[line]?.map(station => (
            <StationNode
              key={station.id}
              station={station}
              isTerminal={station.station_type === 'Terminal'}
              isTunnel={station.is_tunnel_boundary}
              isSelected={filteredTrains.some(t => t.position.current_station_id === station.id && t.at_station)}
            />
          ))
        )}

        {/* Train capsules */}
        {filteredTrains.map(train => (
          <TrainCapsule
            key={train.id}
            train={train}
            isSelected={train.id === selectedTrainId}
            onClick={() => onSelectTrain(train.id)}
            stationMap={stationMap}
          />
        ))}

        {/* Energy pulses from braking trains */}
        {showEnergyPulses && filteredTrains.filter(t => t.telemetry.b_chop_status).map(train => {
          const [x, y] = geoToSvg(train.position.lat, train.position.lng);
          return (
            <g key={`pulse-${train.id}`} filter="url(#energyGlow)">
              <circle cx={x} cy={y} r="40" fill="none" stroke="#d7ff5f" strokeWidth="2" opacity="0">
                <animate attributeName="r" values="20;60" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="30" fill="none" stroke="#d7ff5f" strokeWidth="1" opacity="0">
                <animate attributeName="r" values="15;50" dur="1s" begin="0.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0" dur="1s" begin="0.3s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Network battery meter */}
        <EnergyNetworkMeter level={Math.min(100, trains.reduce((s, t) => s + t.telemetry.energy_recovered_kwh, 0) / 5)} />

        {/* Legend */}
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="140" height="90" rx="6" fill="rgba(10,14,20,0.8)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {[
            { color: '#ef4444', label: 'Line 1' },
            { color: '#22c55e', label: 'Line 2' },
            { color: '#3b82f6', label: 'Line 3' },
            { color: '#22d3ee', label: 'Tunnel' },
            { color: '#fbbf24', label: 'Braking' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(10, ${16 + i * 14})`}>
              <circle cx="4" cy="0" r="3" fill={item.color} />
              <text x="14" y="3" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="JetBrains Mono, monospace">{item.label}</text>
            </g>
          ))}
        </g>

        {/* Scenario intensity indicator */}
        {scenarioIntensity > 1 && (
          <g transform={`translate(${VW / 2 - 60}, 20)`}>
            <rect x="0" y="0" width="120" height="20" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1" />
            <text x="60" y="14" fill="#fbbf24" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
              SCENARIO INTENSITY: {scenarioIntensity.toFixed(1)}x
            </text>
          </g>
        )}
      </svg>

      {/* Overlay stats */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex gap-3">
        <div className="rounded-md border border-white/[0.06] bg-[#0a0e14]/80 px-3 py-1.5 backdrop-blur-md">
          <span className="font-mono text-[9px] text-white/40">TRAINS</span>
          <span className="ml-2 font-mono text-xs font-bold text-white">{filteredTrains.length}</span>
        </div>
        <div className="rounded-md border border-white/[0.06] bg-[#0a0e14]/80 px-3 py-1.5 backdrop-blur-md">
          <span className="font-mono text-[9px] text-white/40">BLOCKS</span>
          <span className="ml-2 font-mono text-xs font-bold text-white">{boardSignalBlocks.filter(b => selectedLine === 'all' || b.line === selectedLine).length}</span>
        </div>
      </div>
    </div>
  );
}
