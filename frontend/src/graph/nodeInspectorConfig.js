/**
 * Inspector field definitions per node type (mirrors BaseNode configs).
 */

const TYPE_LABELS = {
  customInput: 'Input',
  customOutput: 'Output',
  text: 'Text',
  llm: 'LLM',
  delay: 'Delay',
  math: 'Math',
  filter: 'Filter',
  api: 'API',
  image: 'Image',
};

export function getNodeTypeLabel(type) {
  return TYPE_LABELS[type] || type || 'Unknown';
}

export function getInspectorFields(node) {
  if (!node) return [];

  switch (node.type) {
    case 'customInput':
      return [
        { name: 'inputName', label: 'Name', type: 'text' },
        {
          name: 'inputType',
          label: 'Type',
          type: 'select',
          options: [
            { label: 'Text', value: 'Text' },
            { label: 'File', value: 'File' },
          ],
        },
      ];
    case 'customOutput':
      return [
        { name: 'outputName', label: 'Name', type: 'text' },
        {
          name: 'outputType',
          label: 'Type',
          type: 'select',
          options: [
            { label: 'Text', value: 'Text' },
            { label: 'Image', value: 'File' },
          ],
        },
      ];
    case 'text':
      return [{ name: 'text', label: 'Template', type: 'textarea' }];
    case 'delay':
      return [{ name: 'delayMs', label: 'Delay (ms)', type: 'number', min: 0, step: 50 }];
    case 'math':
      return [
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
      ];
    case 'filter':
      return [
        { name: 'field', label: 'Field', type: 'text' },
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
        { name: 'value', label: 'Value', type: 'text' },
      ];
    case 'api':
      return [
        { name: 'url', label: 'URL', type: 'text' },
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
        { name: 'headers', label: 'Headers (JSON)', type: 'textarea' },
        { name: 'payload', label: 'Payload (JSON)', type: 'textarea' },
      ];
    case 'image':
      return [
        {
          name: 'source',
          label: 'Source',
          type: 'select',
          options: [
            { label: 'Upload (future)', value: 'upload' },
            { label: 'URL', value: 'url' },
          ],
        },
        { name: 'imageUrl', label: 'Image URL', type: 'text' },
      ];
    case 'llm':
      return [];
    default:
      return [];
  }
}
