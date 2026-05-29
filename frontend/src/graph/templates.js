/**
 * Starter workflow templates for onboarding and demos.
 */

const edge = (id, source, sourceHandle, target, targetHandle) => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type: 'smoothstep',
  animated: true,
});

export const WORKFLOW_TEMPLATES = [
  {
    id: 'llm-pipeline',
    name: 'Simple LLM Pipeline',
    description: 'Input → Text → LLM → Output',
    nodes: [
      {
        id: 'customInput-1',
        type: 'customInput',
        position: { x: 80, y: 120 },
        data: {
          id: 'customInput-1',
          nodeType: 'customInput',
          inputName: 'input_1',
          inputType: 'Text',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        position: { x: 360, y: 100 },
        data: {
          id: 'text-1',
          nodeType: 'text',
          text: 'Hello {{name}}',
          variables: ['name'],
          variableHandleIds: ['var-name'],
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 640, y: 120 },
        data: { id: 'llm-1', nodeType: 'llm' },
      },
      {
        id: 'customOutput-1',
        type: 'customOutput',
        position: { x: 920, y: 120 },
        data: {
          id: 'customOutput-1',
          nodeType: 'customOutput',
          outputName: 'output_1',
          outputType: 'Text',
        },
      },
    ],
    edges: [
      edge('e1', 'customInput-1', 'customInput-1-value', 'text-1', 'var-name'),
      edge('e2', 'text-1', 'text-1-output', 'llm-1', 'llm-1-prompt'),
      edge('e3', 'llm-1', 'llm-1-response', 'customOutput-1', 'customOutput-1-value'),
    ],
  },
  {
    id: 'api-flow',
    name: 'API Processing Flow',
    description: 'Input → API → Filter → Output',
    nodes: [
      {
        id: 'customInput-1',
        type: 'customInput',
        position: { x: 60, y: 140 },
        data: {
          id: 'customInput-1',
          nodeType: 'customInput',
          inputName: 'input_1',
          inputType: 'Text',
        },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 320, y: 120 },
        data: {
          id: 'api-1',
          nodeType: 'api',
          url: 'https://api.example.com/v1',
          method: 'POST',
          headers: '{\n  "Content-Type": "application/json"\n}',
          payload: '{\n  "query": "{{input}}"\n}',
        },
      },
      {
        id: 'filter-1',
        type: 'filter',
        position: { x: 600, y: 140 },
        data: {
          id: 'filter-1',
          nodeType: 'filter',
          field: 'status',
          operator: 'eq',
          value: 'ok',
        },
      },
      {
        id: 'customOutput-1',
        type: 'customOutput',
        position: { x: 880, y: 140 },
        data: {
          id: 'customOutput-1',
          nodeType: 'customOutput',
          outputName: 'output_1',
          outputType: 'Text',
        },
      },
    ],
    edges: [
      edge('e1', 'customInput-1', 'customInput-1-value', 'api-1', 'api-1-in'),
      edge('e2', 'api-1', 'api-1-out', 'filter-1', 'filter-1-in'),
      edge('e3', 'filter-1', 'filter-1-pass', 'customOutput-1', 'customOutput-1-value'),
    ],
  },
  {
    id: 'math-pipeline',
    name: 'Math Pipeline',
    description: 'Input → Math → Output',
    nodes: [
      {
        id: 'customInput-1',
        type: 'customInput',
        position: { x: 120, y: 160 },
        data: {
          id: 'customInput-1',
          nodeType: 'customInput',
          inputName: 'input_1',
          inputType: 'Text',
        },
      },
      {
        id: 'math-1',
        type: 'math',
        position: { x: 420, y: 140 },
        data: {
          id: 'math-1',
          nodeType: 'math',
          operation: 'add',
          aValue: 1,
          bValue: 2,
        },
      },
      {
        id: 'customOutput-1',
        type: 'customOutput',
        position: { x: 720, y: 160 },
        data: {
          id: 'customOutput-1',
          nodeType: 'customOutput',
          outputName: 'output_1',
          outputType: 'Text',
        },
      },
    ],
    edges: [
      edge('e1', 'customInput-1', 'customInput-1-value', 'math-1', 'math-1-a'),
      edge('e2', 'math-1', 'math-1-result', 'customOutput-1', 'customOutput-1-value'),
    ],
  },
];
