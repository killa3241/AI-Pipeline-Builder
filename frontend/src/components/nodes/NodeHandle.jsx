import { Handle } from 'reactflow';

/**
 * Small wrapper around ReactFlow's Handle so we can standardize visuals and
 * attach labels/tooltips without duplicating boilerplate in every node.
 */
export function NodeHandle({
  id,
  type,
  position,
  top,
  label,
  title,
  isValid = true,
  isActive = false,
}) {
  const handleStyle = top !== undefined ? { top } : undefined;

  const className = [
    'nodeHandle',
    isValid ? null : 'nodeHandleInvalid',
    isActive ? 'nodeHandleActive' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className={className}
      style={handleStyle}
      title={title || label}
    />
  );
}

