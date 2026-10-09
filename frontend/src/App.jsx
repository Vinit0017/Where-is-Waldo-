import { useEffect, useState } from 'react';
import './App.css';
import Photoboard from './components/PhotoBoard';
import { Character } from './db/seed';

const image = {
  url: '/image1.jpg',
  naturalWidth: 1024,
  naturalHeight: 1024,
  targetBoxWidth: 0.06,
};

function hitTest(c, point) {
  const boxW = image.targetBoxWidth;
  const boxH = boxW * (image.naturalWidth / image.naturalHeight);
  return (
    point.x - boxW / 2 < c.xMax && point.x + boxW / 2 > c.xMin &&
    point.y - boxH / 2 < c.yMax && point.y + boxH / 2 > c.yMin
  );
}

function App() {
  const [found, setFound] = useState([]);
  const [message, setMessage] = useState(null);

  const characters = Character;
  const foundIds = found.map((f) => f.id);
  const remaining = characters.filter((c) => !foundIds.includes(c.id));
  const allFound = remaining.length === 0;

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  function handlePick(character, point) {
    if (foundIds.includes(character.id)) return;
    if (hitTest(character, point)) {
      setFound((prev) => [...prev, character]);
      setMessage({ text: `You found ${character.name}!`, kind: 'good' });
    } else {
      setMessage({ text: `That's not ${character.name}!`, kind: 'bad' });
    }
  }

  return (
    <div>
      <header>
        <strong>Find: </strong>
        {characters.map((c) => (
          <span key={c.id}>{c.name} </span>
        ))}
        {allFound && <strong>All found!</strong>}
      </header>

      <Photoboard
        image={image}
        remaining={remaining}
        found={found}
        onPick={handlePick}
      />

      {message && <div className={message.kind}>{message.text}</div>}
    </div>
  );
}

export default App;