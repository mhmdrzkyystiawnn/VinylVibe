"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import Image from "next/image";

export default function VendingMachine() {
  const { data: session } = useSession();
  const spotify = useSpotify();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("IDLE"); // IDLE, BREWING, SERVED

  // Fungsi Utama: Minta Rekomendasi
  const dispenseMix = async () => {
    if (!spotify || !spotify.getAccessToken()) return;
    
    setLoading(true);
    setStatus("BREWING");
    setRecommendations([]);

    try {
      // 1. Ambil 5 lagu top user buat 'Seed'
      const topTracks = await spotify.getMyTopTracks({ limit: 5 });
      
      if (!topTracks.body.items.length) {
         alert("Butuh data Top Tracks dulu buat racik lagu!");
         setLoading(false);
         setStatus("IDLE");
         return;
      }

      const seedTracks = topTracks.body.items.map(t => t.id).join(",");

      // 2. Minta Rekomendasi ke Spotify
      const recs = await spotify.getRecommendations({
        seed_tracks: seedTracks,
        limit: 3, // Kita minta 3 lagu aja biar eksklusif
        min_popularity: 20 // Hindari lagu yang terlalu obscure/aneh
      });

      setRecommendations(recs.body.tracks);
      setStatus("SERVED");
    } catch (err) {
      console.error("Mesin Macet:", err);
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Tambah ke Queue
  const addToQueue = async (uri) => {
    if (!spotify) return;
    try {
        await spotify.addToQueue(uri);
        // Feedback visual simple (alert browser)
        alert("Track dropped into queue! 🎵"); 
    } catch (err) {
        console.error("Gagal add to queue", err);
        alert("Player not active. Please open Spotify app first.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative mt-8">
      
      {/* HEADER MESIN */}
      <div className="flex justify-center mb-4 relative z-10">
        <div className="bg-retro-dark text-retro-bg px-4 py-1 border-2 border-retro-bg text-xs font-bold font-mono uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          Sonic Vending
        </div>
      </div>

      {/* BODY MESIN */}
      <div className="relative bg-retro-bg border-3 border-retro-text p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)]">
        
        {/* Dekorasi Garis-garis Ventilasi */}
        <div className="absolute top-4 right-4 flex gap-1">
            <div className="w-1 h-6 bg-retro-text/20"></div>
            <div className="w-1 h-6 bg-retro-text/20"></div>
            <div className="w-1 h-6 bg-retro-text/20"></div>
        </div>

        {/* LAYAR TAMPILAN */}
        <div className="bg-black/90 border-4 border-inset border-retro-text/50 p-4 min-h-[160px] flex flex-col items-center justify-center text-center mb-6 relative overflow-hidden group">
            
            {/* Efek Scanline Layar */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>

            {loading ? (
                <div className="text-retro-primary font-mono text-xs animate-pulse">
                    [ PROCESSING TASTE PROFILE... ]
                    <br/>
                    MIXING INGREDIENTS...
                </div>
            ) : status === "IDLE" ? (
                <div className="text-retro-bg font-mono text-xs opacity-70">
                    INSERT COIN TO GET <br/>
                    <span className="text-retro-primary font-bold">MYSTERY MIX</span>
                </div>
            ) : status === "SERVED" && recommendations.length > 0 ? (
                <div className="w-full space-y-2 z-20">
                    {recommendations.map((track) => (
                        <div key={track.id} className="flex items-center justify-between bg-white/10 p-2 rounded border border-white/20">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Image 
                                    src={track.album.images[0]?.url} 
                                    width={30} height={30} 
                                    alt={track.name}
                                    className="border border-white/50" 
                                />
                                <div className="text-left overflow-hidden">
                                    <p className="text-[10px] font-bold text-white truncate w-32">{track.name}</p>
                                    <p className="text-[8px] text-gray-400 truncate w-32">{track.artists[0].name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => addToQueue(track.uri)}
                                className="text-[10px] bg-retro-primary text-retro-bg px-2 py-1 font-bold hover:bg-white transition-colors"
                            >
                                +Q
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-red-500 font-mono text-xs">
                    OUT OF STOCK <br/> (ERROR)
                </div>
            )}
        </div>

        {/* CONTROLS (TOMBOL BESAR) */}
        <div className="flex justify-center">
            <button
                onClick={dispenseMix}
                disabled={loading}
                className={`
                    w-full py-3 bg-retro-text text-retro-bg font-display font-black text-xl uppercase tracking-widest border-2 border-retro-bg
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all
                    ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-retro-primary hover:text-white"}
                `}
            >
                {loading ? "BREWING..." : "PUSH TO DISPENSE"}
            </button>
        </div>

        {/* Lubang Keluaran (Hiasan Bawah) */}
        <div className="mt-6 mx-auto w-3/4 h-3 bg-black/20 rounded-full blur-sm"></div>

      </div>
    </div>
  );
}