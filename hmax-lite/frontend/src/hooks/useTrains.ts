import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTrains, fetchAllStations } from '../utils/api';
import { getMockTrainListResponseFromPrevious, getMockTrainListResponse, generateMockHistory } from '../utils/mockData';
import type {
  TelemetryHistoryPoint,
  TrainListResponse,
  AllLinesResponse,
  MetroLine,
  Station,
  TrainStatus,
} from '../types/train';

const POLLING_INTERVAL = 1000;
const HISTORY_MAX_POINTS = 60;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

export function useTrains() {
  const queryClient = useQueryClient();
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<MetroLine | 'all'>('all');
  const [telemetryHistory, setTelemetryHistory] = useState<Map<string, TelemetryHistoryPoint[]>>(new Map());
  const [mockTrains, setMockTrains] = useState<TrainStatus[]>([]);
  const historyRef = useRef(telemetryHistory);
  const mockInitialized = useRef(false);

  useEffect(() => {
    historyRef.current = telemetryHistory;
  }, [telemetryHistory]);

  const {
    data: trainData,
    isLoading: isLoadingTrains,
    error: trainError,
  } = useQuery<TrainListResponse>({
    queryKey: ['trains', selectedLine],
    queryFn: () => fetchTrains(selectedLine === 'all' ? undefined : selectedLine),
    refetchInterval: POLLING_INTERVAL,
    staleTime: POLLING_INTERVAL / 2,
    retry: 1,
  });

  const {
    data: linesData,
    isLoading: isLoadingLines,
    error: linesError,
  } = useQuery<AllLinesResponse>({
    queryKey: ['lines'],
    queryFn: fetchAllStations,
    staleTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (trainError || USE_MOCK) {
      if (!mockInitialized.current) {
        const initial = getMockTrainListResponse();
        setMockTrains(initial.trains);
        mockInitialized.current = true;
      }
      const interval = setInterval(() => {
        setMockTrains(prev => {
          if (prev.length === 0) return getMockTrainListResponse().trains;
          return getMockTrainListResponseFromPrevious(prev).trains;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [trainError]);

  const effectiveTrains = (trainError || USE_MOCK) ? mockTrains : (trainData?.trains || []);
  const effectiveSystemStatus = (trainError || USE_MOCK)
    ? {
        active_trains: mockTrains.length,
        total_energy_recovered_kwh: mockTrains.reduce((s, t) => s + t.telemetry.energy_recovered_kwh, 0),
        trains_in_tunnel: mockTrains.filter(t => t.is_in_tunnel).length,
        system_health: 'NORMAL' as const,
        timestamp: new Date().toISOString(),
      }
    : trainData?.system_status || null;

  useEffect(() => {
    const trains = effectiveTrains;
    if (!trains || trains.length === 0) return;

    const timestamp = Date.now();
    const currentHistory = historyRef.current;
    const newHistory = new Map(currentHistory);

    trains.forEach((train) => {
      const existingHistory = newHistory.get(train.id) || [];
      const newPoint: TelemetryHistoryPoint = {
        timestamp,
        speed_kmh: train.telemetry.speed_kmh,
        energy_recovered_kwh: train.telemetry.energy_recovered_kwh,
        regen_braking_temp: train.telemetry.regen_braking_temp,
      };

      const updatedHistory = [...existingHistory, newPoint].slice(-HISTORY_MAX_POINTS);
      newHistory.set(train.id, updatedHistory);
    });

    setTelemetryHistory(newHistory);
  }, [effectiveTrains]);

  useEffect(() => {
    if (!selectedTrainId) return;
    const hasHistory = historyRef.current.has(selectedTrainId);
    if (!hasHistory) {
      const mockHist = generateMockHistory();
      const newMap = new Map(historyRef.current);
      newMap.set(selectedTrainId, mockHist);
      setTelemetryHistory(newMap);
    }
  }, [selectedTrainId]);

  const selectedTrain = effectiveTrains.find((t) => t.id === selectedTrainId) || null;

  const selectedTrainHistory = selectedTrainId
    ? telemetryHistory.get(selectedTrainId) || []
    : [];

  const selectTrain = useCallback((trainId: string | null) => {
    setSelectedTrainId(trainId);
  }, []);

  const selectLine = useCallback((line: MetroLine | 'all') => {
    setSelectedLine(line);
    setSelectedTrainId(null);
  }, []);

  const refreshTrains = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trains'] });
  }, [queryClient]);

  const filteredStations: Station[] = selectedLine === 'all'
    ? (linesData?.all_stations || [])
    : (linesData?.all_stations.filter(s => s.line === selectedLine) || []);

  const filteredRouteCoordinates: [number, number][] = selectedLine === 'all'
    ? (linesData?.all_stations.map(s => [s.lat, s.lng]) || [])
    : (linesData?.all_route_coordinates[selectedLine] || []);

  return {
    trains: effectiveTrains,
    systemStatus: effectiveSystemStatus,
    lines: linesData?.lines || [],
    selectedLine,
    selectLine,
    stations: filteredStations,
    allStations: linesData?.all_stations || [],
    routeCoordinates: filteredRouteCoordinates,
    allRouteCoordinates: linesData?.all_route_coordinates || { line1: [], line2: [], line3: [] },
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    isLoading: isLoadingTrains || isLoadingLines,
    isLoadingTrains,
    isLoadingLines,
    error: trainError || linesError,
    refreshTrains,
  };
}

export function useStation(stationId: string | null, stations: Station[]) {
  return stationId ? stations.find((s) => s.id === stationId) || null : null;
}
