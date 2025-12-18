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
    <div className="w-full max-w-md mx-auto">
      {/* HEADER STATUS - Retro Label Style */}
      <div className="flex justify-center mb-4 relative z-10">
         <div className={`
            px-4 py-1 border-2 border-retro-text text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--color-retro-text)]
            ${isPlaying ? "bg-retro-dark text-retro-bg" : "bg-zinc-400 text-retro-text"}
         `}>
          {loading ? "SYSTEM BOOT..." : isPlaying ? "● ON AIR" : "|| PAUSED"}
        </div>
      </div>

      {/* CARD UTAMA - Retro Box */}
      <div className={`
          relative bg-retro-bg border-3 border-retro-text p-6 
          shadow-[8px_8px_0px_0px_var(--color-retro-text)] 
          transition-all duration-300
      `}>
        
        {/* Decorative Screws (Pojok-pojok) */}
        <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>

        {loading ? (
          /* === 1. LOADING SKELETON (Retro Style) === */
          <div className="animate-pulse space-y-4">
            <div className="aspect-square w-full border-2 border-dashed border-retro-text/30 bg-retro-text/5 flex items-center justify-center">
                <span className="font-mono text-xs opacity-50">LOADING_DISC...</span>
            </div>
            <div className="h-6 w-3/4 bg-retro-text/20 mx-auto border border-retro-text/20"></div>
            <div className="h-4 w-1/2 bg-retro-text/20 mx-auto border border-retro-text/20"></div>
          </div>
        ) : nowPlaying ? (
          
          /* === 2. MUSIC PLAYER === */
          <>
            {/* Album Art Container */}
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
              
              {/* Scanline Overlay (Estetika Retro) */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

              {/* Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-retro-text/20 backdrop-grayscale-[0.5]">
                    <div className="w-16 h-16 bg-retro-text text-retro-bg flex items-center justify-center border-2 border-retro-bg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                        <div className="flex gap-2">
                             <div className="w-3 h-8 bg-retro-bg"></div>
                             <div className="w-3 h-8 bg-retro-bg"></div>
                        </div>
                    </div>
                </div>
              )}
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

            {/* Progress Bar Retro */}
            <div className="mt-6 flex items-center gap-3 text-xs font-mono font-bold">
              <span className="w-10 text-right">{formatTime(progress)}</span>
              
              <div className="h-4 flex-1 bg-retro-bg border-2 border-retro-text relative shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <div
                  className={`h-full border-r-2 border-retro-text transition-all duration-1000 ease-linear relative ${
                    isPlaying ? "bg-retro-primary" : "bg-zinc-400"
                  }`}
                  style={{
                    width: `${(progress / nowPlaying.duration_ms) * 100}%`,
                  }}
                >
                    {/* Pattern garis-garis di dalam progress bar */}
                    <div className="absolute inset-0 w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                </div>
              </div>
              
              <span className="w-10">{formatTime(nowPlaying.duration_ms)}</span>
            </div>
          </>
        ) : (
          
          /* === 3. STATE NO SIGNAL === */
          <div className="text-center py-12 flex flex-col items-center justify-center h-full border-2 border-dashed border-retro-text/30 bg-retro-text/5">
            <div className="text-4xl mb-4 opacity-50 grayscale">💾</div>
            <h3 className="text-xl font-bold font-display uppercase tracking-widest">System Idle</h3>
            <p className="font-mono text-xs mt-2 opacity-70">WAITING FOR AUDIO STREAM...</p>
          </div>
        )}
      </div>
    </div>
  );
}