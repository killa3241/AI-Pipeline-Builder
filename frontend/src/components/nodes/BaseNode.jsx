import { Position } from 'reactflow';
import { NodeHandle } from './NodeHandle';
import { NodeField } from './NodeField';

/**
 * BaseNode renders a node from a small config object:
 * - header (title)
 * - handles (inputs/outputs)
 * - fields (config-driven controls)
 *
 * It keeps wrappers lightweight: node-specific logic can live in node wrapper
 * components, but the UI/structure stays standardized here.
 */
export function BaseNode({ id, data, selected, config }) {
  const {
    title,
    width,
    minHeight,
    inputs = [],
    outputs = [],
    fields = [],
    description,
  } = config;

  const computeTop = (idx, total) => `${((idx + 1) / (total + 1)) * 100}%`;

  return (
    <div
      className={`nodeFrame ${selected ? 'nodeFrameSelected' : ''}`}
      style={{
        width: width ?? 'var(--node-width)',
        minHeight: minHeight ?? 'var(--node-min-height)',
      }}
    >
      {/* Handles */}
      {inputs.map((h, idx) => (
        <NodeHandle
          key={h.key}
          id={h.id(id, data)}
          type="target"
          position={h.position ?? Position.Left}
          top={h.top ?? computeTop(idx, inputs.length)}
          label={h.label}
          title={h.title}
        />
      ))}
      {outputs.map((h, idx) => (
        <NodeHandle
          key={h.key}
          id={h.id(id, data)}
          type="source"
          position={h.position ?? Position.Right}
          top={h.top ?? computeTop(idx, outputs.length)}
          label={h.label}
          title={h.title}
        />
      ))}

      {/* Header */}
      <div className="baseNodeHeader">
        <div className="baseNodeTitle">{title}</div>
        {description ? <div className="baseNodeDesc">{description}</div> : null}
      </div>

      {/* Fields */}
      {fields.length ? (
        <div className="baseNodeBody">
          {fields.map((field) => (
            <NodeField
              key={field.name}
              nodeId={id}
              field={field}
              value={data?.[field.name]}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

