import { CircleDollarSign, MapPin, Trophy } from "lucide-react";

import type { GameState } from "../types";

type Props = {
  game: GameState;
};

export function PlayerPanel({ game }: Props) {
  const winner = game.players.find((player) => player.id === game.winner_id);

  return (
    <section className="players-panel">
      <div className="panel-heading">
        <span>Players</span>
        <strong>{game.players.length}</strong>
      </div>
      <div className="player-list">
        {game.players.map((player) => (
          <article
            className={`player-card player-${player.id} ${game.current_player_id === player.id ? "current" : ""} ${
              player.is_bankrupt ? "bankrupt" : ""
            }`}
            key={player.id}
          >
            <span className={`token token-${player.id} ${game.current_player_id === player.id ? "token-active" : ""}`}>
              {player.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="player-info">
              <strong>{player.name}</strong>
              <small>{player.is_bankrupt ? "Bankrupt" : game.current_player_id === player.id ? "Taking turn" : "Waiting"}</small>
            </div>
            <div className="player-stats">
              <span>
                <CircleDollarSign size={14} /> ${player.money}
              </span>
              <span>
                <MapPin size={14} /> {player.position}
              </span>
              <span>{player.owned_tile_ids.length} deeds</span>
            </div>
          </article>
        ))}
      </div>
      {winner && (
        <div className="winner">
          <Trophy size={18} /> Winner: {winner.name}
        </div>
      )}
    </section>
  );
}
