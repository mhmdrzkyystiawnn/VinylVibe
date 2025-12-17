"use client";
import { useEffect, useState, useRef } from "react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function NowPlaying() {
  const spotify = useSpotify();
  const [nowPlaying, setNowPlaying] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const progressRef = useRef(progress);

  // Helper Format Waktu
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
            setNowPlaying(data.body.item);
            setIsPlaying(data.body.is_playing);

            const serverProgress = data.body.progress_ms;
            const currentLocalProgress = progressRef.current;

            if (Math.abs(serverProgress - currentLocalProgress) > 2000) {
              setProgress(serverProgress);
            }
          } else {
            setNowPlaying(null);
            setIsPlaying(false);
          }
          setLoading(false);
        })
        .catch((error) => console.error("Error polling:", error));
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
  }, [spotify]);

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
      <div className="text-center mb-6">
        <span className="bg-retro-dark text-retro-bg px-2 py-1 text-xs font-mono uppercase tracking-widest">
          {isPlaying ? "Currently Spinning" : "Player Idle"}
        </span>
      </div>

      <div className="relative bg-retro-bg border-4 border-retro-dark p-6 shadow-[8px_8px_0px_0px_var(--color-retro-dark)] rounded-sm">
        {loading ? (
          <div className="text-center py-10 animate-pulse">
            Checking turntable...
          </div>
        ) : nowPlaying ? (
          <>
            <div className="aspect-square relative w-full mb-6 border-2 border-retro-dark overflow-hidden group">
              <Image
                src={nowPlaying.album.images[0].url}
                alt={nowPlaying.name}
                width={640}
                height={640}
                priority
                className={`w-full h-full object-cover transition duration-500 ${
                  !isPlaying ? "grayscale" : ""
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-[50px] border-black/10 animate-spin-slow opacity-20 pointer-events-none"></div>
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
              <span className="w-10 text-right">{formatTime(progress)}</span>
              <div className="h-3 flex-1 bg-retro-dark/10 rounded-full overflow-hidden border border-retro-dark relative">
                <div
                  className="h-full bg-retro-primary transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(progress / nowPlaying.duration_ms) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="w-10">{formatTime(nowPlaying.duration_ms)}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 text-retro-dark/50">☕</div>
            <h3 className="text-xl font-bold font-display">Break Time.</h3>
            <p className="text-retro-primary mt-2">No music detected.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-retro-dark text-retro-bg text-sm font-bold rounded hover:bg-retro-primary"
            >
              Force Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}