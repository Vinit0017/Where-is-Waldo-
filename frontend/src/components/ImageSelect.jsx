import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function ImageSelect({ onPick, disabled }) {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.images().then((d) => setImages(d.images)).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="msg bad">{error}</p>;
  if (!images) return <p>Loading images...</p>;

  return (
    <div className="grid">
      {images.map((img) => (
        <button key={img.id} className="card" disabled={disabled} onClick={() => onPick(img.id)}>
          <img src={img.thumbnailUrl} alt={img.title} />
          <strong>{img.title}</strong>
          <span>{img.characterCount} characters</span>
        </button>
      ))}
    </div>
  );
}