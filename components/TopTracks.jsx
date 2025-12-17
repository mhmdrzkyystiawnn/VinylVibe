"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "@/hooks/useSpotify";
import Image from "next/image";

export default function TopTracks() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [topTracks, setTopTracks] = useState([]);
  
  // State untuk menyimpan pilihan waktu (Default: 1 Bulan / short_term)
  const [activeRange, setActiveRange] = useState("short_term");

  useEffect(() => {
    if (spotify.getAccessToken()) {
      spotify
        .getMyTopTracks({ limit: 5, time_range: activeRange }) // <--- Pake variabel state
        .then((data) => {
          setTopTracks(data.body.items);
        })
        .catch((err) => console.error("Gagal ambil top tracks:", err));
    }
  }, [session, spotify, activeRange]); // <--- Kalau activeRange berubah, fetch ulang!

  // Helper untuk label tombol
  const ranges = [
    { key: "short_term", label: "Last Month" },
    { key: "medium_term", label: "6 Months" },
    { key: "long_term", label: "All Time" },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <span className="bg-retro-primary text-retro-bg px-2 py-1 text-xs font-mono uppercase tracking-widest">
          Heavy Rotation
        </span>
      </div>

      <div className="bg-white/50 border-2 border-retro-dark p-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-retro-dark rounded-full"></div>

        {/* --- TOMBOL GANTI WAKTU (BARU) --- */}
        <div className="flex justify-center gap-2 mb-6 border-b-2 border-dashed border-retro-dark pb-4">
          {ranges.map((range) => (
            <button
              key={range.key}
              onClick={() => setActiveRange(range.key)}
              className={`
                px-3 py-1 text-[10px] font-bold font-mono uppercase rounded-full border border-retro-dark transition-all
                ${activeRange === range.key 
                  ? "bg-retro-dark text-retro-bg" // Style kalau Aktif
                  : "bg-transparent text-retro-dark hover:bg-retro-light/20" // Style kalau Mati
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        <ul className="space-y-4">
          {topTracks.length > 0 ? (
            topTracks.map((track, index) => (
              <li key={track.id} className="flex items-center gap-3 group">
                <span className="font-mono text-retro-light font-bold text-lg w-6">
                  0{index + 1}
                </span>

                <div className="w-10 h-10 flex-shrink-0 border border-retro-dark relative overflow-hidden">
                  <Image
                    src={track.album.images[0].url}
                    alt={track.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="object-cover w-full h-full group-hover:scale-110 transition"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-retro-dark group-hover:text-retro-primary transition">
                    {track.name}
                  </p>
                  <p className="text-xs truncate opacity-70">
                    {track.artists[0].name}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <div className="text-center py-4 opacity-50 text-sm animate-pulse">
              Calculating charts...
            </div>
          )}
        </ul>

        <div className="mt-6 pt-4 border-t-2 border-dashed border-retro-dark text-center">
          <p className="font-mono text-[10px] opacity-60 uppercase">
            Range: {ranges.find(r => r.key === activeRange).label}
          </p>
        </div>
      </div>
    </div>
  );
}