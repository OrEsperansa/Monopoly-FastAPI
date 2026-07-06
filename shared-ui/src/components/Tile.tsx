import type React from "react";
import type { CSSProperties } from "react";
import { Gift, HelpCircle, Landmark, Receipt, Sparkles } from "lucide-react";

import type { Player, Tile as TileType } from "../types";

type Props = {
  tile: TileType;
  owner?: Player;
  occupied?: boolean;
  style?: CSSProperties;
  children: React.ReactNode;
};

const iconByType = {
  start: Sparkles,
  property: Landmark,
  reward: Gift,
  penalty: Receipt,
  surprise: HelpCircle
};

function formatType(type: TileType["type"]) {
  return type.replace("_", " ");
}

export function Tile({ tile, owner, occupied = false, style, children }: Props) {
  const Icon = iconByType[tile.type];
  const isCorner = tile.id === 0 || tile.id === 4 || tile.id === 8 || tile.id === 12;

  return (
    <div className={`tile tile-${tile.type} ${isCorner ? "tile-corner" : ""} ${occupied ? "tile-occupied" : ""}`} style={style}>
      <div className="tile-band" />
      <div className="tile-topline">
        <span className="tile-number">{tile.id}</span>
        <Icon size={15} />
      </div>
      <strong className="tile-name">{tile.name}</strong>
      <span className="tile-type-label">{formatType(tile.type)}</span>
      {tile.price && <span className="tile-money">Buy ${tile.price}</span>}
      {tile.rent && <span className="tile-meta">Rent ${tile.rent}</span>}
      {tile.amount && <span className="tile-money">${tile.amount}</span>}
      {owner && <span className={`owner owner-${owner.id}`}>{owner.name}</span>}
      <div className="tokens">{children}</div>
    </div>
  );
}
