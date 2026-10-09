export default function TargetingBox({ x, y, boxW, boxH, characters, onPick }) {
  const openLeft = x > 0.7;
  const openUp = y > 0.7;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${boxW * 100}%`,
        height: `${boxH * 100}%`,
        transform: "translate(-50%, -50%)",
        border: "3px dashed white",
        boxShadow: "0 0 0 2px black",
        boxSizing: "border-box",
      }}
    >
      <ul
        role="menu"
        style={{
          position: "absolute",
          margin: 0,
          padding: 4,
          listStyle: "none",
          lineHeight: 1.4,
          background: "white",
          color: "black",
          borderRadius: 6,
          minWidth: 130,
          whiteSpace: "nowrap",
          ...(openLeft ? { right: "100%", marginRight: 8 } : { left: "100%", marginLeft: 8 }),
          ...(openUp ? { bottom: 0 } : { top: 0 }),
        }}
      >
        {characters.length === 0 && <li style={{ padding: 8 }}>All found</li>}

        {characters.map((c) => (
          <li key={c.id} role="none">
            <button
              role="menuitem"
              onClick={() => onPick(c)}
              style={{
                display: "block",
                width: "100%",
                minHeight: 44,          
                textAlign: "left",
                padding: "8px 12px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}