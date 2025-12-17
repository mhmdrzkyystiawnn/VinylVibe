import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import spotifyApi from "@/lib/spotify";

function useSpotify() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      // 1. Kalau ada error di refresh token, paksa login ulang
      if (session.error === "RefreshAccessTokenError") {
        signIn();
      }

      // 2. Tempel access token ke library spotify biar siap pakai
      spotifyApi.setAccessToken(session.user.accessToken);
    }
  }, [session]);

  return spotifyApi;
}

export default useSpotify;