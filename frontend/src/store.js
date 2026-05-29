// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { parseVariables } from './graph/variableParser';
import { removeEdgesForMissingTargetHandles, variablesToHandleIds } from './graph/handleSync';
import { analyzeGraph } from './graph/analytics';
import { parsePipeline } from './api/pipelineApi';
import {
  INITIAL_EXECUTION,
  advanceExecutionState,
  startExecutionState,
  topologicalSort,
} from './graph/executionPreview';
import {
  buildWorkflowExport,
  downloadWorkflowJson,
  rebuildNodeIdCounters,
  validateWorkflowPayload,
} from './graph/persistence';
import { WORKFLOW_TEMPLATES } from './graph/templates';
import { getStoredTheme, applyTheme } from './theme/initTheme';

export const useStore = create((set, get) => ({
    // ReactFlow graph state
    nodes: [],
    edges: [],
    analytics: {
      numNodes: 0,
      numEdges: 0,
      isDag: true,
      cycleDetected: false,
      isolatedNodes: 0,
      disconnectedNodes: 0,
      warnings: [],
      invalidEdgeIds: [],
      invalidEdges: [],
      errorsByEdgeId: new Map(),
    },

    // Backend parse results (populated on Submit)
    backendAnalytics: null,
    backendError: null,
    isSubmitting: false,

    // Visual execution preview (separate from node data / validation)
    execution: { ...INITIAL_EXECUTION },
    executionSpeed: 'normal',
    executionWarning: null,

    theme: getStoredTheme(),
    selectedNodeId: null,
    importError: null,
    reactFlowInstance: null,

    // Per-node-type counters used for deterministic IDs like `text-1`, `text-2`, ...
    // Kept in Zustand so it survives component re-renders and avoids runtime crashes.
    nodeIDs: {},

    getNodeID: (type) => {
        // Ensure we always have an object (defensive against partial state resets)
        const existing = get().nodeIDs || {};
        const newIDs = { ...existing };
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set((state) => {
          const nodes = [...state.nodes, node];
          const analytics = analyzeGraph(nodes, state.edges);
          return { nodes, analytics };
        });
    },
    onNodesChange: (changes) => {
      set((state) => {
        const nodes = applyNodeChanges(changes, state.nodes);
        const analytics = analyzeGraph(nodes, state.edges);
        return { nodes, analytics };
      });
    },
    onEdgesChange: (changes) => {
      set((state) => {
        const edges = applyEdgeChanges(changes, state.edges);
        const analytics = analyzeGraph(state.nodes, edges);
        return { edges, analytics };
      });
    },
    onConnect: (connection) => {
      set((state) => {
        const edges = addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
          },
          state.edges
        );
        const analytics = analyzeGraph(state.nodes, edges);
        return { edges, analytics };
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      // Immutable update to ensure ReactFlow sees new references and re-renders reliably.
      // TextNode special-case: keep `variables` and `edges` synchronized with template variables.
      set((state) => {
        const nodes = state.nodes.map((node) => {
          if (node.id !== nodeId) return node;

          const nextData = {
            ...(node.data || {}),
            [fieldName]: fieldValue,
          };

          if (node.type === 'text' && fieldName === 'text') {
            const parsed = parseVariables(fieldValue);
            nextData.variables = parsed;
            nextData.variableHandleIds = variablesToHandleIds(parsed);
          }

          return {
            ...node,
            data: nextData,
          };
        });

        // If the updated node is a TextNode text edit, prune edges that target removed variable handles.
        let edges = state.edges;
        if (fieldName === 'text') {
          const updated = state.nodes.find((n) => n.id === nodeId);
          if (updated?.type === 'text') {
            const prevVars = updated.data?.variables || [];
            const nextVars = parseVariables(fieldValue);
            const prevHandles = new Set(variablesToHandleIds(prevVars));
            const nextHandles = new Set(variablesToHandleIds(nextVars));
            const removed = new Set([...prevHandles].filter((h) => !nextHandles.has(h)));

            edges = removeEdgesForMissingTargetHandles(state.edges, nodeId, removed);
          }
        }

        const analytics = analyzeGraph(nodes, edges);
        return { nodes, edges, analytics };
      });
    },

    setExecutionSpeed: (speed) => set({ executionSpeed: speed }),

    runExecution: () => {
      const { nodes, edges, analytics } = get();
      if (!analytics?.isDag) {
        set({
          executionWarning:
            'Cannot run preview: pipeline is not a valid DAG (cycle detected).',
        });
        return;
      }

      const order = topologicalSort(nodes, edges);
      if (nodes.length > 0 && order.length === 0) {
        set({
          executionWarning:
            'Cannot run preview: unable to determine topological execution order.',
        });
        return;
      }

      set({
        execution: startExecutionState(order),
        executionWarning: null,
      });
    },

    pauseExecution: () => {
      set((state) => ({
        execution: { ...state.execution, isPaused: true },
      }));
    },

    resumeExecution: () => {
      const { execution } = get();
      if (!execution.isRunning || execution.isComplete) return;
      set({ execution: { ...execution, isPaused: false } });
    },

    resetExecution: () => {
      set({
        execution: { ...INITIAL_EXECUTION },
        executionWarning: null,
      });
    },

    advanceExecutionTick: () => {
      const { execution, edges } = get();
      if (!execution.isRunning || execution.isPaused || execution.isComplete) return;

      const next = advanceExecutionState(execution, edges);
      set({ execution: next });
    },

    stepForward: () => {
      const { nodes, edges, analytics, execution } = get();

      if (execution.isComplete) return;

      if (!execution.isRunning) {
        if (!analytics?.isDag) {
          set({
            executionWarning:
              'Cannot step: pipeline is not a valid DAG (cycle detected).',
          });
          return;
        }
        const order = topologicalSort(nodes, edges);
        if (nodes.length > 0 && order.length === 0) {
          set({ executionWarning: 'Cannot step: invalid execution order.' });
          return;
        }
        set({
          execution: { ...startExecutionState(order), isPaused: true },
          executionWarning: null,
        });
        return;
      }

      const next = advanceExecutionState(execution, edges);
      set({
        execution: {
          ...next,
          isPaused: true,
          isRunning: !next.isComplete,
        },
      });
    },

    submitPipeline: async () => {
      const { nodes, edges } = get();
      set({ isSubmitting: true, backendError: null });

      try {
        const backendAnalytics = await parsePipeline(nodes, edges);
        set({ backendAnalytics, isSubmitting: false });
      } catch (err) {
        set({
          backendError: err?.message || 'Failed to parse pipeline',
          isSubmitting: false,
        });
      }
    },

    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      set({ theme: next });
    },

    setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

    fitView: () => {
      get().reactFlowInstance?.fitView({ padding: 0.2, duration: 280 });
    },

    onSelectionChange: ({ nodes: selectedNodes = [] }) => {
      set({
        selectedNodeId:
          selectedNodes.length === 1 ? selectedNodes[0].id : null,
      });
    },

    clearSelection: () => {
      set((state) => ({
        selectedNodeId: null,
        nodes: state.nodes.map((n) => ({ ...n, selected: false })),
      }));
    },

    selectAllNodes: () => {
      set((state) => ({
        nodes: state.nodes.map((n) => ({ ...n, selected: true })),
      }));
    },

    deleteSelected: () => {
      set((state) => {
        const selectedNodeIds = new Set(
          state.nodes.filter((n) => n.selected).map((n) => n.id)
        );
        const nodes = state.nodes.filter((n) => !n.selected);
        const edges = state.edges.filter(
          (e) =>
            !e.selected &&
            !selectedNodeIds.has(e.source) &&
            !selectedNodeIds.has(e.target)
        );
        const analytics = analyzeGraph(nodes, edges);
        return {
          nodes,
          edges,
          analytics,
          selectedNodeId: null,
          execution: { ...INITIAL_EXECUTION },
        };
      });
    },

    loadGraph: (nodes, edges) => {
      const normalizedEdges = edges.map((e) => ({
        ...e,
        type: e.type || 'smoothstep',
        animated: e.animated ?? true,
        markerEnd:
          e.markerEnd || {
            type: MarkerType.Arrow,
            height: '20px',
            width: '20px',
          },
      }));

      const analytics = analyzeGraph(nodes, normalizedEdges);
      const nodeIDs = rebuildNodeIdCounters(nodes);

      set({
        nodes,
        edges: normalizedEdges,
        analytics,
        nodeIDs,
        selectedNodeId: null,
        backendAnalytics: null,
        backendError: null,
        execution: { ...INITIAL_EXECUTION },
        executionWarning: null,
        importError: null,
      });
    },

    exportWorkflow: () => {
      const { nodes, edges } = get();
      const workflow = buildWorkflowExport(nodes, edges);
      downloadWorkflowJson(workflow);
    },

    importWorkflowFromFile: async (file) => {
      try {
        const text = await file.text();
        const raw = JSON.parse(text);
        const result = validateWorkflowPayload(raw);
        if (!result.ok) {
          set({ importError: result.errors.join(' ') });
          return;
        }
        get().loadGraph(result.workflow.nodes, result.workflow.edges);
      } catch {
        set({ importError: 'Invalid JSON file. Could not parse workflow.' });
      }
    },

    loadTemplate: (templateId) => {
      const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      get().loadGraph(template.nodes, template.edges);
      setTimeout(() => get().fitView(), 50);
    },
  }));
