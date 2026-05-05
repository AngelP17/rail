/**
 * ScenarioDirector - Simulation Mode Selector & Demo Controller
 * ==============================================================
 *
 * Provides scenario mode switching and one-click flagship demo mode.
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Square, SkipForward, Activity, Zap, Radio, Clock, Shield, BatteryCharging, ChevronRight } from 'lucide-react';
import type { ScenarioMode, MetroLine } from '../types/train';
import { SCENARIOS, SCENARIO_ORDER } from '../simulation/scenarios';
import { DEMO_SCRIPT } from '../utils/mockData';

interface ScenarioDirectorProps {
  currentScenario: ScenarioMode;
  onScenarioChange: (scenario: ScenarioMode) => void;
  isDemoRunning: boolean;
  onDemoStart: () => void;
  onDemoStop: () => void;
  onDemoStep: (step: { selectLine?: MetroLine; selectTrainId?: string; setScenario?: ScenarioMode }) => void;
}

const SCENARIO_ICONS: Record<ScenarioMode, React.ReactNode> = {
  normal: <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />,
  rush_hour: <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />,
  tunnel_degraded: <Radio className="h-3.5 w-3.5" strokeWidth={1.5} />,
  bchop_peak: <BatteryCharging className="h-3.5 w-3.5" strokeWidth={1.5} />,
  dwell_delay: <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />,
  signal_hold: <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />,
};

export function ScenarioDirector({
  currentScenario,
  onScenarioChange,
  isDemoRunning,
  onDemoStart,
  onDemoStop,
  onDemoStep,
}: ScenarioDirectorProps) {
  const [expanded, setExpanded] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoDescription, setDemoDescription] = useState('');
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(0);

  useEffect(() => {
    if (!isDemoRunning) return;

    const runNext = () => {
      const idx = stepIndexRef.current;
      if (idx >= DEMO_SCRIPT.length) {
        onDemoStop();
        setDemoStepIndex(0);
        setDemoDescription('Scenario complete');
        stepIndexRef.current = 0;
        return;
      }

      const step = DEMO_SCRIPT[idx];
      setDemoStepIndex(idx);
      setDemoDescription(step.description);

      onDemoStep({
        selectLine: step.selectLine,
        selectTrainId: step.selectTrainId,
        setScenario: step.setScenario,
      });

      stepIndexRef.current = idx + 1;
      demoTimerRef.current = setTimeout(runNext, step.duration);
    };

    stepIndexRef.current = 0;
    demoTimerRef.current = setTimeout(runNext, 100);

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [isDemoRunning, onDemoStep, onDemoStop]);

  const handleStartDemo = () => {
    setDemoStepIndex(0);
    setDemoDescription('');
    onDemoStart();
  };

  const handleStopDemo = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    onDemoStop();
    setDemoStepIndex(0);
    setDemoDescription('');
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Demo control bar */}
      <div className="flex items-center gap-2">
        {!isDemoRunning ? (
          <button
            onClick={handleStartDemo}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d7ff5f] px-3 py-2 text-xs font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2} />
            Run Flagship Scenario
          </button>
        ) : (
          <button
            onClick={handleStopDemo}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs font-bold text-[#ef4444] transition-all hover:bg-[#ef4444]/20"
          >
            <Square className="h-3.5 w-3.5" strokeWidth={2} />
            Stop Demo
          </button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/40 transition-colors hover:text-white"
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Demo status */}
      {isDemoRunning && demoDescription && (
        <div className="flex items-center gap-2 rounded-lg border border-[#d7ff5f]/20 bg-[#d7ff5f]/5 px-3 py-2">
          <SkipForward className="h-3 w-3 animate-pulse text-[#d7ff5f]" strokeWidth={1.5} />
          <span className="text-[10px] font-mono text-[#d7ff5f]">{demoDescription}</span>
          <span className="ml-auto text-[9px] font-mono text-white/30">
            {demoStepIndex + 1}/{DEMO_SCRIPT.length}
          </span>
        </div>
      )}

      {/* Scenario selector */}
      {expanded && (
        <div className="space-y-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
          <p className="px-1 pb-1 text-[9px] font-mono uppercase tracking-wider text-white/30">Scenario Director</p>
          {SCENARIO_ORDER.map(scenario => {
            const config = SCENARIOS[scenario];
            const isActive = currentScenario === scenario;
            return (
              <button
                key={scenario}
                onClick={() => onScenarioChange(scenario)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                }`}
              >
                <span className={isActive ? 'text-[#d7ff5f]' : 'text-white/30'}>
                  {SCENARIO_ICONS[scenario]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{config.label}</p>
                  <p className="text-[9px] text-white/30 truncate">{config.description}</p>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#d7ff5f] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
