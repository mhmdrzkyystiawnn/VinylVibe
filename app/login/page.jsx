"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-retro-bg text-retro-dark">
      
      {/* Dekorasi Piringan Hitam (CSS Only) */}
      <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-retro-dark flex items-center justify-center animate-spin-slow mb-8 border-4 border-retro-primary shadow-[8px_8px_0px_0px_var(--color-retro-light)]">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-retro-light border-4 border-retro-bg"></div>
      </div>

      {/* Judul */}
      <h1 className="text-5xl md:text-7xl font-display font-bold mb-2 tracking-tighter">
        VINYLVIBE
      </h1>
      <p className="text-retro-primary font-body text-sm md:text-lg mb-12 tracking-widest uppercase">
        Your Digital Record Collection
      </p>

      {/* Tombol Login */}
      <button
        onClick={() => signIn("spotify", { callbackUrl: "/" })}
        className="group relative px-8 py-4 bg-retro-primary text-retro-bg font-bold text-xl rounded-lg border-2 border-retro-dark shadow-[4px_4px_0px_0px_var(--color-retro-dark)] active:translate-y-1 active:shadow-none transition-all"
      >
        <span className="font-display">LOGIN WITH SPOTIFY</span>
      </button>

      {/* Footer Text */}
      <p className="mt-8 text-xs font-mono opacity-60">
        Powered by Spotify API • Next.js • Tailwind v4
      </p>
    </div>
  );
}