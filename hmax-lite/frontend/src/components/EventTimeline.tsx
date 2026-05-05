/**
 * EventTimeline - Live Operations Event Strip
 * ============================================
 *
 * Replaces generic bottom KPI cards with a live operational event log.
 * Shows real train events with severity, timestamps, and train associations.
 */

import { useRef, useEffect } from 'react';
import { ArrowRight, Zap, Radio, AlertTriangle, Check, MapPin, Minimize2, Maximize2, BatteryCharging, Wifi, Clock, TrainFront } from 'lucide-react';
import type { OperationalEvent, EventType } from '../types/train';
import { getEventColor } from '../simulation/deriveEvents';

interface EventTimelineProps {
  events: OperationalEvent[];
  maxEvents?: number;
  onEventClick?: (event: OperationalEvent) => void;
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  departed: <ArrowRight className="h-3 w-3" strokeWidth={2} />,
  braking: <AlertTriangle className="h-3 w-3" strokeWidth={2} />,
  energy_recovery: <Zap className="h-3 w-3" strokeWidth={2} />,
  tunnel_entry: <Radio className="h-3 w-3" strokeWidth={2} />,
  tunnel_exit: <Radio className="h-3 w-3" strokeWidth={2} />,
  dwell_complete: <Check className="h-3 w-3" strokeWidth={2} />,
  headway_compressed: <Minimize2 className="h-3 w-3" strokeWidth={2} />,
  headway_restored: <Maximize2 className="h-3 w-3" strokeWidth={2} />,
  bchop_active: <BatteryCharging className="h-3 w-3" strokeWidth={2} />,
  comms_handoff: <Wifi className="h-3 w-3" strokeWidth={2} />,
  station_approach: <MapPin className="h-3 w-3" strokeWidth={2} />,
};

function formatEventTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function EventItem({ event, isLatest }: { event: OperationalEvent; isLatest: boolean }) {
  const color = getEventColor(event.type);
  const icon = EVENT_ICONS[event.type] || <TrainFront className="h-3 w-3" />;

  return (
    <div
      className={`group flex items-center gap-2.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 transition-all duration-300 ${
        isLatest
          ? 'border-white/[0.12] bg-white/[0.06]'
          : 'border-white/[0.04] bg-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
      }`}
      style={{ animation: isLatest ? 'slide-in-right 0.3s ease-out' : 'none' }}
    >
      {/* Severity dot */}
      <div
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{
          backgroundColor: event.severity === 'critical' ? '#ef4444' : event.severity === 'warning' ? '#fbbf24' : color,
          boxShadow: `0 0 6px ${event.severity === 'critical' ? '#ef4444' : event.severity === 'warning' ? '#fbbf24' : color}`,
        }}
      />

      {/* Icon */}
      <span style={{ color }} className="flex-shrink-0 opacity-70">
        {icon}
      </span>

      {/* Time */}
      <span className="font-mono text-[9px] text-white/30 flex-shrink-0">
        {formatEventTime(event.timestamp)}
      </span>

      {/* Message */}
      <span className="text-[11px] text-white/60 truncate max-w-[200px] group-hover:text-white/80 transition-colors">
        {event.message}
      </span>

      {/* Train tag */}
      <span
        className="rounded px-1 py-0.5 font-mono text-[8px] flex-shrink-0"
        style={{
          backgroundColor: `${color}15`,
          color: `${color}cc`,
        }}
      >
        {event.train_id}
      </span>
    </div>
  );
}

export function EventTimeline({ events, maxEvents = 20, onEventClick }: EventTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [events.length]);

  const displayEvents = events.slice(0, maxEvents);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06]">
        <Clock className="h-3 w-3 text-white/30" strokeWidth={1.5} />
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">Live Events</span>
        <span className="ml-auto font-mono text-[9px] text-white/20">{events.length} total</span>
      </div>

      {/* Event strip */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-2 flex items-center gap-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(51,65,85,0.5) transparent' }}
      >
        {displayEvents.length === 0 ? (
          <div className="flex items-center gap-2 text-white/20 px-2">
            <TrainFront className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-[10px] font-mono">Awaiting operational events...</span>
          </div>
        ) : (
          displayEvents.map((event, index) => (
            <div key={event.id} onClick={() => onEventClick?.(event)} style={{ cursor: onEventClick ? 'pointer' : 'default' }}>
              <EventItem event={event} isLatest={index === 0} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
