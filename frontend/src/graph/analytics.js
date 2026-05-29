import { validateConnectionRules } from './validators';

function buildAdjacency(nodes, edges) {
  const nodeIds = nodes.map((n) => n.id);
  const out = new Map(nodeIds.map((id) => [id, []]));

  for (const e of edges) {
    if (!out.has(e.source)) out.set(e.source, []);
    out.get(e.source).push(e.target);
  }

  return out;
}

export function detectCycle(nodes, edges) {
  const adj = buildAdjacency(nodes, edges);
  const visited = new Set();
  const inStack = new Set();

  const dfs = (u) => {
    visited.add(u);
    inStack.add(u);
    for (const v of adj.get(u) || []) {
      if (!visited.has(v) && dfs(v)) return true;
      if (inStack.has(v)) return true;
    }
    inStack.delete(u);
    return false;
  };

  for (const n of nodes) {
    if (!visited.has(n.id) && dfs(n.id)) return true;
  }
  return false;
}

export function computeConnectivity(nodes, edges) {
  // Undirected connectivity for "disconnected from the main graph" UX.
  const neighbors = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of edges) {
    if (!neighbors.has(e.source)) neighbors.set(e.source, new Set());
    if (!neighbors.has(e.target)) neighbors.set(e.target, new Set());
    neighbors.get(e.source).add(e.target);
    neighbors.get(e.target).add(e.source);
  }

  // Degrees (directed) for isolated nodes
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  const outdeg = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges) {
    indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
    outdeg.set(e.source, (outdeg.get(e.source) || 0) + 1);
  }

  const isolatedNodeIds = nodes
    .filter((n) => (indeg.get(n.id) || 0) + (outdeg.get(n.id) || 0) === 0)
    .map((n) => n.id);

  // Connected components (undirected)
  const visited = new Set();
  const components = [];
  for (const n of nodes) {
    if (visited.has(n.id)) continue;
    const stack = [n.id];
    const comp = [];
    visited.add(n.id);
    while (stack.length) {
      const u = stack.pop();
      comp.push(u);
      for (const v of neighbors.get(u) || []) {
        if (!visited.has(v)) {
          visited.add(v);
          stack.push(v);
        }
      }
    }
    components.push(comp);
  }

  const largest = components.reduce((acc, c) => (c.length > acc.length ? c : acc), []);
  const largestSet = new Set(largest);
  const disconnectedNodeIds = nodes
    .map((n) => n.id)
    .filter((id) => nodes.length > 0 && !largestSet.has(id));

  return { isolatedNodeIds, disconnectedNodeIds };
}

export function analyzeGraph(nodes, edges) {
  const numNodes = nodes.length;
  const numEdges = edges.length;

  const cycleDetected = detectCycle(nodes, edges);
  const isDag = !cycleDetected;

  const { isolatedNodeIds, disconnectedNodeIds } = computeConnectivity(nodes, edges);

  const { errorsByEdgeId, invalidEdges } = validateConnectionRules(nodes, edges);
  const invalidEdgeIds = [...errorsByEdgeId.keys()];

  const warnings = [];
  if (cycleDetected) warnings.push('Cycle detected: execution order is not a DAG.');
  if (isolatedNodeIds.length) warnings.push(`${isolatedNodeIds.length} isolated node(s).`);
  if (disconnectedNodeIds.length) warnings.push(`${disconnectedNodeIds.length} disconnected node(s).`);
  if (invalidEdges.length) {
    warnings.push(`${invalidEdgeIds.length} invalid edge(s) — see details below.`);
  }

  return {
    numNodes,
    numEdges,
    isDag,
    cycleDetected,
    isolatedNodes: isolatedNodeIds.length,
    disconnectedNodes: disconnectedNodeIds.length,
    isolatedNodeIds,
    disconnectedNodeIds,
    errorsByEdgeId,
    invalidEdgeIds,
    invalidEdges,
    warnings,
  };
}

