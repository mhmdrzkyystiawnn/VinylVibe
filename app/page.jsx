"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSpotify from "@/hooks/useSpotify";

// Import Semua Komponen
import Header from "@/components/Header";
import NowPlaying from "@/components/NowPlaying";
import TopTracks from "@/components/TopTracks";
import RecentlyPlayed from "@/components/RecentlyPlayed"; // <--- Jangan lupa import ini

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
    <main className="min-h-screen bg-retro-bg text-retro-dark font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. HEADER (Logo & User Profile) */}
        <div className="mb-12">
          <Header user={user} />
        </div>

        {/* 2. GRID LAYOUT UTAMA */}
        {/* Di HP: 1 Kolom ke bawah. Di Laptop: 12 Kolom (Kiri 5, Kanan 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* === KOLOM KIRI (PIRINGAN HITAM / PLAYER) === */}
          <div className="lg:col-span-5 w-full">
            {/* 'sticky top-8' bikin dia diem di tempat pas discroll */}
            <div className="sticky top-8">
              <NowPlaying />
            </div>
          </div>

          {/* === KOLOM KANAN (LIST LAGU) === */}
          <div className="lg:col-span-7 space-y-12 w-full">
            
            {/* Bagian A: Top Tracks */}
            <section>
              <TopTracks />
            </section>

            {/* Bagian B: Recently Played (History) */}
            <section>
              <RecentlyPlayed />
            </section>

          </div>

        </div>

        {/* Footer Kecil */}
        <div className="mt-20 pt-8 border-t-2 border-dashed border-retro-dark/20 text-center opacity-40 font-mono text-[10px] tracking-widest">
          VINYLVIBE SYSTEM v1.0 • CONNECTED TO SPOTIFY API
        </div>

      </div>
    </main>
  );
}