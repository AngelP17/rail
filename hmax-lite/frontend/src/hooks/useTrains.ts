/**
 * HMAX-Lite: Train Data Hook
 * ==========================
 * 
 * Custom React hook for fetching and managing train telemetry data
 * with automatic polling using TanStack Query.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTrains, fetchAllStations } from '../utils/api';
import type { 
  TelemetryHistoryPoint, 
  TrainListResponse, 
  AllLinesResponse, 
  MetroLine,
  Station,
} from '../types/train';

const POLLING_INTERVAL = 1000; // 1 second
const HISTORY_MAX_POINTS = 60; // Keep 60 seconds of history

/**
 * Hook for fetching and managing train data with polling
 */
export function useTrains() {
  const queryClient = useQueryClient();
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<MetroLine | 'all'>('all');
  const [telemetryHistory, setTelemetryHistory] = useState<Map<string, TelemetryHistoryPoint[]>>(new Map());
  const historyRef = useRef(telemetryHistory);

  // Keep ref in sync
  useEffect(() => {
    historyRef.current = telemetryHistory;
  }, [telemetryHistory]);

  // Fetch trains with polling
  const {
    data: trainData,
    isLoading: isLoadingTrains,
    error: trainError,
  } = useQuery<TrainListResponse>({
    queryKey: ['trains', selectedLine],
    queryFn: () => fetchTrains(selectedLine === 'all' ? undefined : selectedLine),
    refetchInterval: POLLING_INTERVAL,
    staleTime: POLLING_INTERVAL / 2,
  });

  // Fetch all lines data (static data, no polling needed)
  const {
    data: linesData,
    isLoading: isLoadingLines,
    error: linesError,
  } = useQuery<AllLinesResponse>({
    queryKey: ['lines'],
    queryFn: fetchAllStations,
    staleTime: Infinity, // Station data doesn't change
  });

  // Update telemetry history when train data changes
  useEffect(() => {
    if (!trainData?.trains) return;

    const timestamp = Date.now();
    const currentHistory = historyRef.current;
    const newHistory = new Map(currentHistory);

    trainData.trains.forEach((train) => {
      const existingHistory = newHistory.get(train.id) || [];
      const newPoint: TelemetryHistoryPoint = {
        timestamp,
        speed_kmh: train.telemetry.speed_kmh,
        energy_recovered_kwh: train.telemetry.energy_recovered_kwh,
        regen_braking_temp: train.telemetry.regen_braking_temp,
      };

      // Add new point and trim to max length
      const updatedHistory = [...existingHistory, newPoint].slice(-HISTORY_MAX_POINTS);
      newHistory.set(train.id, updatedHistory);
    });

    setTelemetryHistory(newHistory);
  }, [trainData]);

  // Get selected train
  const selectedTrain = trainData?.trains.find((t) => t.id === selectedTrainId) || null;

  // Get history for selected train
  const selectedTrainHistory = selectedTrainId
    ? telemetryHistory.get(selectedTrainId) || []
    : [];

  // Select train handler
  const selectTrain = useCallback((trainId: string | null) => {
    setSelectedTrainId(trainId);
  }, []);

  // Select line handler
  const selectLine = useCallback((line: MetroLine | 'all') => {
    setSelectedLine(line);
    setSelectedTrainId(null); // Clear selected train when switching lines
  }, []);

  // Invalidate trains query (for manual refresh)
  const refreshTrains = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trains'] });
  }, [queryClient]);

  // Filter stations based on selected line
  const filteredStations: Station[] = selectedLine === 'all' 
    ? (linesData?.all_stations || [])
    : (linesData?.all_stations.filter(s => s.line === selectedLine) || []);

  // Get route coordinates based on selected line
  const filteredRouteCoordinates: [number, number][] = selectedLine === 'all'
    ? (linesData?.all_stations.map(s => [s.lat, s.lng]) || [])
    : (linesData?.all_route_coordinates[selectedLine] || []);

  return {
    // Train data
    trains: trainData?.trains || [],
    systemStatus: trainData?.system_status || null,
    
    // Line data
    lines: linesData?.lines || [],
    selectedLine,
    selectLine,
    
    // Station data
    stations: filteredStations,
    allStations: linesData?.all_stations || [],
    routeCoordinates: filteredRouteCoordinates,
    allRouteCoordinates: linesData?.all_route_coordinates || { line1: [], line2: [], line3: [] },
    
    // Selection
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    
    // Loading states
    isLoading: isLoadingTrains || isLoadingLines,
    isLoadingTrains,
    isLoadingLines,
    
    // Errors
    error: trainError || linesError,
    
    // Actions
    refreshTrains,
  };
}

/**
 * Hook for getting station by ID
 */
export function useStation(stationId: string | null, stations: Station[]) {
  return stationId ? stations.find((s) => s.id === stationId) || null : null;
}
