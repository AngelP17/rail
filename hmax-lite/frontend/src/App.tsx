import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrains } from './hooks/useTrains';
import { Header, Map, TrainList, TelemetrySidebar } from './components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Dashboard() {
  const {
    trains,
    allStations,
    allRouteCoordinates,
    selectedTrain,
    selectedTrainId,
    selectTrain,
    selectedTrainHistory,
    selectedLine,
    selectLine,
    systemStatus,
    isLoading,
    refreshTrains,
  } = useTrains();

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
      <Header
        systemStatus={systemStatus}
        selectedLine={selectedLine}
        onSelectLine={selectLine}
        isLoading={isLoading}
        onRefresh={refreshTrains}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-64 flex-shrink-0">
          <TrainList
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={selectTrain}
            selectedLine={selectedLine}
          />
        </div>

        <div className="flex-1 relative min-w-0">
          <Map
            trains={trains}
            stations={[]}
            allStations={allStations}
            routeCoordinates={[]}
            allRouteCoordinates={allRouteCoordinates}
            lines={[]}
            selectedLine={selectedLine}
            selectedTrainId={selectedTrainId}
            onSelectTrain={selectTrain}
          />

          <div className="absolute bottom-4 left-4 bg-scada-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-scada-border">
            <span className="text-xs font-mono text-scada-muted">
              PANAMA METRO | {selectedLine === 'all' ? 'ALL LINES' : selectedLine.toUpperCase().replace('LINE', 'LINE ')}
            </span>
          </div>
        </div>

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
