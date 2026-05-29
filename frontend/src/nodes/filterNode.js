import { BaseNode } from '../components/nodes/BaseNode';

export const FilterNode = ({ id, data, selected }) => {
  // Keep wrapper thin: conditional rendering lives in BaseNode/NodeField in later phases.
  // For Phase 3, we model the shape via config and default values (wired in ui.js init data).
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Filter',
        description: 'Route items based on a condition.',
        inputs: [{ key: 'in', id: (nodeId) => `${nodeId}-in`, label: 'in' }],
        outputs: [
          { key: 'pass', id: (nodeId) => `${nodeId}-pass`, label: 'pass' },
          { key: 'fail', id: (nodeId) => `${nodeId}-fail`, label: 'fail' },
        ],
        fields: [
          {
            name: 'field',
            label: 'Field',
            type: 'text',
            placeholder: 'e.g. status',
          },
          {
            name: 'operator',
            label: 'Operator',
            type: 'select',
            options: [
              { label: 'Equals', value: 'eq' },
              { label: 'Not equals', value: 'neq' },
              { label: 'Contains', value: 'contains' },
              { label: 'Greater than', value: 'gt' },
              { label: 'Less than', value: 'lt' },
            ],
          },
          {
            name: 'value',
            label: 'Value',
            type: 'text',
            placeholder: 'e.g. active',
          },
        ],
      }}
    />
  );
};

