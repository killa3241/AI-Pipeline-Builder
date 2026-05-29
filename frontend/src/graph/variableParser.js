const VARIABLE_REGEX = /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g;

/**
 * Extract unique variables from a template string.
 * - Deterministic order: first appearance wins
 * - Ignores duplicates
 */
export function parseVariables(text) {
  const input = typeof text === 'string' ? text : '';
  const seen = new Set();
  const vars = [];

  let match;
  while ((match = VARIABLE_REGEX.exec(input)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      vars.push(name);
    }
  }

  return vars;
}

