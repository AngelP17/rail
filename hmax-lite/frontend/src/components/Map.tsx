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
  color: '#7c3aed',
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
        fillColor: isTunnel ? '#7c3aed' : isTerminal ? '#00ff9d' : lineColor,
        color: '#ffffff',
        weight: isTerminal ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.9,
      }}
    >
      <Popup className="station-popup">
        <div className="bg-scada-surface p-4 rounded-xl min-w-[200px] border border-scada-border/50 shadow-xl">
          {/* Line badge */}
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: lineColor }}
            >
              {LINE_CONFIG[line].label}
            </span>
            <span className="text-[10px] font-mono text-scada-muted uppercase tracking-wider">
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
          
          <h3 className="font-display font-bold text-lg text-white mb-1">
            {station.name}
          </h3>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-scada-border/30">
              <span className="text-scada-muted">ID</span>
              <span className="text-white">{station.id}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-scada-border/30">
              <span className="text-scada-muted">Type</span>
              <span className="text-white">{station.station_type}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-scada-muted">Coordinates</span>
              <span className="text-scada-text-secondary">
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
          {/* Tunnel section (dashed purple line) */}
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

      {/* Map overlay info */}
      <div className="absolute bottom-4 left-4 glass-strong px-4 py-3 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-status-info animate-pulse" />
          <div>
            <span className="text-xs font-mono text-scada-muted block uppercase tracking-wider">
              Panama Metro
            </span>
            <span className="text-sm font-medium text-white">
              {selectedLine === 'all' ? 'All Lines' : LINE_CONFIG[selectedLine].label}
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-scada-border/30 flex items-center gap-4 text-xs font-mono text-scada-muted">
          {selectedLine === 'all' || selectedLine === 'line1' ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              San Isidro ↔ Albrook
            </span>
          ) : null}
          {selectedLine === 'all' || selectedLine === 'line2' ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Nuevo Tocumen ↔ Albrook
            </span>
          ) : null}
          {selectedLine === 'all' || selectedLine === 'line3' ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Albrook ↔ Ciudad del Futuro
            </span>
          ) : null}
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-4 right-4 glass-strong px-4 py-3 rounded-xl shadow-lg hidden lg:block">
        <span className="text-[10px] font-mono text-scada-muted block mb-2 uppercase tracking-wider">
          Map Legend
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-red-500" />
            <span className="text-scada-text-secondary">Line 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-green-500" />
            <span className="text-scada-text-secondary">Line 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-blue-500" />
            <span className="text-scada-text-secondary">Line 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-purple-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, #0f172a 3px, #0f172a 6px)' }} />
            <span className="text-scada-text-secondary">Tunnel Section</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-scada-text-secondary">Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: 'transparent' }} />
            <span className="text-scada-text-secondary">Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}
