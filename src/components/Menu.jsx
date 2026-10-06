import SongRow from "./SongRow.jsx";

// The menu screen: search box, results/favorites tabs, song list.
export default function Menu({
  query, setQuery, onSearch, tab, setTab, favCount,
  list, current, favIds, status, message, onPlay, onFav,
}) {
  // What to say when the list is empty depends on where we are.
  let emptyText = "search an artist or a song ♡";
  if (tab === "favs") emptyText = "no favorites yet ♡";
  else if (status === "loading") emptyText = "searching…";
  else if (status === "error") emptyText = message;
  else if (status === "done") emptyText = "no isolated vocals found ♡";

  return (
    <>
      <div className="mtop">
        <form className="srch" onSubmit={onSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search songs, artists..."
            aria-label="Search songs"
          />
          <button className="sm on" type="submit" aria-label="Search">⌕</button>
        </form>
        <div className="tabs">
          <button className={"sm" + (tab === "results" ? " on" : "")} onClick={() => setTab("results")}>
            results
          </button>
          <button className={"sm" + (tab === "favs" ? " on" : "")} onClick={() => setTab("favs")}>
            favorites {favCount}
          </button>
        </div>
      </div>
      <div className="mlist">
        {list.map((s) => (
          <SongRow
            key={s.id}
            song={s}
            isNow={current && current.id === s.id}
            isFav={favIds.includes(s.id)}
            onPlay={onPlay}
            onFav={onFav}
          />
        ))}
        {list.length === 0 && <div className="empty">{emptyText}</div>}
      </div>
    </>
  );
}