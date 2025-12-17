import SpotifyWebApi from "spotify-web-api-node";

// 1. Definisikan Scopes (Izin)
const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-email",
  "streaming",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-read-playback-state",      // <--- WAJIB ADA (Now Playing)
  "user-modify-playback-state",    // <--- WAJIB ADA
  "user-read-currently-playing",   // <--- WAJIB ADA (Now Playing)
  "user-read-recently-played",
  "user-follow-read",
].join(",");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// 2. Export API (default) dan scopes (named export)
export default spotifyApi;
export { scopes };