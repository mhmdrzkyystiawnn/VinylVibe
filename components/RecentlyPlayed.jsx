"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function RecentlyPlayed() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [recentTracks, setRecentTracks] = useState([]);
  
  // 1. DEFAULT 'TRUE' (Jadi pas lahir langsung loading, ga perlu diset lagi)
  const [loading, setLoading] = useState(true);

  // Helper: Mengubah timestamp jadi "X menit yang lalu"
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
      // 2. HAPUS setLoading(true) DISINI BIAR ESLINT SENANG
      
      spotify
        .getMyRecentlyPlayedTracks({ limit: 5 }) 
        .then((data) => {
          setRecentTracks(data.body.items);
          setLoading(false); // Stop loading pas data dapet
        })
        .catch((err) => {
          console.error("Gagal ambil history:", err);
          setLoading(false); // Stop loading pas error
        });
    }
  }, [session, spotify]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* HEADER LABEL */}
      <div className="flex justify-center mb-4 relative z-10">
        <div className="bg-retro-text text-retro-bg px-4 py-1 border-2 border-retro-bg text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          Log History
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative bg-retro-bg border-3 border-retro-text p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)] transition-all duration-300">
        
        {/* Decorative Screws (Pojok-pojok) */}
        <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>

        <ul className="space-y-4">
          {loading ? (
             /* === SKELETON LOADER (Retro Style) === */
             [...Array(5)].map((_, i) => (
               <li key={i} className="flex items-center gap-3 animate-pulse opacity-60">
                  <div className="w-12 h-12 border-2 border-dashed border-retro-text/30 bg-retro-text/5"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-retro-text/20"></div>
                    <div className="h-2 w-1/3 bg-retro-text/10"></div>
                  </div>
               </li>
             ))
          ) : recentTracks.length > 0 ? (
            
            /* === DATA LIST === */
            recentTracks.map((item, index) => (
              <li key={index} className="flex items-center gap-3 group border-b-2 border-dashed border-retro-text/20 last:border-0 pb-3 last:pb-0 hover:bg-retro-text/5 transition-colors p-1 rounded-sm">
                
                {/* Gambar Album */}
                <div className="w-12 h-12 flex-shrink-0 border-2 border-retro-text relative overflow-hidden bg-black">
                  <Image
                    src={item.track.album.images[0].url}
                    alt={item.track.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                {/* Info Lagu */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm truncate text-retro-text uppercase tracking-tight group-hover:text-retro-primary transition-colors">
                    {item.track.name}
                  </p>
                  <p className="font-mono text-xs truncate opacity-70">
                    {item.track.artists[0].name}
                  </p>
                </div>

                {/* Waktu (Time Ago Badge) */}
                <div className="flex-shrink-0">
                    <div className="text-[10px] font-mono font-bold text-retro-bg bg-retro-text px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] whitespace-nowrap transform group-hover:-translate-y-0.5 transition-transform">
                       {getTimeAgo(item.played_at)}
                    </div>
                </div>
              </li>
            ))
          ) : (
            
            /* === EMPTY STATE === */
            <div className="text-center py-6 border-2 border-dashed border-retro-text/30 bg-retro-text/5">
              <span className="text-2xl block mb-2 opacity-50">📂</span>
              <p className="font-mono text-xs opacity-60 uppercase">No logs found.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}