"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify"; // Relative path
import Image from "next/image";

export default function NowPlaying() {
  const { data: session } = useSession();
  
  // PERBAIKAN: Panggil hook secara langsung, jangan pakai ternary operator
  const spotify = useSpotify();
  
  const [nowPlaying, setNowPlaying] = useState(null);
  // State audioFeatures dihapus karena fitur mood dihilangkan
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

  // LOGIC 1: POLLING LAGU UTAMA (Cek lagu apa yang diputar)
  useEffect(() => {
    // Tambahkan pengecekan 'spotify' disini
    if (!spotify || !spotify.getAccessToken()) return;

    let pollInterval = null;

    const fetchNowPlaying = async () => {
      if (document.hidden) return;

      try {
        const data = await spotify.getMyCurrentPlayingTrack();
        
        // Cek status 204 (No Content) atau body kosong
        if (data.statusCode === 204 || !data.body) {
           setIsPlaying(false);
           setLoading(false);
           return;
        }

        if (data.body && data.body.item) {
          setNowPlaying(data.body.item); // Update state lagu
          setIsPlaying(data.body.is_playing);

          const serverProgress = data.body.progress_ms;
          const currentLocalProgress = progressRef.current;

          // Sync hanya jika selisih waktu > 2 detik
          if (Math.abs(serverProgress - currentLocalProgress) > 2000) {
            setProgress(serverProgress);
          }
        } else {
          setIsPlaying(false);
        }
        setLoading(false);
      } catch (error) {
        if (error?.statusCode !== 401) {
            console.warn("Spotify Polling Warning:", error.message || "Connection issue");
        }
        setLoading(false);
      }
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

  // LOGIC 2: TIMER LOKAL
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
    <div className="w-full max-w-md mx-auto">
      {/* HEADER STATUS */}
      <div className="flex justify-center mb-4 relative z-10">
         <div className={`
            px-4 py-1 border-2 border-retro-text text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--color-retro-text)]
            ${isPlaying ? "bg-retro-dark text-retro-bg" : "bg-zinc-400 text-retro-text"}
         `}>
          {loading ? "SYSTEM BOOT..." : isPlaying ? "● ON AIR" : "|| PAUSED"}
        </div>
      </div>

      {/* CARD UTAMA */}
      <div className={`
          relative bg-retro-bg border-3 border-retro-text p-6 
          shadow-[8px_8px_0px_0px_var(--color-retro-text)] 
          transition-all duration-300
      `}>
        {/* Dekorasi Baut */}
        <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>

        {loading ? (
          <div className="animate-pulse space-y-4">
             <div className="aspect-square bg-retro-text/10 border-2 border-dashed border-retro-text/20"></div>
          </div>
        ) : nowPlaying ? (
          <>
            {/* Album Art */}
            <div className="aspect-square relative w-full mb-6 border-3 border-retro-text group bg-black">
              <Image
                src={nowPlaying.album.images[0].url}
                alt={nowPlaying.name}
                width={640}
                height={640}
                priority
                unoptimized
                className={`w-full h-full object-cover transition-all duration-700 ${
                  !isPlaying ? "grayscale brightness-75 contrast-125" : ""
                }`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
            </div>

            {/* Info Track */}
            <div className="text-center space-y-2 border-t-2 border-dashed border-retro-text/20 pt-4">
              <h2 className="text-2xl md:text-3xl font-display font-black leading-none uppercase truncate tracking-tighter">
                {nowPlaying.name}
              </h2>
              <p className="text-sm font-bold font-mono text-retro-primary uppercase tracking-wider">
                {nowPlaying.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 flex items-center gap-3 text-xs font-mono font-bold">
              <span className="w-10 text-right">{formatTime(progress)}</span>
              <div className="h-4 flex-1 bg-retro-bg border-2 border-retro-text relative shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <div
                  className={`h-full border-r-2 border-retro-text transition-all duration-1000 ease-linear relative ${
                    isPlaying ? "bg-retro-primary" : "bg-zinc-400"
                  }`}
                  style={{ width: `${(progress / nowPlaying.duration_ms) * 100}%` }}
                >
                    <div className="absolute inset-0 w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                </div>
              </div>
              <span className="w-10">{formatTime(nowPlaying.duration_ms)}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold font-display uppercase tracking-widest">System Idle</h3>
          </div>
        )}
      </div>
    </div>
  );
}