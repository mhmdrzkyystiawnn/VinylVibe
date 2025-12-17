"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSpotify from "@/hooks/useSpotify";

// Import Components yang udah kita pecah
import Header from "@/components/Header";
import NowPlaying from "@/components/NowPlaying";
import TopTracks from "@/components/TopTracks";

export default function Home() {
  const { data: session, status } = useSession();
  const spotify = useSpotify();
  const [user, setUser] = useState(null);

  // Ambil data user (Profil) di sini karena dipake di Header
  useEffect(() => {
    if (spotify.getAccessToken()) {
      spotify
        .getMe()
        .then((data) => setUser(data.body))
        .catch((err) => console.error(err));
    }
  }, [session, spotify]);

  // Redirect Login
  if (status === "unauthenticated") {
    return (
      <div className="h-screen flex items-center justify-center bg-retro-bg">
        <a href="/login" className="text-retro-dark underline font-bold text-xl">
          Please Login First
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-retro-bg text-retro-dark font-body">
      
      {/* 1. HEADER COMPONENT */}
      <Header user={user} />

      {/* Grid Layout */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* 2. NOW PLAYING COMPONENT */}
        <NowPlaying />

        {/* 3. TOP TRACKS COMPONENT */}
        <TopTracks />

      </div>

      <div className="mt-12 text-center opacity-50 font-mono text-xs">
        VINYLVIBE SYSTEM v1.0 • MODULAR DESIGN
      </div>
    </main>
  );
}