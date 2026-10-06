export const mmss = (s) =>
  Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export const cover = (song) => ({
  backgroundImage: `url(${song.thumb})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#6c2a35",
});