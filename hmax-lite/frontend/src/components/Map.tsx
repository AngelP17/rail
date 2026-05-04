/**
 * HMAX-Lite: Map Component - Enterprise Edition
 * =============================================
 * 
 * Leaflet map showing all Metro Lines 1, 2, and 3 routes and train positions.
 * Enhanced with enterprise-level styling, animations, and interactions.
 */

import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import type { TrainStatus, Station, MetroLine, LineInfo } from '../types/train';
import { TrainMarker } from './TrainMarker';
import { LINE_CONFIG } from '../types/train';

// Map center and zoom (centered on Panama City covering all lines)
const MAP_CENTER: [number, number] = [8.98, -79.52];
const MAP_ZOOM = 11;

// Tile layer URL (CartoDB Dark Matter for SCADA aesthetic)
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Line styles
const getLineStyle = (line: MetroLine) => ({
  color: LINE_CONFIG[line].color,
  weight: 5,
  opacity: 0.9,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
});

const TUNNEL_LINE_STYLE = {
  color: '#0891b2',
  weight: 5,
  opacity: 0.9,
  dashArray: '12, 8',
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
};

interface MapProps {
  trains: TrainStatus[];
  stations: Station[];
  allStations: Station[];
  routeCoordinates: [number, number][];
  allRouteCoordinates: Record<MetroLine, [number, number][]>;
  lines: LineInfo[];
  selectedLine: MetroLine | 'all';
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
}

/**
 * Component to fit map bounds to route
 */
function MapBoundsHandler({ allRouteCoordinates }: { allRouteCoordinates: Record<MetroLine, [number, number][]> }) {
  const map = useMap();

  useEffect(() => {
    // Combine all coordinates from all lines
    const allCoords: [number, number][] = [];
    Object.values(allRouteCoordinates).forEach(coords => {
      allCoords.push(...coords);
    });
    
    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { 
        padding: [60, 60],
        maxZoom: 13,
        animate: true,
        duration: 1
      });
    }
  }, [map, allRouteCoordinates]);

  return null;
}

/**
 * Station marker component with enhanced styling
 */
