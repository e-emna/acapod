import { mmss } from "../data.js";

// The text and progress bar under the video on the "now playing" screen.
export default function NowPlaying({ song, progress, notice, onSeek }) {
  if (!song) {
    return (
      <div className="np">
        <div className="hint">pick a song ♡<br />press MENU to search</div>
      </div>
    );
  }
  return (
    <div className="np">
      <div>
        <h2>{song.title}</h2>
        <div className="by">{notice || song.artist}</div>
      </div>
      <div className="seekrow">
        <span>{mmss(progress)}</span>
        <input
          className="seek"
          type="range"
          min="0"
          max={song.len}
          value={Math.floor(progress)}
          style={{ "--p": (progress / song.len) * 100 + "%" }}
          aria-label="Seek"
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <span>{mmss(song.len)}</span>
      </div>
    </div>
  );
}