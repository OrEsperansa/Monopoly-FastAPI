import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Circle, FlaskConical, LoaderCircle, Play, RotateCcw, Terminal, XCircle } from "lucide-react";

import { getCheckpoints, runCheckpoint } from "../testApi";
import type { Checkpoint, CheckpointResult } from "../testApi";

type Props = {
  apiUrl: string;
  onApiUrlChange: (value: string) => void;
};

type Status = "idle" | "running" | "passed" | "failed";

export function CheckpointLab({ apiUrl, onApiUrlChange }: Props) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});
  const [result, setResult] = useState<CheckpointResult | null>(null);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [cumulative, setCumulative] = useState(false);

  useEffect(() => {
    getCheckpoints()
      .then(setCheckpoints)
      .catch((error) => setRunnerError(error instanceof Error ? error.message : "Could not load checkpoints."));
  }, []);

  async function execute(checkpoint: number) {
    setStatuses((current) => ({ ...current, [checkpoint]: "running" }));
    setRunnerError(null);
    setResult(null);
    try {
      const nextResult = await runCheckpoint(apiUrl, checkpoint, cumulative);
      setResult(nextResult);
      setStatuses((current) => ({ ...current, [checkpoint]: nextResult.passed ? "passed" : "failed" }));
    } catch (error) {
      setStatuses((current) => ({ ...current, [checkpoint]: "failed" }));
      setRunnerError(error instanceof Error ? error.message : "Checkpoint could not run.");
    }
  }

  const isRunning = Object.values(statuses).includes("running");

  return (
    <section className="lab-page">
      <div className="lab-hero">
        <div>
          <span className="eyebrow"><FlaskConical size={15} /> Student checkpoint runner</span>
          <h1>Build the backend.<br /><em>Prove every feature.</em></h1>
          <p>Run the real black-box HTTP tests here. Your source code stays private; the runner only talks to the API URL below.</p>
        </div>
        <div className="lab-settings">
          <label>
            Backend API URL
            <input value={apiUrl} onChange={(event) => onApiUrlChange(event.target.value)} placeholder="http://localhost:8000" />
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={cumulative} onChange={(event) => setCumulative(event.target.checked)} />
            <span className="toggle" />
            <span>
              <strong>Cumulative run</strong>
              <small>{cumulative ? "Runs this exercise and every prerequisite" : "Runs only this exercise's feature tests"}</small>
            </span>
          </label>
        </div>
      </div>

      {runnerError && <p className="lab-alert"><XCircle size={18} /> {runnerError}</p>}

      <div className="lab-grid">
        <div className="checkpoint-list">
          <div className="section-title">
            <div><span>Learning path</span><h2>8 focused exercises</h2></div>
            <span className="count-pill">{checkpoints.length}/8 loaded</span>
          </div>
          {checkpoints.map((checkpoint) => {
            const status = statuses[checkpoint.id] ?? "idle";
            const StatusIcon = status === "passed" ? CheckCircle2 : status === "failed" ? XCircle : status === "running" ? LoaderCircle : Circle;
            return (
              <article className={`checkpoint-card ${status}`} key={checkpoint.id}>
                <div className="checkpoint-number">{String(checkpoint.id).padStart(2, "0")}</div>
                <div className="checkpoint-copy">
                  <span>Exercise {checkpoint.id}</span>
                  <h3>{checkpoint.title}</h3>
                  <p>{checkpoint.feature}</p>
                </div>
                <StatusIcon className={status === "running" ? "spin" : ""} size={21} />
                <button disabled={isRunning} onClick={() => execute(checkpoint.id)}>
                  {status === "running" ? <LoaderCircle className="spin" size={17} /> : status === "passed" || status === "failed" ? <RotateCcw size={17} /> : <Play size={17} />}
                  {status === "running" ? "Running" : status === "idle" ? "Run tests" : "Run again"}
                  <ChevronRight size={15} />
                </button>
              </article>
            );
          })}
        </div>

        <aside className={`result-console ${result ? (result.passed ? "success" : "failure") : "empty"}`}>
          <div className="console-header">
            <span><Terminal size={17} /> Test output</span>
            {result && <strong>{result.duration_seconds.toFixed(2)}s</strong>}
          </div>
          {result ? (
            <>
              <div className="result-summary">
                {result.passed ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
                <div>
                  <strong>{result.passed ? "Checkpoint passed" : "Keep building"}</strong>
                  <span>Exercise {result.checkpoint} · {result.passed_tests} passed · {result.failed_tests} failed</span>
                </div>
              </div>
              <pre>{result.output}</pre>
            </>
          ) : (
            <div className="console-placeholder">
              <Terminal size={34} />
              <strong>Results appear here</strong>
              <p>Choose an exercise and run its tests. Failures include the exact HTTP behavior to investigate.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
