import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import spotifyApi from "@/lib/spotify";

function useSpotify() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // 1. PENGECEKAN KRUSIAL:
    // Kalau session masih 'null' atau status masih 'loading', JANGAN lakukan apa-apa.
    // Ini yang bikin error sebelumnya.
    if (!session || status === "loading") return;

    // 2. Kalau session sudah ada, baru kita cek propertinya
    if (session.error === "RefreshAccessTokenError") {
      signIn(); // Force login kalau token rusak
    }

    // 3. Set Access Token hanya jika user & accessToken ada
    if (session.user?.accessToken) {
      spotifyApi.setAccessToken(session.user.accessToken);
    }
    
  }, [session, status]);

  return spotifyApi;
}

export default useSpotify;