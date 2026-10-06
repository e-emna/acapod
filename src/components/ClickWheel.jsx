import heartOff from "../assets/heart-empty.png";
import heartOn from "../assets/heart-filled.png";

export default function ClickWheel({ onMenu, onPrev, onNext, onPlayPause, onFav, isFav }) {
  return (
    <div className="wheel">
      <button className="wb t" onClick={onMenu}>MENU</button>
      <button className="wb l" onClick={onPrev} aria-label="Previous">◀◀</button>
      <button className="wb r" onClick={onNext} aria-label="Next">▶▶</button>
      <button className="wb b" onClick={onPlayPause} aria-label="Play or pause">▶❚❚</button>
      <button
        className="hub"
        onClick={onFav}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <img src={isFav ? heartOn : heartOff} alt={isFav ? "♥" : "♡"} />
      </button>
    </div>
  );
}
