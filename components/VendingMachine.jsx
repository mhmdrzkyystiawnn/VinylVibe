"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import Image from "next/image";

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY || 'YOUR_LASTFM_KEY_HERE';

// --- ICON COMPONENTS (SVG) - 8-Bit Style ---
const Icons = {
  Music: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2 4h20v16H2V4zm2 2v12h16V6H4z" />
      <path d="M6 8h12v6H6V8z" />
      <path d="M8 10h2v2H8v-2z" fill="var(--color-background, rgba(0,0,0,0.5))" />
      <path d="M14 10h2v2h-2v-2z" fill="var(--color-background, rgba(0,0,0,0.5))" />
      <path d="M6 18h12v2H6v-2z" />
      <path d="M3 5h1v1H3V5zm17 0h1v1h-1V5zm0 13h1v1h-1v-1zM3 18h1v1H3v-1z" />
    </svg>
  ),
  Coin: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 2h8v2h4v4h2v8h-2v4h-4v2H8v-2H4v-4H2V8h2V4h4V2zm0 2H4v4H2v8h2v4h4v2h8v-2h4v-4h2V8h-2V4h-4V2H8v2zm3 2h2v2h2v2h-4v2h4v2h-2v2h-2v-2h-2v-2h4v-2h-4V8h2V6z" />
    </svg>
  ),
  Dice: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 2h16v20H4V2zm2 2v16h12V4H6zm3 3h2v2H9V7zm6 0h2v2h-2V7zm-3 3.5h2v2h-2v-2zM9 14h2v2H9v-2zm6 0h2v2h-2v-2z" />
    </svg>
  ),
  Play: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 4v16h2v-2h2v-2h2v-2h2v-2h2v-2h-2V8h-2V6h-2V4H6z" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z" />
    </svg>
  ),
  Warning: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v10h-4V2zm0 14h4v4h-4v-4z M2 20h20v2H2v-2z" />
    </svg>
  ),
  Star: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v4h4v4h4v4h-4v4h-4v4h-4v-4H6v-4H2v-4h4V6h4V2z" />
    </svg>
  ),
  Gear: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v2h4v4h2v2h2v4h-2v2h-2v4h-4v2h-4v-2H6v-4H4v-2H2v-4h2V8h2V4h4V2zm2 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )
};

