/**
 * Graph validators are UI-agnostic and reusable for backend parity later.
 * Structural (node-level) validity is separate from optional handle-level checks.
 */

import { variableToHandleId } from './handleSync';

/**
 * Known handle IDs for a node when handles are present on an edge.
 * TextNode dynamic handles come from data.variables / variableHandleIds.
 */
export function getValidHandlesForNode(node) {
  if (!node?.id) return new Set();

  const id = node.id;
  const handles = new Set();

  switch (node.type) {
    case 'customInput':
      handles.add(`${id}-value`);
      break;
    case 'customOutput':
      handles.add(`${id}-value`);
      break;
    case 'text':
      handles.add(`${id}-output`);
      (node.data?.variableHandleIds || []).forEach((h) => handles.add(h));
      (node.data?.variables || []).forEach((v) =>
        handles.add(variableToHandleId(v))
      );
      break;
    case 'llm':
      handles.add(`${id}-system`);
      handles.add(`${id}-prompt`);
      handles.add(`${id}-response`);
      break;
    case 'delay':
      handles.add(`${id}-in`);
      handles.add(`${id}-out`);
      break;
    case 'math':
      handles.add(`${id}-a`);
      handles.add(`${id}-b`);
      handles.add(`${id}-result`);
      break;
    case 'filter':
      handles.add(`${id}-in`);
      handles.add(`${id}-pass`);
      handles.add(`${id}-fail`);
      break;
    case 'api':
    case 'image':
      handles.add(`${id}-in`);
      handles.add(`${id}-out`);
      break;
    default:
      break;
  }

  return handles;
}

function edgeDedupKey(edge) {
  const sh = edge.sourceHandle ?? '';
  const th = edge.targetHandle ?? '';
  if (sh && th) {
    return `${edge.source}::${sh}-->${edge.target}::${th}`;
  }
  if (!sh && !th) {
    return `${edge.source}-->${edge.target}`;
  }
  return `${edge.source}::${sh}-->${edge.target}::${th}`;
}

function validateHandleOnNode(node, handleId, role) {
  if (!handleId) return null;

  const valid = getValidHandlesForNode(node);
  if (!valid.has(handleId)) {
    if (role === 'source') {
      return `invalid source handle: ${handleId}`;
    }
    return `invalid target handle: ${handleId}`;
  }
  return null;
}

export function validateConnectionRules(nodes, edges) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const errorsByEdgeId = new Map(); // edgeId -> string[]

  const addErr = (edgeId, reason) => {
    const arr = errorsByEdgeId.get(edgeId) || [];
    arr.push(reason);
    errorsByEdgeId.set(edgeId, arr);
  };

  for (const edge of edges) {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    // Node-level (structural) validation — always applied
    if (!sourceNode) {
      addErr(edge.id, 'missing source node');
      continue;
    }
    if (!targetNode) {
      addErr(edge.id, 'missing target node');
      continue;
    }
    if (edge.source === edge.target) {
      addErr(edge.id, 'self-connection not allowed');
    }

    // Handle-level validation — only when handle IDs are explicitly provided
    const sourceHandleReason = validateHandleOnNode(
      sourceNode,
      edge.sourceHandle,
      'source'
    );
    if (sourceHandleReason) addErr(edge.id, sourceHandleReason);

    const targetHandleReason = validateHandleOnNode(
      targetNode,
      edge.targetHandle,
      'target'
    );
    if (targetHandleReason) addErr(edge.id, targetHandleReason);
  }

  // Duplicate edges (topology-aware dedup key)
  const seen = new Set();
  for (const edge of edges) {
    const key = edgeDedupKey(edge);
    if (seen.has(key)) {
      addErr(edge.id, 'duplicate edge');
    } else {
      seen.add(key);
    }
  }

  const invalidEdges = [];
  for (const [edgeId, reasons] of errorsByEdgeId) {
    for (const reason of reasons) {
      invalidEdges.push({ edgeId, reason });
    }
  }

  return { errorsByEdgeId, invalidEdges };
}

/**
 * Lightweight connection attempt validation for ReactFlow `isValidConnection`.
 * Requires handles for new interactive connections; import/topology may omit them.
 */
export function isValidConnectionAttempt(connection, nodes, edges) {
  const { source, target, sourceHandle, targetHandle } = connection || {};
  if (!source || !target) return false;
  if (source === target) return false;

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) return false;

  if (targetNode.type === 'customInput') return false;
  if (sourceNode.type === 'customOutput') return false;

  if (!sourceHandle || !targetHandle) return false;

  const sourceReason = validateHandleOnNode(sourceNode, sourceHandle, 'source');
  const targetReason = validateHandleOnNode(targetNode, targetHandle, 'target');
  if (sourceReason || targetReason) return false;

  const exists = edges.some(
    (e) =>
      e.source === source &&
      e.target === target &&
      e.sourceHandle === sourceHandle &&
      e.targetHandle === targetHandle
  );
  if (exists) return false;

  return true;
}
