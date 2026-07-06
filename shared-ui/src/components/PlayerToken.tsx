import type { Player } from "../types";

type Props = {
  player: Player;
  active?: boolean;
};

export function PlayerToken({ player, active = false }: Props) {
  return (
    <span className={`token token-${player.id} ${active ? "token-active" : ""}`} title={player.name}>
      {player.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
