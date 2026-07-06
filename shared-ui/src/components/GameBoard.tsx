import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Crown, MapPin, MousePointerClick } from "lucide-react";

import type { GameState, Player, Tile as BoardTile } from "../types";
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
    return owner ? `Owned by ${owner.name}. Rent is $${tile.rent}.` : `Available to buy for $${tile.price}.`;
  }
  if (tile.type === "reward") return `Reward space: receive $${tile.amount}.`;
  if (tile.type === "penalty") return `Penalty space: pay $${tile.amount}.`;
  if (tile.type === "surprise") return "Surprise space: the backend chooses one random effect.";
  return "Passing or landing here pays the Start reward.";
}

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
          <span>Property Empire</span>
          <h1>Classroom Board</h1>
        </div>
        <PlayerPanel game={game} selectedPlayerId={selectedPlayerId} onSelectPlayer={selectPlayer} />
        <ActionPanel actions={game.available_actions} busy={busy} onAction={onAction} onNewGame={onNewGame} />
        {error && <p className="error">{error}</p>}
      </aside>

      <div className="board-wrap">
        <div className={`board ${game.status === "finished" ? "board-finished" : ""}`}>
          <div className="board-center">
            <span className="board-kicker">Property Empire</span>
            <strong>{winner ? `${winner.name} wins` : selectedPlayer ? `${selectedPlayer.name}` : currentPlayer ? `${currentPlayer.name}'s turn` : "Ready"}</strong>
            {selectedTile ? (
              <div className="selection-card">
                <span>
                  <MousePointerClick size={15} /> Selected space {selectedTile.id}
                </span>
                <h2>{selectedTile.name}</h2>
                <p>{describeTile(selectedTile, selectedTileOwner)}</p>
              </div>
            ) : (
              <p>{game.last_event ?? "Roll the dice to begin building your classroom empire."}</p>
            )}
            <div className="center-stats">
              <span>
                <MapPin size={15} /> {selectedPlayer ? `Space ${selectedPlayer.position}` : `${game.board.length} spaces`}
              </span>
              <span>
                <Crown size={15} /> {game.status}
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
