/**
 * HMAX-Lite: API Utilities
 * ========================
 * 
 * API client functions for fetching train and station data.
 */

import type { TrainListResponse, StationListResponse, AllLinesResponse, MetroLine } from '../types/train';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch all trains with current telemetry
 */
export async function fetchTrains(line?: MetroLine): Promise<TrainListResponse> {
  const url = line 
    ? `${API_BASE_URL}/api/trains?line=${line}`
    : `${API_BASE_URL}/api/trains`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trains: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all lines information
 */
export async function fetchAllLines(): Promise<AllLinesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lines`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lines: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch station data for a specific line
 */
export async function fetchLineStations(line: MetroLine): Promise<StationListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lines/${line}/stations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all stations across all lines
 */
export async function fetchAllStations(): Promise<AllLinesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Format seconds to MM:SS display
 */
export function formatEta(seconds: number): string {
  if (seconds >= 999) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get status color based on train state
 */
export function getStatusColor(isInTunnel: boolean, isBraking: boolean): string {
  if (isInTunnel) return '#a855f7'; // Purple for tunnel
  if (isBraking) return '#f59e0b';   // Amber for braking
  return '#00ff9d';                   // Green for normal
}

/**
 * Format speed for display
 */
export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

/**
 * Format temperature for display
 */
export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

/**
 * Format energy for display
 */
export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}
