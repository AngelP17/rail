/**
 * HMAX-Lite: Speed Gauge Component - OCC Edition
 * ================================================
 *
 * Compact circular gauge for train speed in telemetry sidebar.
 */

import { useMemo } from 'react';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  isBraking?: boolean;
}

export function SpeedGauge({ speed, maxSpeed = 100, isBraking = false }: SpeedGaugeProps) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100);

  const arcData = useMemo(() => {
    const radius = 60;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const startAngle = -225;
    const endAngle = 45;
    const angleRange = endAngle - startAngle;
    const arcLength = (circumference * angleRange) / 360;
    const filledLength = (arcLength * percentage) / 100;
    const dashOffset = arcLength - filledLength;

    return {
      radius,
      strokeWidth,
      arcLength,
      dashOffset,
    };
  }, [percentage]);

  const gaugeColor = isBraking ? '#fbbf24' : percentage > 80 ? '#34d399' : '#60a5fa';

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      {/* SVG Gauge */}
      <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isBraking ? '#fbbf24' : '#60a5fa'} />
            <stop offset="100%" stopColor={gaugeColor} />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <circle
          cx="70"
          cy="70"
          r={arcData.radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={arcData.strokeWidth}
          strokeDasharray={`${arcData.arcLength} ${arcData.arcLength}`}
          strokeLinecap="round"
          transform="rotate(-45 70 70)"
        />

        {/* Filled arc */}
        <circle
          cx="70"
          cy="70"
          r={arcData.radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={arcData.strokeWidth}
          strokeDasharray={`${arcData.arcLength} ${arcData.arcLength}`}
          strokeDashoffset={arcData.dashOffset}
          strokeLinecap="round"
          transform="rotate(-45 70 70)"
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}40)` }}
        />

        {/* Needle */}
        {percentage > 0 && (
          <g transform={`rotate(${(percentage / 100) * 270 - 225} 70 70)`}>
            <circle
              cx={70 + arcData.radius}
              cy="70"
              r="4"
              fill="#ffffff"
              style={{ filter: `drop-shadow(0 0 4px ${gaugeColor})` }}
            />
          </g>
        )}
      </svg>

      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold tabular-nums" style={{ color: gaugeColor }}>
          {Math.round(speed)}
        </span>
        <span className="text-[10px] text-white/40 font-mono">km/h</span>
        {isBraking && (
          <span className="mt-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#fbbf24]">
            Brake
          </span>
        )}
      </div>
    </div>
  );
}
