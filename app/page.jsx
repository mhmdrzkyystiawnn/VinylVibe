"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSpotify from "@/hooks/useSpotify";

// Import Semua Komponen
import Header from "@/components/Header";
import NowPlaying from "@/components/NowPlaying";
import TopTracks from "@/components/TopTracks";
import RecentlyPlayed from "@/components/RecentlyPlayed";

export default function Home() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [user, setUser] = useState(null);

  // Ambil data user buat Header
  useEffect(() => {
    if (spotify.getAccessToken()) {
      spotify
        .getMe()
        .then((data) => setUser(data.body))
        .catch((err) => console.error(err));
    }
  }, [session, spotify]);

  return (
    // Tambahkan pattern grid halus di background biar makin retro
    <main className="min-h-screen bg-retro-bg text-retro-text font-body p-4 md:p-8 relative selection:bg-retro-primary selection:text-retro-bg overflow-x-hidden">
      
      {/* Background Grid Pattern (Visual Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
           style={{
             backgroundImage: "linear-gradient(#3E2723 1px, transparent 1px), linear-gradient(90deg, #3E2723 1px, transparent 1px)",
             backgroundSize: "24px 24px"
           }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 1. HEADER (Logo & User Profile) */}
        <div className="mb-8 md:mb-12">
          <Header user={user} />
        </div>

        {/* 2. GRID LAYOUT UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* === KOLOM KIRI (MONITORING STATION / PLAYER) === */}
          <div className="lg:col-span-5 w-full order-1 lg:order-1">
            <div className="sticky top-8 space-y-4">
               {/* Label Dekoratif diatas komponen */}
               <div className="hidden lg:block text-[10px] font-mono uppercase opacity-50 tracking-widest text-center border-b border-retro-text/20 pb-2">
                   MONITORING_STATION_ALPHA
               </div>
               
               <NowPlaying />
               
               {/* Hiasan teks tambahan di bawah player */}
               <div className="hidden lg:block text-center mt-4">
                  <p className="font-mono text-[9px] opacity-40">
                    BUFFER_SIZE: 1024KB • RATE: 44.1KHZ
                  </p>
               </div>
            </div>
          </div>

          {/* === KOLOM KANAN (DATA LOGS / LIST LAGU) === */}
          <div className="lg:col-span-7 w-full order-2 lg:order-2 space-y-16">
            
            {/* Bagian A: Top Tracks */}
            <section className="relative">
              {/* Garis konektor dekoratif antar section (hanya di desktop) */}
              <div className="hidden lg:block absolute -left-8 top-10 bottom-0 w-px border-l-2 border-dashed border-retro-text/10"></div>
              <TopTracks />
            </section>

            {/* Bagian B: Recently Played */}
            <section className="relative">
              <div className="hidden lg:block absolute -left-8 top-0 h-full w-px border-l-2 border-dashed border-retro-text/10"></div>
              <RecentlyPlayed />
            </section>

          </div>

        </div>

        {/* Footer Kecil - Gaya Terminal System */}
        <div className="mt-24 pt-6 border-t-4 border-double border-retro-text/20 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2 font-bold text-retro-text">
            VINYLVIBE SYSTEM v1.0 • STATUS: ONLINE
          </p>
          <p className="font-mono text-[10px] opacity-40">
            POWERED BY SPOTIFY API • {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </main>
  );
}