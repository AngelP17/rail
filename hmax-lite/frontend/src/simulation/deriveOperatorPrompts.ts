import type { TrainStatus, OperatorPrompt } from '../types/train';

let promptIdCounter = 0;

export function deriveOperatorPrompts(trains: TrainStatus[]): OperatorPrompt[] {
  const prompts: OperatorPrompt[] = [];

  for (const train of trains) {
    if (train.is_in_tunnel && train.tunnel_phase === 'inside') {
      prompts.push({
        id: `prompt-${++promptIdCounter}`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `${train.id} in tunnel relay. Monitor comms handoff.`,
        action: 'Watch relay state',
        priority: 'medium',
        acknowledged: false,
      });
    }

    if (train.telemetry.b_chop_status && train.braking_phase === 'heavy') {
      prompts.push({
        id: `prompt-${++promptIdCounter}`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `B-CHOP peak on ${train.id} approaching ${train.position.next_station_id}`,
        action: 'Verify regen temp',
        priority: 'high',
        acknowledged: false,
      });
    }

    if (train.at_station && train.dwell_countdown_seconds > 18) {
      prompts.push({
        id: `prompt-${++promptIdCounter}`,
        timestamp: Date.now(),
        train_id: train.id,
        line: train.line,
        message: `Extended dwell on ${train.id} at ${train.position.current_station_id}`,
        action: 'Check platform status',
        priority: 'low',
        acknowledged: false,
      });
    }
  }

  // Line-level prompt for tunnel density
  const line3TunnelTrains = trains.filter(t => t.line === 'line3' && t.is_in_tunnel);
  if (line3TunnelTrains.length >= 2) {
    prompts.push({
      id: `prompt-${++promptIdCounter}`,
      timestamp: Date.now(),
      line: 'line3',
      message: `High tunnel density: ${line3TunnelTrains.length} trains in relay zone`,
      action: 'Adjust spacing',
      priority: 'high',
      acknowledged: false,
    });
  }

  return prompts.slice(0, 6);
}
