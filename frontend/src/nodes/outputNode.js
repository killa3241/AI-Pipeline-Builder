// outputNode.js

import { BaseNode } from '../components/nodes/BaseNode';

export const OutputNode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Output',
        width: 200,
        height: 80,
        inputs: [
          {
            key: 'value',
            id: (nodeId) => `${nodeId}-value`,
            label: 'value',
          },
        ],
        fields: [
          {
            name: 'outputName',
            label: 'Name',
            type: 'text',
          },
          {
            name: 'outputType',
            label: 'Type',
            type: 'select',
            options: [
              { label: 'Text', value: 'Text' },
              { label: 'Image', value: 'File' },
            ],
          },
        ],
      }}
    />
  );
}
