export type Checkpoint = {
  id: number;
  title: string;
  feature: string;
};

export type CheckpointResult = {
  checkpoint: number;
  cumulative: boolean;
  passed: boolean;
  passed_tests: number;
  failed_tests: number;
  duration_seconds: number;
  output: string;
};

async function runnerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/test-runner${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "מערכת הבדיקות אינה זמינה כרגע." }));
    throw new Error(body.detail ?? "מערכת הבדיקות אינה זמינה כרגע.");
  }
  return response.json() as Promise<T>;
}

export function getCheckpoints(): Promise<Checkpoint[]> {
  return runnerRequest("/api/checkpoints");
}

export function runCheckpoint(apiUrl: string, checkpoint: number, cumulative: boolean): Promise<CheckpointResult> {
  return runnerRequest(`/api/checkpoints/${checkpoint}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_url: apiUrl, cumulative })
  });
}
