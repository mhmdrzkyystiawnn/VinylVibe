"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify"; // Pastikan path ini benar
import Image from "next/image";
import Link from "next/link"; // Import Link untuk navigasi

export default function TopTracks() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spotify && spotify.getAccessToken()) {
      // PERBAIKAN: Hapus setLoading(true) disini untuk menghindari error ESLint.
      // Loading awal sudah true dari useState.
      
      // Di dashboard utama, kita cuma butuh short_term (bulan ini) sebagai default
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
    <div className="w-full max-w-md mx-auto relative">
      
      {/* HEADER LABEL */}
      <div className="flex justify-center mb-4 relative z-10">
        <div className="bg-retro-text text-retro-bg px-4 py-1 border-2 border-retro-bg text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          Heavy Rotation
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative bg-retro-bg border-3 border-retro-text p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)]">
        
        {/* Dekorasi Baut */}
        <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-[1px] bg-retro-text transform -rotate-45"></div></div>

        {/* List Tracks (Teaser 1-5) */}
        <ul className="space-y-4 mb-6">
          {loading ? (
             [...Array(5)].map((_, i) => (
               <li key={i} className="flex items-center gap-3 animate-pulse opacity-60">
                  <div className="w-6 h-4 bg-retro-text/10"></div>
                  <div className="w-10 h-10 border-2 border-dashed border-retro-text/30"></div>
                  <div className="flex-1 space-y-2"><div className="h-3 w-3/4 bg-retro-text/20"></div></div>
               </li>
             ))
          ) : topTracks.length > 0 ? (
            topTracks.map((track, index) => (
              <li key={track.id} className="flex items-center gap-3 group border-b-2 border-dashed border-retro-text/20 last:border-0 pb-3 last:pb-0 hover:bg-retro-text/5 p-1">
                <span className="font-mono text-retro-primary font-bold text-lg w-6 opacity-80">0{index + 1}</span>
                <div className="w-10 h-10 flex-shrink-0 border-2 border-retro-text relative overflow-hidden bg-black">
                  <Image src={track.album.images[0].url} alt={track.name} width={40} height={40} unoptimized className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm truncate text-retro-text uppercase">{track.name}</p>
                  <p className="font-mono text-xs truncate opacity-70">{track.artists[0].name}</p>
                </div>
              </li>
            ))
          ) : (
            <div className="text-center py-6 opacity-50">No Data</div>
          )}
        </ul>

        {/* BUTTON KE HALAMAN DETAIL */}
        <div className="border-t-2 border-dashed border-retro-text/30 pt-4">
            <Link 
                href="/stats"
                className="block w-full py-3 text-xs font-bold font-mono uppercase bg-retro-text text-retro-bg text-center hover:bg-retro-primary transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
                📂 View Full Stats Center
            </Link>
        </div>
      </div>
    </div>
  );
}