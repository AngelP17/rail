/**
 * HMAX-Lite: Metrics Card Component - Enterprise Edition
 * =======================================================
 * 
 * Reusable metric display card with trend indicators,
 * sparklines, and enterprise-grade styling.
 */

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MetricData {
  value: number;
  label: string;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: number;
  sparklineData?: number[];
  minValue?: number;
  maxValue?: number;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

interface MetricsCardProps {
  title: string;
  metric: MetricData;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function MetricsCard({
  title,
  metric,
  icon,
  className = '',
  size = 'md',
  onClick,
}: MetricsCardProps) {
  const {
    value,
    label,
    unit = '',
    trend = 'neutral',
    trendValue = 0,
    sparklineData = [],
    minValue = 0,
    maxValue = 100,
    thresholds,
  } = metric;

  // Determine status color based on thresholds
  const statusColor = useMemo(() => {
    if (thresholds?.critical !== undefined && value >= thresholds.critical) {
      return '#ef4444';
    }
    if (thresholds?.warning !== undefined && value >= thresholds.warning) {
      return '#f59e0b';
    }
    return '#00ff9d';
  }, [value, thresholds]);

  // Trend icon and color
  const trendConfig = {
    up: { icon: TrendingUp, color: '#00ff9d', label: 'Increasing' },
    down: { icon: TrendingDown, color: '#ef4444', label: 'Decreasing' },
    neutral: { icon: Minus, color: '#64748b', label: 'Stable' },
  };

  const TrendIcon = trendConfig[trend].icon;
  const trendColor = trendConfig[trend].color;

  // Format value
  const formattedValue = useMemo(() => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    if (value >= 100) return value.toFixed(0);
    return value.toFixed(1);
  }, [value]);

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      titleSize: 'text-[10px]',
      valueSize: 'text-xl',
      iconSize: 'w-8 h-8',
    },
    md: {
      padding: 'p-4',
      titleSize: 'text-xs',
      valueSize: 'text-2xl',
      iconSize: 'w-10 h-10',
    },
    lg: {
      padding: 'p-5',
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      iconSize: 'w-12 h-12',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`
        ${config.padding}
        bg-scada-card/50 rounded-xl border border-scada-border/30
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-scada-card hover:border-scada-border/50 hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div 
              className={`${config.iconSize} rounded-lg flex items-center justify-center`}
              style={{ backgroundColor: `${statusColor}15` }}
            >
              <div style={{ color: statusColor }}>{icon}</div>
            </div>
          )}
          <div>
            <span className={`${config.titleSize} font-mono text-scada-muted uppercase tracking-wider block`}>
              {title}
            </span>
            <span className="text-[10px] text-scada-text-secondary">{label}</span>
          </div>
        </div>

        {/* Trend indicator */}
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ backgroundColor: `${trendColor}10` }}
        >
          <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
          <span className="text-[10px] font-mono font-medium" style={{ color: trendColor }}>
            {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span 
          className={`${config.valueSize} font-display font-bold tabular-nums`}
          style={{ color: statusColor }}
        >
          {formattedValue}
        </span>
        {unit && (
          <span className="text-xs text-scada-muted font-mono">{unit}</span>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="h-10 mt-2">
          <Sparkline 
            data={sparklineData} 
            color={statusColor}
            minValue={minValue}
            maxValue={maxValue}
          />
        </div>
      )}

      {/* Progress bar for thresholds */}
      {(thresholds?.warning !== undefined || thresholds?.critical !== undefined) && (
        <div className="mt-3">
          <div className="h-1.5 bg-scada-border/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100)}%`,
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}50`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-scada-muted font-mono">{minValue}</span>
            <span className="text-[10px] text-scada-muted font-mono">{maxValue}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sparkline component for mini charts
 */
interface SparklineProps {
  data: number[];
  color: string;
  minValue?: number;
  maxValue?: number;
  height?: number;
}

function Sparkline({ 
  data, 
  color, 
  minValue = Math.min(...data), 
  maxValue = Math.max(...data),
  height = 40 
}: SparklineProps) {
  const range = maxValue - minValue || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#sparkline-gradient-${color})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      
      {/* End dot */}
      <circle
        cx="100"
        cy={100 - ((data[data.length - 1] - minValue) / range) * 100}
        r="3"
        fill={color}
      />
    </svg>
  );
}

/**
 * Metrics Grid - Display multiple metrics in a grid layout
 */
interface MetricsGridProps {
  metrics: Array<{
    id: string;
    title: string;
    metric: MetricData;
    icon?: React.ReactNode;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricsGrid({ metrics, columns = 2, className = '' }: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {metrics.map((item) => (
        <MetricsCard
          key={item.id}
          title={item.title}
          metric={item.metric}
          icon={item.icon}
          size="sm"
        />
      ))}
    </div>
  );
}

export default MetricsCard;
