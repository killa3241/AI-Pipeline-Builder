import { useStore } from '../store';

export function AppHeader() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const exportWorkflow = useStore((state) => state.exportWorkflow);
  const importWorkflowFromFile = useStore((state) => state.importWorkflowFromFile);
  const importError = useStore((state) => state.importError);

  return (
    <header className="appHeader">
      <div className="appHeaderLeft">
        <div className="brandMark brandMarkSm" aria-hidden="true" />
        <div>
          <div className="appHeaderTitle">AI Pipeline Builder</div>
          <div className="appHeaderSub">Visual AI workflow editor</div>
        </div>
      </div>

      <div className="appHeaderActions">
        <button type="button" className="headerBtn" onClick={exportWorkflow}>
          Export
        </button>
        <label className="headerBtn headerBtnLabel">
          Import
          <input
            type="file"
            accept="application/json,.json"
            className="headerFileInput"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importWorkflowFromFile(file);
              e.target.value = '';
            }}
          />
        </label>
        <button type="button" className="headerBtn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {importError ? <div className="appHeaderError">{importError}</div> : null}
    </header>
  );
}
