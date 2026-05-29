const WORKFLOW_VERSION = 1;

export function buildWorkflowExport(nodes, edges, extraMetadata = {}) {
  return {
    version: WORKFLOW_VERSION,
    metadata: {
      app: 'AI Pipeline Builder',
      exportedAt: new Date().toISOString(),
      ...extraMetadata,
    },
    nodes,
    edges,
  };
}

export function downloadWorkflowJson(workflow) {
  const blob = new Blob([JSON.stringify(workflow, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'workflow.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate imported workflow shape before loading into the store.
 */
export function validateWorkflowPayload(raw) {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Invalid workflow: expected a JSON object.'] };
  }

  if (!Array.isArray(raw.nodes)) {
    errors.push('Missing or invalid "nodes" array.');
  }
  if (!Array.isArray(raw.edges)) {
    errors.push('Missing or invalid "edges" array.');
  }
  if (errors.length) return { ok: false, errors };

  const nodeIds = new Set();
  for (const n of raw.nodes) {
    if (!n?.id || typeof n.id !== 'string') errors.push('Each node must have a string "id".');
    if (!n?.type || typeof n.type !== 'string') errors.push(`Node ${n?.id || '?'} must have a "type".`);
    if (!n?.position || typeof n.position.x !== 'number' || typeof n.position.y !== 'number') {
      errors.push(`Node ${n?.id || '?'} must have a valid "position".`);
    }
    if (n?.data === undefined || typeof n.data !== 'object') {
      errors.push(`Node ${n?.id || '?'} must have a "data" object.`);
    }
    if (n?.id) {
      if (nodeIds.has(n.id)) errors.push(`Duplicate node id: ${n.id}`);
      nodeIds.add(n.id);
    }
  }

  for (const e of raw.edges) {
    if (!e?.id || typeof e.id !== 'string') errors.push('Each edge must have a string "id".');
    if (!e?.source || !e?.target) errors.push(`Edge ${e?.id || '?'} must have source and target.`);
    if (e?.source && !nodeIds.has(e.source)) {
      errors.push(`Edge ${e.id} references unknown source ${e.source}.`);
    }
    if (e?.target && !nodeIds.has(e.target)) {
      errors.push(`Edge ${e.id} references unknown target ${e.target}.`);
    }
  }

  return { ok: errors.length === 0, errors, workflow: raw };
}

export function rebuildNodeIdCounters(nodes) {
  const nodeIDs = {};
  for (const n of nodes) {
    const match = String(n.id).match(/^(.+)-(\d+)$/);
    if (!match) continue;
    const type = match[1];
    const num = parseInt(match[2], 10);
    nodeIDs[type] = Math.max(nodeIDs[type] || 0, num);
  }
  return nodeIDs;
}
