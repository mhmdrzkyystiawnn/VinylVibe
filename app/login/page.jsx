"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

// --- ICON COMPONENTS (Sama seperti di VendingMachine) ---
const Icons = {
  Coin: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 2h8v2h4v4h2v8h-2v4h-4v2H8v-2H4v-4H2V8h2V4h4V2zm0 2H4v4H2v8h2v4h4v2h8v-2h4v-4h2V8h-2V4h-4V2H8v2zm3 2h2v2h2v2h-4v2h4v2h-2v2h-2v-2h-2v-2h4v-2h-4V8h2V6z" />
    </svg>
  ),
  Spotify: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.58 14.43a.62.62 0 0 1-.85.2c-2.33-1.42-5.26-1.74-8.71-.95a.62.62 0 1 1-.28-1.21c3.84-.88 7.11-.51 9.8 1.13a.62.62 0 0 1 .24.83zm1.21-2.7a.78.78 0 0 1-1.07.26c-2.68-1.65-6.76-2.13-9.92-1.17a.78.78 0 1 1-.46-1.51c3.64-1.1 8.21-.55 11.23 1.3a.78.78 0 0 1 .22 1.12zM18 9.39c-3.2-1.9-8.5-2.08-11.56-1.15a.94.94 0 1 1-.54-1.8c3.56-1.09 9.47-.87 13.16 1.33a.94.94 0 0 1-1.06 1.62z" />
    </svg>
  ),
  Gear: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v2h4v4h2v2h2v4h-2v2h-2v4h-4v2h-4v-2H6v-4H4v-2H2v-4h2V8h2V4h4V2zm2 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Ganti callbackUrl sesuai kebutuhan (misal ke "/" atau "/vending-machine")
    signIn("spotify", { callbackUrl: "/" }); 
  };

  return (
    // Background senada dengan Vending Machine Body
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-retro-bg text-retro-text font-body relative selection:bg-retro-primary selection:text-retro-bg overflow-x-hidden">
      
      {/* === CASING MESIN (Border Luar) === */}
      <div className="relative w-full max-w-md bg-linear-to-b from-[#D4B896] to-[#C4A57B] border-4 border-retro-text rounded-3xl p-6 shadow-[10px_10px_0px_0px_rgba(62,39,35,1)]">
        
        {/* Baut/Sekrup Dekorasi di Pojok */}
        <div className="absolute top-3 left-3 w-3 h-3 bg-retro-text/20 rounded-full border border-retro-text/50"></div>
        <div className="absolute top-3 right-3 w-3 h-3 bg-retro-text/20 rounded-full border border-retro-text/50"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 bg-retro-text/20 rounded-full border border-retro-text/50"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 bg-retro-text/20 rounded-full border border-retro-text/50"></div>

        {/* === LAYAR CRT (Main Screen) === */}
        <div className="relative bg-black border-4 border-retro-text rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] min-h-125 flex flex-col items-center justify-between py-12 px-6">
          
          {/* Efek Layar CRT */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-10"></div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,0,0.03),rgba(0,255,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none z-10"></div>
          
          {/* --- KONTEN LAYAR --- */}
          <div className="relative z-20 flex flex-col items-center w-full h-full text-center">
            
            {/* Header: Judul Game/App */}
            <div className="mb-8 space-y-2">
              <div className="inline-block px-4 py-1 bg-retro-primary text-retro-bg font-black text-xs tracking-widest rounded border-2 border-retro-bg shadow-[0_0_10px_rgba(205,86,86,0.6)] animate-pulse">
                VERSION 1.0
              </div>
              <h1 className="text-4xl md:text-4xl font-display font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] tracking-tighter leading-none">
                MYSTERY<br/>MIX
              </h1>
              <p className="text-green-600/80 text-xs font-bold tracking-[0.3em] mt-2">
                DIGITAL JUKEBOX
              </p>
            </div>

            {/* Visual Tengah: Animasi Koin */}
            <div className="flex-1 flex items-center justify-center relative w-full">
              {isLoading ? (
                // Animasi Loading (Gear Muter)
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse"></div>
                    <Icons.Gear className="w-20 h-20 text-green-400 animate-spin" />
                  </div>
                  <p className="text-green-400 font-bold text-sm blink">CONNECTING...</p>
                </div>
              ) : (
                // Animasi Idle (Koin Melayang)
                <div className="animate-bounce">
                  <div className="w-24 h-24 rounded-full bg-yellow-500 border-4 border-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center text-yellow-900 relative group">
                    <Icons.Coin className="w-16 h-16 group-hover:scale-110 transition-transform" />
                    {/* Kilauan Koin */}
                    <div className="absolute top-2 right-4 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Instruksi */}
            <div className="mt-8 space-y-4 w-full">
              {!isLoading && (
                <div className="text-green-500/60 text-[10px] animate-pulse">
                  INSERT COIN TO START
                </div>
              )}

              {/* Tombol Login (Dibuat seperti lubang koin/tombol arcade) */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`
                  group w-full relative py-4 bg-retro-primary hover:bg-retro-light text-retro-bg 
                  font-display font-black text-xl uppercase tracking-widest 
                  rounded-lg border-b-4 border-r-4 border-retro-dark active:border-0 active:translate-y-1 active:shadow-inner
                  transition-all duration-100 flex items-center justify-center gap-3
                  ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02]'}
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-retro-bg rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-retro-bg rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-retro-bg rounded-full animate-bounce delay-300"></span>
                  </span>
                ) : (
                  <>
                    <Icons.Spotify className="w-10 h-10" />
                    <span>INSERT COIN</span>
                  </>
                )}
              </button>
              
              <div className="flex justify-between items-center text-[9px] text-green-800/50 pt-2 border-t border-green-900/30">
                <span>© 2025 VINYLVIBE</span>
                <span>50¢ / PLAY</span>
              </div>
            </div>

          </div>
        </div>

        {/* Lubang Kembalian (Dekorasi Bawah) */}
        <div className="mt-6 mx-auto w-32 h-4 bg-black/20 rounded-full shadow-inner border border-black/10"></div>

      </div>

      <style jsx>{`
        .blink {
          animation: blink-animation 1s steps(2, start) infinite;
        }
        @keyframes blink-animation {
          to { visibility: hidden; }
        }
      `}</style>
    </div>
  );
}