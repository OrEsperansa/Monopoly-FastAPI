import type { CSSProperties } from "react";
import { Crown, MapPin } from "lucide-react";

import type { GameState } from "../types";
import { ActionPanel } from "./ActionPanel";
import { EventLog } from "./EventLog";
import { PlayerPanel } from "./PlayerPanel";
import { PlayerToken } from "./PlayerToken";
import { Tile } from "./Tile";

type Props = {
  game: GameState;
  busy: boolean;
  error: string | null;
  onAction: (actionName: string) => void;
  onNewGame: () => void;
};

const boardPositions: CSSProperties[] = [
  { gridColumn: 1, gridRow: 5 },
  { gridColumn: 2, gridRow: 5 },
  { gridColumn: 3, gridRow: 5 },
  { gridColumn: 4, gridRow: 5 },
  { gridColumn: 5, gridRow: 5 },
  { gridColumn: 5, gridRow: 4 },
  { gridColumn: 5, gridRow: 3 },
  { gridColumn: 5, gridRow: 2 },
  { gridColumn: 5, gridRow: 1 },
  { gridColumn: 4, gridRow: 1 },
  { gridColumn: 3, gridRow: 1 },
  { gridColumn: 2, gridRow: 1 },
  { gridColumn: 1, gridRow: 1 },
  { gridColumn: 1, gridRow: 2 },
  { gridColumn: 1, gridRow: 3 },
  { gridColumn: 1, gridRow: 4 }
];

export function GameBoard({ game, busy, error, onAction, onNewGame }: Props) {
  const currentPlayer = game.players.find((player) => player.id === game.current_player_id);
  const winner = game.players.find((player) => player.id === game.winner_id);

  return (
    <section className="game-layout">
      <aside className="side-panel game-dashboard">
        <div className="dashboard-header">
          <span>Property Empire</span>
          <h1>Classroom Board</h1>
        </div>
        <PlayerPanel game={game} />
        <ActionPanel actions={game.available_actions} busy={busy} onAction={onAction} onNewGame={onNewGame} />
        {error && <p className="error">{error}</p>}
      </aside>

      <div className="board-wrap">
        <div className={`board ${game.status === "finished" ? "board-finished" : ""}`}>
          <div className="board-center">
            <span className="board-kicker">Property Empire</span>
            <strong>{winner ? `${winner.name} wins` : currentPlayer ? `${currentPlayer.name}'s turn` : "Ready"}</strong>
            <p>{game.last_event ?? "Roll the dice to begin building your classroom empire."}</p>
            <div className="center-stats">
              <span>
                <MapPin size={15} /> {game.board.length} spaces
              </span>
              <span>
                <Crown size={15} /> {game.status}
              </span>
            </div>
          </div>
          {game.board.map((tile) => {
            const owner = game.players.find((player) => player.id === tile.owner_id);
            const occupants = game.players.filter((player) => player.position === tile.id);
            return (
              <Tile
                key={tile.id}
                tile={tile}
                owner={owner}
                occupied={occupants.length > 0}
                style={boardPositions[tile.id]}
              >
                {occupants.map((player) => (
                  <PlayerToken key={player.id} player={player} active={player.id === game.current_player_id} />
                ))}
              </Tile>
            );
          })}
        </div>
      </div>

      <EventLog events={game.event_log} />
    </section>
  );
}
