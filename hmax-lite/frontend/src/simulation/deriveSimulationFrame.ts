import type { TrainStatus, ScenarioMode, SystemStatus } from '../types/train';
import { SCENARIOS } from './scenarios';
import { deriveSignalBlocks } from './deriveSignalBlocks';
import type { SignalBlock } from './deriveSignalBlocks';

export interface SimulationFrame {
  trains: TrainStatus[];
  systemStatus: SystemStatus;
  scenario: ScenarioMode;
  signalBlocks: SignalBlock[];
  tunnelTrainCount: number;
  brakingTrainCount: number;
  dwellTrainCount: number;
  totalEnergyRecovered: number;
  networkBatteryLevel: number; // 0-100
}

export function deriveSimulationFrame(
  trains: TrainStatus[],
  systemStatus: SystemStatus,
  scenario: ScenarioMode,
): SimulationFrame {
  const config = SCENARIOS[scenario];
  const signalBlocks = deriveSignalBlocks(trains);
  const tunnelTrainCount = trains.filter(t => t.is_in_tunnel).length;
  const brakingTrainCount = trains.filter(t => t.telemetry.b_chop_status).length;
  const dwellTrainCount = trains.filter(t => t.at_station).length;
  const totalEnergyRecovered = trains.reduce((sum, t) => sum + t.telemetry.energy_recovered_kwh, 0);
  const networkBatteryLevel = Math.min(100, (totalEnergyRecovered / 500) * 100 * config.event_frequency_multiplier);

  return {
    trains,
    systemStatus,
    scenario,
    signalBlocks,
    tunnelTrainCount,
    brakingTrainCount,
    dwellTrainCount,
    totalEnergyRecovered,
    networkBatteryLevel,
  };
}
