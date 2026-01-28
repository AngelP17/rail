/**
 * HMAX-Lite: Speed Gauge Component - Enterprise Edition
 * =====================================================
 * 
 * Circular gauge display for train speed with SCADA styling.
 * Enhanced with enterprise-level animations and visual polish.
 */

import { useMemo } from 'react';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  isBraking?: boolean;
}

export function SpeedGauge({ speed, maxSpeed = 100, isBraking = false }: SpeedGaugeProps) {
  // Calculate gauge fill percentage
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  
  // Calculate SVG arc with enhanced precision
  const arcData = useMemo(() => {
    const radius = 85;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const startAngle = -225; // Start from bottom-left
    const endAngle = 45;     // End at bottom-right
    const angleRange = endAngle - startAngle;
    const arcLength = (circumference * angleRange) / 360;
    const filledLength = (arcLength * percentage) / 100;
    const dashOffset = arcLength - filledLength;

    return {
      radius,
      strokeWidth,
      arcLength,
      dashOffset,
      startAngle,
    };
  }, [percentage]);

  // Determine color based on state with enhanced palette
  const gaugeColor = isBraking ? '#f59e0b' : percentage > 80 ? '#00ff9d' : '#3b82f6';
  const glowColor = isBraking ? 'rgba(245, 158, 11, 0.5)' : percentage > 80 ? 'rgba(0, 255, 157, 0.5)' : 'rgba(59, 130, 246, 0.5)';

  // Speed zones for color coding
  const getSpeedZone = (pct: number) => {
    if (pct < 30) return { color: '#3b82f6', label: 'LOW' };
    if (pct < 70) return { color: '#00ff9d', label: 'CRUISE' };
    if (pct < 90) return { color: '#f59e0b', label: 'HIGH' };
    return { color: '#ef4444', label: 'MAX' };
  };

  const speedZone = getSpeedZone(percentage);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background: `conic-gradient(from 225deg, ${gaugeColor} 0deg, transparent ${(percentage / 100) * 270}deg, transparent 270deg)`,
        }}
      />

      {/* SVG Gauge */}
      <svg
        viewBox="0 0 200 200"
        className="w-52 h-52 transform -rotate-90"
      >
        <defs>
          {/* Gradient for the gauge fill */}
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isBraking ? '#fbbf24' : '#3b82f6'} />
            <stop offset="100%" stopColor={gaugeColor} />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background arc track */}
        <circle
          cx="100"
          cy="100"
          r={arcData.radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={arcData.strokeWidth}
          strokeDasharray={`${arcData.arcLength} ${arcData.arcLength}`}
          strokeLinecap="round"
          transform="rotate(-45 100 100)"
        />

        {/* Subtle tick marks */}
        {[0, 25, 50, 75, 100].map((mark) => {
          const angle = -225 + (mark / 100) * 270;
          const rad = (angle * Math.PI) / 180;
          const innerR = arcData.radius - arcData.strokeWidth / 2 - 5;
          const outerR = arcData.radius - arcData.strokeWidth / 2 - 2;
          const x1 = 100 + innerR * Math.cos(rad);
          const y1 = 100 + innerR * Math.sin(rad);
          const x2 = 100 + outerR * Math.cos(rad);
          const y2 = 100 + outerR * Math.sin(rad);
          
          return (
            <line
              key={mark}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Filled arc with gradient */}
        <circle
          cx="100"
          cy="100"
          r={arcData.radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={arcData.strokeWidth}
          strokeDasharray={`${arcData.arcLength} ${arcData.arcLength}`}
          strokeDashoffset={arcData.dashOffset}
          strokeLinecap="round"
          transform="rotate(-45 100 100)"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />

        {/* Needle/indicator at current position */}
        {percentage > 0 && (
          <g transform={`rotate(${(percentage / 100) * 270 - 225} 100 100)`}>
            <circle
              cx={100 + arcData.radius}
              cy="100"
              r="5"
              fill="#ffffff"
              style={{
                filter: `drop-shadow(0 0 6px ${gaugeColor})`,
              }}
            />
          </g>
        )}
      </svg>

      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Speed value */}
        <div className="relative">
          <span
            className="font-display text-5xl font-bold tabular-nums transition-colors duration-300"
            style={{ color: gaugeColor }}
          >
            {Math.round(speed)}
          </span>
          <span className="absolute -right-6 top-2 text-xs text-scada-muted font-mono">
            km/h
          </span>
        </div>

        {/* Speed zone indicator */}
        <div 
          className="mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{ 
            backgroundColor: `${speedZone.color}15`,
            color: speedZone.color,
            border: `1px solid ${speedZone.color}30`
          }}
        >
          {speedZone.label}
        </div>

        {/* Braking indicator */}
        {isBraking && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-status-warning/10 rounded-full border border-status-warning/30">
            <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
            <span className="text-status-warning text-xs font-mono font-semibold uppercase tracking-wider">
              Regen Brake
            </span>
          </div>
        )}
      </div>

      {/* Scale markers */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 25, 50, 75, 100].map((mark) => {
          const angle = -225 + (mark / 100) * 270;
          const x = 100 + 102 * Math.cos((angle * Math.PI) / 180);
          const y = 100 + 102 * Math.sin((angle * Math.PI) / 180);
          return (
            <span
              key={mark}
              className="absolute text-scada-muted text-xs font-mono font-medium"
              style={{
                left: `${(x / 200) * 100}%`,
                top: `${(y / 200) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {mark}
            </span>
          );
        })}
      </div>
    </div>
  );
}
