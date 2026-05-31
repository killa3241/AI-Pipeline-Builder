import { useStore } from '../store';
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

function AnalysisStatusBadge({ valid }) {
  return (
    <div
      className={`analysisStatusBadge ${valid ? 'analysisStatusBadgeValid' : 'analysisStatusBadgeInvalid'}`}
      role="status"
      aria-label={valid ? 'Pipeline valid' : 'Pipeline invalid'}
    >
      {valid ? 'Valid' : 'Invalid'}
    </div>
  );
}

function formatIssuesFound(data) {
  const issues = [];

  if (data.cycleDetected) {
    issues.push('Cycle detected in workflow.');
  }
  if ((data.isolatedNodes ?? 0) > 0) {
    const count = data.isolatedNodes;
    issues.push(
      `${count} isolated node${count === 1 ? '' : 's'} detected`
    );
  }
  if ((data.disconnectedNodes ?? 0) > 0) {
    const count = data.disconnectedNodes;
    issues.push(
      `${count} disconnected component${count === 1 ? '' : 's'} detected`
    );
  }

  return issues;
}

function AnalysisSourceBanner({ source }) {
  if (source === 'backend') {
    return (
      <div className="analysisSourceBanner analysisSourceBannerVerified">
        ✓ Backend Verified
      </div>
    );
  }

  if (source === 'frontend') {
    return (
      <div className="analysisSourceBanner analysisSourceBannerFallback">
        <div className="analysisSourceBannerTitle">⚠ Backend Unavailable</div>
        <div className="analysisSourceBannerHint">
          Showing local workflow analysis.
        </div>
      </div>
    );
  }

  return null;
}

function FinalAnalysisBlock({ data, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="analyticsSection">
        <div className="analyticsSectionTitle">Final Analysis</div>
        <div className="analysisEmptyState analysisLoadingState">
          <div className="analyticsHint">Analyzing pipeline...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analyticsSection">
        <div className="analyticsSectionTitle">Final Analysis</div>
        <AnalysisStatusBadge valid={false} />
        <div className="analyticsError">
          <div className="analyticsErrorTitle">Analysis Failed</div>
          <div className="analyticsErrorMessage">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analyticsSection">
        <div className="analyticsSectionTitle">Final Analysis</div>
        <div className="analysisEmptyState">
          <div className="analyticsHint">No analysis available.</div>
          <div className="analysisEmptyHint">
            Click Analyze Pipeline to inspect workflow structure.
          </div>
        </div>
      </div>
    );
  }

  const pipelineValid = data.pipelineValid ?? false;
  const issues = formatIssuesFound(data);

  return (
    <div className="analyticsSection analyticsFinalSection">
      <div className="analyticsSectionTitle">Final Analysis</div>

      <div className="analysisReportHero">
        <AnalysisStatusBadge valid={pipelineValid} />
      </div>

      <AnalysisSourceBanner source={data.source} />

      <div className="analyticsIssuesBlock">
        <div className="analyticsWarningsTitle">Issues Found</div>
        {issues.length > 0 ? (
          <ul className="analyticsIssuesList">
            {issues.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : (
          <div className="analyticsIssuesClear">No issues detected.</div>
        )}
      </div>

      <div className="analysisMetricsBlock">
        <MetricRow label="Nodes" value={data.numNodes ?? 0} />
        <MetricRow label="Edges" value={data.numEdges ?? 0} />
        <MetricRow
          label="DAG"
          value={data.isDag ? 'Valid' : 'Invalid'}
          pill={data.isDag}
        />
        <MetricRow
          label="Cycle Detected"
          value={data.cycleDetected ? 'Yes' : 'No'}
          pill={!data.cycleDetected}
        />
        <MetricRow label="Isolated Nodes" value={data.isolatedNodes ?? 0} />
        <MetricRow label="Disconnected Nodes" value={data.disconnectedNodes ?? 0} />
      </div>
    </div>
  );
}

export function AnalyticsPanel() {
  const execution = useStore((state) => state.execution);
  const executionSpeed = useStore((state) => state.executionSpeed);
  const executionWarning = useStore((state) => state.executionWarning);
  const nodes = useStore((state) => state.nodes);
  const analytics = useStore((state) => state.analytics);

  const runExecution = useStore((state) => state.runExecution);
  const pauseExecution = useStore((state) => state.pauseExecution);
  const resumeExecution = useStore((state) => state.resumeExecution);
  const resetExecution = useStore((state) => state.resetExecution);
  const stepForward = useStore((state) => state.stepForward);
  const setExecutionSpeed = useStore((state) => state.setExecutionSpeed);

  const backendAnalytics = useStore((state) => state.backendAnalytics);
  const backendError = useStore((state) => state.backendError);
  const isSubmitting = useStore((state) => state.isSubmitting);

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

      <FinalAnalysisBlock
        data={backendAnalytics}
        isLoading={isSubmitting}
        error={backendError}
      />
    </div>
  );
}
