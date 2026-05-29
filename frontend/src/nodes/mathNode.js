import { BaseNode } from '../components/nodes/BaseNode';

export const MathNode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Math',
        description: 'Basic numeric operations.',
        inputs: [
          { key: 'a', id: (nodeId) => `${nodeId}-a`, label: 'a' },
          { key: 'b', id: (nodeId) => `${nodeId}-b`, label: 'b' },
        ],
        outputs: [
          { key: 'result', id: (nodeId) => `${nodeId}-result`, label: 'result' },
        ],
        fields: [
          {
            name: 'operation',
            label: 'Operation',
            type: 'select',
            options: [
              { label: 'Add', value: 'add' },
              { label: 'Subtract', value: 'sub' },
              { label: 'Multiply', value: 'mul' },
              { label: 'Divide', value: 'div' },
            ],
          },
          { name: 'aValue', label: 'A (fallback)', type: 'number', step: 1 },
          { name: 'bValue', label: 'B (fallback)', type: 'number', step: 1 },
        ],
      }}
    />
  );
};

