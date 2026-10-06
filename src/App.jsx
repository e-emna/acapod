import { useState, useEffect, useRef } from "react";
import { searchVocals, loadYouTubeApi } from "./youtube.js";
import StatusBar from "./components/StatusBar.jsx";
import NowPlaying from "./components/NowPlaying.jsx";
import Menu from "./components/Menu.jsx";
import ClickWheel from "./components/ClickWheel.jsx";

// The whole app. It owns all the STATE (data that changes over time).
export default function App() {
  const [view, setView] = useState("menu"); // which screen: "menu" or "now"
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]); // songs found by the last search
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [notice, setNotice] = useState(""); // e.g. "can't play this one"

  // REFS hold things that can change without redrawing the screen.
  const boxRef = useRef(null); // the empty <div> the YouTube player lives in
  const playerRef = useRef(null); // the YouTube player itself
  const repeatRef = useRef(false); // lets the player's callbacks see the latest "repeat"
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  // Favorites are remembered in the browser.
  const [favs, setFavs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cupid-favs")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("cupid-favs", JSON.stringify(favs));
  }, [favs]);

  // Create the YouTube player once, when the app starts.
  useEffect(() => {
    let player;
    let cancelled = false;
    const box = boxRef.current;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const slot = document.createElement("div");
      box.appendChild(slot);
      player = new YT.Player(slot, {
        width: "200",
        height: "200",
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerRef.current = player;
          },
          // YouTube tells us what the video is doing; we mirror it in our state.
          onStateChange: (e) => {
            const S = YT.PlayerState;
            if (e.data === S.PLAYING) setPlaying(true);
            else if (e.data === S.PAUSED) setPlaying(false);
            else if (e.data === S.ENDED) {
              if (repeatRef.current) {
                player.seekTo(0);
                player.playVideo();
              } else {
                setPlaying(false);
                setProgress(0);
              }
            }
          },
          onError: () => {
            setPlaying(false);
            setNotice("can't play this one, try another ♡");
          },
        },
      });
    });

    // Cleanup: remove the player if the app closes.
    return () => {
      cancelled = true;
      playerRef.current = null;
      if (player && player.destroy) player.destroy();
      box.innerHTML = "";
    };
  }, []);

  // While playing, ask the player for the time twice a second.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const p = playerRef.current;
      if (p) setProgress(p.getCurrentTime());
    }, 500);
    return () => clearInterval(timer);
  }, [playing]);

  const list = tab === "favs" ? favs : results;
  const favIds = favs.map((f) => f.id);
  const isFav = current ? favIds.includes(current.id) : false;

  // Runs when you press Enter or the search button.
  async function search(e) {
    e.preventDefault(); // stop the page from reloading
    const text = query.trim();
    if (!text) return;
    setTab("results");
    setStatus("loading");
    setResults([]);
    try {
      setResults(await searchVocals(text));
      setStatus("done");
    } catch (err) {
      setMessage(err.message);
      setStatus("error");
    }
  }

  function play(song) {
    setCurrent(song);
    setProgress(0);
    setNotice("");
    setView("now");
    if (playerRef.current) playerRef.current.loadVideoById(song.id);
  }
  function togglePlay() {
    const p = playerRef.current;
    if (!current || !p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }
  function seek(t) {
    setProgress(t);
    if (playerRef.current) playerRef.current.seekTo(t, true);
  }
  // YouTube requires the video to be on screen while it plays,
  // so opening the menu pauses the song.
  function toggleMenu() {
    if (view === "menu") {
      setView("now");
    } else {
      if (playerRef.current) playerRef.current.pauseVideo();
      setView("menu");
    }
  }
  function toggleFav(song) {
    setFavs((f) => (f.some((x) => x.id === song.id) ? f.filter((x) => x.id !== song.id) : [...f, song]));
  }
  function step(d) {
    if (!current || !list.length) return;
    const i = list.findIndex((s) => s.id === current.id);
    play(i < 0 ? list[0] : list[(i + d + list.length) % list.length]);
  }

  return (
    <div className="wrap">
      <div className="ipod">
        <div className={"screen" + (view === "menu" ? " menu" : "")}>
          <StatusBar
            current={current}
            playing={playing}
            repeat={repeat}
            isFav={isFav}
            onRepeat={() => setRepeat(!repeat)}
          />
          {/* The video. Always on the page (so it keeps working), only shown on Now Playing. */}
          <div ref={boxRef} className={"ytbox" + (view === "now" && current ? " show" : "")} />
          {view === "menu" ? (
            <Menu
              query={query} setQuery={setQuery} onSearch={search}
              tab={tab} setTab={setTab} favCount={favs.length}
              list={list} current={current} favIds={favIds}
              status={status} message={message}
              onPlay={play} onFav={toggleFav}
            />
          ) : (
            <NowPlaying song={current} progress={progress} notice={notice} onSeek={seek} />
          )}
        </div>
        <ClickWheel
          isFav={isFav}
          onMenu={toggleMenu}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onPlayPause={togglePlay}
          onFav={() => current && toggleFav(current)}
        />
        <div className="brand"></div>
      </div>
    </div>
  );
}