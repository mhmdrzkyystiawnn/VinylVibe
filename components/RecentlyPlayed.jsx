"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function RecentlyPlayed() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTimeAgo = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  useEffect(() => {
    if (spotify.getAccessToken()) {
      spotify
        .getMyRecentlyPlayedTracks({ limit: 5 }) 
        .then((data) => {
          setRecentTracks(data.body.items);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal ambil history:", err);
          setLoading(false);
        });
    }
  }, [session, spotify]);

  return (
    <div className="w-full space-y-4">
      
      {/* Track List - Cassette Tape History Style */}
      <ul className="space-y-3">
        {loading ? (
           [...Array(5)].map((_, i) => (
             <li key={i} className="flex items-center gap-4 animate-pulse bg-retro-bg/30 p-3 rounded-lg border-2 border-dashed border-retro-text/20">
                <div className="w-14 h-14 bg-retro-text/10 border-2 border-dashed border-retro-text/20 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-retro-text/10 rounded"></div>
                  <div className="h-3 w-1/2 bg-retro-text/5 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-retro-text/10 rounded"></div>
             </li>
           ))
        ) : recentTracks.length > 0 ? (
          recentTracks.map((item, index) => (
            <li 
              key={index} 
              className="group flex items-center gap-4 bg-linear-to-r from-retro-bg to-transparent p-3 rounded-xl border-2 border-retro-text/30 hover:border-retro-light hover:shadow-[4px_4px_0px_0px_rgba(218,108,108,0.3)] transition-all hover:translate-x-1"
            >
              {/* Album Art - Cassette Style */}
              <div className="relative w-14 h-14 shrink-0">
                <div className="absolute inset-0 border-3 border-retro-text bg-black overflow-hidden shadow-lg rounded">
                  <Image
                    src={item.track.album.images[0].url}
                    alt={item.track.name}
                    width={56}
                    height={56}
                    unoptimized
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                
                {/* Cassette Holes Decoration */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-retro-light rounded-full bg-retro-bg"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-retro-light rounded-full bg-retro-bg"></div>
              </div>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-base truncate text-retro-text uppercase tracking-tight group-hover:text-retro-light transition-colors">
                  {item.track.name}
                </p>
                <p className="font-mono text-xs truncate opacity-70 font-bold">
                  {item.track.artists[0].name}
                </p>
              </div>

              {/* Time Badge */}
              <div className="shrink-0">
                <div className="bg-retro-light text-retro-bg px-3 py-1.5 text-[10px] font-mono font-black uppercase rounded border-2 border-retro-text shadow-[2px_2px_0px_0px_rgba(62,39,35,0.3)] whitespace-nowrap group-hover:scale-105 transition-transform">
                  {getTimeAgo(item.played_at)}
                </div>
              </div>
            </li>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-retro-text/30 rounded-lg bg-retro-bg/20">
            <span className="text-4xl block mb-3 opacity-40">📼</span>
            <p className="font-mono text-sm opacity-60 uppercase">No history found</p>
            <p className="font-mono text-xs opacity-40 mt-1">Start playing to see your tracks here</p>
          </div>
        )}
      </ul>

      {/* Tape Strip Decoration */}
      <div className="flex items-center gap-2 pt-4 border-t-4 border-double border-retro-text/30">
        <div className="flex-1 h-2 bg-linear-to-r from-transparent via-retro-text/20 to-transparent rounded"></div>
        <span className="text-xs font-mono font-bold opacity-40">TRACK_LOG_END</span>
        <div className="flex-1 h-2 bg-linear-to-r from-transparent via-retro-text/20 to-transparent rounded"></div>
      </div>
    </div>
  );
}