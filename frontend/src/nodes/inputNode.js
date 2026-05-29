// inputNode.js

import { BaseNode } from '../components/nodes/BaseNode';

export const InputNode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Input',
        width: 200,
        height: 80,
        outputs: [
          {
            key: 'value',
            id: (nodeId) => `${nodeId}-value`,
            label: 'value',
          },
        ],
        fields: [
          {
            name: 'inputName',
            label: 'Name',
            type: 'text',
          },
          {
            name: 'inputType',
            label: 'Type',
            type: 'select',
            options: [
              { label: 'Text', value: 'Text' },
              { label: 'File', value: 'File' },
            ],
          },
        ],
      }}
    />
  );
}
