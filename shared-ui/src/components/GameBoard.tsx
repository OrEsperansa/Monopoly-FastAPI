import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Crown, MapPin, MousePointerClick } from "lucide-react";

import type { GameState, Player, Tile as BoardTile } from "../types";
import { translateGameEvent } from "../translateGameEvent";
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

function describeTile(tile: BoardTile, owner?: Player) {
  if (tile.type === "property") {
    return owner ? `בבעלות ${owner.name}. דמי השכירות הם ${tile.rent}.` : `הנכס זמין לרכישה במחיר ${tile.price}.`;
  }
  if (tile.type === "reward") return `משבצת פרס: קבלת ${tile.amount}.`;
  if (tile.type === "penalty") return `משבצת תשלום: תשלום ${tile.amount}.`;
  if (tile.type === "surprise") return "משבצת הפתעה: השרת בוחר השפעה אקראית.";
  return "מעבר או נחיתה כאן מעניקים את פרס נקודת היציאה.";
}

const statusLabels = { not_started: "טרם התחיל", active: "פעיל", finished: "הסתיים" };

export function GameBoard({ game, busy, error, onAction, onNewGame }: Props) {
  const currentPlayer = game.players.find((player) => player.id === game.current_player_id);
  const winner = game.players.find((player) => player.id === game.winner_id);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(currentPlayer?.position ?? null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(currentPlayer?.id ?? null);

  useEffect(() => {
    if (currentPlayer) {
      setSelectedPlayerId(currentPlayer.id);
      setSelectedTileId(currentPlayer.position);
    }
  }, [currentPlayer?.id, currentPlayer?.position]);

  const selectedTile = game.board.find((tile) => tile.id === selectedTileId) ?? null;
  const selectedTileOwner = selectedTile ? game.players.find((player) => player.id === selectedTile.owner_id) : undefined;
  const selectedPlayer = game.players.find((player) => player.id === selectedPlayerId) ?? null;

  function selectTile(tileId: number) {
    const occupant = game.players.find((player) => player.position === tileId);
    setSelectedTileId(tileId);
    if (occupant) setSelectedPlayerId(occupant.id);
  }

  function selectPlayer(playerId: number) {
    const player = game.players.find((candidate) => candidate.id === playerId);
    setSelectedPlayerId(playerId);
    if (player) setSelectedTileId(player.position);
  }

  return (
    <section className="game-layout">
      <aside className="side-panel game-dashboard">
        <div className="dashboard-header">
          <span>Sigit Empire</span>
          <h1>מסע בעולם הערבי</h1>
        </div>
        <PlayerPanel game={game} selectedPlayerId={selectedPlayerId} onSelectPlayer={selectPlayer} />
        <ActionPanel actions={game.available_actions} busy={busy} onAction={onAction} onNewGame={onNewGame} />
        {error && <p className="error">{error}</p>}
      </aside>

      <div className="board-wrap">
        <div className={`board ${game.status === "finished" ? "board-finished" : ""}`}>
          <div className="board-center">
            <span className="board-kicker">Sigit Empire</span>
            <strong>{winner ? `${winner.name} ניצח/ה` : selectedPlayer ? selectedPlayer.name : currentPlayer ? `התור של ${currentPlayer.name}` : "מוכנים"}</strong>
            {selectedTile ? (
              <div className="selection-card">
                <span>
                  <MousePointerClick size={15} /> משבצת נבחרת {selectedTile.id}
                </span>
                <h2>{selectedTile.name}</h2>
                <p>{describeTile(selectedTile, selectedTileOwner)}</p>
              </div>
            ) : (
              <p>{game.last_event ? translateGameEvent(game.last_event) : "זרקו את הקובייה והתחילו לבנות את האימפריה של סיגית."}</p>
            )}
            <div className="center-stats">
              <span>
                <MapPin size={15} /> {selectedPlayer ? `משבצת ${selectedPlayer.position}` : `${game.board.length} משבצות`}
              </span>
              <span>
                <Crown size={15} /> {statusLabels[game.status]}
              </span>
            </div>
          </div>
          {game.board.map((tile) => {
            const owner = game.players.find((player) => player.id === tile.owner_id);
            const occupants = game.players.filter((player) => player.position === tile.id);
            const selectedByPlayer = selectedPlayer?.position === tile.id || selectedPlayer?.owned_tile_ids.includes(tile.id);
            return (
              <Tile
                key={tile.id}
                tile={tile}
                owner={owner}
                occupied={occupants.length > 0}
                selected={selectedTileId === tile.id}
                related={Boolean(selectedByPlayer)}
                style={boardPositions[tile.id]}
                onSelect={() => selectTile(tile.id)}
              >
                {occupants.map((player) => (
                  <PlayerToken key={player.id} player={player} active={player.id === game.current_player_id} selected={player.id === selectedPlayerId} />
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
