"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSpotify from "@/hooks/useSpotify";

import Header from "@/components/Header";
import NowPlaying from "@/components/NowPlaying";
import TopTracks from "@/components/TopTracks";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import VendingMachine from "@/components/VendingMachine";

export default function Home() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const equalizerBars = useState(() => 
    Array.from({ length: 12 }, () => ({
      height: Math.random() * 60 + 40,
      duration: Math.random() * 0.5 + 0.5
    }))
  )[0];
 // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (spotify.getAccessToken()) {
      spotify
        .getMe()
        .then((data) => setUser(data.body))
        .catch((err) => console.error(err));
    }
  }, [session, spotify]);

  return (
    <main className="min-h-screen bg-retro-bg text-retro-text font-body relative selection:bg-retro-primary selection:text-retro-bg overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: "repeating-linear-gradient(45deg, #3E2723 0px, #3E2723 2px, transparent 2px, transparent 12px)",
             }}
        />
        <div className="absolute inset-0"
             style={{
               backgroundImage: "linear-gradient(#3E2723 1px, transparent 1px), linear-gradient(90deg, #3E2723 1px, transparent 1px)",
               backgroundSize: "40px 40px"
             }}
        />
      </div>

      <div className="fixed top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-retro-primary/30 pointer-events-none z-50"></div>

      <div className="fixed top-0 left-0 right-0 bg-retro-dark text-retro-bg py-2 overflow-hidden z-40 border-b-4 border-retro-text shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="inline-block px-8 font-display font-black text-sm uppercase tracking-wider">
            NOW PLAYING YOUR VIBE - POWERED BY SPOTIFY - 90s MUSIC EXPERIENCE - VINYLVIBE SYSTEM v1.0
          </span>
          <span className="inline-block px-8 font-display font-black text-sm uppercase tracking-wider">
            NOW PLAYING YOUR VIBE - POWERED BY SPOTIFY - 90s MUSIC EXPERIENCE - VINYLVIBE SYSTEM v1.0
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 pt-20 pb-12">
        
        <div className="mb-12 relative">
          <div className="absolute -top-4 left-0 w-12 h-12 border-4 border-retro-primary/20 rounded-full"></div>
          <div className="absolute -top-4 left-6 w-8 h-8 border-4 border-retro-dark/20 rounded-full"></div>
          
          <div className="bg-gradient-to-r from-retro-bg via-[#E5E6C1] to-retro-bg border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] relative overflow-hidden">
            <div className="absolute top-4 left-8 w-16 h-16 border-4 border-retro-text/10 rounded-full"></div>
            <div className="absolute top-4 right-8 w-16 h-16 border-4 border-retro-text/10 rounded-full"></div>
            
            <Header user={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-5 w-full order-1 lg:order-1">
            
            <div className="bg-gradient-to-b from-[#D4B896] to-[#C4A57B] border-8 border-retro-text rounded-3xl p-6 shadow-[12px_12px_0px_0px_rgba(62,39,35,1)] relative">
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-6 bg-retro-text/20 rounded-full"></div>
                ))}
              </div>

              <div className="absolute top-6 right-6 flex gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <div className="w-3 h-3 bg-retro-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(205,86,86,0.8)]"></div>
              </div>

              <div className="sticky top-24 space-y-6">
                
                <div className="flex items-center gap-3 pb-3 border-b-2 border-retro-text/20">
                  <div className="w-8 h-8 bg-retro-primary border-3 border-retro-text rounded-lg flex items-center justify-center">
                    <span className="text-retro-bg font-black text-lg">&#9835;</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest font-bold opacity-70">
                      Control Panel
                    </div>
                    <div className="text-[10px] font-mono opacity-40">
                      DECK A ACTIVE
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-3 -top-3 bg-retro-dark text-retro-bg px-2 py-1 text-[10px] font-black rounded border-2 border-retro-text shadow-md">
                    DECK A
                  </div>
                  <NowPlaying />
                </div>
                
                <div className="flex items-center gap-4 py-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-retro-text/30 to-transparent flex-1"></div>
                  <div className="text-2xl">&#127902;</div>
                  <div className="h-px bg-gradient-to-r from-transparent via-retro-text/30 to-transparent flex-1"></div>
                </div>

                <div className="relative">
                  <div className="absolute -left-3 -top-3 bg-retro-primary text-retro-bg px-2 py-1 text-[10px] font-black rounded border-2 border-retro-text shadow-md z-10">
                    DECK B
                  </div>
                  <VendingMachine />
                </div>

                <div className="flex items-end justify-center gap-1 h-12 pt-4 border-t-2 border-retro-text/20">
                  {equalizerBars.map((bar, i) => (
                    <div 
                      key={i} 
                      className="w-3 bg-gradient-to-t from-retro-primary to-retro-light rounded-t"
                      style={{ 
                        height: `${bar.height}%`,
                        animation: `equalizer ${bar.duration}s ease-in-out infinite alternate`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 w-full order-2 lg:order-2 space-y-12">
            
            <section className="relative">
              <div className="bg-gradient-to-br from-retro-bg to-[#E5E6C1] border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] relative overflow-hidden">
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-retro-primary/10 to-transparent rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-4 mb-6 pb-4 border-b-4 border-double border-retro-text/20">
                  <div className="w-12 h-12 bg-retro-dark border-4 border-retro-text rounded-full flex items-center justify-center shadow-lg relative">
                    <div className="absolute inset-2 border-2 border-retro-bg/50 rounded-full"></div>
                    <span className="text-retro-bg font-black text-xl relative z-10">&#128191;</span>
                  </div>
                  <div>
                    <h2 className="font-display font-black text-3xl text-retro-dark uppercase tracking-tight">
                      Top Tracks
                    </h2>
                    <p className="text-xs font-mono opacity-60">YOUR MOST PLAYED HITS</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="bg-retro-primary text-retro-bg px-3 py-1 rounded-full border-2 border-retro-text text-[10px] font-black">
                      HOT
                    </div>
                  </div>
                </div>
                
                <TopTracks />
              </div>
            </section>

            <section className="relative">
              <div className="bg-gradient-to-br from-[#E5E6C1] to-retro-bg border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] relative overflow-hidden">
                
                <div className="absolute top-0 left-0 right-0 h-2 bg-retro-dark opacity-20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-retro-dark opacity-20"></div>
                
                <div className="flex items-center gap-4 mb-6 pb-4 border-b-4 border-double border-retro-text/20">
                  <div className="w-12 h-12 bg-retro-light border-4 border-retro-text rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-retro-bg font-black text-xl">&#127902;</span>
                  </div>
                  <div>
                    <h2 className="font-display font-black text-3xl text-retro-dark uppercase tracking-tight">
                      Recent Plays
                    </h2>
                    <p className="text-xs font-mono opacity-60">YOUR LISTENING HISTORY</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="bg-retro-light text-retro-bg px-3 py-1 rounded-full border-2 border-retro-text text-[10px] font-black">
                      NEW
                    </div>
                  </div>
                </div>
                
                <RecentlyPlayed />
              </div>
            </section>

          </div>

        </div>

        <div className="mt-20 relative">
          <div className="bg-gradient-to-r from-retro-dark via-retro-primary to-retro-dark border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] text-center relative overflow-hidden">
            
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute border-4 border-retro-bg rounded-full animate-ping"
                  style={{ 
                    width: `${(i + 1) * 100}px`,
                    height: `${(i + 1) * 100}px`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="font-display font-black text-2xl uppercase tracking-wider text-retro-bg mb-2">
                VINYLVIBE STATION
              </div>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-24 h-1 bg-retro-bg/50 rounded-full"></div>
                <p className="font-mono text-sm text-retro-bg font-bold">
                  FM 90.5 ON AIR
                </p>
                <div className="w-24 h-1 bg-retro-bg/50 rounded-full"></div>
              </div>
              <p className="font-mono text-xs text-retro-bg/70 uppercase tracking-widest">
                Broadcasting Since {new Date().getFullYear()} - Powered by Spotify API
              </p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes equalizer {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </main>
  );
}