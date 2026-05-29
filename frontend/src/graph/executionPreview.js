/**
 * Visual execution preview — topological ordering and simulation phases only.
 * No real node/API execution.
 */

export const EXECUTION_SPEEDS = {
  slow: { nodeMs: 900, edgeMs: 700 },
  normal: { nodeMs: 550, edgeMs: 450 },
  fast: { nodeMs: 280, edgeMs: 220 },
};

export const INITIAL_EXECUTION = {
  isRunning: false,
  isPaused: false,
  isComplete: false,
  activeNodeId: null,
  activeEdgeId: null,
  executionOrder: [],
  currentStep: 0,
  phase: 'idle', // idle | activating-node | traversing-edge | done
  completedNodeIds: [],
  completedEdgeIds: [],
};

const NODE_TYPE_LABELS = {
  customInput: 'Input',
  customOutput: 'Output',
  text: 'Text',
  llm: 'LLM',
  delay: 'Delay',
  math: 'Math',
  filter: 'Filter',
  api: 'API',
  image: 'Image',
};

/**
 * Kahn's algorithm — returns topological order or [] if not a full DAG sort.
 */
export function topologicalSort(nodes, edges) {
  const nodeIds = nodes.map((n) => n.id);
  if (!nodeIds.length) return [];

  const indeg = Object.fromEntries(nodeIds.map((id) => [id, 0]));
  const adj = Object.fromEntries(nodeIds.map((id) => [id, []]));

  for (const e of edges) {
    if (indeg[e.target] === undefined || indeg[e.source] === undefined) continue;
    adj[e.source].push(e.target);
    indeg[e.target] += 1;
  }

  const queue = nodeIds.filter((id) => indeg[id] === 0);
  const order = [];

  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) {
      indeg[v] -= 1;
      if (indeg[v] === 0) queue.push(v);
    }
  }

  return order.length === nodeIds.length ? order : [];
}

export function findConnectingEdge(edges, fromId, toId) {
  return edges.find((e) => e.source === fromId && e.target === toId) || null;
}

export function getPhaseDelayMs(speed, phase) {
  const cfg = EXECUTION_SPEEDS[speed] || EXECUTION_SPEEDS.normal;
  return phase === 'traversing-edge' ? cfg.edgeMs : cfg.nodeMs;
}

export function getNodeDisplayLabel(node) {
  if (!node) return 'Node';
  return NODE_TYPE_LABELS[node.type] || node.type || node.id;
}

export function formatExecutionOrder(nodes, order) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return order.map((id) => getNodeDisplayLabel(byId.get(id)));
}

export function getExecutionStatusLabel(execution) {
  if (execution.isComplete) return 'Complete';
  if (execution.isPaused) return 'Paused';
  if (execution.isRunning) return 'Running';
  return 'Idle';
}

/**
 * Advance one simulation tick. Returns next execution state.
 */
export function advanceExecutionState(execution, edges) {
  const order = execution.executionOrder;
  if (!order.length) {
    return { ...INITIAL_EXECUTION, isComplete: true };
  }

  const step = execution.currentStep;
  const phase = execution.phase;

  if (phase === 'activating-node') {
    if (step >= order.length - 1) {
      const completedNodeIds = [...execution.completedNodeIds, order[step]];
      return {
        ...execution,
        completedNodeIds,
        activeNodeId: null,
        activeEdgeId: null,
        phase: 'done',
        isRunning: false,
        isComplete: true,
        isPaused: false,
      };
    }

    const edge = findConnectingEdge(edges, order[step], order[step + 1]);
    return {
      ...execution,
      phase: 'traversing-edge',
      activeEdgeId: edge?.id ?? null,
      completedNodeIds: [...execution.completedNodeIds, order[step]],
    };
  }

  if (phase === 'traversing-edge') {
    const completedEdgeIds = execution.activeEdgeId
      ? [...execution.completedEdgeIds, execution.activeEdgeId]
      : execution.completedEdgeIds;
    const nextStep = step + 1;

    return {
      ...execution,
      phase: 'activating-node',
      currentStep: nextStep,
      activeNodeId: order[nextStep],
      activeEdgeId: null,
      completedEdgeIds,
    };
  }

  return execution;
}

export function startExecutionState(order) {
  if (!order.length) {
    return { ...INITIAL_EXECUTION, isComplete: true };
  }

  return {
    ...INITIAL_EXECUTION,
    isRunning: true,
    isPaused: false,
    isComplete: false,
    executionOrder: order,
    currentStep: 0,
    phase: 'activating-node',
    activeNodeId: order[0],
    activeEdgeId: null,
    completedNodeIds: [],
    completedEdgeIds: [],
  };
}
