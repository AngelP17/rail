/**
 * HMAX-Lite: Map Component - OCC Edition
 * ======================================
 *
 * Leaflet map showing all Metro Lines 1, 2, and 3 routes and train positions.
 * Styled for Operations Control Center aesthetic.
 */

import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import type { TrainStatus, Station, MetroLine, LineInfo } from '../types/train';
import { TrainMarker } from './TrainMarker';
import { LINE_CONFIG } from '../types/train';

const MAP_CENTER: [number, number] = [8.98, -79.52];
const MAP_ZOOM = 11;

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const getLineStyle = (line: MetroLine) => ({
  color: LINE_CONFIG[line].color,
  weight: 4,
  opacity: 0.85,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
});

const TUNNEL_LINE_STYLE = {
  color: '#0891b2',
  weight: 4,
  opacity: 0.85,
  dashArray: '10, 6',
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

function MapBoundsHandler({ allRouteCoordinates }: { allRouteCoordinates: Record<MetroLine, [number, number][]> }) {
  const map = useMap();

  useEffect(() => {
    const allCoords: [number, number][] = [];
    Object.values(allRouteCoordinates).forEach((coords) => {
      allCoords.push(...coords);
    });

    if (allCoords.length > 0) {
      map.fitBounds(allCoords, {
        padding: [60, 60],
        maxZoom: 13,
        animate: true,
        duration: 1,
      });
    }
  }, [map, allRouteCoordinates]);

  return null;
}

function StationMarker({
  station,
  index,
  total,
  line,
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
      radius={isTerminal ? 10 : isTunnel ? 8 : 5}
      pathOptions={{
        fillColor: isTunnel ? '#0891b2' : isTerminal ? '#34d399' : lineColor,
        color: '#ffffff',
        weight: isTerminal ? 2 : 1.5,
        opacity: 0.8,
        fillOpacity: 0.85,
      }}
    >
      <Popup className="station-popup">
        <div className="min-w-[200px] rounded-xl border border-white/[0.1] bg-[#0a0e14]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: lineColor }}
            >
              {LINE_CONFIG[line].label}
            </span>
            <span className="text-[10px] font-mono text-white/30">
              Station {index + 1} of {total}
            </span>
          </div>
          <h3 className="mb-2 text-lg font-black tracking-tight text-white">{station.name}</h3>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <span className="text-white/30">Type</span>
              <span className="text-white/70">{station.station_type}</span>
            </div>
            <div className="flex justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <span className="text-white/30">Coordinates</span>
              <span className="text-white/50">
                {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function RouteLine({ line, coordinates }: { line: MetroLine; coordinates: [number, number][] }) {
  const lineStyle = getLineStyle(line);

  const { normalRoute, tunnelRoute } = useMemo(() => {
    if (line !== 'line3' || coordinates.length <= 2) {
      return { normalRoute: coordinates, tunnelRoute: [] };
    }
    return {
      normalRoute: [...coordinates.slice(0, 2), ...coordinates.slice(2)],
      tunnelRoute: [coordinates[1], coordinates[2]],
    };
  }, [coordinates, line]);

  return (
    <>
      {line !== 'line3' ? (
        <>
          <Polyline
            positions={coordinates}
            pathOptions={{
              ...lineStyle,
              weight: lineStyle.weight + 3,
              opacity: 0.15,
            }}
          />
          <Polyline positions={coordinates} pathOptions={lineStyle} />
        </>
      ) : (
        <>
          <Polyline
            positions={normalRoute}
            pathOptions={{
              ...lineStyle,
              weight: lineStyle.weight + 3,
              opacity: 0.15,
            }}
          />
          <Polyline positions={normalRoute} pathOptions={lineStyle} />
          {tunnelRoute.length > 1 && (
            <>
              <Polyline
                positions={tunnelRoute}
                pathOptions={{
                  ...TUNNEL_LINE_STYLE,
                  weight: TUNNEL_LINE_STYLE.weight + 3,
                  opacity: 0.15,
                }}
              />
              <Polyline positions={tunnelRoute} pathOptions={TUNNEL_LINE_STYLE} />
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
  onSelectTrain,
}: MapProps) {
  const stationsByLine = useMemo(() => {
    const grouped: Record<MetroLine, Station[]> = {
      line1: [],
      line2: [],
      line3: [],
    };
    allStations.forEach((station) => {
      grouped[station.line].push(station);
    });
    return grouped;
  }, [allStations]);

  const filteredTrains = selectedLine === 'all' ? trains : trains.filter((t) => t.line === selectedLine);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapBoundsHandler allRouteCoordinates={allRouteCoordinates} />

        {(selectedLine === 'all'
          ? (['line1', 'line2', 'line3'] as MetroLine[])
          : [selectedLine]
        ).map((line) => (
          <RouteLine key={line} line={line} coordinates={allRouteCoordinates[line] || []} />
        ))}

        {(selectedLine === 'all'
          ? (['line1', 'line2', 'line3'] as MetroLine[])
          : [selectedLine]
        ).map((line) =>
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

        {filteredTrains.map((train) => (
          <TrainMarker
            key={train.id}
            train={train}
            isSelected={train.id === selectedTrainId}
            onSelect={onSelectTrain}
          />
        ))}
      </MapContainer>

      {/* Minimal overlay */}
      <div className="pointer-events-none absolute left-4 top-4 z-[400]">
        <div className="rounded-lg border border-white/[0.06] bg-[#0a0e14]/70 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d7ff5f]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              {selectedLine === 'all' ? 'Panama network' : `${LINE_CONFIG[selectedLine].label} focus`}
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[400]">
        <div className="rounded-lg border border-white/[0.06] bg-[#0a0e14]/70 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
            <span>{filteredTrains.length} trains</span>
            <span className="text-white/20">|</span>
            <span>{allStations.length} stations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
