// The strip at the top of the iPod screen.
export default function StatusBar({ current, playing }) {
  return (
    <div className="status">
      <span>{current ? (playing ? "▶ playing" : "❚❚ paused") : "Acapod"}</span>
      <svg
        className="battery"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path d="M4 5h14v2H4zm0 12h14v2H4zM2 7h2v10H2zm16-2h2v14h-2zm2 4h2v6h-2zM6 9h2v6H6zm4 0h2v6h-2z" />
      </svg>
    </div>
  );
}