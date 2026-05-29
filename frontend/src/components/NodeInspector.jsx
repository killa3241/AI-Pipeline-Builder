import { useStore } from '../store';
import { NodeField } from './nodes/NodeField';
import { getInspectorFields, getNodeTypeLabel } from '../graph/nodeInspectorConfig';

export function NodeInspector() {
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const node = useStore((state) =>
    state.nodes.find((n) => n.id === state.selectedNodeId)
  );

  if (!selectedNodeId || !node) {
    return (
      <div className="analyticsHint">Select a node on the canvas to inspect its configuration.</div>
    );
  }

  const fields = getInspectorFields(node);
  const displayName =
    node.data?.inputName ||
    node.data?.outputName ||
    node.data?.url ||
    node.id;

  return (
    <div className="inspector">
      <div className="inspectorHeader">
        <div className="inspectorTitle">{displayName}</div>
        <div className="inspectorMeta">{getNodeTypeLabel(node.type)}</div>
      </div>

      <div className="inspectorSection">
        <div className="analyticsRow">
          <div className="analyticsLabel">Node ID</div>
          <div className="analyticsValue inspectorMono">{node.id}</div>
        </div>
        <div className="analyticsRow">
          <div className="analyticsLabel">Type</div>
          <div className="analyticsValue">{node.type}</div>
        </div>
      </div>

      {node.type === 'text' && (node.data?.variables || []).length > 0 && (
        <div className="inspectorSection">
          <div className="analyticsWarningsTitle">Variables</div>
          <div className="inspectorTags">
            {(node.data.variables || []).map((v) => (
              <span key={v} className="inspectorTag">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {fields.length > 0 ? (
        <div className="inspectorSection">
          <div className="analyticsWarningsTitle">Configuration</div>
          {fields.map((field) => (
            <NodeField
              key={field.name}
              nodeId={node.id}
              field={field}
              value={node.data?.[field.name]}
            />
          ))}
        </div>
      ) : (
        <div className="analyticsHint">This node has no configurable fields.</div>
      )}
    </div>
  );
}
