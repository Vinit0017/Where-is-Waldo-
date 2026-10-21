import { useCallback, useState } from "react";
import "./App.css";
import { api } from "./api/api";
import ImageSelect from "./components/ImageSelect";
import Game from "./components/Game";

const KEY = "waldo.session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession); // { gameId, imageId }
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  async function startNew(imageId) {
    setError(null);
    setStarting(true);
    try {
      const game = await api.createGame(imageId);
      await api.startGame(game.gameId);
      const s = { gameId: game.gameId, imageId };
      localStorage.setItem(KEY, JSON.stringify(s));
      setSession(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  }

 const exit = useCallback(() =>{
    localStorage.removeItem(KEY);
    setSession(null);
 }, []);

  return (
    <div className="app">
      <h1>Where's Waldo?</h1>
      {error && <p className="msg bad">{error}</p>}
      {session ? (
        <Game key={session.gameId} {...session} onExit={exit} />
      ) : (
        <ImageSelect onPick={startNew} disabled={starting} />
      )}
    </div>
  );
}