function StationMarker({ 
  station, 
  index, 
  total,
  line 
}: { 
  station: Station; 
  index: number;
  total: number;
  line: MetroLine;
}) {
  const isTerminal = station.station_type === 'Terminal';
  const isTunnel = station.is_tunnel_boundary;
  const lineColor = LINE_CONFIG[line].color;
  
  return (
    <CircleMarker
      center={[station.lat, station.lng]}
      radius={isTerminal ? 12 : isTunnel ? 10 : 7}
      pathOptions={{
        fillColor: isTunnel ? '#0891b2' : isTerminal ? '#00ff9d' : lineColor,
        color: '#ffffff',
        weight: isTerminal ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.9,
      }}
    >
      <Popup className="station-popup">
        <div className="min-w-[240px] rounded-[1.4rem] border border-white/12 bg-[#07101d]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
          {/* Line badge */}
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: lineColor }}
            >
              {LINE_CONFIG[line].label}
            </span>
            <span className="text-[10px] font-mono text-white/36 uppercase tracking-[0.2em]">
              Station {index + 1} of {total}
            </span>
          </div>
          
          {isTunnel && (
            <span className="status-badge status-badge-tunnel text-[10px] mb-2 inline-block">
              Tunnel
            </span>
          )}
          {isTerminal && (
            <span className="status-badge status-badge-normal text-[10px] mb-2 inline-block">
              Terminal
            </span>
          )}
          
          <h3 className="font-sans font-black text-2xl tracking-[-0.05em] text-white mb-3">
            {station.name}
          </h3>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
              <span className="text-white/36">ID</span>
              <span className="text-white">{station.id}</span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
              <span className="text-white/36">Type</span>
              <span className="text-white">{station.station_type}</span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
              <span className="text-white/36">Coordinates</span>
              <span className="text-white/60">
                {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

/**
 * Route line component for a single metro line
 */
function RouteLine({ 
  line, 
  coordinates 
}: { 
  line: MetroLine; 
  coordinates: [number, number][];
}) {
  const lineStyle = getLineStyle(line);
  
  // For Line 3, separate tunnel section
  const { normalRoute, tunnelRoute } = useMemo(() => {
    if (line !== 'line3' || coordinates.length <= 2) {
      return { normalRoute: coordinates, tunnelRoute: [] };
    }
    
    // Tunnel is between station index 1 (Balboa) and 2 (Panama Pacifico)
    return {
      normalRoute: [...coordinates.slice(0, 2), ...coordinates.slice(2)],
      tunnelRoute: [coordinates[1], coordinates[2]],
    };
  }, [coordinates, line]);

  return (
    <>
      {/* Main route line with glow effect */}
      {line !== 'line3' ? (
        <>
          {/* Glow layer */}
          <Polyline
            positions={coordinates}
            pathOptions={{
              ...lineStyle,
              weight: lineStyle.weight + 4,
              opacity: 0.2,
            }}
          />
          {/* Main line */}
          <Polyline
            positions={coordinates}
            pathOptions={lineStyle}
          />
        </>
      ) : (
        <>
          {/* Glow layer for normal route */}
          <Polyline
            positions={normalRoute}
            pathOptions={{
              ...lineStyle,
              weight: lineStyle.weight + 4,
              opacity: 0.2,
            }}
          />
          {/* Main line for normal route */}
          <Polyline
            positions={normalRoute}
            pathOptions={lineStyle}
          />
          {/* Tunnel section (dashed cyan line) */}
          {tunnelRoute.length > 1 && (
            <>
              <Polyline
                positions={tunnelRoute}
                pathOptions={{
                  ...TUNNEL_LINE_STYLE,
                  weight: TUNNEL_LINE_STYLE.weight + 4,
                  opacity: 0.2,
                }}
              />
              <Polyline
                positions={tunnelRoute}
                pathOptions={TUNNEL_LINE_STYLE}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

export function Map({ 
  trains, 
  allStations,
  allRouteCoordinates,
  selectedLine,
  selectedTrainId, 
  onSelectTrain 
}: MapProps) {
  // Group stations by line
  const stationsByLine = useMemo(() => {
    const grouped: Record<MetroLine, Station[]> = {
      line1: [],
      line2: [],
      line3: [],
    };
    allStations.forEach(station => {
      grouped[station.line].push(station);
    });
    return grouped;
  }, [allStations]);

  // Filter trains by selected line
  const filteredTrains = selectedLine === 'all' 
    ? trains 
    : trains.filter(t => t.line === selectedLine);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        {/* Dark mode tiles */}
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
        />

        {/* Fit bounds to all routes */}
        <MapBoundsHandler allRouteCoordinates={allRouteCoordinates} />

        {/* Route lines for all lines */}
        {(selectedLine === 'all' ? ['line1', 'line2', 'line3'] as MetroLine[] : [selectedLine]).map(line => (
          <RouteLine
            key={line}
            line={line}
            coordinates={allRouteCoordinates[line] || []}
          />
        ))}

        {/* Station markers for all lines or selected line */}
        {(selectedLine === 'all' 
          ? (['line1', 'line2', 'line3'] as MetroLine[]) 
          : [selectedLine]
        ).map(line => 
          stationsByLine[line]?.map((station, index) => (
            <StationMarker
              key={station.id}
              station={station}
              index={index}
              total={stationsByLine[line].length}
              line={line}
            />
          ))
        )}

        {/* Train markers */}
        {filteredTrains.map((train) => (
          <TrainMarker
            key={train.id}
            train={train}
            isSelected={train.id === selectedTrainId}
            onSelect={onSelectTrain}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-5 top-5 z-[400] flex flex-wrap items-start justify-between gap-3">
        <div className="rounded-full border border-white/12 bg-black/42 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#d7ff5f] animate-pulse shadow-[0_0_18px_rgba(215,255,95,0.7)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/56">
              {selectedLine === 'all' ? 'Panama network' : `${LINE_CONFIG[selectedLine].label} focus`}
            </span>
          </div>
        </div>

        <div className="hidden rounded-full border border-white/12 bg-black/42 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:block">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/48">
            <span>{filteredTrains.length} trains</span>
            <span>{allStations.length} stations</span>
            <span>{selectedLine === 'all' ? '3 corridors' : '1 corridor'}</span>
          </div>
        </div>
      </div>

      {/* Map overlay info */}
      <div className="absolute bottom-5 left-5 z-[400] max-w-[calc(100%-40px)] rounded-[1.4rem] border border-white/12 bg-black/48 px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-status-info animate-pulse" />
          <div>
            <span className="text-[10px] font-mono text-white/38 block uppercase tracking-[0.24em]">
              Panama Metro
            </span>
            <span className="text-lg font-black tracking-[-0.04em] text-white">
              {selectedLine === 'all' ? 'All Lines' : LINE_CONFIG[selectedLine].label}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono text-white/50">
          {selectedLine === 'all' || selectedLine === 'line1' ? (
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              San Isidro ↔ Albrook
            </span>
          ) : null}
          {selectedLine === 'all' || selectedLine === 'line2' ? (
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Nuevo Tocumen ↔ Albrook
            </span>
          ) : null}
          {selectedLine === 'all' || selectedLine === 'line3' ? (
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Albrook ↔ Ciudad del Futuro
            </span>
          ) : null}
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-5 right-5 z-[400] hidden rounded-[1.4rem] border border-white/12 bg-black/48 px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl lg:block">
        <span className="text-[10px] font-mono text-white/38 block mb-3 uppercase tracking-[0.24em]">
          Signal legend
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-red-500" />
            <span className="text-white/62">Line 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-green-500" />
            <span className="text-white/62">Line 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-blue-500" />
            <span className="text-white/62">Line 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-cyan-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, #0f172a 3px, #0f172a 6px)' }} />
            <span className="text-white/62">Tunnel Section</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/62">Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: 'transparent' }} />
            <span className="text-white/62">Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}
