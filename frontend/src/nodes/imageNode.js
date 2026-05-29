import { BaseNode } from '../components/nodes/BaseNode';

export const ImageNode = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      config={{
        title: 'Image',
        description: 'Image/file oriented step.',
        inputs: [{ key: 'in', id: (nodeId) => `${nodeId}-in`, label: 'in' }],
        outputs: [{ key: 'out', id: (nodeId) => `${nodeId}-out`, label: 'out' }],
        fields: [
          {
            name: 'source',
            label: 'Source',
            type: 'select',
            options: [
              { label: 'Upload (future)', value: 'upload' },
              { label: 'URL', value: 'url' },
            ],
          },
          {
            name: 'imageUrl',
            label: 'Image URL',
            type: 'text',
            placeholder: 'https://…',
          },
        ],
      }}
    />
  );
};

