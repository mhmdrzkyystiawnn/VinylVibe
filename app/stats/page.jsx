"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../../hooks/useSpotify";
import Image from "next/image";
import Link from "next/link";
import { toPng } from 'html-to-image';

export default function StatsPage() {
  useSession();
  const spotify = useSpotify();

  const [activeTab, setActiveTab] = useState("tracks");
  const [timeRange, setTimeRange] = useState("short_term");
  const [limit, setLimit] = useState(5);
  
  const [items, setItems] = useState([]); 
  const [genres, setGenres] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const receiptRef = useRef(null);

  // Fetch user profile (separate effect)
  useEffect(() => {
    if (spotify && spotify.getAccessToken()) {
        spotify.getMe().then(data => setUserProfile(data.body)).catch(err => console.error(err));
    }
  }, [spotify]);

  // Fetch stats data (with proper dependency array)
  useEffect(() => {
    if (!spotify || !spotify.getAccessToken()) return;
    
    const fetchData = async () => {
        // Set loading state at the start of async operation
        setLoading(true);
        setItems([]); 
        
        try {
            let dataItems = [];
            
            if (activeTab === "tracks") {
                const res = await spotify.getMyTopTracks({ limit, time_range: timeRange });
                dataItems = res.body.items;
            } else {
                const res = await spotify.getMyTopArtists({ limit, time_range: timeRange });
                dataItems = res.body.items;
                
                const genreCounts = {};
                dataItems.forEach(artist => {
                    artist.genres.forEach(genre => {
                        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                    });
                });
                const sortedGenres = Object.entries(genreCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5) 
                    .map(([name, count]) => ({ name, count }));
                
                setGenres(sortedGenres);
            }
            
            setItems(dataItems);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [spotify, activeTab, timeRange, limit]);

  const handleDownloadImage = useCallback(() => {
    if (receiptRef.current === null) return;

    toPng(receiptRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `vinylvibe-receipt-${activeTab}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Download failed:", err);
      });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text font-body relative overflow-x-hidden">
      
      {/* Background Pattern */}
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

      {/* Corner Brackets */}
      <div className="fixed top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-retro-primary/30 pointer-events-none z-50"></div>

      {/* Marquee Header */}
      <div className="fixed top-0 left-0 right-0 bg-retro-dark text-retro-bg py-2 overflow-hidden z-40 border-b-4 border-retro-text shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="inline-block px-8 font-display font-black text-sm uppercase tracking-wider">
            STATS CENTER - YOUR MUSIC DNA - POWERED BY SPOTIFY AND LAST.FM - VINYLVIBE ANALYTICS v1.0
          </span>
          <span className="inline-block px-8 font-display font-black text-sm uppercase tracking-wider">
            STATS CENTER - YOUR MUSIC DNA - POWERED BY SPOTIFY AND LAST.FM - VINYLVIBE ANALYTICS v1.0
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 pt-20 pb-12">
        
        {/* Back Button Header */}
        <div className="mb-8">
          <div className="absolute -top-4 left-0 w-12 h-12 border-4 border-retro-primary/20 rounded-full"></div>
          <div className="absolute -top-4 left-6 w-8 h-8 border-4 border-retro-dark/20 rounded-full"></div>
          
          <div className="bg-linear-to-r from-retro-dark via-retro-primary to-retro-dark border-4 border-retro-text rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 font-display font-black text-retro-bg uppercase hover:scale-105 transition-transform">
                <span className="text-2xl">←</span>
                <span className="text-lg">BACK TO STATION</span>
              </Link>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <div className="w-3 h-3 bg-retro-bg rounded-full animate-pulse shadow-[0_0_8px_rgba(234,235,208,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
          {/* SIDEBAR - Left Column */}
          <div className="lg:col-span-4 w-full">
            
            <div className="bg-linear-to-b from-[#D4B896] to-[#C4A57B] border-8 border-retro-text rounded-3xl p-6 shadow-[12px_12px_0px_0px_rgba(62,39,35,1)] relative">
              
              {/* Decorative Elements */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-6 bg-retro-text/20 rounded-full"></div>
                ))}
              </div>

              <div className="absolute top-6 right-6 flex gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <div className="w-3 h-3 bg-retro-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(205,86,86,0.8)]"></div>
              </div>

              <div className="space-y-6">
                
                {/* Profile Section */}
                <div className="relative">
                  <div className="absolute -left-3 -top-3 bg-retro-dark text-retro-bg px-2 py-1 text-[10px] font-black rounded border-2 border-retro-text shadow-md">
                    PROFILE
                  </div>
                  
                  <div className="bg-linear-to-br from-retro-bg/50 to-transparent border-4 border-retro-text/30 rounded-xl p-4 mt-2">
                    <div className="text-center">
                      {userProfile?.images?.[0] && (
                        <div className="w-24 h-24 mx-auto rounded-full border-4 border-retro-text overflow-hidden mb-3 shadow-lg">
                          <Image 
                            src={userProfile.images[0].url} 
                            width={96} height={96} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h2 className="font-display font-black text-lg uppercase leading-tight">{userProfile?.display_name}</h2>
                      <p className="font-mono text-[10px] opacity-60 mt-1">{userProfile?.followers?.total} FOLLOWERS</p>
                    </div>

                    {genres.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-retro-text/30">
                        <h3 className="font-mono text-[10px] font-bold uppercase mb-2 text-center">TOP GENRES</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {genres.map((g, i) => (
                            <span key={i} className="px-2 py-1 bg-retro-text text-retro-bg text-[9px] font-bold font-mono uppercase rounded">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 py-3">
                  <div className="h-px bg-linear-to-r from-transparent via-retro-text/30 to-transparent flex-1"></div>
                  <div className="text-2xl">⚙️</div>
                  <div className="h-px bg-linear-to-r from-transparent via-retro-text/30 to-transparent flex-1"></div>
                </div>

                {/* Control Panel */}
                <div className="relative">
                  <div className="absolute -left-3 -top-3 bg-retro-primary text-retro-bg px-2 py-1 text-[10px] font-black rounded border-2 border-retro-text shadow-md z-10">
                    CONTROLS
                  </div>
                  
                  <div className="bg-linear-to-br from-retro-bg/50 to-transparent border-4 border-retro-text/30 rounded-xl p-4 mt-2 space-y-4">
                    
                    {/* Time Range */}
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] uppercase font-bold opacity-60">TIME RANGE</p>
                      <div className="flex flex-col gap-2">
                        {[
                          { k: 'short_term', l: '1 MONTH' },
                          { k: 'medium_term', l: '6 MONTHS' },
                          { k: 'long_term', l: 'ALL TIME' }
                        ].map((r) => (
                          <button
                            key={r.k}
                            onClick={() => setTimeRange(r.k)}
                            className={`
                              w-full py-2 text-[10px] font-black font-mono uppercase border-3 border-retro-text transition-all shadow-[3px_3px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(62,39,35,1)]
                              ${timeRange === r.k ? "bg-retro-text text-retro-bg" : "bg-retro-bg hover:bg-retro-primary/20"}
                            `}
                          >
                            {r.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Limit */}
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] uppercase font-bold opacity-60">LIMIT</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 50].map((l) => (
                          <button
                            key={l}
                            onClick={() => setLimit(l)}
                            className={`
                              py-2 text-[10px] font-black font-mono uppercase border-3 border-retro-text transition-all shadow-[3px_3px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(62,39,35,1)]
                              ${limit === l ? "bg-retro-text text-retro-bg" : "bg-retro-bg hover:bg-retro-primary/20"}
                            `}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Receipt Button */}
                    <div className="pt-4 border-t-2 border-dashed border-retro-text/30">
                      <button 
                        onClick={() => setIsReceiptOpen(true)}
                        className="w-full py-3 bg-linear-to-b from-retro-light via-retro-primary to-retro-dark text-retro-bg border-3 border-retro-text text-[11px] font-black font-display uppercase hover:brightness-110 transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] flex items-center justify-center gap-2 rounded-lg"
                      >
                        <span>🧾</span>
                        <span>PRINT RECEIPT</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* MAIN CONTENT - Right Column */}
          <div className="lg:col-span-8 w-full space-y-8">
            
            {/* Tabs */}
            <div className="bg-linear-to-r from-retro-bg via-[#E5E6C1] to-retro-bg border-4 border-retro-text rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)]">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('tracks')}
                  className={`
                    flex-1 py-4 font-display font-black text-xl uppercase transition-all border-4 border-retro-text rounded-xl shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]
                    ${activeTab === 'tracks' ? 'bg-retro-primary text-retro-bg' : 'bg-retro-bg text-retro-text hover:bg-retro-light/20'}
                  `}
                >
                  TOP TRACKS
                </button>
                <button 
                  onClick={() => setActiveTab('artists')}
                  className={`
                    flex-1 py-4 font-display font-black text-xl uppercase transition-all border-4 border-retro-text rounded-xl shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]
                    ${activeTab === 'artists' ? 'bg-retro-primary text-retro-bg' : 'bg-retro-bg text-retro-text hover:bg-retro-light/20'}
                  `}
                >
                  TOP ARTISTS
                </button>
              </div>
            </div>

            {/* List */}
            <div className="bg-linear-to-br from-retro-bg to-[#E5E6C1] border-4 border-retro-text rounded-2xl shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] min-h-150 overflow-hidden relative">
              
              {/* Decorative corner dots */}
              <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border border-retro-text rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border border-retro-text rounded-full"></div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4 inline-block animate-spin">🎵</div>
                  <p className="font-mono text-sm uppercase font-bold">LOADING DATA...</p>
                  <div className="mt-4 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-8 bg-retro-primary rounded animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              ) : items.length > 0 ? (
                <div className="divide-y-2 divide-retro-text/10">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-retro-primary/10 transition-colors group">
                      <div className="w-10 h-10 shrink-0 bg-linear-to-br from-retro-primary to-retro-dark border-3 border-retro-text rounded-full flex items-center justify-center shadow-lg">
                        <span className="font-black text-retro-bg text-lg">{index + 1}</span>
                      </div>
                      
                      <div className="w-16 h-16 bg-black border-3 border-retro-text relative overflow-hidden shrink-0 rounded-lg shadow-lg">
                        {(() => {
                          const imageUrl = item.album?.images?.[0]?.url || item.images?.[0]?.url;
                          return imageUrl ? (
                            <Image 
                              src={imageUrl} 
                              alt={item.name} 
                              width={64} height={64}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                            />
                          ) : null;
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-black text-lg uppercase truncate group-hover:text-retro-primary transition-colors leading-tight">{item.name}</h3>
                        <p className="font-mono text-xs opacity-60 truncate mt-1">
                          {activeTab === 'tracks' 
                            ? item.artists?.map(a => a.name).join(", ") 
                            : `${item.genres?.[0] || 'ARTIST'} • POP ${item.popularity}%`}
                        </p>
                      </div>

                      {item.duration_ms && (
                        <div className="font-mono text-sm font-bold opacity-40 shrink-0 bg-retro-text/10 px-3 py-1 rounded-full border-2 border-retro-text/20">
                          {Math.floor(item.duration_ms / 60000)}:{String(Math.floor((item.duration_ms % 60000) / 1000)).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4 opacity-20">📊</div>
                  <p className="font-mono text-sm opacity-50 uppercase">NO DATA FOUND</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 relative">
          <div className="bg-linear-to-r from-retro-dark via-retro-primary to-retro-dark border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] text-center relative overflow-hidden">
            
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
                VINYLVIBE ANALYTICS
              </div>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-24 h-1 bg-retro-bg/50 rounded-full"></div>
                <p className="font-mono text-sm text-retro-bg font-bold">
                  YOUR MUSIC DNA
                </p>
                <div className="w-24 h-1 bg-retro-bg/50 rounded-full"></div>
              </div>
              <p className="font-mono text-xs text-retro-bg/70 uppercase tracking-widest">
                Tracking Since {new Date().getFullYear()} - Powered by Spotify API
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RECEIPT MODAL */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur p-4" onClick={() => setIsReceiptOpen(false)}>
          
          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            
            <div ref={receiptRef} className="bg-white text-black w-full max-w-[320px] p-8 shadow-2xl font-mono text-xs">
              <div className="text-center border-b-2 border-dashed border-black pb-6 mb-6">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-2">VINYLVIBE</h2>
                <p className="text-sm font-bold">OFFICIAL RECORDS</p>
                <p className="text-[10px] mt-2 uppercase">{userProfile?.display_name}</p>
                <p className="text-[10px]">{new Date().toLocaleString()}</p>
                <p className="text-[10px] mt-1 uppercase">
                  TYPE: {activeTab} - RANGE: {timeRange.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {items.slice(0, limit).map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-2">
                    <span className="w-4 opacity-50">{i+1}</span>
                    <div className="flex-1 uppercase">
                      <p className="font-bold leading-tight text-[10px]">{item.name}</p>
                      <p className="text-[9px] opacity-60">
                        {activeTab === 'tracks' 
                          ? (item.artists?.[0]?.name || "Unknown") 
                          : (item.genres?.[0] || "Artist")}
                      </p>
                    </div>
                    <span className="opacity-80 text-[10px]">
                      {activeTab === 'tracks' 
                        ? `${Math.floor(item.duration_ms / 60000)}:${String(Math.floor((item.duration_ms % 60000) / 1000)).padStart(2, '0')}`
                        : `${item.popularity}%`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-black pt-6 text-center">
                <div className="flex justify-between font-bold text-sm mb-4">
                  <span>TOTAL</span>
                  <span>{items.length}</span>
                </div>
                <p className="text-[10px] uppercase">KEEP THE VIBE ALIVE</p>
                <div className="mt-4 font-black text-3xl tracking-[0.3em]">|||||||||||</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleDownloadImage}
                className="px-6 py-3 bg-retro-primary text-white font-black font-display text-sm uppercase border-4 border-retro-text hover:bg-retro-dark transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] rounded-lg"
              >
                📥 DOWNLOAD
              </button>
              <button 
                onClick={() => setIsReceiptOpen(false)}
                className="px-6 py-3 bg-white text-black font-black font-display text-sm uppercase border-4 border-retro-text hover:bg-gray-200 transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] rounded-lg"
              >
                ✕ CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}