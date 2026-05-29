// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant, MarkerType } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { isValidConnectionAttempt } from './graph/validators';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { DelayNode } from './nodes/delayNode';
import { MathNode } from './nodes/mathNode';
import { FilterNode } from './nodes/filterNode';
import { APINode } from './nodes/apiNode';
import { ImageNode } from './nodes/imageNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  delay: DelayNode,
  math: MathNode,
  filter: FilterNode,
  api: APINode,
  image: ImageNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  analytics: state.analytics,
  execution: state.execution,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setReactFlowInstance: state.setReactFlowInstance,
  onSelectionChange: state.onSelectionChange,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const {
      nodes,
      edges,
      analytics,
      execution,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      setReactFlowInstance,
      onSelectionChange,
    } = useStore(selector, shallow);

    const invalidEdgeIds = new Set(analytics?.invalidEdgeIds || []);
    const invalidNodeIds = new Set([
      ...(analytics?.isolatedNodeIds || []),
      ...(analytics?.disconnectedNodeIds || []),
    ]);

    const completedNodes = new Set(execution?.completedNodeIds || []);
    const completedEdges = new Set(execution?.completedEdgeIds || []);

    const styledEdges = edges.map((e) => {
      const classes = [];
      if (invalidEdgeIds.has(e.id)) classes.push('edgeInvalid');
      else classes.push('edgeNormal');
      if (execution?.activeEdgeId === e.id) classes.push('edgeTraversing');
      else if (completedEdges.has(e.id)) classes.push('edgeExecCompleted');

      return {
        ...e,
        className: classes.join(' '),
        animated:
          execution?.activeEdgeId === e.id ||
          completedEdges.has(e.id) ||
          e.animated,
      };
    });

    const selectedNodeId = useStore((state) => state.selectedNodeId);

    const styledNodes = nodes.map((n) => {
      const classes = [];
      if (invalidNodeIds.has(n.id)) classes.push('nodeInvalid');
      if (execution?.activeNodeId === n.id) classes.push('nodeExecActive');
      else if (completedNodes.has(n.id)) classes.push('nodeExecCompleted');
      if (selectedNodeId === n.id && execution?.activeNodeId !== n.id) {
        classes.push('nodeInspectorSelected');
      }

      return {
        ...n,
        className: classes.length ? classes.join(' ') : undefined,
      };
    });

    const isValidConnection = useCallback(
      (connection) => isValidConnectionAttempt(connection, nodes, edges),
      [nodes, edges]
    );

    const getInitNodeData = (nodeID, type) => {
      // Standardized node data shape: every node has `id` and `nodeType`,
      // and type-specific fields are initialized here (single source of defaults).
      const nodeData = { id: nodeID, nodeType: `${type}` };

      if (type === 'customInput') {
        return {
          ...nodeData,
          inputName: nodeID.replace('customInput-', 'input_'),
          inputType: 'Text',
        };
      }

      if (type === 'customOutput') {
        return {
          ...nodeData,
          outputName: nodeID.replace('customOutput-', 'output_'),
          outputType: 'Text',
        };
      }

      if (type === 'text') {
        return {
          ...nodeData,
          text: '{{input}}',
          variables: ['input'],
          variableHandleIds: ['var-input'],
        };
      }

      if (type === 'delay') {
        return {
          ...nodeData,
          delayMs: 500,
        };
      }

      if (type === 'math') {
        return {
          ...nodeData,
          operation: 'add',
          aValue: 0,
          bValue: 0,
        };
      }

      if (type === 'filter') {
        return {
          ...nodeData,
          field: '',
          operator: 'eq',
          value: '',
        };
      }

      if (type === 'api') {
        return {
          ...nodeData,
          url: '',
          method: 'POST',
          headers: '{\n  \n}',
          payload: '{\n  \n}',
        };
      }

      if (type === 'image') {
        return {
          ...nodeData,
          source: 'url',
          imageUrl: '',
        };
      }

      // llm (and any future nodes without fields) still get the base shape
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const rf = useStore.getState().reactFlowInstance;
            if (!rf) return;

            const position = rf.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [addNode, getNodeID]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <>
        <div
          ref={reactFlowWrapper}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
            <ReactFlow
                className="reactflowRoot"
                nodes={styledNodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                deleteKeyCode={null}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                  markerEnd: { type: MarkerType.ArrowClosed },
                }}
            >
                <Background variant={BackgroundVariant.Dots} color="var(--grid)" gap={gridSize} size={1} />
                <Controls />
                <MiniMap
                  className="minimapThemed"
                  maskColor="var(--minimap-mask)"
                  nodeColor={(node) => {
                    if (execution?.activeNodeId === node.id) return 'var(--accent-1)';
                    if (completedNodes.has(node.id)) return 'var(--accent-2)';
                    if (selectedNodeId === node.id) return 'var(--warn-1)';
                    return 'var(--minimap-node)';
                  }}
                />
            </ReactFlow>
        </div>
        </>
    )
}
