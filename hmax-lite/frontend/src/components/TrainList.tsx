/**
 * HMAX-Lite: Train List Component - Enterprise Edition
 * ====================================================
 * 
 * Compact list of all active trains with real-time status indicators.
 * Enhanced with enterprise-level styling, animations, and interactions.
 */

import { Train, ChevronRight, Radio, MapPin, Zap, Mountain } from 'lucide-react';
import type { TrainStatus, MetroLine } from '../types/train';
import { formatSpeed, getStatusColor } from '../utils/api';
import { LINE_CONFIG } from '../types/train';

interface TrainListProps {
  trains: TrainStatus[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  selectedLine: MetroLine | 'all';
}

export function TrainList({ trains, selectedTrainId, onSelectTrain, selectedLine }: TrainListProps) {
  const getStatusBadge = (train: TrainStatus) => {
    if (train.is_in_tunnel) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-status-tunnel/10 text-status-tunnel border border-status-tunnel/20">
          <Mountain className="w-3 h-3" />
          TUNNEL
        </span>
      );
    }
    if (train.telemetry.b_chop_status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
          <Zap className="w-3 h-3" />
          BRAKING
        </span>
      );
    }
    if (train.at_station) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-status-info/10 text-status-info border border-status-info/20">
          <MapPin className="w-3 h-3" />
          STATION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-status-normal/10 text-status-normal border border-status-normal/20">
        <Radio className="w-3 h-3" />
        ACTIVE
      </span>
    );
  };

  // Group trains by line
  const trainsByLine: Record<MetroLine, TrainStatus[]> = {
    line1: trains.filter(t => t.line === 'line1'),
    line2: trains.filter(t => t.line === 'line2'),
    line3: trains.filter(t => t.line === 'line3'),
  };

  const linesToShow: (MetroLine | 'all')[] = selectedLine === 'all' 
    ? ['line1', 'line2', 'line3'] 
    : [selectedLine];

  return (
    <div className="bg-scada-surface border-r border-scada-border/50 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-scada-border/50 bg-scada-surface/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-scada-card rounded-md">
              <Train className="w-4 h-4 text-scada-muted" />
            </div>
            <span className="font-mono text-xs text-scada-muted uppercase tracking-wider">Fleet Status</span>
          </div>
          <span className="text-xs font-mono text-scada-muted bg-scada-card px-2 py-0.5 rounded">
            {trains.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Train list */}
      <div className="flex-1 overflow-y-auto">
        {trains.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-scada-card flex items-center justify-center">
              <Train className="w-6 h-6 text-scada-muted" />
            </div>
            <p className="text-sm text-scada-muted">No active trains</p>
          </div>
        ) : (
          <div className="divide-y divide-scada-border/30">
            {linesToShow.map((line) => {
              const lineTrains = line === 'all' ? [] : trainsByLine[line];
              if (line === 'all' || lineTrains.length === 0) return null;
              
              return (
                <div key={line} className="py-2">
                  {/* Line header */}
                  <div 
                    className="px-3 py-2 flex items-center gap-2"
                    style={{ backgroundColor: `${LINE_CONFIG[line].color}10` }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: LINE_CONFIG[line].color }}
                    />
                    <span 
                      className="text-xs font-mono font-semibold uppercase"
                      style={{ color: LINE_CONFIG[line].color }}
                    >
                      {LINE_CONFIG[line].label}
                    </span>
                    <span className="text-[10px] text-scada-muted">
                      ({lineTrains.length})
                    </span>
                  </div>
                  
                  {/* Trains for this line */}
                  {lineTrains.map((train, index) => {
                    const statusColor = getStatusColor(train.is_in_tunnel, train.telemetry.b_chop_status);
                    const isSelected = train.id === selectedTrainId;

                    return (
                      <button
                        key={train.id}
                        onClick={() => onSelectTrain(train.id)}
                        className={`w-full p-3 transition-all duration-200 group ${
                          isSelected
                            ? 'bg-scada-card border-l-2 border-l-status-info'
                            : 'hover:bg-scada-card/50 border-l-2 border-l-transparent'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status indicator */}
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                isSelected ? 'scale-110' : ''
                              }`}
                              style={{
                                backgroundColor: statusColor,
                                boxShadow: `0 0 ${isSelected ? '12px' : '6px'} ${statusColor}50`,
                              }}
                            />
                            {/* Connection line to next train */}
                            {index < lineTrains.length - 1 && (
                              <div className="w-px h-8 bg-scada-border/30" />
                            )}
                          </div>

                          {/* Train info */}
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-semibold text-white">
                                {train.id}
                              </span>
                              {getStatusBadge(train)}
                            </div>
                            
                            <p className="text-xs text-scada-muted truncate mb-2">
                              {train.name}
                            </p>

                            {/* Speed and destination */}
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Radio className="w-3 h-3 text-scada-muted" />
                                <span className="font-mono text-scada-text-secondary">
                                  {formatSpeed(train.telemetry.speed_kmh)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                <MapPin className="w-3 h-3 text-scada-muted flex-shrink-0" />
                                <span className="font-mono text-scada-text-secondary truncate">
                                  {train.position.next_station_id}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 h-1 bg-scada-border/30 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${train.position.progress * 100}%`,
                                  backgroundColor: statusColor,
                                  boxShadow: `0 0 4px ${statusColor}`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Selection indicator */}
                          <ChevronRight
                            className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                              isSelected 
                                ? 'text-status-info translate-x-0.5' 
                                : 'text-scada-muted opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-scada-border/50 bg-scada-surface/50">
        <span className="text-[10px] text-scada-muted font-mono block mb-2 uppercase tracking-wider">Legend</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-normal shadow-[0_0_6px_rgba(0,255,157,0.5)]" />
            <span className="text-scada-muted">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-warning shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <span className="text-scada-muted">Braking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-tunnel shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
            <span className="text-scada-muted">Tunnel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1 bg-status-info/20 text-status-info font-mono text-[10px] rounded">STA</span>
            <span className="text-scada-muted">Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}
