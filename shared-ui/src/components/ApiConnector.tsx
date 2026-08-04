import { PlugZap, Server } from "lucide-react";

type Props = {
  apiUrl: string;
  busy: boolean;
  error: string | null;
  onApiUrlChange: (value: string) => void;
  onConnect: () => void;
};

export function ApiConnector({ apiUrl, busy, error, onApiUrlChange, onConnect }: Props) {
  return (
    <section className="center-screen start-screen">
      <div className="panel narrow welcome-panel">
        <div className="brand-row">
          <span className="brand-mark"><PlugZap size={28} /></span>
          <div>
            <span>ממשק כיתתי משותף</span>
            <h1>Sigit Empire</h1>
          </div>
        </div>
        <p className="screen-copy">התחברו לכל שרת FastAPI של תלמיד שמממש את חוזה המשחק.</p>
        <label>
          כתובת ה-API
          <div className="input-shell">
            <Server size={18} />
            <input value={apiUrl} onChange={(event) => onApiUrlChange(event.target.value)} placeholder="http://localhost:8000" />
          </div>
        </label>
        <button className="primary hero-action" disabled={busy} onClick={onConnect}>
          {busy ? "בודק את ה-API..." : "התחברות"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
