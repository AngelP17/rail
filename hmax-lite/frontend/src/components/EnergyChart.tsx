/**
 * HMAX-Lite: Energy Recovery Chart Component - Enterprise Edition
 * ===============================================================
 * 
 * Real-time line chart showing energy recovery from regenerative braking.
 * Enhanced with enterprise-level styling and animations.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TelemetryHistoryPoint } from '../types/train';

interface EnergyChartProps {
  history: TelemetryHistoryPoint[];
}

export function EnergyChart({ history }: EnergyChartProps) {
  // Calculate energy delta and format chart data
  const chartData = history.map((point, index) => {
    const prevPoint = history[index - 1];
    const energyDelta = prevPoint
      ? Math.max(0, point.energy_recovered_kwh - prevPoint.energy_recovered_kwh)
      : 0;
    
    return {
      time: index,
      energy: energyDelta * 100, // Scale for visibility
      temp: point.regen_braking_temp,
      totalEnergy: point.energy_recovered_kwh,
    };
  });

  // Calculate statistics
  const avgRecovery = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.energy, 0) / chartData.length
    : 0;
  const maxRecovery = chartData.length > 0
    ? Math.max(...chartData.map(d => d.energy))
    : 0;

  if (chartData.length < 2) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-scada-muted">
        <div className="w-8 h-8 mb-3 rounded-full border-2 border-scada-border border-t-status-info animate-spin" />
        <span className="text-sm font-mono">Collecting telemetry data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-scada-surface/50 rounded-lg p-2.5 border border-scada-border/30">
          <span className="text-[10px] text-scada-muted block uppercase tracking-wider mb-1">Avg Recovery</span>
          <span className="font-mono text-sm text-white font-semibold">
            {avgRecovery.toFixed(2)} <span className="text-xs text-scada-muted">kW</span>
          </span>
        </div>
        <div className="bg-scada-surface/50 rounded-lg p-2.5 border border-scada-border/30">
          <span className="text-[10px] text-scada-muted block uppercase tracking-wider mb-1">Peak Recovery</span>
          <span className="font-mono text-sm text-status-normal font-semibold">
            {maxRecovery.toFixed(2)} <span className="text-xs text-scada-muted">kW</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              {/* Gradient for the area */}
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#00ff9d" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
              </linearGradient>
              
              {/* Gradient for the line */}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#00ff9d" />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="time"
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#334155', strokeWidth: 1 }}
              tickLine={false}
              tickFormatter={() => ''}
            />
            
            <YAxis
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#334155', strokeWidth: 1 }}
              tickLine={false}
              width={35}
              tickFormatter={(value) => value.toFixed(0)}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-scada-surface border border-scada-border/50 rounded-lg p-3 shadow-xl">
                      <p className="text-[10px] text-scada-muted uppercase tracking-wider mb-2">
                        Energy Recovery
                      </p>
                      <p className="font-mono text-sm text-status-normal font-semibold">
                        {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value} kW
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <ReferenceLine 
              y={avgRecovery} 
              stroke="#64748b" 
              strokeDasharray="4 4" 
              strokeOpacity={0.5}
            />
            
            <Area
              type="monotone"
              dataKey="energy"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#energyGradient)"
              isAnimationActive={true}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Temperature gauge showing brake system temperature - Enterprise Edition
 */
interface TempGaugeProps {
  temp: number;
  minTemp?: number;
  maxTemp?: number;
}

export function TempGauge({ temp, minTemp = 40, maxTemp = 90 }: TempGaugeProps) {
  const percentage = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
  const isHot = temp > 70;
  const isCritical = temp > 85;

  const barColor = isCritical
    ? '#ef4444'
    : isHot
    ? '#f59e0b'
    : '#00ff9d';

  const statusText = isCritical
    ? 'CRITICAL'
    : isHot
    ? 'ELEVATED'
    : 'NORMAL';

  return (
    <div className="space-y-3">
      {/* Temperature display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: barColor,
              boxShadow: `0 0 8px ${barColor}` 
            }}
          />
          <span className="text-xs text-scada-muted font-mono uppercase tracking-wider">
            Regen Temp
          </span>
        </div>
        <div className="text-right">
          <span
            className="font-mono text-xl font-bold tabular-nums"
            style={{ color: barColor }}
          >
            {Math.round(temp)}°C
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-scada-border/30 rounded-full overflow-hidden">
        {/* Background zones */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-transparent" /> {/* Normal zone */}
          <div className="w-[30%] bg-status-warning/5" /> {/* Warning zone */}
          <div className="w-[15%] bg-status-danger/5 rounded-r-full" /> {/* Critical zone */}
        </div>
        
        {/* Fill bar */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}50`,
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              className="w-px h-full bg-scada-bg/50"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
      </div>

      {/* Scale and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-scada-muted font-mono">
          <span>{minTemp}°</span>
          <span className="text-scada-border">|</span>
          <span>{maxTemp}°</span>
        </div>
        <span 
          className="text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${barColor}15`,
            color: barColor,
            border: `1px solid ${barColor}30`
          }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
