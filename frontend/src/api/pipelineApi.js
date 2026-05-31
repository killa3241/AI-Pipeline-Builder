const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Serialize ReactFlow graph for backend analysis (minimal, stable contract).
 */
export function serializePipeline(nodes, edges) {
  return {
    nodes: nodes.map(({ id, type }) => ({ id, type: type ?? null })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      sourceHandle: sourceHandle ?? null,
      targetHandle: targetHandle ?? null,
    })),
  };
}

function mapParseResponse(data) {
  return {
    numNodes: data.num_nodes,
    numEdges: data.num_edges,
    isDag: data.is_dag,
    cycleDetected: data.cycle_detected,
    isolatedNodes: data.isolated_nodes,
    disconnectedNodes: data.disconnected_nodes,
    pipelineValid: data.pipeline_valid,
    validationErrors: data.validation_errors ?? [],
    source: 'backend',
  };
}

/**
 * POST /pipelines/parse — backend graph analytics.
 */
export async function parsePipeline(nodes, edges) {
  const body = serializePipeline(nodes, edges);

  const res = await fetch(`${API_BASE}/pipelines/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = payload?.detail;
    const errors = Array.isArray(detail?.errors)
      ? detail.errors
      : typeof detail === 'string'
        ? [detail]
        : [res.statusText || 'Request failed'];
    throw new Error(errors.join(' '));
  }

  return mapParseResponse(payload);
}
