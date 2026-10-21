import { useEffect, useState } from "react";
import { api, formatTime } from "../api/api";
import Finish from "./Finish";

export default function Game({ gameId, imageId, onExit }) {
  const [image, setImage] = useState(null);
  const [found, setFound] = useState([]); // [{ characterId, name, box }]
  const [timing, setTiming] = useState(null); // { startedAt, offset }
  const [finished, setFinished] = useState(null); // { durationMs }
  const [target, setTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(null);

  // Load image metadata + restore game state (works after a page refresh)
  useEffect(() => {
    Promise.all([api.image(imageId), api.getGame(gameId)])
      .then(([img, game]) => {
        setImage(img);
        setFound(game.found ?? []);
        setNow(Date.now());
        setTiming({
          startedAt: new Date(game.startedAt).getTime(),
          offset: Date.now() - new Date(game.serverNow).getTime(),
        });
        if(game.status === "FINISHED"){
            setFinished({durationMs: game.durationMs});
        }
      })
      .catch((e) => e.status === 404? onExit(): setError(e.message));
  }, [gameId, imageId, onExit]);

  useEffect(() => {
    if (!timing || finished) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [timing, finished]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setTarget(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (error) return <p className="msg bad">{error}</p>;
  if (!image || !timing) return <p>Loading game...</p>;

  const foundIds = found.map((f) => f.characterId);
  const remaining = image.characters.filter((c) => !foundIds.includes(c.id));
  const boxW = image.targetBoxWidth;
  const boxH = boxW * (image.naturalWidth / image.naturalHeight);
  const elapsed = finished ? finished.durationMs : now - timing.offset - timing.startedAt;

  function handleClick(e) {
    if (!loaded || finished || busy) return;
    if (target) return setTarget(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    setTarget({ x, y });
  }

  async function pick(character) {
    const point = target;
    setTarget(null);
    setBusy(true);
    try {
      const res = await api.guess(gameId, { characterId: character.id, x: point.x, y: point.y });
      if (!res.correct) {
        setMessage({ text: res.message || `That's not ${character.name}.`, kind: "bad" });
        return;
      }
      setFound((prev) =>
        prev.some((f) => f.characterId === character.id)
          ? prev
          : [...prev, { characterId: character.id, name: character.name, box: res.box }]
      );
      setMessage({ text: `You found ${character.name}!`, kind: "good" });
      if (res.finished) setFinished({ durationMs: res.durationMs });
    } catch (e) {
      setMessage({ text: e.message, kind: "bad" });
    } finally {
      setBusy(false);
    }
  }

  const menuOnLeft = target && target.x > 0.7;

  return (
    <div>
      <header className="bar">
        <div>
          <strong>Find: </strong>
          {image.characters.map((c) => (
            <span key={c.id} className={foundIds.includes(c.id) ? "chip done" : "chip"}>
              {c.iconUrl && <img src={c.iconUrl} alt="" />}
              {c.name}
            </span>
          ))}
        </div>
        <span className="timer">{formatTime(elapsed)}</span>
        <button onClick={onExit}>Quit</button>
      </header>

      {message && <div className={`msg ${message.kind}`}>{message.text}</div>}

      <div className="board" onClick={handleClick}>
        {!loaded && <p>Loading photo...</p>}
        <img
          src={image.url}
          alt={image.title}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setError("Couldn't load the photo. Check the image url.")}
        />

        {loaded &&
          found.map((f) => (
            <div
              key={f.characterId}
              title={f.name}
              className="found-ring"
              style={{
                left: `${((f.box.xMin + f.box.xMax) / 2) * 100}%`,
                top: `${((f.box.yMin + f.box.yMax) / 2) * 100}%`,
                width: `${(f.box.xMax - f.box.xMin) * 100}%`,
                height: `${(f.box.yMax - f.box.yMin) * 100}%`,
              }}
            />
          ))}

        {loaded && target && (
          <div
            className="target"
            onClick={(e) => e.stopPropagation()}
            style={{
              left: `${target.x * 100}%`,
              top: `${target.y * 100}%`,
              width: `${boxW * 100}%`,
              height: `${boxH * 100}%`,
            }}
          >
            <ul className={menuOnLeft ? "menu left" : "menu"}>
              {remaining.map((c) => (
                <li key={c.id}>
                  <button onClick={() => pick(c)}>{c.name}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {finished && <Finish gameId={gameId} imageId={imageId} durationMs={finished.durationMs} onDone={onExit} />}
    </div>
  );
}