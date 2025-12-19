import { useState, useEffect } from "react";
import { Icons } from "./Icons";

export default function VendingMachineControls({ loading, status, usedTrackIds, isPremium, onInsertCoin }) {
  
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if first time user
  useEffect(() => {
    const interacted = localStorage.getItem('vinylvibe-interacted');
    if (!interacted && status === 'IDLE') {
      // Show hint after 2 seconds for first-time users
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Hide hint when user interacts
  const handleInsertCoin = () => {
    if (!hasInteracted) {
      localStorage.setItem('vinylvibe-interacted', 'true');
      setHasInteracted(true);
      setShowHint(false);
    }
    onInsertCoin();
  };

  const isButtonDisabled = loading || status === 'SELECTING' || status === 'BREWING';

  return (
    <div className="space-y-2 md:space-y-3 mb-4 md:mb-5 relative">
      
      {/* ANIMATED HINT - For First Time Users */}
      {showHint && status === 'IDLE' && !hasInteracted && (
        <div className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="relative">
            {/* Hint Bubble */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black px-4 py-2 md:px-5 md:py-3 rounded-2xl font-bold text-xs md:text-sm shadow-2xl border-3 border-yellow-600">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl">👇</span>
                <span>Tap to discover new music!</span>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
          </div>
        </div>
      )}

      {/* === TOMBOL FISIK UTAMA: INSERT COIN === */}
      <button
        onClick={handleInsertCoin}
        disabled={isButtonDisabled}
        className={`
          w-full py-3 md:py-5 bg-linear-to-b from-retro-light via-retro-primary to-retro-dark 
          text-retro-bg font-display font-black text-base md:text-xl uppercase tracking-widest 
          rounded-xl border-4 border-retro-text
          shadow-[0_4px_0px_0px_rgba(62,39,35,1)] md:shadow-[0_6px_0px_0px_rgba(62,39,35,1)]
          active:translate-y-1.5 active:shadow-[0_2px_0px_0px_rgba(62,39,35,1)] 
          transition-all duration-100
          ${isButtonDisabled ? "opacity-50 cursor-not-allowed filter grayscale" : "hover:brightness-110"}
          relative overflow-hidden group touch-manipulation
        `}
      >
        {/* Efek Kilau (Sheen) */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Label Tombol dengan Hints */}
        <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-1">
           {status === 'SELECTING' ? (
             <>
               <span className="flex items-center gap-2">👆 CHOOSE ON SCREEN 👆</span>
               <span className="text-[10px] md:text-xs opacity-80 font-normal">Pick your vibe mode above</span>
             </>
           ) : loading ? (
             <>
               <span className="flex items-center gap-2">
                 <Icons.Gear className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                 <span>BREWING...</span>
               </span>
               <span className="text-[10px] md:text-xs opacity-80 font-normal">Finding perfect tracks for you</span>
             </>
           ) : (
             <>
               <span className="flex items-center gap-2">
                 <Icons.Coin className="w-5 h-5 md:w-6 md:h-6" />
                 <span>INSERT COIN</span>
               </span>
               <span className="text-[10px] md:text-xs opacity-80 font-normal">Get 3 personalized tracks</span>
             </>
           )}
        </span>
      </button>

      {/* === STATUS PANEL (LCD) === */}
      <div className="bg-black/40 rounded-lg p-2 md:p-2.5 border-2 border-retro-text shadow-inner">
        <div className="flex items-center justify-between text-[7px] md:text-[9px] font-mono text-amber-400/80 font-bold">
          
          {/* Indikator Status & Lampu LED */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border border-retro-text transition-colors duration-300 ${
              status === 'IDLE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
              status === 'SELECTING' ? 'bg-yellow-400 animate-bounce shadow-[0_0_8px_rgba(250,204,21,0.8)]' :
              status === 'BREWING' ? 'bg-amber-500 animate-pulse' : 
              status === 'SERVED' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
              'bg-red-500'
            }`}></div>
            <span>STATUS: {status}</span>
          </div>

          {/* Info Seeds & Premium */}
          <div className="flex items-center gap-2 md:gap-3">
            <span title="Unique tracks used as seeds">SEEDS: {usedTrackIds.length}/20</span>
            {isPremium && (
              <div className="items-center gap-1 text-amber-300 hidden md:flex" title="Premium features enabled">
                  <Icons.Star className="w-3 h-3" /> <span>PREMIUM</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Helper Text - Only show when served */}
      {status === 'SERVED' && (
        <div className="text-center text-[10px] md:text-xs text-retro-text/60 font-mono animate-pulse">
          💡 Tip: Click receipt icon to save & share your mix!
        </div>
      )}
    </div>
  );
}