import { RefreshCw, Wifi, WifiOff, TramFront } from 'lucide-react';
import type { SystemStatus, MetroLine } from '../types/train';
import { LINE_CONFIG } from '../types/train';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  selectedLine: MetroLine | 'all';
  onSelectLine: (line: MetroLine | 'all') => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function Header({
  systemStatus,
  selectedLine,
  onSelectLine,
  isLoading,
  onRefresh,
}: HeaderProps) {
  const isOnline = !!systemStatus;

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <header className="bg-scada-surface border-b border-scada-border/40 flex-shrink-0">
      <div className="flex items-center h-16 px-5 gap-6">

        {/* Brand — left-anchored, no Orbitron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-status-info/15 border border-status-info/25 flex items-center justify-center">
            <TramFront className="w-4 h-4 text-status-info" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-sans font-semibold text-sm tracking-tight text-scada-text">
              HMAX-Lite
            </span>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="w-2.5 h-2.5 text-status-normal" strokeWidth={2} />
              ) : (
                <WifiOff className="w-2.5 h-2.5 text-status-danger" strokeWidth={2} />
              )}
              <span className="font-mono text-[10px] text-scada-muted tracking-widest uppercase">
                {isOnline ? 'live' : 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-scada-border/40 flex-shrink-0" />

        {/* Line selector — pill group */}
        <div className="hidden md:flex items-center gap-1 bg-scada-bg/60 rounded-lg p-1 border border-scada-border/30">
          {(['all', 'line1', 'line2', 'line3'] as const).map((l) => {
            const isActive = selectedLine === l;
            const color = l === 'all' ? null : LINE_CONFIG[l].color;
            return (
              <button
                key={l}
                onClick={() => onSelectLine(l)}
                className={`relative px-3 py-1 rounded-md text-xs font-mono font-medium transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'text-scada-text bg-scada-surface shadow-sm'
                    : 'text-scada-muted hover:text-scada-text-secondary'
                }`}
              >
                {color && isActive && (
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className={color && isActive ? 'pl-2.5' : ''}>
                  {l === 'all' ? 'All' : LINE_CONFIG[l as MetroLine].label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Metrics — right side, clean data display */}
        <div className="hidden sm:flex items-center divide-x divide-scada-border/30">
          <div className="pr-6 text-right">
            <p className="font-mono text-[9px] text-scada-muted uppercase tracking-widest mb-1">Active</p>
            <p className="font-mono text-3xl font-bold text-scada-text leading-none tabular-nums">
              {systemStatus?.active_trains ?? '—'}
            </p>
          </div>
          <div className="px-6 text-right">
            <p className="font-mono text-[9px] text-scada-muted uppercase tracking-widest mb-1">Recovered</p>
            <p className="font-mono text-xl font-bold text-status-normal leading-none tabular-nums">
              {systemStatus ? `${systemStatus.total_energy_recovered_kwh.toFixed(1)}` : '—'}
              <span className="text-[11px] text-scada-muted font-normal ml-1">kWh</span>
            </p>
          </div>
          <div className="px-6 text-right">
            <p className="font-mono text-[9px] text-scada-muted uppercase tracking-widest mb-1">In Tunnel</p>
            <p className="font-mono text-3xl font-bold text-status-tunnel leading-none tabular-nums">
              {systemStatus?.trains_in_tunnel ?? '—'}
            </p>
          </div>
          <div className="pl-6 text-right">
            <p className="font-mono text-[9px] text-scada-muted uppercase tracking-widest mb-1">System</p>
            <p className={`font-mono text-sm font-bold leading-none uppercase tracking-wider ${
              systemStatus?.system_health === 'NORMAL'
                ? 'text-status-normal'
                : systemStatus?.system_health === 'DEGRADED'
                ? 'text-status-warning'
                : 'text-status-danger'
            }`}>
              {systemStatus?.system_health ?? 'OFFLINE'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-scada-border/40 hidden sm:block flex-shrink-0" />

        {/* Timestamp + refresh */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {systemStatus && (
            <span className="hidden xl:block font-mono text-xs text-scada-muted tabular-nums">
              {formatTimestamp(systemStatus.timestamp)}
            </span>
          )}
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-lg border border-scada-border/30 hover:border-scada-border/60 hover:bg-scada-card/50 flex items-center justify-center transition-all duration-150 active:scale-[0.96]"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-scada-muted ${isLoading ? 'animate-spin' : ''}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Mobile line selector */}
      <div className="md:hidden px-4 pb-2.5 flex gap-1.5 overflow-x-auto">
        {(['all', 'line1', 'line2', 'line3'] as const).map((l) => {
          const isActive = selectedLine === l;
          const color = l === 'all' ? null : LINE_CONFIG[l].color;
          return (
            <button
              key={l}
              onClick={() => onSelectLine(l)}
              className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-mono font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-scada-card text-scada-text border border-scada-border/50'
                  : 'text-scada-muted bg-scada-bg/60'
              }`}
              style={isActive && color ? { borderLeftColor: color, borderLeftWidth: 2 } : undefined}
            >
              {l === 'all' ? 'All Lines' : LINE_CONFIG[l as MetroLine].label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
