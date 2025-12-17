"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function NowPlaying() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  
  const [nowPlaying, setNowPlaying] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const progressRef = useRef(progress);

  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // LOGIC POLLING & SYNC
  useEffect(() => {
    if (!spotify.getAccessToken()) return;

    let pollInterval = null;

    const fetchNowPlaying = () => {
      if (document.hidden) return;

      spotify
        .getMyCurrentPlayingTrack()
        .then((data) => {
          if (data.body && data.body.item) {
            // KONDISI 1: ADA DATA LAGU (Play atau Pause sebentar)
            setNowPlaying(data.body.item);
            setIsPlaying(data.body.is_playing);

            const serverProgress = data.body.progress_ms;
            const currentLocalProgress = progressRef.current;

            if (Math.abs(serverProgress - currentLocalProgress) > 2000) {
              setProgress(serverProgress);
            }
          } else {
            // KONDISI 2: DATA KOSONG (Pause lama / Idle)
            // Ubah status jadi 'Tidak Main' (biar jadi abu-abu)
            setIsPlaying(false);
            
            // PENTING: Jangan setNowPlaying(null)! 
            // Biarkan lagu terakhir tetap nampang di layar.
          }
          setLoading(false); 
        })
        .catch((error) => {
          console.error("Error polling:", error);
          setLoading(false); 
        });
    };

    fetchNowPlaying();
    pollInterval = setInterval(fetchNowPlaying, 5000);

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchNowPlaying();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, spotify]);

  // LOGIC TIMER LOKAL
  useEffect(() => {
    let timerInterval = null;
    if (isPlaying && nowPlaying) {
      timerInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= nowPlaying.duration_ms) return prev;
          return prev + 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isPlaying, nowPlaying]);

  return (
    <div>
      {/* HEADER STATUS */}
      <div className="text-center mb-6">
        <span className={`px-2 py-1 text-xs font-mono uppercase tracking-widest ${
          isPlaying 
            ? "bg-retro-dark text-retro-bg" // Kalau Play: Hitam
            : "bg-gray-400 text-white"      // Kalau Pause: Abu-abu
        }`}>
          {loading ? "BOOTING..." : isPlaying ? "Currently Spinning" : "Player Paused"}
        </span>
      </div>

      {/* CARD UTAMA */}
      <div className={`relative bg-retro-bg border-4 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-sm transition-colors duration-500 ${
         isPlaying ? "border-retro-dark" : "border-gray-400" // Border jadi abu kalau pause
      }`}>
        
        {loading ? (
          /* === 1. LOADING SKELETON === */
          <div className="animate-pulse">
            <div className="aspect-square w-full mb-6 bg-gray-200 relative overflow-hidden"></div>
            <div className="h-6 w-3/4 bg-gray-200 mx-auto rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 mx-auto rounded"></div>
          </div>
        ) : nowPlaying ? (
          
          /* === 2. MUSIC PLAYER (AKTIF ATAU PAUSE) === */
          <>
            <div className="aspect-square relative w-full mb-6 border-2 border-retro-dark overflow-hidden group">
              <Image
                src={nowPlaying.album.images[0].url}
                alt={nowPlaying.name}
                width={640}
                height={640}
                priority
                unoptimized
                // LOGIC GRAYSCALE DISINI:
                // Kalau !isPlaying (Pause), tambah class 'grayscale'
                className={`w-full h-full object-cover transition-all duration-700 ${
                  !isPlaying ? "grayscale brightness-90 blur-[1px]" : ""
                }`}
              />
              
              {/* Animasi Muter hanya muncul kalau isPlaying = TRUE */}
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-[50px] border-black/10 animate-spin-slow opacity-20 pointer-events-none"></div>
              )}

              {/* Icon Pause Besar saat lagu berhenti */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-4 h-8 bg-white/90 border-r-4 border-transparent mr-1"></div>
                    <div className="w-4 h-8 bg-white/90 ml-1"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-display font-bold leading-tight mb-2 truncate">
                {nowPlaying.name}
              </h2>
              <p className="text-md text-retro-primary font-mono border-t border-retro-light/50 inline-block pt-2 mt-1">
                {nowPlaying.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs font-mono">
              <span className="w-10 text-right opacity-60">{formatTime(progress)}</span>
              <div className="h-3 flex-1 bg-retro-dark/10 rounded-full overflow-hidden border border-retro-dark/20 relative">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    isPlaying ? "bg-retro-primary" : "bg-gray-400"
                  }`}
                  style={{
                    width: `${(progress / nowPlaying.duration_ms) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="w-10 opacity-60">{formatTime(nowPlaying.duration_ms)}</span>
            </div>
          </>
        ) : (
          
          /* === 3. STATE AWAL (Belum pernah play lagu sama sekali) === */
          <div className="text-center py-12">
            <div className="text-4xl mb-4 text-gray-300">💿</div>
            <h3 className="text-xl font-bold font-display text-gray-400">No Signal</h3>
            <p className="text-gray-400 mt-2 text-sm">Play Spotify to start...</p>
          </div>
        )}
      </div>
    </div>
  );
}