export default function VendingMachine() {
  const { data: session } = useSession();
  const spotify = useSpotify();

  // State Management
  const [recommendations, setRecommendations] = useState([]);
  const [scanType, setScanType] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [usedTrackIds, setUsedTrackIds] = useState([]);
  const [seedInfo, setSeedInfo] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [machineShake, setMachineShake] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const audioContextRef = useRef(null);

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Check Premium Status
  useEffect(() => {
    const checkPremium = async () => {
      if (spotify && session) {
        try {
          const user = await spotify.getMe();
          setIsPremium(user.body.product === 'premium');
        } catch {
          setIsPremium(false);
        }
      }
    };
    checkPremium();
  }, [spotify, session]);

  // Sound Effects Utilities
  const playSound = (frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playCoinSound = () => {
    playSound(800, 0.1);
    setTimeout(() => playSound(600, 0.1), 100);
    setTimeout(() => playSound(400, 0.15), 200);
  };

  const playDispenseSound = () => {
    playSound(300, 0.2, 'square');
    setTimeout(() => playSound(250, 0.3, 'square'), 300);
  };

  const playErrorSound = () => {
    playSound(200, 0.5, 'sawtooth');
  };

  const playSuccessSound = () => {
    playSound(523, 0.15);
    setTimeout(() => playSound(659, 0.15), 150);
    setTimeout(() => playSound(784, 0.3), 300);
  };

  // Main Action: Insert Coin
  const dispenseMix = async () => {
    const accessToken = spotify?.getAccessToken();
    if (!accessToken) {
      alert("Please login to Spotify first!");
      playErrorSound();
      return;
    }
    setCoinAnimation(true);
    playCoinSound();
    setTimeout(() => {
      setCoinAnimation(false);
      startBrewing();
    }, 800);
  };

  // Core Logic: The Vending Algorithm
  const startBrewing = async () => {
    setLoading(true);
    setStatus("BREWING");
    setRecommendations([]);
    setSeedInfo(null);
    setDispensing(false);
    setMachineShake(true);
    setScanType("SCANNING...");

    const shakeInterval = setInterval(() => {
      playSound(150, 0.05, 'square');
    }, 200);

    try {
      const rng = Math.random(); 
      let tracks;
      
      if (rng > 0.4) {
        setScanType("CURRENT OBSESSION");
        const result = await spotify.getMyTopTracks({ limit: 20, time_range: 'short_term' });
        tracks = result.body.items;
      } else if (rng > 0.1) {
        setScanType("RECENT VIBES");
        const result = await spotify.getMyRecentlyPlayedTracks({ limit: 20 });
        tracks = result.body.items.map(item => item.track);
      } else {
        setScanType("✨ NOSTALGIA HIT ✨");
        const result = await spotify.getMyTopTracks({ limit: 20, time_range: 'long_term' });
        tracks = result.body.items;
        playSound(1200, 0.1);
        setTimeout(() => playSound(1200, 0.1), 150);
      }

      if (!tracks || tracks.length === 0) {
         alert("Butuh listening history dulu buat racik lagu!");
         playErrorSound();
         setLoading(false);
         setStatus("IDLE");
         setMachineShake(false);
         clearInterval(shakeInterval);
         return;
      }

      let availableTracks = tracks.filter(track => !usedTrackIds.includes(track.id));
      if (availableTracks.length === 0) {
        setUsedTrackIds([]);
        availableTracks = tracks;
      }

      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      const seedTrack = availableTracks[randomIndex];
      const artistName = seedTrack.artists[0].name;
      const trackName = seedTrack.name;

      setSeedInfo({ 
        name: trackName, 
        artist: artistName,
        image: seedTrack.album.images[0]?.url
      });

      setUsedTrackIds(prev => [...prev, seedTrack.id]);

      const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&api_key=${LASTFM_API_KEY}&format=json&limit=15`;
      const lastfmResponse = await fetch(lastfmUrl);
      const lastfmData = await lastfmResponse.json();

      if (lastfmData.error) throw new Error(`Last.fm Error: ${lastfmData.message}`);

      if (!lastfmData.similartracks?.track || lastfmData.similartracks.track.length === 0) {
        const artistId = seedTrack.artists[0].id;
        const artistTopTracks = await spotify.getArtistTopTracks(artistId, 'US');
        const fallbackTracks = artistTopTracks.body.tracks.filter(t => t.id !== seedTrack.id).slice(0, 3);
        
        if (fallbackTracks.length > 0) {
          clearInterval(shakeInterval);
          setMachineShake(false);
          setDispensing(true);
          playDispenseSound();
          setTimeout(() => {
            setRecommendations(fallbackTracks);
            setStatus("SERVED");
            setDispensing(false);
            setLoading(false);
            playSuccessSound();
          }, 1800);
          return;
        }
        throw new Error("No similar tracks found");
      }

      const similarTracks = lastfmData.similartracks.track.sort(() => Math.random() - 0.5).slice(0, 8);
      const spotifyTracks = [];
      
      for (const track of similarTracks) {
        try {
          const searchQuery = `track:${track.name} artist:${track.artist.name}`;
          const searchResult = await spotify.searchTracks(searchQuery, { limit: 1 });
          if (searchResult.body.tracks.items.length > 0) {
            spotifyTracks.push(searchResult.body.tracks.items[0]);
          }
        } catch {}
        if (spotifyTracks.length >= 3) break;
      }

      if (spotifyTracks.length === 0) throw new Error("Could not find tracks on Spotify");

      clearInterval(shakeInterval);
      setMachineShake(false);
      setDispensing(true);
      playDispenseSound();
      
      setTimeout(() => {
        setRecommendations(spotifyTracks);
        setStatus("SERVED");
        setDispensing(false);
        setLoading(false);
        playSuccessSound();
      }, 1800);
      
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      setLoading(false);
      setMachineShake(false);
      clearInterval(shakeInterval);
      playErrorSound();
    }
  };

  const openInSpotify = (uri) => {
    const spotifyUrl = uri.replace('spotify:track:', 'https://open.spotify.com/track/');
    window.open(spotifyUrl, '_blank');
    playSound(880, 0.1);
    setTimeout(() => playSound(1046, 0.1), 100);
  };

  const tryAddToQueue = async (uri) => {
    if (!spotify) return;
    try {
        await spotify.addToQueue(uri);
        playSound(880, 0.1);
        setTimeout(() => playSound(1046, 0.1), 100);
        alert("✅ Added to queue!"); 
    } catch {
        playErrorSound();
        alert("Failed to add to queue.");
    }
  };

  return (
    // FIX: Menggunakan max-w-sm (sedikit lebih kecil dari md) agar lebih proporsional di HP
    <div className="w-full max-w-sm md:max-w-md mx-auto relative select-none px-4 py-4 md:py-8">
      
      {/* Coin Animation */}
      {coinAnimation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-coin-drop pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-700 shadow-xl flex items-center justify-center text-yellow-900">
             <Icons.Coin className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* === VENDING MACHINE BODY === */}
      <div className={`relative transition-transform duration-75 ${machineShake ? 'animate-shake' : ''}`}>
        
        {/* MAIN BODY */}
        <div className="relative bg-linear-to-b from-[#D4B896] via-retro-bg to-[#C4A57B] border-4 border-retro-text rounded-2xl p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] md:shadow-[8px_8px_0px_0px_rgba(62,39,35,1)]">
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 md:w-4 md:h-4 border-l-2 border-t-2 border-retro-dark/50"></div>
          <div className="absolute top-2 right-2 w-3 h-3 md:w-4 md:h-4 border-r-2 border-t-2 border-retro-dark/50"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-retro-dark/50"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 md:w-4 md:h-4 border-r-2 border-b-2 border-retro-dark/50"></div>

          {/* Coin Slot */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 bg-linear-to-b from-gray-600 to-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-t-xl border-3 border-retro-text shadow-lg">
            <div className="w-12 h-2.5 md:w-16 md:h-3 bg-black rounded-sm border border-gray-800 shadow-inner flex items-center justify-center">
              <div className="text-[6px] md:text-[8px] text-amber-500/70 font-mono font-bold">INSERT</div>
            </div>
          </div>

          {/* === DISPLAY WINDOW === */}
          {/* FIX: Ubah min-h agar dinamis di mobile (300px) dan desktop (350px) */}
          <div className="relative bg-linear-to-b from-gray-900 via-black to-gray-900 border-4 border-retro-text rounded-xl p-3 md:p-5 min-h-75 md:min-h-95 mb-4 md:mb-5 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] flex flex-col">
            
            {/* Screen Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none z-20"></div>
            <div className="absolute top-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none z-20"></div>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(205,86,86,0.03),rgba(205,86,86,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none z-20"></div>

            {/* CONTENT WRAPPER */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center overflow-y-auto no-scrollbar">
              
              {loading && !dispensing ? (
                <div className="text-center space-y-4 py-4">
                  <div className="text-retro-primary font-mono text-xs md:text-sm font-bold animate-pulse">
                    [ ANALYZING MUSIC DNA... ]
                  </div>

                   {/* --- INDIKATOR MODE --- */}
                   <div className={`
                    text-[10px] md:text-xs font-black tracking-widest py-1 px-2 rounded border-2 inline-block mb-2
                    ${scanType.includes("NOSTALGIA") 
                      ? "text-purple-400 border-purple-400 bg-purple-900/30 animate-bounce shadow-[0_0_10px_rgba(192,132,252,0.8)]" 
                      : "text-green-400 border-green-400 bg-green-900/20"}
                  `}>
                    MODE: {scanType}
                  </div>

                  {seedInfo && (
                    <div className="flex items-center justify-center gap-3 bg-retro-primary/10 p-2 md:p-3 rounded-lg border-2 border-retro-primary/30 mx-2">
                      {seedInfo.image && (
                        <Image src={seedInfo.image} width={40} height={40} alt="seed" className="rounded border-2 border-retro-primary shadow-lg shrink-0 w-10 h-10 md:w-12 md:h-12" />
                      )}
                      <div className="text-left min-w-0">
                        <p className="text-[8px] md:text-[10px] text-retro-primary/80 font-mono font-bold mb-1">SEED TRACK:</p>
                        <p className="text-xs md:text-sm font-bold text-retro-light truncate">{seedInfo.name}</p>
                        <p className="text-[10px] md:text-xs text-retro-bg/60 truncate">{seedInfo.artist}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-retro-primary/60 font-mono text-[10px] md:text-xs mt-4">
                    <Icons.Gear className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    <span>CONSULTING LAST.FM...</span>
                  </div>
                </div>
              ) : dispensing ? (
                <div className="text-center space-y-4 md:space-y-6 py-6">
                  <div className="text-retro-primary font-display font-black text-xl md:text-2xl animate-pulse">
                    ⬇ DISPENSING ⬇
                  </div>
                  <div className="flex justify-center gap-2 md:gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="relative animate-item-drop" style={{ animationDelay: `${i * 0.3}s` }}>
                        <div className="w-14 h-18 md:w-20 md:h-24 bg-linear-to-br from-retro-light/40 to-retro-dark/40 border-4 border-retro-primary rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-sm">
                           <Icons.Music className="w-8 h-8 md:w-12 md:h-12 text-retro-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : status === "IDLE" ? (
                <div className="text-center space-y-3 md:space-y-4 py-8">
                  <div className="flex justify-center mb-1 md:mb-2 animate-bounce">
                    <Icons.Music className="w-16 h-16 md:w-20 md:h-20 text-retro-primary/80" />
                  </div>
                  <div className="text-retro-bg font-mono text-xs md:text-sm font-bold opacity-90">INSERT COIN TO GET</div>
                  <div className="text-retro-primary font-display font-black text-xl md:text-4xl tracking-wider drop-shadow-[0_0_20px_rgba(205,86,86,0.4)] leading-tight">
                    MYSTERY<br/>MIX
                  </div>
                  <div className="text-[9px] md:text-[11px] text-retro-bg/40 font-mono mt-4 md:mt-6 space-y-1">
                    <div>[ POWERED BY LAST.FM AND SPOTIFY ]</div>
                    <div className="text-amber-400/60 font-bold">💰 COST: 50 CENTS</div>
                  </div>
                </div>
              ) : status === "SERVED" && recommendations.length > 0 ? (
                <div className="space-y-2 md:space-y-3 pb-2">
                  {seedInfo && (
                    <div className="flex items-center gap-2 bg-linear-to-r from-retro-primary/20 to-transparent p-2 rounded-lg border-2 border-retro-primary/40 mb-2 md:mb-4 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-30">
                      <div className="shrink-0">
                         {seedInfo.image && <Image src={seedInfo.image} width={28} height={28} alt="seed" className="rounded border border-retro-primary w-7 h-7 md:w-8 md:h-8" /> }
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[7px] md:text-[8px] text-retro-primary/80 font-mono font-bold">BASED ON:</p>
                        <p className="text-[10px] md:text-xs font-bold text-retro-light truncate">{seedInfo.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {recommendations.map((track, idx) => (
                    <div key={track.id} className="flex items-center justify-between bg-linear-to-r from-retro-bg/20 to-transparent p-2 rounded-xl border-2 border-retro-bg/30 hover:border-retro-light/60 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-2 md:gap-3 overflow-hidden flex-1">
                        <div className="relative shrink-0">
                          <Image src={track.album.images[0]?.url || '/placeholder.png'} width={40} height={40} alt={track.name} className="rounded-lg border-2 border-retro-bg/50 w-10 h-10 md:w-12 md:h-12" />
                          <div className="absolute -top-1.5 -left-1.5 bg-retro-primary text-retro-bg text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full border border-retro-text shadow-sm">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="overflow-hidden flex-1 min-w-0 pr-1">
                          <p className="text-xs md:text-sm font-bold text-retro-light truncate">{track.name}</p>
                          <p className="text-[10px] md:text-xs text-retro-bg/70 truncate">{track.artists[0].name}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 shrink-0 ml-1">
                        <button onClick={() => openInSpotify(track.uri)} className="h-7 w-7 md:h-8 md:w-8 flex items-center justify-center bg-green-600 text-white rounded-lg border-b-2 border-green-800 active:border-b-0 active:translate-y-0.5" title="Play">
                          <Icons.Play className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        {isPremium && (
                          <button onClick={() => tryAddToQueue(track.uri)} className="h-7 w-7 md:h-8 md:w-8 flex items-center justify-center bg-retro-light text-white rounded-lg border-b-2 border-retro-dark active:border-b-0 active:translate-y-0.5" title="Queue">
                            <Icons.Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : status === "ERROR" ? (
                <div className="text-center py-8 md:py-12">
                   <div className="flex justify-center mb-2 md:mb-3">
                      <Icons.Warning className="w-10 h-10 md:w-12 md:h-12 text-retro-primary animate-pulse" />
                   </div>
                  <div className="text-retro-primary font-display text-xl md:text-2xl font-black mb-1">OUT OF STOCK</div>
                  <div className="text-retro-light/70 text-xs md:text-sm">(SYSTEM ERROR)</div>
                  <div className="text-[10px] md:text-xs text-retro-bg/40 mt-3 md:mt-4 font-mono">Tap button to retry</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* === BUTTON & PANEL === */}
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
            <button
              onClick={dispenseMix}
              disabled={loading}
              className={`
                w-full py-3 md:py-5 bg-linear-to-b from-retro-light via-retro-primary to-retro-dark 
                text-retro-bg font-display font-black text-base md:text-xl uppercase tracking-widest 
                rounded-xl border-4 border-retro-text
                shadow-[0_4px_0px_0px_rgba(62,39,35,1)] md:shadow-[0_6px_0px_0px_rgba(62,39,35,1)]
                active:translate-y-1.5 active:shadow-[0_2px_0px_0px_rgba(62,39,35,1)] 
                transition-all duration-100
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}
                relative overflow-hidden group touch-manipulation
              `}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2">
                {loading ? (
                  <><Icons.Gear className="w-4 h-4 md:w-5 md:h-5 animate-spin" /><span>BREWING...</span></>
                ) : (
                  <><Icons.Dice className="w-6 h-6 md:w-5 md:h-5" /><span>DISPENSE MIX</span></>
                )}
              </span>
            </button>

            {/* Status Panel */}
            <div className="bg-black/40 rounded-lg p-2 md:p-2.5 border-2 border-retro-text shadow-inner">
              <div className="flex items-center justify-between text-[7px] md:text-[9px] font-mono text-amber-400/80 font-bold">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border border-retro-text ${
                    status === 'IDLE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                    status === 'BREWING' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 
                    status === 'SERVED' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
                    'bg-red-500'
                  }`}></div>
                  <span>STATUS: {status}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <span>SEEDS: {usedTrackIds.length}/20</span>
                  {isPremium && (
                    <div className="items-center gap-1 text-amber-300 hidden md:flex">
                        <Icons.Star className="w-3 h-3" /> <span>PREMIUM</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* === TRAY === */}
          <div className="relative">
            <div className="mx-auto w-4/5 h-4 md:h-6 bg-linear-to-b from-gray-800 to-black rounded-b-xl border-3 border-retro-text border-t-0 shadow-inner flex items-end justify-center pb-1">
              <div className="text-[6px] md:text-[8px] text-gray-600 font-mono font-bold tracking-wider">PICKUP</div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes coin-drop {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes item-drop {
          0% { transform: translateY(-100px); opacity: 0; }
          50% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateY(0); }
        }
        .animate-coin-drop { animation: coin-drop 0.8s ease-in forwards; }
        .animate-shake { animation: shake 0.1s infinite; }
        .animate-item-drop { animation: item-drop 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}