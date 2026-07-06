export type ActionName = "roll" | "buy" | "end_turn";

export type Player = {
  id: number;
  name: string;
  money: number;
  position: number;
  is_bankrupt: boolean;
  owned_tile_ids: number[];
};

export type Tile = {
  id: number;
  name: string;
  type: "start" | "property" | "reward" | "penalty" | "surprise";
  price?: number | null;
  rent?: number | null;
  owner_id?: number | null;
  amount?: number | null;
};

export type GameState = {
  status: "not_started" | "active" | "finished";
  current_player_id: number | null;
  winner_id: number | null;
  available_actions: ActionName[];
  players: Player[];
  board: Tile[];
  last_event: string | null;
  event_log: string[];
};
