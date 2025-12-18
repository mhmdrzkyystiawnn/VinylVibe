"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
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

  useEffect(() => {
    if (!spotify || !spotify.getAccessToken()) return;

    let pollInterval = null;

    const fetchNowPlaying = async () => {
      if (document.hidden) return;

      try {
        const data = await spotify.getMyCurrentPlayingTrack();
        
        if (data.statusCode === 204 || !data.body) {
           setIsPlaying(false);
           setLoading(false);
           return;
        }

        if (data.body && data.body.item) {
          setNowPlaying(data.body.item);
          setIsPlaying(data.body.is_playing);

          const serverProgress = data.body.progress_ms;
          const currentLocalProgress = progressRef.current;

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
    <div className="w-full">
      
      {/* CD Player Display Screen */}
      <div className="relative bg-linear-to-br from-gray-900 to-black border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] overflow-hidden">
        
        {/* LCD Screen Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,0,0.03),rgba(0,255,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none"></div>

        {/* Status LED */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className={`w-3 h-3 rounded-full border-2 border-retro-text ${
            isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-500'
          }`}></div>
          <span className="text-[10px] font-mono font-bold text-green-400">
            {loading ? "LOADING..." : isPlaying ? "PLAYING" : "PAUSED"}
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
             <div className="aspect-square bg-retro-text/10 border-2 border-dashed border-green-500/20 rounded-lg"></div>
             <div className="h-4 bg-retro-text/10 rounded"></div>
             <div className="h-3 bg-retro-text/5 rounded w-3/4"></div>
          </div>
        ) : nowPlaying ? (
          <div className="relative z-10">
            {/* Album Art - CD Style */}
            <div className="aspect-square relative w-full mb-6 rounded-full overflow-hidden border-4 border-retro-text bg-black shadow-2xl group">
              <Image
                src={nowPlaying.album.images[0].url}
                alt={nowPlaying.name}
                width={640}
                height={640}
                priority
                unoptimized
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isPlaying ? 'animate-spin-slow' : 'grayscale'
                }`}
              />
              
              {/* CD Center Hole */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-gray-900 border-4 border-retro-text shadow-inner"></div>
              </div>
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_50%,transparent_50%)] bg-size-[100%_4px] pointer-events-none"></div>
            </div>

            {/* Track Info Display */}
            <div className="space-y-3 bg-black/40 backdrop-blur-sm rounded-lg p-4 border-2 border-green-500/30">
              <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-display font-black leading-tight uppercase text-green-400 truncate drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                  {nowPlaying.name}
                </h2>
                <p className="text-sm font-mono text-green-300/80 uppercase tracking-wider truncate">
                  {nowPlaying.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>

              {/* Progress Bar - VU Meter Style */}
              <div className="flex items-center gap-3 text-xs font-mono font-bold text-green-400">
                <span className="w-12 text-right">{formatTime(progress)}</span>
                <div className="h-6 flex-1 bg-black border-2 border-green-500/50 relative rounded overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear relative ${
                      isPlaying 
                        ? 'bg-linear-to-r from-green-600 via-green-400 to-green-300' 
                        : 'bg-gray-600'
                    }`}
                    style={{ width: `${(progress / nowPlaying.duration_ms) * 100}%` }}
                  >
                    {isPlaying && (
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] animate-pulse"></div>
                    )}
                  </div>
                </div>
                <span className="w-12">{formatTime(nowPlaying.duration_ms)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
            <div className="text-6xl opacity-30">⏸️</div>
            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-gray-500">
              NO DISC LOADED
            </h3>
            <p className="text-xs font-mono text-gray-600">Insert CD to begin playback</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}