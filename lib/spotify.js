import SpotifyWebApi from "spotify-web-api-node";

// 1. Scopes (Izin Akses)
// Docs: https://developer.spotify.com/documentation/web-api/concepts/scopes
const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-private",
  "user-library-read",
  "user-top-read",             // Wajib: Untuk ambil Top Tracks 
  "user-read-playback-state",  // Wajib: Untuk baca status Player
  "user-modify-playback-state",// Wajib: Untuk Add to Queue / Play
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
].join(",");

const params = {
  scope: scopes,
};

const queryParamString = new URLSearchParams(params);

// 2. URL Authorization Resmi (Sesuai Docs Spotify)
// Endpoint: https://accounts.spotify.com/authorize
const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString.toString()}`;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export default spotifyApi;
export { LOGIN_URL, scopes };