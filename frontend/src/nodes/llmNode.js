// llmNode.js

import { BaseNode } from '../components/nodes/BaseNode';

export const LLMNode = ({ id, data, selected }) => {

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'LLM',
        description: 'This is a LLM.',
        width: 200,
        height: 80,
        inputs: [
          {
            key: 'system',
            id: (nodeId) => `${nodeId}-system`,
            label: 'system',
            top: `${100 / 3}%`,
          },
          {
            key: 'prompt',
            id: (nodeId) => `${nodeId}-prompt`,
            label: 'prompt',
            top: `${200 / 3}%`,
          },
        ],
        outputs: [
          {
            key: 'response',
            id: (nodeId) => `${nodeId}-response`,
            label: 'response',
          },
        ],
        fields: [],
      }}
    />
  );
}
