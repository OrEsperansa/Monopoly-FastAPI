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
        <span>Available actions</span>
        <strong>{actions.length}</strong>
      </div>
      <div className="actions">
        <button className="action-button primary" disabled={busy || !actions.includes("roll")} onClick={() => onAction("roll")} title="Roll dice">
          <Dice5 size={19} /> Roll
        </button>
        <button className="action-button buy" disabled={busy || !actions.includes("buy")} onClick={() => onAction("buy")} title="Buy property">
          <Banknote size={19} /> Buy
        </button>
        <button
          className="action-button"
          disabled={busy || !actions.includes("end_turn")}
          onClick={() => onAction("end_turn")}
          title="End turn"
        >
          <StepForward size={19} /> End Turn
        </button>
        <button className="action-button utility" disabled={busy} onClick={() => onAction("reset")} title="Reset API game">
          <RotateCcw size={18} /> Reset
        </button>
        <button className="action-button utility" disabled={busy} onClick={onNewGame} title="Return to setup">
          <Settings size={18} /> Setup
        </button>
      </div>
    </section>
  );
}
