"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../../hooks/useSpotify";
import Image from "next/image";
import Link from "next/link";
import { toPng } from 'html-to-image'; // Pastikan install: npm install html-to-image

export default function StatsPage() {
  const { data: session } = useSession();
  const spotify = useSpotify();

  // STATES
  const [activeTab, setActiveTab] = useState("tracks"); // 'tracks' | 'artists'
  const [timeRange, setTimeRange] = useState("short_term"); // short_term, medium_term, long_term
  const [limit, setLimit] = useState(50); // Default 50 items
  
  const [items, setItems] = useState([]); 
  const [genres, setGenres] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // States untuk Fitur Action
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Ref untuk Download Image
  const receiptRef = useRef(null);

  // 1. FETCH PROFILE
  useEffect(() => {
    if (spotify && spotify.getAccessToken()) {
        spotify.getMe().then(data => setUserProfile(data.body)).catch(err => console.error(err));
    }
  }, [spotify]);

  // 2. FETCH DATA UTAMA
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
                
                // ANALISIS GENRE (Hanya saat tab Artist)
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

  // FEATURE: BURN CD (Tracks Only)
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

  // FEATURE: DOWNLOAD IMAGE
  const handleDownloadImage = useCallback(() => {
    if (receiptRef.current === null) {
      return;
    }

    toPng(receiptRef.current, { cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `vinylvibe-receipt-${activeTab}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Gagal download gambar:", err);
      });
  }, [receiptRef, activeTab]);

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text font-body p-4 md:p-8">
        
        {/* Navigation Back */}
        <div className="max-w-4xl mx-auto mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold hover:text-retro-primary transition-colors">
                <span>←</span> Back to Dashboard
            </Link>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: SETTINGS */}
            <div className="md:col-span-1 space-y-6">
                
                {/* User Profile */}
                <div className="border-3 border-retro-text bg-retro-bg p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)] relative">
                    <div className="text-center">
                        {userProfile?.images?.[0] && (
                            <Image 
                                src={userProfile.images[0].url} 
                                width={100} height={100} 
                                alt="Profile" 
                                className="w-24 h-24 mx-auto rounded-full border-2 border-retro-text mb-4 grayscale hover:grayscale-0 transition-all"
                            />
                        )}
                        <h1 className="font-display font-black text-2xl uppercase leading-none">{userProfile?.display_name}</h1>
                        <p className="font-mono text-xs opacity-60 mt-1">{userProfile?.followers?.total} FOLLOWERS</p>
                    </div>

                    {genres.length > 0 && activeTab === 'artists' && (
                        <div className="mt-6 pt-4 border-t-2 border-dashed border-retro-text/30">
                            <h3 className="font-mono text-[10px] font-bold uppercase mb-3 text-center">Top Genres</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {genres.map((g, i) => (
                                    <span key={i} className="px-2 py-1 bg-retro-text text-retro-bg text-[10px] font-bold font-mono uppercase">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Control Panel */}
                <div className="border-3 border-retro-text bg-white/50 p-6 shadow-[8px_8px_0px_0px_var(--color-retro-text)]">
                    <h3 className="font-display font-bold uppercase text-lg mb-4 flex items-center gap-2">
                        <span>⚙</span> Settings
                    </h3>
                    
                    {/* Time Range */}
                    <div className="space-y-2">
                        <p className="font-mono text-[10px] uppercase font-bold opacity-60">Time Range</p>
                        <div className="flex flex-col gap-2">
                            {[
                                { k: 'short_term', l: 'Last Month' },
                                { k: 'medium_term', l: 'Last 6 Months' },
                                { k: 'long_term', l: 'All Time' }
                            ].map((r) => (
                                <button
                                    key={r.k}
                                    onClick={() => setTimeRange(r.k)}
                                    className={`
                                        w-full py-2 text-xs font-bold font-mono uppercase border-2 border-retro-text transition-all
                                        ${timeRange === r.k ? "bg-retro-text text-retro-bg" : "hover:bg-retro-text/10"}
                                    `}
                                >
                                    {r.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Limit Selector */}
                    <div className="space-y-2 mt-4 pt-4 border-t-2 border-dashed border-retro-text/20">
                        <p className="font-mono text-[10px] uppercase font-bold opacity-60">Item Limit</p>
                        <div className="flex gap-2">
                            {[5, 10, 50].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLimit(l)}
                                    className={`
                                        flex-1 py-2 text-xs font-bold font-mono uppercase border-2 border-retro-text transition-all
                                        ${limit === l ? "bg-retro-text text-retro-bg" : "hover:bg-retro-text/10"}
                                    `}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3 pt-6 border-t-2 border-dashed border-retro-text/30">
                        
                        {/* BUTTON: PRINT RECEIPT (Berlaku untuk TRACKS & ARTISTS) */}
                        <button 
                            onClick={() => setIsReceiptOpen(true)}
                            className="w-full py-2 bg-white border-2 border-retro-text text-xs font-bold font-mono uppercase hover:bg-retro-light hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            🧾 Print Receipt
                        </button>

                        {/* BUTTON: BURN CD (Hanya TRACKS) */}
                        {activeTab === 'tracks' ? (
                            <button 
                                onClick={handleBurnCD}
                                disabled={isSaving || saveStatus === 'success'}
                                className={`
                                    w-full py-2 text-xs font-bold font-mono uppercase border-2 border-retro-text transition-colors flex items-center justify-center gap-2
                                    ${saveStatus === 'success' ? "bg-green-600 text-white" : "bg-retro-primary text-retro-bg hover:bg-retro-dark"}
                                `}
                            >
                                {isSaving ? "Processing..." : saveStatus === 'success' ? "Saved to Library!" : "💿 Burn to Playlist"}
                            </button>
                        ) : (
                            <div className="text-center font-mono text-[10px] opacity-40 pt-2">
                                *Burn CD only available for Tracks
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: DATA LIST */}
            <div className="md:col-span-2">
                
                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('tracks')}
                        className={`text-2xl md:text-4xl font-display font-black uppercase transition-colors ${activeTab === 'tracks' ? 'text-retro-text underline decoration-4 underline-offset-4 decoration-retro-primary' : 'text-retro-text/30 hover:text-retro-text/60'}`}
                    >
                        Top Tracks
                    </button>
                    <button 
                        onClick={() => setActiveTab('artists')}
                        className={`text-2xl md:text-4xl font-display font-black uppercase transition-colors ${activeTab === 'artists' ? 'text-retro-text underline decoration-4 underline-offset-4 decoration-retro-primary' : 'text-retro-text/30 hover:text-retro-text/60'}`}
                    >
                        Top Artists
                    </button>
                </div>

                {/* List Container */}
                <div className="border-3 border-retro-text bg-retro-bg shadow-[8px_8px_0px_0px_var(--color-retro-text)] min-h-[500px]">
                    {loading ? (
                        <div className="p-12 text-center">
                            <span className="text-4xl animate-spin inline-block">💿</span>
                            <p className="font-mono text-xs mt-4 uppercase font-bold">Reading Disk Data...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="divide-y-2 divide-dashed divide-retro-text/20">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-retro-text/5 transition-colors group">
                                    <span className="font-mono font-bold text-xl w-8 text-retro-text/40 group-hover:text-retro-primary">{index + 1}</span>
                                    
                                    <div className="w-12 h-12 bg-black border-2 border-retro-text relative overflow-hidden flex-shrink-0">
                                        {(() => {
                                            const imageUrl = item.album?.images?.[0]?.url || item.images?.[0]?.url;
                                            return imageUrl ? (
                                                <Image 
                                                    src={imageUrl} 
                                                    alt={item.name} 
                                                    width={50} height={50}
                                                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-retro-text/20 flex items-center justify-center text-[10px]">No Pic</div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display font-bold text-lg uppercase truncate">{item.name}</h3>
                                        <p className="font-mono text-xs opacity-60 truncate">
                                            {activeTab === 'tracks' 
                                                ? item.artists?.map(a => a.name).join(", ") 
                                                : `${item.genres?.[0] || 'Artist'} • ${item.popularity}% Pop`}
                                        </p>
                                    </div>

                                    {item.duration_ms && (
                                        <div className="font-mono text-xs font-bold opacity-40">
                                            {((item.duration_ms || 0) / 60000).toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center opacity-50 font-mono">No Data Found.</div>
                    )}
                </div>

            </div>
        </div>

        {/* === RECEIPT MODAL === */}
        {isReceiptOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsReceiptOpen(false)}>
                
                {/* Wrapper untuk tombol download & struk */}
                <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    
                    {/* AREA YANG AKAN DI-DOWNLOAD */}
                    <div ref={receiptRef} className="bg-white text-black w-full min-w-[300px] max-w-[320px] p-8 shadow-2xl font-mono text-xs relative">
                        <div className="text-center border-b-2 border-dashed border-black pb-6 mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">VINYLVIBE</h2>
                            <p className="text-sm font-bold">OFFICIAL RECORDS</p>
                            <p className="text-[10px] mt-2 uppercase">{userProfile?.display_name}</p>
                            <p className="text-[10px]">{new Date().toLocaleString()}</p>
                            <p className="text-[10px] mt-1 uppercase">
                                TYPE: {activeTab} • RANGE: {timeRange.replace('_', ' ')}
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {items.slice(0, limit).map((item, i) => (
                                <div key={i} className="flex justify-between items-start gap-2">
                                    <span className="w-4 opacity-50">{i+1}</span>
                                    <div className="flex-1 uppercase">
                                        <p className="font-bold leading-tight">{item.name}</p>
                                        <p className="text-[10px] opacity-60">
                                            {activeTab === 'tracks' 
                                                ? (item.artists?.[0]?.name || "Unknown") 
                                                : (item.genres?.[0] || "Artist")}
                                        </p>
                                    </div>
                                    <span className="opacity-80">
                                        {activeTab === 'tracks' 
                                            ? (item.duration_ms / 60000).toFixed(2) 
                                            : `${item.popularity}%`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-dashed border-black pt-6 text-center">
                            <div className="flex justify-between font-bold text-sm mb-4">
                                <span>TOTAL ITEMS</span>
                                <span>{items.length}</span>
                            </div>
                            <p className="text-[10px] uppercase">KEEP THE VIBE ALIVE</p>
                            <p className="barcode font-display text-4xl mt-4 tracking-[0.2em] opacity-80 h-12 overflow-hidden">||| |||| || | ||</p>
                        </div>
                    </div>

                    {/* ACTION BUTTONS DALAM MODAL */}
                    <div className="flex gap-4">
                         <button 
                            onClick={handleDownloadImage}
                            className="px-6 py-2 bg-retro-primary text-white font-bold font-mono uppercase rounded hover:bg-retro-dark transition shadow-lg flex items-center gap-2"
                        >
                            ⬇ Download PNG
                        </button>
                        <button 
                            onClick={() => setIsReceiptOpen(false)}
                            className="px-6 py-2 bg-white text-black font-bold font-mono uppercase rounded hover:bg-gray-200 transition shadow-lg"
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        )}

    </div>
  );
}