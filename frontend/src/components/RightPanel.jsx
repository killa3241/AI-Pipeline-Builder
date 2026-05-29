import { useStore } from '../store';
import { AnalyticsPanel } from './AnalyticsPanel';
import { NodeInspector } from './NodeInspector';
import { SubmitButton } from '../submit';

export function RightPanel() {
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const clearSelection = useStore((state) => state.clearSelection);

  return (
    <section className="surface appPanel">
      <div className="surfaceHeader">
        <div className="surfaceTitle">
          {selectedNodeId ? 'Node Inspector' : 'Analytics'}
        </div>
        <div className="panelHeaderActions">
          {selectedNodeId ? (
            <button type="button" className="headerBtn headerBtnSm" onClick={clearSelection}>
              Back
            </button>
          ) : (
            <SubmitButton />
          )}
        </div>
      </div>
      <div className="surfaceBody panelScroll">
        {selectedNodeId ? <NodeInspector /> : <AnalyticsPanel />}
      </div>
    </section>
  );
}
