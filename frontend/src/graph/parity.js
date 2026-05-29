/**
 * Compare frontend live analytics with backend parse response.
 * Used for validation parity visibility in the analytics panel.
 */
export function compareAnalytics(frontend, backend) {
  if (!frontend || !backend) return { match: null, mismatches: [] };

  const checks = [
    ['numNodes', frontend.numNodes, backend.numNodes],
    ['numEdges', frontend.numEdges, backend.numEdges],
    ['isDag', frontend.isDag, backend.isDag],
    ['cycleDetected', frontend.cycleDetected, backend.cycleDetected],
    ['isolatedNodes', frontend.isolatedNodes, backend.isolatedNodes],
    ['disconnectedNodes', frontend.disconnectedNodes, backend.disconnectedNodes],
  ];

  const mismatches = checks
    .filter(([, a, b]) => a !== b)
    .map(([field, a, b]) => ({ field, frontend: a, backend: b }));

  return {
    match: mismatches.length === 0,
    mismatches,
  };
}
