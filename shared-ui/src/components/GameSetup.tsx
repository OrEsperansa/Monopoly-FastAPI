import { useState } from "react";
import { Plus, UserRound, Users, X } from "lucide-react";

type Props = {
  busy: boolean;
  error: string | null;
  onStart: (playerNames: string[]) => void;
};

export function GameSetup({ busy, error, onStart }: Props) {
  const [names, setNames] = useState(["סיגית", "אמיר"]);

  function updateName(index: number, value: string) {
    setNames(names.map((name, currentIndex) => (currentIndex === index ? value : name)));
  }

  function addPlayer() {
    if (names.length < 4) setNames([...names, ""]);
  }

  function removePlayer() {
    if (names.length > 2) setNames(names.slice(0, -1));
  }

  return (
    <section className="center-screen start-screen">
      <div className="panel narrow setup-panel">
        <div className="brand-row">
          <span className="brand-mark"><Users size={28} /></span>
          <div>
            <span>משחק חדש</span>
            <h1>בחירת שחקנים</h1>
          </div>
        </div>
        <div className="setup-roster">
          {names.map((name, index) => (
            <label className="player-input" key={index}>
              <span>שחקן {index + 1}</span>
              <div className="input-shell">
                <UserRound size={18} />
                <input value={name} onChange={(event) => updateName(index, event.target.value)} placeholder={`שם שחקן ${index + 1}`} />
              </div>
            </label>
          ))}
        </div>
        <div className="button-row">
          <button onClick={addPlayer} disabled={names.length >= 4}>
            <Plus size={18} /> הוספה
          </button>
          <button onClick={removePlayer} disabled={names.length <= 2}>
            <X size={18} /> הסרה
          </button>
        </div>
        <button className="primary hero-action" disabled={busy} onClick={() => onStart(names)}>
          {busy ? "פותח משחק..." : "פתיחת משחק"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
