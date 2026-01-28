/**
 * HMAX-Lite: Header Component - Enterprise Edition
 * ================================================
 * 
 * Dashboard header with system status indicators, branding, and real-time metrics.
 * Enhanced with enterprise-level styling and animations.
 */

import { Train, Zap, Activity, Mountain, RefreshCw, Wifi, WifiOff } from 'lucide-react';
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
  onRefresh 
}: HeaderProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getHealthStatus = () => {
    if (!systemStatus) return { label: 'OFFLINE', color: 'text-status-danger', bgColor: 'bg-status-danger/10' };
    switch (systemStatus.system_health) {
      case 'NORMAL':
        return { label: 'ONLINE', color: 'text-status-normal', bgColor: 'bg-status-normal/10' };
      case 'DEGRADED':
        return { label: 'DEGRADED', color: 'text-status-warning', bgColor: 'bg-status-warning/10' };
      case 'CRITICAL':
        return { label: 'CRITICAL', color: 'text-status-danger', bgColor: 'bg-status-danger/10' };
      default:
        return { label: 'UNKNOWN', color: 'text-scada-muted', bgColor: 'bg-scada-card' };
    }
  };

  const health = getHealthStatus();
  const isOnline = systemStatus?.system_health === 'NORMAL';

  return (
    <header className="bg-scada-surface/95 backdrop-blur-md border-b border-scada-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-status-info to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Train className="w-6 h-6 text-white" />
              </div>
              {/* Status indicator dot */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-scada-surface ${
                  isOnline ? 'bg-status-normal animate-pulse' : 'bg-status-danger'
                }`}
              />
            </div>
            
            {/* Title */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg lg:text-xl text-white tracking-wider">
                  HMAX-LITE
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-medium bg-status-info/10 text-status-info rounded border border-status-info/20">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-scada-muted font-mono">
                Panama Metro Operations Control
              </p>
            </div>
          </div>

          {/* Connection Status - Desktop */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-scada-border/50">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-status-normal" />
                <span className="text-xs text-scada-muted font-mono">CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-status-danger" />
                <span className="text-xs text-scada-muted font-mono">DISCONNECTED</span>
              </>
            )}
          </div>
        </div>

        {/* Line Selector */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-scada-card/50 rounded-lg border border-scada-border/30">
          <span className="text-[10px] text-scada-muted uppercase tracking-wider mr-2">Line</span>
          <button
            onClick={() => onSelectLine('all')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all duration-200 ${
              selectedLine === 'all'
                ? 'bg-white text-scada-bg'
                : 'text-scada-muted hover:text-white hover:bg-scada-card'
            }`}
          >
            All
          </button>
          {(['line1', 'line2', 'line3'] as MetroLine[]).map((line) => (
            <button
              key={line}
              onClick={() => onSelectLine(line)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all duration-200 ${
                selectedLine === line
                  ? 'text-white'
                  : 'text-scada-muted hover:text-white hover:bg-scada-card'
              }`}
              style={{
                backgroundColor: selectedLine === line ? LINE_CONFIG[line].color : undefined,
              }}
            >
              {LINE_CONFIG[line].label}
            </button>
          ))}
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Active Trains */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-scada-card/50 rounded-lg border border-scada-border/30">
            <Train className="w-4 h-4 text-status-normal" />
            <div>
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider">Active</span>
              <span className="font-mono text-base lg:text-lg text-white font-semibold">
                {systemStatus?.active_trains ?? '-'}
              </span>
            </div>
          </div>

          {/* Energy Recovered */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-scada-card/50 rounded-lg border border-scada-border/30">
            <Zap className="w-4 h-4 text-status-warning" />
            <div>
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider">Recovered</span>
              <span className="font-mono text-base lg:text-lg text-white font-semibold">
                {systemStatus?.total_energy_recovered_kwh.toFixed(1) ?? '-'} <span className="text-xs text-scada-muted">kWh</span>
              </span>
            </div>
          </div>

          {/* Trains in Tunnel */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-scada-card/50 rounded-lg border border-scada-border/30">
            <Mountain className="w-4 h-4 text-status-tunnel" />
            <div>
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider">In Tunnel</span>
              <span className="font-mono text-base lg:text-lg text-white font-semibold">
                {systemStatus?.trains_in_tunnel ?? '-'}
              </span>
            </div>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-scada-card/50 rounded-lg border border-scada-border/30">
            <Activity className={`w-4 h-4 ${health.color}`} />
            <div className="hidden sm:block">
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider">System</span>
              <span className={`font-mono text-sm font-semibold ${health.color}`}>
                {health.label}
              </span>
            </div>
            {/* Mobile: just show icon with color */}
            <span className={`sm:hidden font-mono text-xs font-semibold ${health.color}`}>
              {health.label}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2.5 hover:bg-scada-card rounded-lg transition-all duration-200 border border-transparent hover:border-scada-border/50 active:scale-95"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 text-scada-muted transition-transform duration-700 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
          </button>

          {/* Timestamp - Desktop */}
          {systemStatus && (
            <div className="hidden xl:block text-right pl-3 border-l border-scada-border/50">
              <span className="text-[10px] text-scada-muted block uppercase tracking-wider">Last Update</span>
              <span className="font-mono text-sm text-white">
                {formatTimestamp(systemStatus.timestamp)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Line Selector */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => onSelectLine('all')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 ${
              selectedLine === 'all'
                ? 'bg-white text-scada-bg'
                : 'text-scada-muted bg-scada-card/50'
            }`}
          >
            All Lines
          </button>
          {(['line1', 'line2', 'line3'] as MetroLine[]).map((line) => (
            <button
              key={line}
              onClick={() => onSelectLine(line)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 ${
                selectedLine === line
                  ? 'text-white'
                  : 'text-scada-muted bg-scada-card/50'
              }`}
              style={{
                backgroundColor: selectedLine === line ? LINE_CONFIG[line].color : undefined,
              }}
            >
              {LINE_CONFIG[line].label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom accent line with gradient */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-status-info/50 to-transparent" />
    </header>
  );
}
