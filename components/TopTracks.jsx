"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function TopTracks() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [topTracks, setTopTracks] = useState([]);
  const [activeRange, setActiveRange] = useState("short_term");
  
  // Default true, jadi pas pertama load dia langsung loading (Aman!)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spotify.getAccessToken()) {
      // ❌ HAPUS setLoading(true) DARI SINI BIAR GAK ERROR ESLINT
      
      spotify
        .getMyTopTracks({ limit: 5, time_range: activeRange })
        .then((data) => {
          setTopTracks(data.body.items);
          setLoading(false); // Stop loading kalau sukses
        })
        .catch((err) => {
          console.error("Gagal ambil top tracks:", err);
          setLoading(false); // Stop loading kalau error
        });
    }
  }, [session, spotify, activeRange]);

  const ranges = [
    { key: "short_term", label: "Last Month" },
    { key: "medium_term", label: "6 Months" },
    { key: "long_term", label: "All Time" },
  ];

  // Helper function buat handle klik tombol
  const handleRangeChange = (key) => {
    if (key === activeRange) return; // Kalau klik tombol yg sama, cuekin aja
    
    setLoading(true); // <--- ✅ PINDAH KESINI (Set loading pas diklik)
    setActiveRange(key);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* HEADER LABEL */}
      <div className="flex justify-center mb-4 relative z-10">
        <div className="bg-retro-text text-retro-bg px-4 py-1 border-2 border-retro-bg text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          Heavy Rotation
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative bg-retro-bg border-3 border-retro-text p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)] transition-all duration-300">
        
        {/* Decorative Screws (Pojok-pojok) */}
        <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-px bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-px bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-px bg-retro-text transform -rotate-45"></div></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border border-retro-text rounded-full flex items-center justify-center"><div className="w-1 h-px bg-retro-text transform -rotate-45"></div></div>

        {/* Range Selector Buttons */}
        <div className="flex justify-center gap-2 mb-6 border-b-2 border-dashed border-retro-text/30 pb-4">
          {ranges.map((range) => (
            <button
              key={range.key}
              onClick={() => handleRangeChange(range.key)}
              disabled={loading} 
              className={`
                px-3 py-1 text-[10px] font-bold font-mono uppercase border-2 border-retro-text transition-all duration-100 shadow-[3px_3px_0px_0px_var(--color-retro-text)]
                ${activeRange === range.key 
                  ? "bg-retro-text text-retro-bg translate-y-0.75 translate-x-0.75 shadow-none" 
                  : "bg-transparent text-retro-text hover:bg-retro-text/10 hover:-translate-y-0.5"
                }
                ${loading ? "opacity-50 cursor-wait" : ""}
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        <ul className="space-y-4">
          {loading ? (
             /* === SKELETON LOADER === */
             [...Array(5)].map((_, i) => (
               <li key={i} className="flex items-center gap-3 animate-pulse opacity-60">
                  <div className="w-6 h-4 bg-retro-text/10 rounded"></div>
                  <div className="w-10 h-10 border-2 border-dashed border-retro-text/30 bg-retro-text/5"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-retro-text/20"></div>
                    <div className="h-2 w-1/2 bg-retro-text/10"></div>
                  </div>
               </li>
             ))
          ) : topTracks.length > 0 ? (
            
            /* === DATA LIST === */
            topTracks.map((track, index) => (
              <li key={track.id} className="flex items-center gap-3 group border-b-2 border-dashed border-retro-text/20 last:border-0 pb-3 last:pb-0 hover:bg-retro-text/5 transition-colors p-1 rounded-sm">
                
                {/* Ranking Number */}
                <span className="font-mono text-retro-primary font-bold text-lg w-6 opacity-80">
                  0{index + 1}
                </span>

                {/* Album Art */}
                <div className="w-10 h-10 shrink-0 border-2 border-retro-text relative overflow-hidden bg-black">
                  <Image
                    src={track.album.images[0].url}
                    alt={track.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm truncate text-retro-text uppercase tracking-tight group-hover:text-retro-primary transition-colors">
                    {track.name}
                  </p>
                  <p className="font-mono text-xs truncate opacity-70">
                    {track.artists[0].name}
                  </p>
                </div>
              </li>
            ))
          ) : (
            
            /* === EMPTY STATE === */
            <div className="text-center py-6 border-2 border-dashed border-retro-text/30 bg-retro-text/5">
              <span className="text-2xl block mb-2 opacity-50">📉</span>
              <p className="font-mono text-xs opacity-60 uppercase">No Stats Available.</p>
            </div>
          )}
        </ul>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-retro-text/30 text-center">
          <p className="font-mono text-[10px] opacity-60 uppercase">
             {"//"} VIEWING DATA: {ranges.find(r => r.key === activeRange).label}
          </p>
        </div>
      </div>
    </div>
  );
}