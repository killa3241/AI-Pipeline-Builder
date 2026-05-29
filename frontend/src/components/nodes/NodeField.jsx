import { useStore } from '../../store';
import { useLayoutEffect, useRef } from 'react';

/**
 * Renders a single config-driven field and writes updates into node `data`
 * via the centralized graph store (no local component state).
 */
export function NodeField({ nodeId, field, value }) {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const textareaRef = useRef(null);

  const {
    name,
    label,
    type,
    placeholder,
    options,
    min,
    max,
    step,
  } = field;

  const inputId = `${nodeId}-${name}`;

  const onChange = (e) => {
    const raw = e.target.value;
    const nextValue = type === 'number' ? (raw === '' ? '' : Number(raw)) : raw;
    updateNodeField(nodeId, name, nextValue);
  };

  useLayoutEffect(() => {
    if (type !== 'textarea') return;
    const el = textareaRef.current;
    if (!el) return;

    // Auto-resize with a cap to avoid large reflows; the node body will scroll beyond this.
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, 140);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > 140 ? 'auto' : 'hidden';
  }, [type, value]);

  return (
    <div className="nodeField">
      <label className="nodeFieldLabel" htmlFor={inputId}>
        {label}
      </label>

      {type === 'select' ? (
        <select
          id={inputId}
          className="nodeFieldControl"
          value={value ?? ''}
          onChange={onChange}
        >
          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          className="nodeFieldControl nodeFieldTextarea"
          ref={textareaRef}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={onChange}
        />
      ) : (
        <input
          id={inputId}
          className="nodeFieldControl"
          type={type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
        />
      )}
    </div>
  );
}

