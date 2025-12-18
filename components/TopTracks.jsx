"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import Image from "next/image";
import Link from "next/link";

export default function TopTracks() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spotify && spotify.getAccessToken()) {
      spotify
        .getMyTopTracks({ limit: 5, time_range: "short_term" })
        .then((data) => {
          setTopTracks(data.body.items);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal ambil top tracks:", err);
          setLoading(false);
        });
    }
  }, [session, spotify]);

  return (
    <div className="w-full space-y-4">
      
      {/* Track List - Vinyl Record Style */}
      <ul className="space-y-3">
        {loading ? (
           [...Array(5)].map((_, i) => (
             <li key={i} className="flex items-center gap-4 animate-pulse bg-retro-bg/30 p-3 rounded-lg border-2 border-dashed border-retro-text/20">
                <div className="w-8 h-8 bg-retro-text/10 rounded"></div>
                <div className="w-14 h-14 bg-retro-text/10 border-2 border-dashed border-retro-text/20"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-retro-text/10 rounded"></div>
                  <div className="h-3 w-1/2 bg-retro-text/5 rounded"></div>
                </div>
             </li>
           ))
        ) : topTracks.length > 0 ? (
          topTracks.map((track, index) => (
            <li 
              key={track.id} 
              className="group flex items-center gap-4 bg-linear-to-r from-retro-bg to-transparent p-3 rounded-xl border-2 border-retro-text/30 hover:border-retro-primary hover:shadow-[4px_4px_0px_0px_rgba(62,39,35,0.3)] transition-all hover:translate-x-1"
            >
              {/* Chart Position */}
              <div className="shrink-0 w-8 h-8 bg-retro-primary border-2 border-retro-text rounded-full flex items-center justify-center shadow-md">
                <span className="font-black text-retro-bg text-sm">{index + 1}</span>
              </div>
              
              {/* Album Art - Vinyl Style */}
              <div className="relative w-14 h-14 shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-retro-text bg-black overflow-hidden shadow-lg">
                  <Image 
                    src={track.album.images[0].url} 
                    alt={track.name} 
                    width={56} 
                    height={56} 
                    unoptimized 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                {/* Vinyl Center Dot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-retro-text/80 border border-retro-bg"></div>
                </div>
              </div>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-base truncate text-retro-text uppercase tracking-tight group-hover:text-retro-primary transition-colors">
                  {track.name}
                </p>
                <p className="font-mono text-xs truncate opacity-70 font-bold">
                  {track.artists[0].name}
                </p>
              </div>
            </li>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-retro-text/30 rounded-lg bg-retro-bg/20">
            <span className="text-4xl block mb-3 opacity-40">💿</span>
            <p className="font-mono text-sm opacity-60 uppercase">No tracks found</p>
          </div>
        )}
      </ul>

      {/* View Full Stats Button */}
      <div className="pt-4 border-t-4 border-double border-retro-text/30">
        <Link 
          href="/stats"
          className="
            group relative w-full py-4 px-6 bg-linear-to-r from-retro-light to-retro-primary text-retro-bg 
            font-display font-black text-base uppercase tracking-wider text-center
            border-4 border-retro-text rounded-xl
            shadow-[6px_6px_0px_0px_rgba(62,39,35,1)]
            hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[4px_4px_0px_0px_rgba(62,39,35,1)]
            active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]
            transition-all duration-100
            flex items-center justify-center gap-3
            overflow-hidden
          "
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <span className="relative z-10 flex items-center gap-2">
             VIEW FULL STATS
          </span>
        </Link>
      </div>
    </div>
  );
}