import { BaseNode } from '../components/nodes/BaseNode';

export const APINode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'API',
        description: 'HTTP request step.',
        inputs: [{ key: 'in', id: (nodeId) => `${nodeId}-in`, label: 'in' }],
        outputs: [{ key: 'out', id: (nodeId) => `${nodeId}-out`, label: 'out' }],
        fields: [
          {
            name: 'url',
            label: 'URL',
            type: 'text',
            placeholder: 'https://api.example.com/v1',
          },
          {
            name: 'method',
            label: 'Method',
            type: 'select',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'PATCH', value: 'PATCH' },
              { label: 'DELETE', value: 'DELETE' },
            ],
          },
          {
            name: 'headers',
            label: 'Headers (JSON)',
            type: 'textarea',
            placeholder: '{ "Authorization": "Bearer …" }',
          },
          {
            name: 'payload',
            label: 'Payload (JSON)',
            type: 'textarea',
            placeholder: '{ "input": "{{text-1.output}}" }',
          },
        ],
      }}
    />
  );
};

