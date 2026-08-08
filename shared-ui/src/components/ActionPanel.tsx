import { Banknote, Dice5, RotateCcw, Settings, StepForward } from "lucide-react";

import type { ActionName } from "../types";

type Props = {
  actions: ActionName[];
  busy: boolean;
  onAction: (actionName: string) => void;
  onNewGame: () => void;
};

export function ActionPanel({ actions, busy, onAction, onNewGame }: Props) {
  return (
    <section className="action-panel">
      <div className="panel-heading">
        <span>פעולות זמינות</span>
        <strong>{actions.length}</strong>
      </div>
      <div className="actions">
        <button className="action-button primary" disabled={busy || !actions.includes("roll")} onClick={() => onAction("roll")} title="זריקת קובייה">
          <Dice5 size={19} /> זריקת קובייה
        </button>
        <button className="action-button buy" disabled={busy || !actions.includes("buy")} onClick={() => onAction("buy")} title="רכישת נכס">
          <Banknote size={19} /> רכישה
        </button>
        <button
          className="action-button"
          disabled={busy || !actions.includes("end_turn")}
          onClick={() => onAction("end_turn")}
          title="סיום התור"
        >
          <StepForward size={19} /> סיום תור
        </button>
        <button className="action-button utility" disabled={busy} onClick={() => onAction("reset")} title="איפוס המשחק ב-API">
          <RotateCcw size={18} /> איפוס
        </button>
        <button className="action-button utility" disabled={busy} onClick={onNewGame} title="חזרה להגדרת המשחק">
          <Settings size={18} /> הגדרה מחדש
        </button>
      </div>
    </section>
  );
}
