"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../../hooks/useSpotify";
import Image from "next/image";
import Link from "next/link";
import { toPng } from 'html-to-image';

export default function StatsPage() {
  const { data: session } = useSession();
  const spotify = useSpotify();

  const [activeTab, setActiveTab] = useState("tracks");
  const [timeRange, setTimeRange] = useState("short_term");
  const [limit, setLimit] = useState(5);
  
  const [items, setItems] = useState([]); 
  const [genres, setGenres] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const receiptRef = useRef(null);

  useEffect(() => {
    if (spotify && spotify.getAccessToken()) {
        spotify.getMe().then(data => setUserProfile(data.body)).catch(err => console.error(err));
    }
  }, [spotify]);

  useEffect(() => {
    if (!spotify || !spotify.getAccessToken()) return;
    
    setLoading(true);
    setItems([]); 
    
    const fetchData = async () => {
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
            setLoading(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setLoading(false);
        }
    };

    fetchData();
  }, [spotify, activeTab, timeRange, limit]);

  const handleBurnCD = async () => {
    if (!spotify || activeTab !== "tracks" || items.length === 0) return;
    setIsSaving(true);
    
    try {
        const userId = userProfile?.id;
        const playlistName = `My Top ${limit} (${timeRange}) - ${new Date().toLocaleDateString()}`;
        const playlist = await spotify.createPlaylist(userId, {
            name: playlistName,
            description: "Generated via VinylVibe Stats Center",
            public: false
        });
        
        const uris = items.map(i => i.uri);
        await spotify.addTracksToPlaylist(playlist.body.id, uris);
        
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
        console.error("Burn CD Failed:", err);
        setSaveStatus("error");
    } finally {
        setIsSaving(false);
    }
  };

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
  }, [receiptRef, activeTab]);

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text font-body relative overflow-x-hidden">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: "repeating-linear-gradient(45deg, #3E2723 0px, #3E2723 2px, transparent 2px, transparent 12px)",
             }}
        />
      </div>

      {/* Corner Brackets */}
      <div className="fixed top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>
      <div className="fixed top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-retro-primary/30 pointer-events-none z-50"></div>

      <div className="relative z-10 p-4 md:p-8">
        
        {/* Header Bar */}
        <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-retro-dark to-retro-primary text-retro-bg py-3 px-6 border-4 border-retro-text shadow-[6px_6px_0px_0px_rgba(62,39,35,1)] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono font-black text-sm uppercase hover:scale-105 transition-transform">
            <span>←</span> BACK
          </Link>
          <h1 className="font-display font-black text-xl uppercase tracking-wider">STATS CENTER</h1>
          <div className="w-16"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#D4B896] to-[#C4A57B] border-4 border-retro-text rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] relative">
                    <div className="absolute top-2 left-2 w-2 h-2 border border-retro-text rounded-full"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 border border-retro-text rounded-full"></div>
                    
                    <div className="text-center">
                        {userProfile?.images?.[0] && (
                            <div className="w-24 h-24 mx-auto rounded-full border-4 border-retro-text overflow-hidden mb-4 shadow-lg">
                                <Image 
                                    src={userProfile.images[0].url} 
                                    width={96} height={96} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h2 className="font-display font-black text-xl uppercase leading-tight">{userProfile?.display_name}</h2>
                        <p className="font-mono text-[10px] opacity-60 mt-1">{userProfile?.followers?.total} FOLLOWERS</p>
                    </div>

                    {genres.length > 0 && activeTab === 'artists' && (
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

                {/* Control Panel */}
                <div className="bg-gradient-to-br from-retro-bg to-[#E5E6C1] border-4 border-retro-text rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)]">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-retro-text/20">
                        <div className="w-6 h-6 bg-retro-primary border-2 border-retro-text rounded flex items-center justify-center">
                            <span className="text-retro-bg font-black text-sm">&#9881;</span>
                        </div>
                        <h3 className="font-display font-black uppercase text-sm">CONTROLS</h3>
                    </div>
                    
                    {/* Time Range */}
                    <div className="space-y-2 mb-4">
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
                                        w-full py-2 text-[10px] font-black font-mono uppercase border-2 border-retro-text transition-all shadow-[2px_2px_0px_0px_rgba(62,39,35,0.3)]
                                        ${timeRange === r.k ? "bg-retro-text text-retro-bg" : "bg-retro-bg hover:bg-retro-primary/20"}
                                    `}
                                >
                                    {r.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Limit */}
                    <div className="space-y-2 mb-4">
                        <p className="font-mono text-[9px] uppercase font-bold opacity-60">LIMIT</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[5, 10, 50].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLimit(l)}
                                    className={`
                                        py-2 text-[10px] font-black font-mono uppercase border-2 border-retro-text transition-all shadow-[2px_2px_0px_0px_rgba(62,39,35,0.3)]
                                        ${limit === l ? "bg-retro-text text-retro-bg" : "bg-retro-bg hover:bg-retro-primary/20"}
                                    `}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t-2 border-dashed border-retro-text/30">
                        <button 
                            onClick={() => setIsReceiptOpen(true)}
                            className="w-full py-3 bg-gradient-to-r from-retro-light to-retro-primary text-retro-bg border-2 border-retro-text text-[10px] font-black font-mono uppercase hover:brightness-110 transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] flex items-center justify-center gap-2"
                        >
                            RECEIPT
                        </button>

                        {/* {activeTab === 'tracks' && (
                            <button 
                                onClick={handleBurnCD}
                                disabled={isSaving || saveStatus === 'success'}
                                className={`
                                    w-full py-3 text-[10px] font-black font-mono uppercase border-2 border-retro-text transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)] flex items-center justify-center gap-2
                                    ${saveStatus === 'success' ? "bg-green-600 text-white" : "bg-retro-dark text-retro-bg hover:brightness-110"}
                                `}
                            >
                                {isSaving ? "BURNING..." : saveStatus === 'success' ? "&#10003; SAVED" : "&#128191; BURN CD"}
                            </button>
                        )} */}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-3">
                
                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('tracks')}
                        className={`
                            font-display font-black text-2xl md:text-4xl uppercase transition-all relative pb-2
                            ${activeTab === 'tracks' ? 'text-retro-text' : 'text-retro-text/30 hover:text-retro-text/60'}
                        `}
                    >
                        TOP TRACKS
                        {activeTab === 'tracks' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-retro-primary"></div>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('artists')}
                        className={`
                            font-display font-black text-2xl md:text-4xl uppercase transition-all relative pb-2
                            ${activeTab === 'artists' ? 'text-retro-text' : 'text-retro-text/30 hover:text-retro-text/60'}
                        `}
                    >
                        TOP ARTISTS
                        {activeTab === 'artists' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-retro-primary"></div>
                        )}
                    </button>
                </div>

                {/* List */}
                <div className="bg-gradient-to-br from-retro-bg to-[#E5E6C1] border-4 border-retro-text rounded-xl shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] min-h-[600px] overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4 inline-block animate-spin">&#128191;</div>
                            <p className="font-mono text-sm uppercase font-bold">LOADING DATA...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="divide-y-2 divide-retro-text/10">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-retro-primary/10 transition-colors group">
                                    <div className="w-8 h-8 flex-shrink-0 bg-retro-primary border-2 border-retro-text rounded-full flex items-center justify-center shadow-md">
                                        <span className="font-black text-retro-bg text-sm">{index + 1}</span>
                                    </div>
                                    
                                    <div className="w-14 h-14 bg-black border-2 border-retro-text relative overflow-hidden flex-shrink-0 rounded">
                                        {(() => {
                                            const imageUrl = item.album?.images?.[0]?.url || item.images?.[0]?.url;
                                            return imageUrl ? (
                                                <Image 
                                                    src={imageUrl} 
                                                    alt={item.name} 
                                                    width={56} height={56}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                                                />
                                            ) : null;
                                        })()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display font-black text-base uppercase truncate group-hover:text-retro-primary transition-colors">{item.name}</h3>
                                        <p className="font-mono text-[10px] opacity-60 truncate mt-1">
                                            {activeTab === 'tracks' 
                                                ? item.artists?.map(a => a.name).join(", ") 
                                                : `${item.genres?.[0] || 'ARTIST'} - POP ${item.popularity}%`}
                                        </p>
                                    </div>

                                    {item.duration_ms && (
                                        <div className="font-mono text-xs font-bold opacity-40 flex-shrink-0">
                                            {Math.floor(item.duration_ms / 60000)}:{String(Math.floor((item.duration_ms % 60000) / 1000)).padStart(2, '0')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4 opacity-20">&#128191;</div>
                            <p className="font-mono text-sm opacity-50 uppercase">NO DATA FOUND</p>
                        </div>
                    )}
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
                            className="px-6 py-3 bg-retro-primary text-white font-black font-mono text-xs uppercase border-4 border-retro-text hover:bg-retro-dark transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] flex items-center gap-2"
                        >
                            DOWNLOAD
                        </button>
                        <button 
                            onClick={() => setIsReceiptOpen(false)}
                            className="px-6 py-3 bg-white text-black font-black font-mono text-xs uppercase border-4 border-retro-text hover:bg-gray-200 transition shadow-[4px_4px_0px_0px_rgba(62,39,35,1)]"
                        >
                            CLOSE
                        </button>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
}