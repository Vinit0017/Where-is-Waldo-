import { useEffect, useState } from "react";
import { api, formatTime } from "../api/api";

function Leaderboard({ imageId, highlightId }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api.scores(imageId).then((d) => setRows(d.scores)).catch(() => setRows([]));
  }, [imageId]);

  if (!rows) return <p>Loading leaderboard...</p>;
  if (rows.length === 0) return <p>No scores yet.</p>;

  return (
    <ol className="leaderboard">
      {rows.map((s) => (
        <li key={s.rank} className={s.rank === highlightId ? "me" : ""}>
          <span>#{s.rank}</span>
          <span>{s.playerName}</span>
          <span>{formatTime(s.durationMs)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Finish({ gameId, imageId, durationMs, onDone }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null); // { rank } or { already: true }
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.saveScore(gameId, name.trim());
      setResult({ rank: res.rank });
    } catch (err) {
      if (err.type === "SCORE_ALREADY_SUBMITTED") setResult({ already: true });
      else setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay">
      <div className="dialog">
        <h2>All found!</h2>
        <p>Your time: <strong>{formatTime(durationMs)}</strong></p>

        {!result ? (
          <form onSubmit={submit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              autoFocus
            />
            <button disabled={saving || !name.trim()}>Save score</button>
            {error && <p className="msg bad">{error}</p>}
          </form>
        ) : (
          <>
            {result.rank && <p>You ranked <strong>#{result.rank}</strong>.</p>}
            {result.already && <p>Score already saved.</p>}
            <Leaderboard imageId={imageId} highlightId={result.rank} />
          </>
        )}

        <button onClick={onDone}>{result ? "Play again" : "Skip"}</button>
      </div>
    </div>
  );
}