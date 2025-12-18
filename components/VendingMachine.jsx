"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import Image from "next/image";

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY || 'YOUR_LASTFM_KEY_HERE';

export default function VendingMachine() {
  const { data: session } = useSession();
  const spotify = useSpotify();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [usedTrackIds, setUsedTrackIds] = useState([]);
  const [seedInfo, setSeedInfo] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [machineShake, setMachineShake] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const audioContextRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Check if user is premium
  useEffect(() => {
    const checkPremium = async () => {
      if (spotify && session) {
        try {
          const user = await spotify.getMe();
          setIsPremium(user.body.product === 'premium');
          console.log('User premium status:', user.body.product);
        } catch (err) {
          console.log('Could not check premium status:', err);
          setIsPremium(false);
        }
      }
    };
    checkPremium();
  }, [spotify, session]);

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

  const startBrewing = async () => {
    setLoading(true);
    setStatus("BREWING");
    setRecommendations([]);
    setSeedInfo(null);
    setDispensing(false);
    setMachineShake(true);

    const shakeInterval = setInterval(() => {
      playSound(150, 0.05, 'square');
    }, 200);

    try {
      console.log('🔑 Last.fm API Key:', LASTFM_API_KEY ? 'EXISTS' : 'MISSING');
      
      const useTopTracks = Math.random() > 0.5;
      let tracks;

      console.log(`📊 Using ${useTopTracks ? 'Top Tracks' : 'Recently Played'}`);

      if (useTopTracks) {
        const result = await spotify.getMyTopTracks({ 
          limit: 20, 
          time_range: 'short_term'
        });
        tracks = result.body.items;
        console.log(`✅ Got ${tracks.length} top tracks`);
      } else {
        const result = await spotify.getMyRecentlyPlayedTracks({ limit: 20 });
        tracks = result.body.items.map(item => item.track);
        console.log(`✅ Got ${tracks.length} recent tracks`);
      }
      
      if (!tracks.length) {
         alert("Butuh listening history dulu buat racik lagu!");
         playErrorSound();
         setLoading(false);
         setStatus("IDLE");
         setMachineShake(false);
         clearInterval(shakeInterval);
         return;
      }

      let availableTracks = tracks.filter(
        track => !usedTrackIds.includes(track.id)
      );

      if (availableTracks.length === 0) {
        setUsedTrackIds([]);
        availableTracks = tracks;
      }

      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      const seedTrack = availableTracks[randomIndex];
      
      const artistName = seedTrack.artists[0].name;
      const trackName = seedTrack.name;

      console.log(`🎲 Seed Track: "${trackName}" by ${artistName}`);

      setSeedInfo({ 
        name: trackName, 
        artist: artistName,
        image: seedTrack.album.images[0]?.url
      });

      setUsedTrackIds(prev => [...prev, seedTrack.id]);

      const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&api_key=${LASTFM_API_KEY}&format=json&limit=15`;
      
      console.log('🌐 Fetching from Last.fm...');
      
      const lastfmResponse = await fetch(lastfmUrl);
      console.log('📡 Last.fm Response Status:', lastfmResponse.status);
      
      const lastfmData = await lastfmResponse.json();
      console.log('📦 Last.fm Data:', lastfmData);

      if (lastfmData.error) {
        throw new Error(`Last.fm Error: ${lastfmData.message}`);
      }

      if (!lastfmData.similartracks?.track || lastfmData.similartracks.track.length === 0) {
        console.warn('⚠️ No similar tracks found, trying fallback...');
        
        const artistId = seedTrack.artists[0].id;
        const artistTopTracks = await spotify.getArtistTopTracks(artistId, 'US');
        const fallbackTracks = artistTopTracks.body.tracks
          .filter(t => t.id !== seedTrack.id)
          .slice(0, 3);
        
        if (fallbackTracks.length > 0) {
          console.log('✅ Using fallback: Artist top tracks');
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

      console.log(`✅ Found ${lastfmData.similartracks.track.length} similar tracks`);

      const similarTracks = lastfmData.similartracks.track
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);

      console.log('🔍 Searching on Spotify...');
      const spotifyTracks = [];
      
      for (const track of similarTracks) {
        try {
          const searchQuery = `track:${track.name} artist:${track.artist.name}`;
          const searchResult = await spotify.searchTracks(searchQuery, { limit: 1 });
          
          if (searchResult.body.tracks.items.length > 0) {
            spotifyTracks.push(searchResult.body.tracks.items[0]);
            console.log(`✓ Found: ${track.name}`);
          }
        } catch {
          console.log(`✗ Could not find: ${track.name}`);
        }

        if (spotifyTracks.length >= 3) break;
      }

      console.log(`🎵 Final tracks: ${spotifyTracks.length}`);

      if (spotifyTracks.length === 0) {
        throw new Error("Could not find tracks on Spotify");
      }

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
      console.error("❌ Mesin Macet:", err);
      console.error("Error details:", err.message);
      setStatus("ERROR");
      setLoading(false);
      setMachineShake(false);
      clearInterval(shakeInterval);
      playErrorSound();
      
      alert(`Error: ${err.message}\n\nCheck console (F12) for details.`);
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
    } catch (err) {
        console.log("Queue not available:", err.message);
        playErrorSound();
        alert("Failed to add to queue. Please try again.");
    }
  };

  return (
    <div className="w-full mx-auto relative select-none">
      
      {/* Coin Animation */}
      {coinAnimation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-coin-drop pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-300 via-yellow-500 to-yellow-700 border-4 border-yellow-900 shadow-2xl flex items-center justify-center text-yellow-900 font-black text-lg">
            ¢
          </div>
        </div>
      )}

      {/* === VENDING MACHINE BODY === */}
      <div className={`relative transition-transform duration-75 ${machineShake ? 'animate-shake' : ''}`}>
        
        {/* MAIN BODY - 90s Retro Machine */}
        <div className="relative bg-linear-to-b from-[#D4B896] via-retro-bg to-[#C4A57B] border-4 border-retro-text rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)]">
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-retro-dark/50"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-retro-dark/50"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-retro-dark/50"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-retro-dark/50"></div>

          {/* Coin Slot */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 bg-linear-to-b from-gray-600 to-gray-900 px-4 py-2 rounded-t-xl border-3 border-retro-text shadow-lg">
            <div className="w-16 h-3 bg-black rounded-sm border border-gray-800 shadow-inner flex items-center justify-center">
              <div className="text-[8px] text-amber-500/70 font-mono font-bold">INSERT</div>
            </div>
          </div>

          {/* === DISPLAY WINDOW - CRT Monitor Style === */}
          <div className="relative bg-linear-to-b from-gray-900 via-black to-gray-900 border-4 border-retro-text rounded-xl p-5 min-h-70 mb-5 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
            
            {/* CRT Screen Curvature Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none"></div>
            
            {/* Screen Glare - Top Left */}
            <div className="absolute top-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Scanlines - Subtle */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(205,86,86,0.03),rgba(205,86,86,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none"></div>

            {/* CONTENT */}
            <div className="relative z-10">
              {loading && !dispensing ? (
                <div className="text-center space-y-4 py-4">
                  <div className="text-retro-primary font-mono text-sm font-bold animate-pulse">
                    [ ANALYZING MUSIC DNA... ]
                  </div>
                  {seedInfo && (
                    <div className="flex items-center justify-center gap-3 bg-retro-primary/10 p-3 rounded-lg border-2 border-retro-primary/30">
                      {seedInfo.image && (
                        <Image 
                          src={seedInfo.image} 
                          width={50} 
                          height={50} 
                          alt="seed"
                          className="rounded border-2 border-retro-primary shadow-lg" 
                        />
                      )}
                      <div className="text-left">
                        <p className="text-[10px] text-retro-primary/80 font-mono font-bold mb-1">SEED TRACK:</p>
                        <p className="text-sm font-bold text-retro-light">{seedInfo.name}</p>
                        <p className="text-xs text-retro-bg/60">{seedInfo.artist}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-retro-primary/60 font-mono text-xs">
                    <div className="animate-spin">⚙</div>
                    <span>CONSULTING LAST.FM DATABASE...</span>
                  </div>
                </div>
              ) : dispensing ? (
                <div className="text-center space-y-6 py-6">
                  <div className="text-retro-primary font-display font-black text-2xl animate-pulse">
                    ⬇ DISPENSING ⬇
                  </div>
                  <div className="flex justify-center gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        className="relative animate-item-drop"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      >
                        <div className="w-20 h-24 bg-linear-to-br from-retro-light/40 to-retro-dark/40 border-4 border-retro-primary rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-sm">
                          <div className="text-5xl">🎵</div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/60 rounded-full blur-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : status === "IDLE" ? (
                <div className="text-center space-y-5 py-12">
                  <div className="text-7xl mb-4 animate-bounce">🎵</div>
                  <div className="text-retro-bg font-mono text-base font-bold opacity-90">
                    INSERT COIN TO GET
                  </div>
                  <div className="text-retro-primary font-display font-black text-3xl tracking-wider drop-shadow-[0_0_20px_rgba(205,86,86,0.4)]">
                    MYSTERY MIX
                  </div>
                  <div className="text-[11px] text-retro-bg/40 font-mono mt-6 space-y-1">
                    <div>[ POWERED BY LAST.FM × SPOTIFY ]</div>
                    <div className="text-amber-400/60 font-bold">💰 COST: 50 CENTS</div>
                  </div>
                </div>
              ) : status === "SERVED" && recommendations.length > 0 ? (
                <div className="space-y-3">
                  {seedInfo && (
                    <div className="flex items-center gap-2 bg-linear-to-r from-retro-primary/20 to-transparent p-2.5 rounded-lg border-2 border-retro-primary/40 mb-4">
                      {seedInfo.image && (
                        <Image 
                          src={seedInfo.image} 
                          width={40} 
                          height={40} 
                          alt="seed"
                          className="rounded border-2 border-retro-primary shadow-md" 
                        />
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] text-retro-primary/80 font-mono font-bold">BASED ON:</p>
                        <p className="text-xs font-bold text-retro-light truncate">{seedInfo.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {recommendations.map((track, idx) => (
                    <div 
                      key={track.id} 
                      className="flex items-center justify-between bg-linear-to-r from-retro-bg/20 to-transparent p-3 rounded-xl border-2 border-retro-bg/30 hover:border-retro-light/60 transition-all hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="relative shrink-0">
                          <Image 
                            src={track.album.images[0]?.url || '/placeholder.png'} 
                            width={56} 
                            height={56} 
                            alt={track.name}
                            className="rounded-lg border-2 border-retro-bg/50 shadow-xl" 
                          />
                          <div className="absolute -top-2 -left-2 bg-linear-to-br from-retro-primary to-retro-dark text-retro-bg text-xs font-black px-2 py-1 rounded-full border-2 border-retro-text shadow-lg">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="overflow-hidden flex-1 min-w-0">
                          <p className="text-sm font-bold text-retro-light truncate group-hover:text-retro-primary transition-colors">
                            {track.name}
                          </p>
                          <p className="text-xs text-retro-bg/70 truncate">{track.artists[0].name}</p>
                          <p className="text-[10px] text-retro-bg/50 truncate">{track.album.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        <button 
                          onClick={() => openInSpotify(track.uri)}
                          className="text-xs bg-linear-to-br from-green-600 to-green-800 text-white px-2.5 py-2 font-black hover:brightness-110 transition-all hover:scale-110 rounded-lg shadow-lg border-2 border-retro-text"
                          title="Open in Spotify"
                        >
                          ▶
                        </button>
                        {isPremium && (
                          <button 
                            onClick={() => tryAddToQueue(track.uri)}
                            className="text-xs bg-linear-to-br from-retro-light to-retro-dark text-white px-2.5 py-2 font-black hover:brightness-110 transition-all hover:scale-110 rounded-lg shadow-lg border-2 border-retro-text"
                            title="Add to Queue (Premium Only)"
                          >
                            +Q
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : status === "ERROR" ? (
                <div className="text-center py-12">
                  <div className="text-retro-primary font-display text-2xl font-black mb-3 animate-pulse">
                    ⚠️ OUT OF STOCK
                  </div>
                  <div className="text-retro-light/70 text-sm">(SYSTEM ERROR)</div>
                  <div className="text-xs text-retro-bg/40 mt-4 font-mono">Please try again</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* === BIG RED BUTTON - Classic 90s Style === */}
          <div className="space-y-3 mb-5">
            <button
              onClick={dispenseMix}
              disabled={loading}
              className={`
                w-full py-5 bg-linear-to-b from-retro-light via-retro-primary to-retro-dark text-retro-bg font-display font-black text-xl uppercase tracking-widest 
                rounded-xl border-4 border-retro-text
                shadow-[0_8px_0px_0px_rgba(62,39,35,1)] 
                active:translate-y-1.5 active:shadow-[0_2px_0px_0px_rgba(62,39,35,1)] 
                transition-all duration-100
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}
                relative overflow-hidden group
              `}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="relative z-10 drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    <span>BREWING...</span>
                  </>
                ) : (
                  <>
                    <span>🎲</span>
                    <span>DISPENSE MIX</span>
                  </>
                )}
              </span>
            </button>

            {/* Status Panel - LCD Style */}
            <div className="bg-black/40 rounded-lg p-2.5 border-2 border-retro-text shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono text-amber-400/80 font-bold">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full border border-retro-text ${
                    status === 'IDLE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                    status === 'BREWING' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 
                    status === 'SERVED' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  }`}></div>
                  <span>STATUS: {status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>SEEDS: {usedTrackIds.length}/20</span>
                  {isPremium && <span className="text-amber-300">★ PREMIUM</span>}
                </div>
              </div>
            </div>
          </div>

          {/* === DISPENSE TRAY === */}
          <div className="relative">
            <div className="mx-auto w-4/5 h-6 bg-linear-to-b from-gray-800 to-black rounded-b-xl border-3 border-retro-text border-t-0 shadow-inner flex items-end justify-center pb-1">
              <div className="text-[8px] text-gray-600 font-mono font-bold tracking-wider">PICKUP</div>
            </div>
          </div>

        </div>

      </div>

      <style jsx>{`
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
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-coin-drop {
          animation: coin-drop 0.8s ease-in forwards;
        }
        .animate-shake {
          animation: shake 0.1s infinite;
        }
        .animate-item-drop {
          animation: item-drop 0.8s ease-out forwards;
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
      `}</style>
    </div>
  );
}