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
    <div>
      <div className="text-center mb-6">
        <span className="bg-retro-dark text-retro-bg px-2 py-1 text-xs font-mono uppercase tracking-widest">
          Log History
        </span>
      </div>

      <div className="bg-white/50 border-2 border-retro-dark p-6 relative">
        {/* Hiasan Paku di pojok */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-retro-dark/30 rounded-full"></div>
        <div className="absolute top-2 left-2 w-2 h-2 bg-retro-dark/30 rounded-full"></div>

        <ul className="space-y-4">
          {loading ? (
             // SKELETON LOADER
             [...Array(5)].map((_, i) => (
               <li key={i} className="flex items-center gap-3 animate-pulse opacity-50">
                  <div className="w-10 h-10 bg-retro-dark/20 rounded-none"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-retro-dark/20 rounded"></div>
                    <div className="h-2 w-1/3 bg-retro-dark/10 rounded"></div>
                  </div>
               </li>
             ))
          ) : recentTracks.length > 0 ? (
            recentTracks.map((item, index) => (
              <li key={index} className="flex items-center gap-3 group border-b border-retro-dark/10 last:border-0 pb-2 last:pb-0">
                {/* Gambar Album */}
                <div className="w-10 h-10 flex-shrink-0 border border-retro-dark relative overflow-hidden grayscale group-hover:grayscale-0 transition">
                  <Image
                    src={item.track.album.images[0].url}
                    alt={item.track.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Info Lagu */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-retro-dark">
                    {item.track.name}
                  </p>
                  <p className="text-xs truncate opacity-70">
                    {item.track.artists[0].name}
                  </p>
                </div>

                {/* Waktu (Time Ago) */}
                <div className="text-[10px] font-mono font-bold text-retro-primary bg-retro-dark/5 px-2 py-1 rounded-sm whitespace-nowrap">
                   {getTimeAgo(item.played_at)}
                </div>
              </li>
            ))
          ) : (
            <div className="text-center py-4 opacity-50 text-sm">
              Belum ada riwayat lagu.
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}