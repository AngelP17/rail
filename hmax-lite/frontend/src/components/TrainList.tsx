import type { TrainStatus, MetroLine } from '../types/train';
import { formatSpeed, getStatusColor } from '../utils/api';
import { LINE_CONFIG } from '../types/train';

interface TrainListProps {
  trains: TrainStatus[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  selectedLine: MetroLine | 'all';
}

function statusLabel(train: TrainStatus): { text: string; color: string } {
  if (train.is_in_tunnel) return { text: 'TUNNEL', color: '#22d3ee' };
  if (train.telemetry.b_chop_status) return { text: 'BRAKING', color: '#fbbf24' };
  if (train.at_station) return { text: 'STATION', color: '#60a5fa' };
  return { text: 'MOVING', color: '#34d399' };
}

function isActive(train: TrainStatus) {
  return !train.is_in_tunnel && !train.telemetry.b_chop_status && !train.at_station;
}

export function TrainList({ trains, selectedTrainId, onSelectTrain, selectedLine }: TrainListProps) {
  const trainsByLine: Record<MetroLine, TrainStatus[]> = {
    line1: trains.filter(t => t.line === 'line1'),
    line2: trains.filter(t => t.line === 'line2'),
    line3: trains.filter(t => t.line === 'line3'),
  };

  const linesToShow: MetroLine[] = selectedLine === 'all'
    ? ['line1', 'line2', 'line3']
    : [selectedLine];

  let globalIndex = 0;
  const movingCount = trains.filter(isActive).length;
  const brakingCount = trains.filter(t => t.telemetry.b_chop_status).length;
  const tunnelCount = trains.filter(t => t.is_in_tunnel).length;

  return (
    <div className="relative h-full overflow-hidden bg-[#08101d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(96,165,250,0.14),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(52,211,153,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:100%_56px]" />
      <div className="relative h-full flex flex-col">
      {/* Panel header */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Fleet rail</span>
            <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">{trains.length}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            {selectedLine === 'all' ? 'Network' : LINE_CONFIG[selectedLine].label}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Moving', value: movingCount, color: '#34d399' },
            { label: 'Brake', value: brakingCount, color: '#fbbf24' },
            { label: 'Tunnel', value: tunnelCount, color: '#22d3ee' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
              <div className="mb-2 h-1 w-6 rounded-full" style={{ backgroundColor: color }} />
              <p className="font-mono text-lg font-black text-white">{value}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/38">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Train list */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {trains.length === 0 ? (
          <div className="flex flex-col items-start justify-center h-full gap-3 px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8">
              <div className="h-4 w-4 rounded bg-white/20" />
            </div>
            <p className="font-mono text-xs text-white/50">No active trains</p>
          </div>
        ) : (
          <>
            {linesToShow.map((line) => {
              const lineTrains = trainsByLine[line];
              if (!lineTrains.length) return null;
              return (
                <div key={line}>
                  {/* Line heading */}
                  <div className="px-2 pb-3 pt-4 flex items-center gap-2">
                    <span
                      className="block h-2 w-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: LINE_CONFIG[line].color }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
                      {LINE_CONFIG[line].label}
                    </span>
                    <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px] text-white/50">
                      {lineTrains.length}
                    </span>
                  </div>

                  {/* Trains — divide-y, stagger animated */}
                  <div className="space-y-2">
                    {lineTrains.map((train) => {
                      const itemIndex = globalIndex++;
                      const isSelected = train.id === selectedTrainId;
                      const dotColor = getStatusColor(train.is_in_tunnel, train.telemetry.b_chop_status);
                      const status = statusLabel(train);
                      const moving = isActive(train);

                      return (
                        <button
                          key={train.id}
                          onClick={() => onSelectTrain(train.id)}
                          className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] train-item-enter ${
                            isSelected
                              ? 'border-white/22 bg-white text-black shadow-[0_18px_50px_rgba(0,0,0,0.32)]'
                              : 'border-white/8 bg-white/[0.045] text-white hover:border-white/16 hover:bg-white/[0.075]'
                          }`}
                          style={{ animationDelay: `${itemIndex * 55}ms` }}
                        >
                          {/* Left accent — selected */}
                          <span
                            className="absolute left-0 top-0 bottom-0 transition-all duration-300"
                            style={{
                              width: isSelected ? '5px' : '0px',
                              backgroundColor: LINE_CONFIG[line].color,
                              opacity: isSelected ? 1 : 0,
                            }}
                          />

                          <div className="flex items-start gap-3">
                            {/* Status dot — animated ring for moving trains */}
                            <div className="pt-1 flex-shrink-0 relative">
                              {moving && (
                                <span
                                  className="absolute inset-0 rounded-full animate-ping"
                                  style={{
                                    backgroundColor: dotColor,
                                    opacity: 0.3,
                                    width: '10px',
                                    height: '10px',
                                  }}
                                />
                              )}
                              <div
                                className="w-2.5 h-2.5 rounded-full relative"
                                style={{ backgroundColor: dotColor }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* ID + status */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className={`font-mono text-sm font-black tracking-[-0.04em] truncate transition-colors duration-150 ${
                                  isSelected ? 'text-black' : 'text-white/78 group-hover:text-white'
                                }`}>
                                  {train.id}
                                </span>
                                <span
                                  className="rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase flex-shrink-0 font-semibold"
                                  style={{
                                    color: status.color,
                                    borderColor: `${status.color}55`,
                                    backgroundColor: `${status.color}14`,
                                  }}
                                >
                                  {status.text}
                                </span>
                              </div>

                              {/* Speed + next station */}
                              <div className={`flex items-center gap-2 text-[11px] font-mono ${isSelected ? 'text-black/55' : 'text-white/40'}`}>
                                <span className="tabular-nums font-medium">{formatSpeed(train.telemetry.speed_kmh)}</span>
                                <span>·</span>
                                <span className="truncate">{train.position.next_station_id}</span>
                              </div>

                              {/* Progress bar */}
                              <div className={`mt-3 h-1 rounded-full overflow-hidden ${isSelected ? 'bg-black/10' : 'bg-white/10'}`}>
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${train.position.progress * 100}%`,
                                    backgroundColor: dotColor,
                                    opacity: 0.7,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer legend */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            { color: '#34d399', label: 'Moving' },
            { color: '#fbbf24', label: 'Braking' },
            { color: '#22d3ee', label: 'Tunnel' },
            { color: '#60a5fa', label: 'Station' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-white/44">{label}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
