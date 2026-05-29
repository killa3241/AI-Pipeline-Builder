// textNode.js

import { BaseNode } from '../components/nodes/BaseNode';
import { variableToHandleId } from '../graph/handleSync';

export const TextNode = ({ id, data, selected }) => {
  const variables = data?.variables || [];

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Text',
        description: 'Template with variables like {{name}}.',
        // Width/minHeight are now controlled centrally by BaseNode defaults.
        inputs: variables.map((v) => ({
          key: `var-${v}`,
          id: () => variableToHandleId(v),
          label: v,
          title: `Variable: ${v}`,
        })),
        outputs: [
          {
            key: 'output',
            id: (nodeId) => `${nodeId}-output`,
            label: 'output',
          },
        ],
        fields: [
          {
            name: 'text',
            label: 'Text',
            type: 'textarea',
          },
        ],
      }}
    />
  );
}
