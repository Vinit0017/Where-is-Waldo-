import { useEffect, useRef, useState } from "react";
import TargetingBox from "./TargetingBox";

export default function Photoboard({image, remaining, found, onPick, onLoad}){
    const wrapRef = useRef(null);
    const imgRef = useRef(null);

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const [target, setTarget] = useState(null);

    const boxW = image.targetBoxWidth;
    const boxH = boxW* (image.naturalWidth/image.naturalHeight);

    const handlePhotoClick = (e) =>{
        if(!loaded) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) /rect.width;
        const y = (e.clientY - rect.top) /rect.height;
        if( x > 1 || x < 0 || y < 0 || y > 1) return;
        setTarget(target? null: {x, y});
    }

    useEffect ( () =>{
        function onKey(e){
            if(e.key === "Escape") setTarget(null);
        }

        function onDocClick(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target))setTarget(null);
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener("click", onDocClick);

        return() =>{
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("click", onDocClick);
        };
    }, []);

    function handlePick(character){
        onPick(character, target);
        setTarget(null);
    }

    return (
        <div ref={wrapRef} onClick={handlePhotoClick} className="image-container">
            {!loaded && <p>Loading Photo....</p>}
            {failed && <p>Couldn't load the photo. Check image.url.</p>}

            <img
                ref={imgRef}
                src={image.url}
                alt="Find the characters"
                draggable={false}
                onLoad={() => {setLoaded(true); onLoad?.();}}
                onError={() =>setFailed(true)}
            />

        {loaded && found.map((f) => (
            <div
                key={f.id}
                title={f.name}
                style={{
                    position: "absolute",
                    left: `${((f.xMin + f.xMax) / 2) * 100}%`,
                    top: `${((f.yMin + f.yMax) / 2) * 100}%`,
                    width: `${(f.xMax - f.xMin) * 100}%`,
                    height: `${(f.yMax - f.yMin) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    border: "3px solid limegreen",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />
        ))}

        {loaded && target && (
            <TargetingBox
                x={target.x}
                y={target.y}
                boxW={boxW}
                boxH={boxH}
                characters={remaining}
                onPick={handlePick}
            />
        )}
        </div>
    );
}