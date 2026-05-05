import type { TrainStatus, MetroLine } from '../types/train';

export interface SignalBlock {
  id: string;
  line: MetroLine;
  fromStationId: string;
  toStationId: string;
  occupancy: number; // 0-1
  isTunnel: boolean;
  trainCount: number;
  status: 'clear' | 'occupied' | 'approach' | 'restricted';
}

export function deriveSignalBlocks(trains: TrainStatus[]): SignalBlock[] {
  const blocks: SignalBlock[] = [];
  const trainsByLine = new Map<MetroLine, TrainStatus[]>();

  for (const t of trains) {
    if (!trainsByLine.has(t.line)) trainsByLine.set(t.line, []);
    trainsByLine.get(t.line)!.push(t);
  }

  for (const [line, lineTrains] of trainsByLine) {
    // Group trains by their current segment
    const segmentMap = new Map<string, TrainStatus[]>();
    for (const t of lineTrains) {
      const segKey = `${t.position.current_station_id}-${t.position.next_station_id}`;
      if (!segmentMap.has(segKey)) segmentMap.set(segKey, []);
      segmentMap.get(segKey)!.push(t);
    }

    for (const [segKey, segTrains] of segmentMap) {
      const [fromId, toId] = segKey.split('-');
      const occupancy = Math.min(1, segTrains.reduce((sum, t) => sum + t.block_occupancy, 0));
      const isTunnel = line === 'line3' && ((fromId === 'ST-02' && toId === 'ST-03') || (fromId === 'ST-03' && toId === 'ST-02'));

      let status: SignalBlock['status'] = 'clear';
      if (isTunnel && segTrains.some(t => t.is_in_tunnel)) status = 'restricted';
      else if (occupancy > 0.7) status = 'occupied';
      else if (occupancy > 0.3) status = 'approach';

      blocks.push({
        id: `block-${line}-${segKey}`,
        line,
        fromStationId: fromId,
        toStationId: toId,
        occupancy,
        isTunnel,
        trainCount: segTrains.length,
        status,
      });
    }
  }

  return blocks;
}
