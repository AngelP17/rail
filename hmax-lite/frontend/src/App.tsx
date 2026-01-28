/**
 * HMAX-Lite: Main Application Component
 * =====================================
 * 
 * Panama Metro Digital Twin - Operations Control Center Dashboard
 * Supports Lines 1, 2, and 3
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrains } from './hooks/useTrains';
import { Header, Map, TrainList, TelemetrySidebar } from './components';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

/**
 * Main Dashboard Layout
 */
function Dashboard() {
  const {
    trains,
    stations,
    allStations,
    routeCoordinates,
    allRouteCoordinates,
    lines,
    systemStatus,
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    selectedLine,
    selectLine,
    isLoading,
    error,
    refreshTrains,
  } = useTrains();

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-scada-bg flex items-center justify-center">
        <div className="bg-scada-surface p-8 rounded-lg border border-status-danger text-center max-w-md">
          <h2 className="font-display text-xl text-status-danger mb-4">Connection Error</h2>
          <p className="text-scada-muted mb-4 font-mono text-sm">
            Unable to connect to the telemetry backend. Please ensure the backend service is running.
          </p>
          <button
            onClick={refreshTrains}
            className="px-4 py-2 bg-status-danger/20 text-status-danger rounded font-mono text-sm hover:bg-status-danger/30 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && trains.length === 0) {
    return (
      <div className="min-h-screen bg-scada-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-status-info border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-scada-muted">Initializing HMAX-Lite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-scada-bg overflow-hidden">
      {/* Header */}
      <Header
        systemStatus={systemStatus}
        selectedLine={selectedLine}
        onSelectLine={selectLine}
        isLoading={isLoading}
        onRefresh={refreshTrains}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Train list */}
        <div className="w-64 flex-shrink-0">
          <TrainList
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={selectTrain}
            selectedLine={selectedLine}
          />
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <Map
            trains={trains}
            stations={stations}
            allStations={allStations}
            routeCoordinates={routeCoordinates}
            allRouteCoordinates={allRouteCoordinates}
            lines={lines}
            selectedLine={selectedLine}
            selectedTrainId={selectedTrainId}
            onSelectTrain={selectTrain}
          />
          
          {/* Map overlay info */}
          <div className="absolute bottom-4 left-4 bg-scada-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-scada-border">
            <span className="text-xs font-mono text-scada-muted">
              PANAMA METRO | {selectedLine === 'all' ? 'ALL LINES' : selectedLine.toUpperCase().replace('LINE', 'LINE ')}
            </span>
          </div>
        </div>

        {/* Right sidebar - Telemetry */}
        <div className="w-80 flex-shrink-0 border-l border-scada-border">
          <TelemetrySidebar
            train={selectedTrain}
            history={selectedTrainHistory}
            stations={allStations}
            onClose={() => selectTrain(null)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * App root with providers
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
