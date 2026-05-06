/**
 * EventTimeline — Live Operations Event Strip
 * =============================================
 *
 * Severity lanes, event grouping, selected-train highlighting,
 * compact network state when empty.
 */

import { useRef, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Zap,
  Radio,
  AlertTriangle,
  Check,
  MapPin,
  Minimize2,
  Maximize2,
  BatteryCharging,
  Wifi,
  Clock,
  TrainFront,
  Activity,
} from 'lucide-react';
import type { OperationalEvent, EventType } from '../types/train';
import { getEventColor } from '../simulation/deriveEvents';

interface EventTimelineProps {
  events: OperationalEvent[];
  maxEvents?: number;
  selectedTrainId?: string | null;
  onSelectTrain?: (trainId: string) => void;
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

function EventItem({
  event,
  isLatest,
  isSelectedTrain,
  onClick,
}: {
  event: OperationalEvent;
  isLatest: boolean;
  isSelectedTrain: boolean;
  onClick?: () => void;
}) {
  const color = getEventColor(event.type);
  const icon = EVENT_ICONS[event.type] || <TrainFront className="h-3 w-3" />;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 transition-all duration-300 ${
        isSelectedTrain
          ? 'border-brand/30 bg-brand/[0.08]'
          : isLatest
          ? 'border-white/[0.12] bg-white/[0.06]'
          : 'border-white/[0.04] bg-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
      } ${onClick ? 'cursor-pointer' : ''}`}
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
      <span className="font-mono text-3xs text-white/30 flex-shrink-0">{formatEventTime(event.timestamp)}</span>

      {/* Message */}
      <span className="text-2xs text-white/60 truncate max-w-[200px] group-hover:text-white/80 transition-colors">
        {event.message}
      </span>

      {/* Train tag */}
      <span
        className="rounded px-1 py-0.5 font-mono text-3xs flex-shrink-0"
        style={{
          backgroundColor: isSelectedTrain ? `${color}30` : `${color}15`,
          color: `${color}cc`,
        }}
      >
        {event.train_id}
      </span>
    </div>
  );
}

export function EventTimeline({ events, maxEvents = 24, selectedTrainId, onSelectTrain }: EventTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [events.length]);

  const displayEvents = events.slice(0, maxEvents);

  // Group by severity for lane visualization
  const severityCounts = useMemo(() => {
    const counts = { info: 0, warning: 0, critical: 0 };
    displayEvents.forEach((e) => {
      counts[e.severity] = (counts[e.severity] || 0) + 1;
    });
    return counts;
  }, [displayEvents]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-scada-border">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-white/30" strokeWidth={1.5} />
          <span className="font-mono text-3xs uppercase tracking-wider text-white/30">Live Events</span>
        </div>

        {/* Severity lanes */}
        <div className="hidden items-center gap-2 md:flex">
          {severityCounts.critical > 0 && (
            <span className="flex items-center gap-1 rounded bg-status-danger/10 px-1.5 py-0.5 text-3xs font-mono text-status-danger">
              <span className="h-1 w-1 rounded-full bg-status-danger" />
              {severityCounts.critical}
            </span>
          )}
          {severityCounts.warning > 0 && (
            <span className="flex items-center gap-1 rounded bg-status-warning/10 px-1.5 py-0.5 text-3xs font-mono text-status-warning">
              <span className="h-1 w-1 rounded-full bg-status-warning" />
              {severityCounts.warning}
            </span>
          )}
          {severityCounts.info > 0 && (
            <span className="flex items-center gap-1 rounded bg-status-normal/10 px-1.5 py-0.5 text-3xs font-mono text-status-normal">
              <span className="h-1 w-1 rounded-full bg-status-normal" />
              {severityCounts.info}
            </span>
          )}
        </div>

        <span className="ml-auto font-mono text-3xs text-white/20">{events.length} total</span>
      </div>

      {/* Event strip */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-2 flex items-center gap-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(51,65,85,0.5) transparent' }}
      >
        {displayEvents.length === 0 ? (
          <div className="flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-2 text-white/20">
              <Activity className="h-3 w-3" strokeWidth={1.5} />
              <span className="text-2xs font-mono">Network nominal. Awaiting operational events...</span>
            </div>
            <div className="flex items-center gap-3 text-3xs font-mono text-white/20">
              <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-status-normal" /> Normal</span>
              <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-status-warning" /> Warning</span>
              <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-status-danger" /> Critical</span>
            </div>
          </div>
        ) : (
          displayEvents.map((event, index) => (
            <EventItem
              key={event.id}
              event={event}
              isLatest={index === 0}
              isSelectedTrain={!!selectedTrainId && event.train_id === selectedTrainId}
              onClick={onSelectTrain ? () => onSelectTrain(event.train_id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
