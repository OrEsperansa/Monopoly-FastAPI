import type { Player } from "../types";

type Props = {
  player: Player;
  active?: boolean;
  selected?: boolean;
};

export function PlayerToken({ player, active = false, selected = false }: Props) {
  return (
    <span className={`token token-${player.id} ${active ? "token-active" : ""} ${selected ? "token-selected" : ""}`} title={player.name}>
      {player.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
