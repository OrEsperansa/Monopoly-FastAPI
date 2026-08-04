import { useEffect, useState } from "react";

import { action, createGame, getGame, health } from "./api";
import { ApiConnector } from "./components/ApiConnector";
import { AppHeader } from "./components/AppHeader";
import { CheckpointLab } from "./components/CheckpointLab";
import { GameBoard } from "./components/GameBoard";
import { GameSetup } from "./components/GameSetup";
import type { GameState } from "./types";

const storedUrl = localStorage.getItem("sigit-empire-api-url") ?? localStorage.getItem("property-empire-api-url") ?? "http://localhost:8000";

export function App() {
  const [apiUrl, setApiUrl] = useState(storedUrl);
  const [connected, setConnected] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"game" | "tests">("game");

  useEffect(() => {
    localStorage.setItem("sigit-empire-api-url", apiUrl);
  }, [apiUrl]);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      await health(apiUrl);
      setConnected(true);
      try {
        setGame(await getGame(apiUrl));
      } catch {
        setGame(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "לא ניתן להתחבר ל-API.");
    } finally {
      setBusy(false);
    }
  }

  async function startGame(playerNames: string[]) {
    await run(() => createGame(apiUrl, playerNames));
  }

  async function sendAction(actionName: string) {
    await run(() => action(apiUrl, actionName));
  }

  async function run(operation: () => Promise<GameState>) {
    setBusy(true);
    setError(null);
    try {
      setGame(await operation());
    } catch (err) {
      setError(err instanceof Error ? err.message : "הבקשה נכשלה.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <AppHeader apiUrl={apiUrl} connected={connected} view={view} onViewChange={setView} />
      {view === "tests" ? (
        <CheckpointLab apiUrl={apiUrl} onApiUrlChange={setApiUrl} />
      ) : (
        <div className="game-workspace">
          {!connected && (
            <ApiConnector apiUrl={apiUrl} busy={busy} error={error} onApiUrlChange={setApiUrl} onConnect={connect} />
          )}
          {connected && !game && <GameSetup busy={busy} error={error} onStart={startGame} />}
          {connected && game && (
            <GameBoard game={game} busy={busy} error={error} onAction={sendAction} onNewGame={() => setGame(null)} />
          )}
        </div>
      )}
    </main>
  );
}
