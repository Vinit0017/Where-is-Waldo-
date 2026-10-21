const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8070/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.message || "Request failed");
    err.status = res.status;
    err.type = data?.error?.type || data?.error?.code;
    throw err;
  }
  return data;
}

const post = (path, body) =>
  request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const api = {
  images: () => request("/images"),
  image: (id) => request(`/images/${id}`),
  createGame: (imageId) => post("/games", { imageId }),
  startGame: (gameId) => post(`/games/${gameId}/start`),
  getGame: (gameId) => request(`/games/${gameId}`),
  guess: (gameId, body) => post(`/games/${gameId}/guess`, body),
  saveScore: (gameId, playerName) => post(`/games/${gameId}/score`, { playerName }),
  scores: (imageId) => request(`/games/images/${imageId}/scores`),
};

export function formatTime(ms) {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const t = Math.floor((total % 1000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${t}`;
}