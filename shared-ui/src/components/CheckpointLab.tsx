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
      .catch((error) => setRunnerError(error instanceof Error ? error.message : "לא ניתן לטעון את הבדיקות."));
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
      setRunnerError(error instanceof Error ? error.message : "לא ניתן להריץ את הבדיקה.");
    }
  }

  const isRunning = Object.values(statuses).includes("running");

  return (
    <section className="lab-page">
      <div className="lab-hero">
        <div>
          <span className="eyebrow"><FlaskConical size={15} /> בדיקות התקדמות לתלמידים</span>
          <h1>בונים את ה-Backend.<br /><em>מוכיחים שכל שלב עובד.</em></h1>
          <p>הריצו כאן את בדיקות ה-HTTP האמיתיות. קוד המקור נשאר אצלכם; מערכת הבדיקות פונה רק לכתובת ה-API שתזינו.</p>
        </div>
        <div className="lab-settings">
          <label>
            כתובת ה-API של ה-Backend
            <input value={apiUrl} onChange={(event) => onApiUrlChange(event.target.value)} placeholder="http://localhost:8000" />
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={cumulative} onChange={(event) => setCumulative(event.target.checked)} />
            <span className="toggle" />
            <span>
              <strong>הרצה מצטברת</strong>
              <small>{cumulative ? "הרצת התרגיל וכל התרגילים שקדמו לו" : "הרצת הבדיקות של התרגיל הנבחר בלבד"}</small>
            </span>
          </label>
        </div>
      </div>

      {runnerError && <p className="lab-alert"><XCircle size={18} /> {runnerError}</p>}

      <div className="lab-grid">
        <div className="checkpoint-list">
          <div className="section-title">
            <div><span>מסלול הלמידה</span><h2>8 תרגילים ממוקדים</h2></div>
            <span className="count-pill">נטענו {checkpoints.length}/8</span>
          </div>
          {checkpoints.map((checkpoint) => {
            const status = statuses[checkpoint.id] ?? "idle";
            const StatusIcon = status === "passed" ? CheckCircle2 : status === "failed" ? XCircle : status === "running" ? LoaderCircle : Circle;
            return (
              <article className={`checkpoint-card ${status}`} key={checkpoint.id}>
                <div className="checkpoint-number">{String(checkpoint.id).padStart(2, "0")}</div>
                <div className="checkpoint-copy">
                  <span>תרגיל {checkpoint.id}</span>
                  <h3>{checkpoint.title}</h3>
                  <p>{checkpoint.feature}</p>
                </div>
                <StatusIcon className={status === "running" ? "spin" : ""} size={21} />
                <button disabled={isRunning} onClick={() => execute(checkpoint.id)}>
                  {status === "running" ? <LoaderCircle className="spin" size={17} /> : status === "passed" || status === "failed" ? <RotateCcw size={17} /> : <Play size={17} />}
                  {status === "running" ? "מריץ..." : status === "idle" ? "הרצת בדיקות" : "הרצה חוזרת"}
                  <ChevronRight className="rtl-chevron" size={15} />
                </button>
              </article>
            );
          })}
        </div>

        <aside className={`result-console ${result ? (result.passed ? "success" : "failure") : "empty"}`}>
          <div className="console-header">
            <span><Terminal size={17} /> פלט הבדיקות</span>
            {result && <strong>{result.duration_seconds.toFixed(2)}s</strong>}
          </div>
          {result ? (
            <>
              <div className="result-summary">
                {result.passed ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
                <div>
                  <strong>{result.passed ? "הבדיקה עברה" : "ממשיכים לשפר"}</strong>
                  <span>תרגיל {result.checkpoint} · {result.passed_tests} עברו · {result.failed_tests} נכשלו</span>
                </div>
              </div>
              <pre>{result.output}</pre>
            </>
          ) : (
            <div className="console-placeholder">
              <Terminal size={34} />
              <strong>התוצאות יופיעו כאן</strong>
              <p>בחרו תרגיל והריצו את הבדיקות שלו. במקרה של כישלון יוצג מה בהתנהגות ה-HTTP דורש בדיקה.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
