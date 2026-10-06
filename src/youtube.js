// Talks to the YouTube Data API. Your key lives in the .env file, never in the code.
const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const API = "https://www.googleapis.com/youtube/v3";

// YouTube sends titles like "Don&#39;t Stop"; this turns them back into normal text.
function decode(html) {
  const box = document.createElement("textarea");
  box.innerHTML = html;
  return box.value;
}

// "PT3M45S" -> 225 seconds
function toSeconds(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso) || [];
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}

async function get(path, params) {
  const res = await fetch(`${API}/${path}?${new URLSearchParams({ ...params, key: KEY })}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Search failed");
  return data;
}

// Search "<what you typed> isolated vocals" and return a clean list of songs.
export async function searchVocals(text) {
  if (!KEY) throw new Error("Missing API key. Add it to .env and restart.");

  const found = await get("search", {
    part: "snippet",
    type: "video",
    videoCategoryId: "10", // Music
    videoEmbeddable: "true", // only videos that are allowed to play in our player
    maxResults: "15",
    q: `${text} isolated vocals`,
  });
  const ids = found.items.map((i) => i.id.videoId).join(",");
  if (!ids) return [];

  // The search results don't include lengths, so ask for them separately (very cheap).
  const details = await get("videos", { part: "contentDetails", id: ids });
  const lengths = {};
  details.items.forEach((v) => (lengths[v.id] = toSeconds(v.contentDetails.duration)));

  return found.items
    .map((i) => ({
      id: i.id.videoId,
      title: decode(i.snippet.title),
      artist: decode(i.snippet.channelTitle),
      thumb: i.snippet.thumbnails.medium.url,
      len: lengths[i.id.videoId] || 0,
    }))
    .filter((s) => s.len >= 30 && s.len <= 600); // drop live streams and long compilations
}

// Loads YouTube's player script once and gives back the YT toolbox when it's ready.
let apiPromise;
export function loadYouTubeApi() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}