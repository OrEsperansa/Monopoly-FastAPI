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
          <strong>Property Empire</strong>
          <span>Backend Lab</span>
        </div>
      </div>
      <nav className="view-switcher" aria-label="Workspace">
        <button className={view === "game" ? "active" : ""} onClick={() => onViewChange("game")}>
          <Gamepad2 size={17} /> Game
        </button>
        <button className={view === "tests" ? "active" : ""} onClick={() => onViewChange("tests")}>
          <FlaskConical size={17} /> Test lab
        </button>
      </nav>
      <div className={`connection-chip ${connected ? "online" : ""}`} title={apiUrl}>
        <Radio size={14} />
        <span>{connected ? "API connected" : "API not checked"}</span>
        <code>{apiUrl.replace(/^https?:\/\//, "")}</code>
      </div>
    </header>
  );
}
