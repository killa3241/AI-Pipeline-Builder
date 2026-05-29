import { useStore } from '../store';
import { compareAnalytics } from '../graph/parity';
import {
  formatExecutionOrder,
  getExecutionStatusLabel,
} from '../graph/executionPreview';

function MetricRow({ label, value, pill }) {
  if (pill !== undefined) {
    return (
      <div className="analyticsRow">
        <div className="analyticsLabel">{label}</div>
        <div className={`analyticsPill ${pill ? 'pillOk' : 'pillBad'}`}>{value}</div>
      </div>
    );
  }
  return (
    <div className="analyticsRow">
      <div className="analyticsLabel">{label}</div>
      <div className="analyticsValue">{value}</div>
    </div>
  );
}

function AnalyticsBlock({ title, data, showInvalidEdges }) {
  if (!data) {
    return (
      <div className="analyticsSection">
        <div className="analyticsSectionTitle">{title}</div>
        <div className="analyticsHint">Not available</div>
      </div>
    );
  }

  return (
    <div className="analyticsSection">
      <div className="analyticsSectionTitle">{title}</div>
      <MetricRow label="Nodes" value={data.numNodes ?? 0} />
      <MetricRow label="Edges" value={data.numEdges ?? 0} />
      <MetricRow
        label="DAG"
        value={data.isDag ? 'Valid' : 'Invalid'}
        pill={data.isDag}
      />
      <MetricRow
        label="Cycle"
        value={data.cycleDetected ? 'Detected' : 'None'}
        pill={!data.cycleDetected}
      />
      <MetricRow label="Isolated" value={data.isolatedNodes ?? 0} />
      <MetricRow label="Disconnected" value={data.disconnectedNodes ?? 0} />
      {showInvalidEdges ? (
        <>
          <MetricRow label="Invalid edges" value={(data.invalidEdgeIds || []).length} />
          {(data.invalidEdges || []).length > 0 && (
            <ul className="analyticsWarnings analyticsInvalidEdgeList">
              {data.invalidEdges.map((item, idx) => (
                <li key={`${item.edgeId}-${idx}`}>
                  <span className="inspectorMono">{item.edgeId}</span>: {item.reason}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}

export function AnalyticsPanel() {
  const analytics = useStore((state) => state.analytics);
  const backendAnalytics = useStore((state) => state.backendAnalytics);
  const backendError = useStore((state) => state.backendError);
  const execution = useStore((state) => state.execution);
  const executionSpeed = useStore((state) => state.executionSpeed);
  const executionWarning = useStore((state) => state.executionWarning);
  const nodes = useStore((state) => state.nodes);

  const runExecution = useStore((state) => state.runExecution);
  const pauseExecution = useStore((state) => state.pauseExecution);
  const resumeExecution = useStore((state) => state.resumeExecution);
  const resetExecution = useStore((state) => state.resetExecution);
  const stepForward = useStore((state) => state.stepForward);
  const setExecutionSpeed = useStore((state) => state.setExecutionSpeed);

  const parity = compareAnalytics(analytics, backendAnalytics);
  const canRun = analytics?.isDag && (analytics?.numNodes ?? 0) > 0;
  const statusLabel = getExecutionStatusLabel(execution);
  const orderLabels = formatExecutionOrder(nodes, execution.executionOrder || []);
  const totalSteps = execution.executionOrder?.length || 0;
  const progressStep =
    execution.isComplete
      ? totalSteps
      : Math.min(execution.currentStep + 1, totalSteps);

  return (
    <div className="analytics">
      <div className="analyticsSection">
        <div className="analyticsSectionTitle">Execution preview</div>

        <div className="analyticsRow">
          <div className="analyticsLabel">Status</div>
          <div className={`analyticsPill ${execution.isComplete ? 'pillOk' : execution.isRunning ? 'pillRun' : 'pillIdle'}`}>
            {statusLabel}
          </div>
        </div>

        {totalSteps > 0 && (
          <div className="analyticsRow">
            <div className="analyticsLabel">Progress</div>
            <div className="analyticsValue">
              {progressStep} / {totalSteps}
            </div>
          </div>
        )}

        <div className="execControls">
          <button
            type="button"
            className="execBtn execBtnPrimary"
            onClick={runExecution}
            disabled={!canRun || (execution.isRunning && !execution.isPaused)}
          >
            Run
          </button>
          {execution.isRunning && !execution.isPaused && (
            <button type="button" className="execBtn" onClick={pauseExecution}>
              Pause
            </button>
          )}
          {execution.isPaused && (
            <button type="button" className="execBtn" onClick={resumeExecution}>
              Resume
            </button>
          )}
          <button type="button" className="execBtn" onClick={stepForward} disabled={!canRun}>
            Step
          </button>
          <button type="button" className="execBtn" onClick={resetExecution}>
            Reset
          </button>
        </div>

        <div className="analyticsRow">
          <div className="analyticsLabel">Speed</div>
          <select
            className="execSpeedSelect"
            value={executionSpeed}
            onChange={(e) => setExecutionSpeed(e.target.value)}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        {executionWarning && <div className="analyticsError">{executionWarning}</div>}
        {!canRun && !executionWarning && (
          <div className="analyticsHint">Run disabled until the graph is a valid DAG.</div>
        )}

        {orderLabels.length > 0 && (
          <div className="execOrder">
            <div className="analyticsWarningsTitle">Execution order</div>
            <div className="execOrderChain">
              {orderLabels.map((label, idx) => (
                <span key={`${label}-${idx}`} className="execOrderItem">
                  {idx > 0 && <span className="execOrderArrow">→</span>}
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="analyticsDivider" />

      <AnalyticsBlock title="Live (frontend)" data={analytics} showInvalidEdges />

      {(analytics?.warnings || []).length > 0 && (
        <>
          <div className="analyticsDivider" />
          <div className="analyticsWarningsTitle">Live warnings</div>
          <ul className="analyticsWarnings">
            {(analytics.warnings || []).map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </>
      )}

      <div className="analyticsDivider" />

      <AnalyticsBlock title="Backend" data={backendAnalytics} />

      {backendError ? <div className="analyticsError">{backendError}</div> : null}

      {parity.match !== null && (
        <>
          <div className="analyticsDivider" />
          <div className="analyticsRow">
            <div className="analyticsLabel">Parity</div>
            <div className={`analyticsPill ${parity.match ? 'pillOk' : 'pillBad'}`}>
              {parity.match ? 'Match' : 'Mismatch'}
            </div>
          </div>
          {!parity.match && parity.mismatches.length > 0 && (
            <ul className="analyticsWarnings">
              {parity.mismatches.map((m) => (
                <li key={m.field}>
                  {m.field}: frontend {String(m.frontend)} vs backend {String(m.backend)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!backendAnalytics && !backendError && (
        <div className="analyticsHint">Analyze pipeline to compare with backend.</div>
      )}
    </div>
  );
}
