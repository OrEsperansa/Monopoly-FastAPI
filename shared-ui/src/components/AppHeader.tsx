import { FlaskConical, Gamepad2, Landmark, Radio } from "lucide-react";

type Props = {
  apiUrl: string;
  connected: boolean;
  view: "game" | "tests";
  onViewChange: (view: "game" | "tests") => void;
};

export function AppHeader({ apiUrl, connected, view, onViewChange }: Props) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo"><Landmark size={21} /></span>
        <div>
          <strong>Sigit Empire</strong>
          <span>מעבדת Backend</span>
        </div>
      </div>
      <nav className="view-switcher" aria-label="סביבת עבודה">
        <button className={view === "game" ? "active" : ""} onClick={() => onViewChange("game")}>
          <Gamepad2 size={17} /> משחק
        </button>
        <button className={view === "tests" ? "active" : ""} onClick={() => onViewChange("tests")}>
          <FlaskConical size={17} /> מעבדת בדיקות
        </button>
      </nav>
      <div className={`connection-chip ${connected ? "online" : ""}`} title={apiUrl}>
        <Radio size={14} />
        <span>{connected ? "ה-API מחובר" : "ה-API טרם נבדק"}</span>
        <code>{apiUrl.replace(/^https?:\/\//, "")}</code>
      </div>
    </header>
  );
}
