import { BaseNode } from '../components/nodes/BaseNode';

export const DelayNode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Delay',
        description: 'Pause execution for a duration.',
        inputs: [
          {
            key: 'in',
            id: (nodeId) => `${nodeId}-in`,
            label: 'in',
          },
        ],
        outputs: [
          {
            key: 'out',
            id: (nodeId) => `${nodeId}-out`,
            label: 'out',
          },
        ],
        fields: [
          {
            name: 'delayMs',
            label: 'Delay (ms)',
            type: 'number',
            min: 0,
            step: 50,
          },
        ],
      }}
    />
  );
};

