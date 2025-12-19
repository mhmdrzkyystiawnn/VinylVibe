import Image from "next/image";
import { Icons } from "./Icons";

export default function VendingMachineDisplay({ state, actions }) {
  const { loading, dispensing, status, scanType, seedInfo, recommendations, isPremium } = state;
  const { openInSpotify, tryAddToQueue, selectModeAndBrew, printReceipt } = actions;

  return (
    <div className="relative bg-linear-to-b from-gray-900 via-black to-gray-900 border-4 border-retro-text rounded-xl p-3 md:p-5 min-h-75 md:min-h-95 mb-4 md:mb-5 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] flex flex-col">
      
      {/* Screen Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none z-20"></div>
      <div className="absolute top-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none z-20"></div>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(205,86,86,0.03),rgba(205,86,86,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none z-20"></div>

      <div className="relative z-10 w-full h-full flex flex-col justify-center overflow-y-auto no-scrollbar">
        
        {/* MODE 1: SELECTING */}
        {status === 'SELECTING' ? (
          <div className="flex flex-col gap-3 px-2 animate-in fade-in zoom-in duration-300">
             <div className="text-center text-green-400 font-mono text-xs md:text-sm font-bold mb-2 animate-pulse">
               &gt; SELECT_MODE_
             </div>
             
             <button onClick={() => selectModeAndBrew('OBSESSION')} className="group flex items-center justify-between bg-green-900/20 border-2 border-green-600/50 hover:bg-green-600 hover:text-black hover:border-green-400 p-2 rounded text-green-400 transition-all text-left">
                <div className="flex flex-col">
                  <span className="font-black text-xs md:text-sm">🔥 OBSESSION</span>
                  <span className="text-[9px] opacity-70 group-hover:text-black/70">1 Bulan Lalu</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 font-black">&lt;</span>
             </button>

             <button onClick={() => selectModeAndBrew('RECENT')} className="group flex items-center justify-between bg-amber-900/20 border-2 border-amber-600/50 hover:bg-amber-500 hover:text-black hover:border-amber-400 p-2 rounded text-amber-500 transition-all text-left">
                <div className="flex flex-col">
                  <span className="font-black text-xs md:text-sm">🎲 RECENT VIBES</span>
                  <span className="text-[9px] opacity-70 group-hover:text-black/70">History Lagu Baru Kamu Putar</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 font-black">&lt;</span>
             </button>

             <button onClick={() => selectModeAndBrew('NOSTALGIA')} className="group flex items-center justify-between bg-purple-900/20 border-2 border-purple-600/50 hover:bg-[#a29bfe] hover:text-black hover:border-purple-300 p-2 rounded text-[#a29bfe] transition-all text-left">
                <div className="flex flex-col">
                  <span className="font-black text-xs md:text-sm">✨ NOSTALGIA</span>
                  <span className="text-[9px] opacity-70 group-hover:text-black/70">1 Tahun Lalu</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 font-black">&lt;</span>
             </button>
          </div>

        ) : loading && !dispensing ? (
           <div className="text-center space-y-4 py-4">
             <div className="text-retro-primary font-mono text-xs md:text-sm font-bold animate-pulse">[ ANALYZING... ]</div>
             <div className="text-xs font-black tracking-widest py-1 px-2 rounded border-2 border-green-400 text-green-400 inline-block mb-2">
                MODE: {scanType}
             </div>
             {seedInfo && (
                <div className="flex items-center justify-center gap-3 bg-retro-primary/10 p-2 rounded-lg border-2 border-retro-primary/30 mx-2">
                  {seedInfo.image && <Image src={seedInfo.image} width={40} height={40} alt="seed" className="rounded border-2 border-retro-primary" />}
                  <div className="text-left min-w-0">
                    <p className="text-[8px] text-retro-primary/80 font-mono font-bold">SEED:</p>
                    <p className="text-xs font-bold text-retro-light truncate">{seedInfo.name}</p>
                  </div>
                </div>
             )}
           </div>

        ) : dispensing ? (
           <div className="text-center space-y-4 py-6">
             <div className="text-retro-primary font-black text-xl animate-pulse">⬇ DISPENSING ⬇</div>
             <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-item-drop" style={{ animationDelay: `${i * 0.3}s` }}>
                     <div className="w-14 h-18 bg-retro-light/40 border-4 border-retro-primary rounded-xl flex items-center justify-center">
                        <Icons.Music className="w-8 h-8 text-retro-primary" />
                     </div>
                  </div>
                ))}
             </div>
           </div>

        ) : status === "SERVED" && recommendations.length > 0 ? (
           <div className="space-y-2 pb-2">
             {/* SEED TRACK INFO - Yang dipake buat nyari rekomendasi */}
             {seedInfo && (
               <div className="sticky top-0 bg-gradient-to-r from-yellow-900/40 via-yellow-800/40 to-yellow-900/40 backdrop-blur-sm z-30 px-2 py-2 mb-3 rounded-lg border-2 border-yellow-500/50 shadow-lg">
                 <div className="flex items-center gap-2">
                   {seedInfo.image && (
                     <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-yellow-400/50 shrink-0">
                       <Image src={seedInfo.image} width={40} height={40} alt="seed" className="object-cover" />
                     </div>
                   )}
                   <div className="min-w-0 flex-1">
                     <p className="text-[9px] text-yellow-300/80 font-mono font-bold uppercase tracking-wide">Based on:</p>
                     <p className="text-xs font-bold text-yellow-200 truncate">{seedInfo.name}</p>
                     <p className="text-[9px] text-yellow-300/60 truncate">{seedInfo.artist}</p>
                   </div>
                   <div className="shrink-0">
                     <div className="bg-yellow-500/20 px-2 py-1 rounded border border-yellow-400/30">
                       <span className="text-[8px] font-mono font-black text-yellow-300">SEED</span>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             <div className="sticky top-16 bg-black/80 backdrop-blur-sm z-20 px-1 py-1 mb-2 border-b border-retro-text/30 flex justify-between items-center">
               <span className="text-[10px] font-mono text-green-400 animate-pulse">Select track to print receipt 🖨️</span>
             </div>

             {recommendations.map((track) => (
               <div key={track.id} className="flex items-center justify-between bg-retro-bg/20 p-2 rounded-xl border-2 border-retro-bg/30 hover:border-retro-light transition-all">
                 <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <Image src={track.album.images[0]?.url || '/placeholder.png'} width={40} height={40} alt={track.name} className="rounded-lg border-2 border-retro-bg/50" />
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-bold text-retro-light truncate">{track.name}</p>
                      <p className="text-[10px] text-retro-bg/70 truncate">{track.artists[0].name}</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-1.5 ml-1">
                   {/* TOMBOL PRINT RECEIPT */}
                   <button 
                      onClick={() => printReceipt(track)} 
                      className="h-7 w-7 bg-white text-black rounded-lg flex items-center justify-center border-b-2 border-gray-400 active:border-b-0 active:translate-y-0.5 hover:bg-gray-200 transition-colors"
                      title="Ambil Struk"
                   >
                      <Icons.Receipt className="w-4 h-4" />
                   </button>

                   <button onClick={() => openInSpotify(track.uri)} className="h-7 w-7 bg-green-600 text-white rounded-lg flex items-center justify-center border-b-2 border-green-800 active:border-b-0 active:translate-y-0.5"><Icons.Play className="w-3 h-3"/></button>
                   {isPremium && <button onClick={() => tryAddToQueue(track.uri)} className="h-7 w-7 bg-retro-light text-white rounded-lg flex items-center justify-center"><Icons.Plus className="w-3 h-3"/></button>}
                 </div>
               </div>
             ))}
           </div>

        ) : status === "ERROR" ? (
           <div className="text-center py-8">
             <Icons.Warning className="w-10 h-10 text-retro-primary animate-pulse mx-auto mb-2" />
             <div className="text-retro-primary font-black text-xl">OUT OF STOCK</div>
             <div className="text-retro-bg/40 text-xs mt-2">Tap button to retry</div>
           </div>

        ) : (
           <div className="text-center space-y-3 py-8">
              <Icons.Music className="w-16 h-16 text-retro-primary/80 mx-auto animate-bounce" />
              <div className="text-retro-primary font-black text-2xl tracking-wider leading-tight">MYSTERY<br/>MIX</div>
              <div className="text-[10px] text-retro-bg/40 font-mono mt-4">INSERT COIN TO START</div>
           </div>
        )}

      </div>
    </div>
  );
}