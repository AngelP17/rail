import type { TrainListResponse, AllLinesResponse, MetroLine } from '../types/train';
import { getMockTrainListResponse, getMockAllLinesResponse } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

let mockTrainData: TrainListResponse | null = null;

async function fetchWithMockFallback<T>(
  fetcher: () => Promise<T>,
  mockFn: () => T,
): Promise<T> {
  if (USE_MOCK) {
    return mockFn();
  }
  try {
    return await fetcher();
  } catch {
    return mockFn();
  }
}

export async function fetchTrains(line?: MetroLine): Promise<TrainListResponse> {
  return fetchWithMockFallback(
    async () => {
      const url = line
        ? `${API_BASE_URL}/api/trains?line=${line}`
        : `${API_BASE_URL}/api/trains`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch trains: ${response.statusText}`);
      }
      const data = await response.json();
      mockTrainData = data;
      return data;
    },
    () => {
      if (!mockTrainData) {
        mockTrainData = getMockTrainListResponse();
      }
      let trains = mockTrainData.trains;
      if (line) {
        trains = trains.filter(t => t.line === line);
      }
      const totalEnergy = trains.reduce((sum, t) => sum + t.telemetry.energy_recovered_kwh, 0);
      return {
        trains,
        system_status: {
          active_trains: trains.length,
          total_energy_recovered_kwh: totalEnergy,
          trains_in_tunnel: trains.filter(t => t.is_in_tunnel).length,
          system_health: 'NORMAL' as const,
          timestamp: new Date().toISOString(),
        },
      };
    },
  );
}

export async function fetchAllStations(): Promise<AllLinesResponse> {
  return fetchWithMockFallback(
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/stations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.statusText}`);
      }
      return response.json();
    },
    getMockAllLinesResponse,
  );
}

export function formatEta(seconds: number): string {
  if (seconds >= 999) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getStatusColor(isInTunnel: boolean, isBraking: boolean): string {
  if (isInTunnel) return '#22d3ee';
  if (isBraking) return '#fbbf24';
  return '#34d399';
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}\u00B0C`;
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}
