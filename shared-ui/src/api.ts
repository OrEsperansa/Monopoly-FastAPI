import type { GameState } from "./types";

async function request<T>(apiUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers;
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(error.detail ?? "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function health(apiUrl: string): Promise<void> {
  await request(apiUrl, "/api/health");
}

export async function createGame(apiUrl: string, playerNames: string[]): Promise<GameState> {
  return request<GameState>(apiUrl, "/api/game", {
    method: "POST",
    body: JSON.stringify({ player_names: playerNames })
  });
}

export async function getGame(apiUrl: string): Promise<GameState> {
  return request<GameState>(apiUrl, "/api/game");
}

export async function action(apiUrl: string, actionName: string): Promise<GameState> {
  const pathByAction: Record<string, string> = {
    roll: "/api/game/roll",
    buy: "/api/game/buy",
    end_turn: "/api/game/end-turn",
    reset: "/api/game/reset"
  };
  const result = await request<{ state: GameState }>(apiUrl, pathByAction[actionName], { method: "POST" });
  return result.state;
}
