import { cover } from "../data.js";

// One row in the playlist.
export default function SongRow({ song, isNow, isFav, onPlay, onFav }) {
  return (
    <div className={"mrow" + (isNow ? " now" : "")} onClick={() => onPlay(song)}>
      <div className="cov" style={cover(song)} />
      <div className="meta">
        <div className="t">{song.title}</div>
        <div className="a">{song.artist}</div>
      </div>
      <button
        className="hrt"
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.stopPropagation(); // don't also trigger the row's play click
          onFav(song);
        }}
      >
        {isFav ? "♥" : "♡"}
      </button>
    </div>
  );
}