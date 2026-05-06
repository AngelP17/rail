/**
 * HMAX-Lite: Shared Design Primitives
 * =====================================
 *
 * Reusable local components for the OCC shell and portfolio layer.
 * HudPanel, StatusRail, ModeToggle, OperationalMetric, SectionSurface.
 */

import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

// ------------------------------------------------------------------
// HudPanel — Low-chrome operational surface
// ------------------------------------------------------------------
interface HudPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleIcon?: ReactNode;
  rightAction?: ReactNode;
  dense?: boolean;
}

export function HudPanel({ children, className, title, titleIcon, rightAction, dense }: HudPanelProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border border-scada-border bg-scada-surface/80 backdrop-blur-xl shadow-panel',
        className,
      )}
    >
      {(title || rightAction) && (
        <div className={cn('flex items-center justify-between border-b border-scada-border', dense ? 'px-3 py-2' : 'px-4 py-3')}>
          <div className="flex items-center gap-2">
            {titleIcon && <span className="text-white/40">{titleIcon}</span>}
            {title && (
              <span className="text-2xs font-mono uppercase tracking-[0.16em] text-white/40">
                {title}
              </span>
            )}
          </div>
          {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// ------------------------------------------------------------------
// StatusRail — Horizontal status indicator strip
// ------------------------------------------------------------------
interface StatusRailProps {
  items: { label: string; value: ReactNode; color?: string; active?: boolean }[];
  className?: string;
}

export function StatusRail({ items, className }: StatusRailProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-scada-border bg-scada-surface/60 p-1', className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-1 flex-col items-center justify-center rounded-md px-2 py-1.5 transition-colors',
            item.active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
          )}
        >
          <span className="text-2xs font-mono uppercase tracking-wider text-white/30">{item.label}</span>
          <span
            className="mt-0.5 text-xs font-black tabular-nums"
            style={{ color: item.color ?? 'rgba(255,255,255,0.7)' }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// ModeToggle — Two-state toggle with icons
// ------------------------------------------------------------------
interface ModeToggleProps<T extends string> {
  modes: { value: T; icon: ReactNode; label: string }[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ModeToggle<T extends string>({ modes, active, onChange, className }: ModeToggleProps<T>) {
  return (
    <div className={cn('flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5', className)}>
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          aria-label={m.label}
          title={m.label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            active === m.value ? 'bg-white/[0.10] text-white' : 'text-white/30 hover:text-white/60',
          )}
        >
          {m.icon}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// OperationalMetric — Dense instrument readout
// ------------------------------------------------------------------
interface OperationalMetricProps {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: string;
  icon?: ReactNode;
  sublabel?: string;
  children?: ReactNode;
  className?: string;
}

export function OperationalMetric({ label, value, unit, accent, icon, sublabel, children, className }: OperationalMetricProps) {
  return (
    <div className={cn('rounded-xl border border-scada-border bg-white/[0.03] p-3', className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span style={{ color: accent ?? 'rgba(255,255,255,0.4)' }}>{icon}</span>}
          <span className="text-2xs font-mono uppercase tracking-wider text-white/40">{label}</span>
        </div>
        {sublabel && <span className="text-3xs text-white/25">{sublabel}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black tabular-nums" style={{ color: accent ?? 'rgba(255,255,255,0.9)' }}>
          {value}
        </span>
        {unit && <span className="text-3xs text-white/40">{unit}</span>}
      </div>
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// SectionSurface — Editorial section container for portfolio layer
// ------------------------------------------------------------------
interface SectionSurfaceProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionSurface({ children, className, id }: SectionSurfaceProps) {
  return (
    <section id={id} className={cn('relative w-full', className)}>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------
// InlineImage — Typography-integrated image block
// ------------------------------------------------------------------
interface InlineImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}

export function InlineImage({ src, alt, caption, className }: InlineImageProps) {
  return (
    <figure className={cn('group relative overflow-hidden rounded-lg border border-scada-border bg-scada-surface', className)}>
      <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      {caption && (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-3xs font-mono uppercase tracking-wider text-white/60">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
