import { useEffect } from 'react';
import { useStore } from '../store';
import { getPhaseDelayMs } from '../graph/executionPreview';

/**
 * Drives timed execution ticks without coupling timers to individual nodes.
 */
export function ExecutionRunner() {
  const execution = useStore((state) => state.execution);
  const executionSpeed = useStore((state) => state.executionSpeed);
  const advanceExecutionTick = useStore((state) => state.advanceExecutionTick);

  const { isRunning, isPaused, isComplete, phase } = execution;

  useEffect(() => {
    if (!isRunning || isPaused || isComplete || phase === 'idle' || phase === 'done') {
      return undefined;
    }

    const delay = getPhaseDelayMs(executionSpeed, phase);
    const timerId = setTimeout(() => advanceExecutionTick(), delay);
    return () => clearTimeout(timerId);
  }, [
    isRunning,
    isPaused,
    isComplete,
    phase,
    execution.currentStep,
    execution.activeNodeId,
    execution.activeEdgeId,
    executionSpeed,
    advanceExecutionTick,
  ]);

  return null;
}
