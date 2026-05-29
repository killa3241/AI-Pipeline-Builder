/**
 * Variable handle IDs are derived from variable names.
 * Requirement: handleId = `var-${variable}`
 */
export function variableToHandleId(variableName) {
  return `var-${variableName}`;
}

export function variablesToHandleIds(variables) {
  return (variables || []).map(variableToHandleId);
}

/**
 * Removes edges that reference removed target handles on a given node.
 * This prevents dangling edges when TextNode variables disappear.
 */
export function removeEdgesForMissingTargetHandles(edges, nodeId, removedHandleIds) {
  if (!removedHandleIds || removedHandleIds.size === 0) return edges;

  return edges.filter((e) => {
    if (e.target !== nodeId) return true;
    if (!e.targetHandle) return true;
    return !removedHandleIds.has(e.targetHandle);
  });
}

