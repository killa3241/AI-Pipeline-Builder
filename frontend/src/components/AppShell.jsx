import { PipelineUI } from '../ui';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { AppHeader } from './AppHeader';
import { ExecutionRunner } from './ExecutionRunner';
import { KeyboardShortcuts } from './KeyboardShortcuts';

export function AppShell() {
  return (
    <div className="appLayout">
      <AppHeader />
      <ExecutionRunner />
      <KeyboardShortcuts />
      <div className="appShell">
        <aside className="surface appSidebar">
          <div className="surfaceHeader">
            <div className="surfaceTitle">Nodes</div>
          </div>
          <Sidebar />
        </aside>

        <main className="surface appCanvas">
          <div className="surfaceHeader">
            <div className="surfaceTitle">Canvas</div>
            <div className="nodeDragHint">
              Del remove · Ctrl+S export · Ctrl+A select · F fit
            </div>
          </div>
          <div className="canvasWrap">
            <PipelineUI />
          </div>
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
