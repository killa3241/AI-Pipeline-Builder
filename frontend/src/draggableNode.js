// draggableNode.js

export const DraggableNode = ({ type, label, hint, icon }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };
  
    return (
      <div
        className="nodeCard"
        onDragStart={(event) => onDragStart(event, type)}
        draggable
      >
          <div className="nodeCardLeft">
            <div className="nodeIcon" aria-hidden="true">
              {icon || label?.slice(0, 2)?.toUpperCase()}
            </div>
            <div className="nodeMeta">
              <div className="nodeLabel">{label}</div>
              {hint ? <div className="nodeHint">{hint}</div> : null}
            </div>
          </div>
          <div className="nodeDragHint">Drag</div>
      </div>
    );
  };
  