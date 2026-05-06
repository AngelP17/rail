/**
 * HMAX-Lite: Shared Styling Logic
 * ================================
 *
 * Unified helpers for block colors, station lookup, train trail state,
 * line/tunnel rendering so SimulationBoard and Map do not drift.
 */

import type { MetroLine, Station, TrainStatus } from '../types/train';
import { LINE_CONFIG } from '../types/train';
import type { SignalBlock } from '../simulation/deriveSignalBlocks';

export function getLineColor(line: MetroLine): string {
  return LINE_CONFIG[line].color;
}

export function getBlockColor(status: SignalBlock['status']): string {
  if (status === 'occupied') return '#ef4444';
  if (status === 'approach') return '#fbbf24';
  if (status === 'restricted') return '#22d3ee';
  return '#34d399';
}

export function getTrainStatusColor(train: TrainStatus): string {
  if (train.is_in_tunnel) return '#22d3ee';
  if (train.telemetry.b_chop_status) return '#fbbf24';
  return LINE_CONFIG[train.line].color;
}

export function getTrainStatusText(train: TrainStatus): string {
  if (train.is_in_tunnel) return 'TUNNEL MODE';
  if (train.telemetry.b_chop_status) return 'REGEN BRAKING';
  if (train.at_station) return 'AT STATION';
  return 'NOMINAL';
}

export function buildStationMap(stations: Station[]): Map<string, Station> {
  const map = new Map<string, Station>();
  stations.forEach((s) => map.set(s.id, s));
  return map;
}

export function groupStationsByLine(stations: Station[]): Record<MetroLine, Station[]> {
  const grouped: Record<MetroLine, Station[]> = { line1: [], line2: [], line3: [] };
  stations.forEach((s) => grouped[s.line].push(s));
  return grouped;
}

export function buildRouteCoords(stations: Station[]): Record<MetroLine, [number, number][]> {
  const coords: Record<MetroLine, [number, number][]> = { line1: [], line2: [], line3: [] };
  stations.forEach((s) => coords[s.line].push([s.lat, s.lng]));
  return coords;
}

export function getTunnelSegmentIndices(coordinates: [number, number][]): { start: number; end: number } | null {
  // Line 3 tunnel between Balboa (~8.9594, -79.5573) and Panama Pacifico (~8.9600, -79.5900)
  const tunnelStart = coordinates.findIndex(
    ([lat, lng]) => Math.abs(lat - 8.9594) < 0.001 && Math.abs(lng - (-79.5573)) < 0.001,
  );
  const tunnelEnd = coordinates.findIndex(
    ([lat, lng]) => Math.abs(lat - 8.9600) < 0.001 && Math.abs(lng - (-79.5900)) < 0.001,
  );
  if (tunnelStart >= 0 && tunnelEnd >= 0) {
    return { start: tunnelStart, end: tunnelEnd };
  }
  return null;
}

export function getFilteredTrains(trains: TrainStatus[], selectedLine: MetroLine | 'all'): TrainStatus[] {
  return selectedLine === 'all' ? trains : trains.filter((t) => t.line === selectedLine);
}

export function getFilteredLines(selectedLine: MetroLine | 'all'): MetroLine[] {
  return selectedLine === 'all' ? ['line1', 'line2', 'line3'] : [selectedLine];
}
