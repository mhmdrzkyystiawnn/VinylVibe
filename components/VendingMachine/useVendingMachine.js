import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSpotify from "../../hooks/useSpotify"; // Sesuaikan path

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export function useVendingMachine() {
  const { data: session } = useSession();
  const spotify = useSpotify();
  const audioContextRef = useRef(null);

  // --- STATES ---
  const [recommendations, setRecommendations] = useState([]);
  const [scanType, setScanType] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("IDLE"); // IDLE -> SELECTING -> BREWING -> SERVED
  const [usedTrackIds, setUsedTrackIds] = useState([]);
  const [seedInfo, setSeedInfo] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [machineShake, setMachineShake] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // State Printer
  const [receiptTrack, setReceiptTrack] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Init Audio & Premium
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    const checkPremium = async () => {
      if (spotify && session) {
        try {
          const user = await spotify.getMe();
          setIsPremium(user.body.product === 'premium');
        } catch { setIsPremium(false); }
      }
    };
    checkPremium();
  }, [spotify, session]);

  // Sound Engine
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

  // --- 1. INSERT COIN ---
  const insertCoin = () => {
    setReceiptTrack(null); // Reset printer
    const accessToken = spotify?.getAccessToken();
    if (!accessToken) {
      alert("Please login to Spotify first!");
      return;
    }
    if (status !== 'IDLE' && status !== 'SERVED' && status !== 'ERROR') return;

    setCoinAnimation(true);
    playSound(800, 0.1);
    setTimeout(() => playSound(600, 0.1), 100);
    setTimeout(() => playSound(400, 0.15), 200);

    setTimeout(() => {
      setCoinAnimation(false);
      setStatus("SELECTING");
      setScanType("WAITING INPUT...");
    }, 800);
  };

  // --- 2. SELECT MODE & BREW ---
  const selectModeAndBrew = async (mode) => {
    setLoading(true);
    setStatus("BREWING");
    setRecommendations([]);
    setSeedInfo(null);
    setDispensing(false);
    setMachineShake(true);
    
    let displayText = "SCANNING...";
    if (mode === 'OBSESSION') displayText = "CURRENT OBSESSION";
    if (mode === 'RECENT') displayText = "RECENT VIBES";
    if (mode === 'NOSTALGIA') displayText = "✨ NOSTALGIA HIT ✨";
    setScanType(displayText);

    const shakeInterval = setInterval(() => {
      playSound(150, 0.05, 'square');
    }, 200);

    try {
      let tracks;
      
      if (mode === 'OBSESSION') {
        const result = await spotify.getMyTopTracks({ limit: 20, time_range: 'short_term' });
        tracks = result.body.items;
      } else if (mode === 'RECENT') {
        const result = await spotify.getMyRecentlyPlayedTracks({ limit: 20 });
        tracks = result.body.items.map(item => item.track);
      } else if (mode === 'NOSTALGIA') {
        const result = await spotify.getMyTopTracks({ limit: 20, time_range: 'long_term' });
        tracks = result.body.items;
        playSound(1200, 0.1);
      } else {
        const result = await spotify.getMyTopTracks({ limit: 20 });
        tracks = result.body.items;
      }

      if (!tracks || tracks.length === 0) throw new Error("No tracks found");

      let availableTracks = tracks.filter(track => !usedTrackIds.includes(track.id));
      if (availableTracks.length === 0) {
        setUsedTrackIds([]);
        availableTracks = tracks;
      }

      const seedTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      setSeedInfo({ 
        name: seedTrack.name, 
        artist: seedTrack.artists[0].name,
        image: seedTrack.album.images[0]?.url
      });
      setUsedTrackIds(prev => [...prev, seedTrack.id]);

      const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(seedTrack.artists[0].name)}&track=${encodeURIComponent(seedTrack.name)}&api_key=${LASTFM_API_KEY}&format=json&limit=15`;
      const lastfmResponse = await fetch(lastfmUrl);
      const lastfmData = await lastfmResponse.json();

      let finalTracks = [];

      if (lastfmData.similartracks?.track?.length > 0) {
        const similarTracks = lastfmData.similartracks.track.sort(() => Math.random() - 0.5).slice(0, 5);
        for (const t of similarTracks) {
           try {
             const search = await spotify.searchTracks(`track:${t.name} artist:${t.artist.name}`, { limit: 1 });
             if (search.body.tracks.items.length > 0) finalTracks.push(search.body.tracks.items[0]);
           } catch(e) {}
           if (finalTracks.length >= 3) break;
        }
      }

      if (finalTracks.length === 0) {
         const artistTop = await spotify.getArtistTopTracks(seedTrack.artists[0].id, 'US');
         finalTracks = artistTop.body.tracks.filter(t => t.id !== seedTrack.id).slice(0, 3);
      }
      
      if (finalTracks.length === 0) throw new Error("Recommendation failed");

      clearInterval(shakeInterval);
      setMachineShake(false);
      setDispensing(true);
      playSound(300, 0.2, 'square');
      setTimeout(() => playSound(250, 0.3, 'square'), 300);

      setTimeout(() => {
        setRecommendations(finalTracks);
        setStatus("SERVED");
        setDispensing(false);
        setLoading(false);
        playSound(523, 0.15);
        setTimeout(() => playSound(659, 0.15), 150);
      }, 1800);

    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      setLoading(false);
      setMachineShake(false);
      clearInterval(shakeInterval);
      playSound(200, 0.5, 'sawtooth');
    }
  };

  // --- 3. PRINTER ACTIONS ---
  const printReceipt = (track) => {
    setReceiptTrack(null);
    setIsPrinting(true);
    
    // Suara Printer (tek tek tek)
    const printSound = setInterval(() => {
        playSound(800, 0.05, 'square');
    }, 100);

    setTimeout(() => {
        clearInterval(printSound);
        setReceiptTrack(track); // Munculkan struk
        setIsPrinting(false);
        playSound(1200, 0.3); // Suara 'Ching'
    }, 2000);
  };

  const closeReceipt = () => {
    setReceiptTrack(null);
  };

  const openInSpotify = (uri) => {
    window.open(uri.replace('spotify:track:', 'https://open.spotify.com/track/'), '_blank');
  };

  const tryAddToQueue = async (uri) => {
    if(!spotify) return;
    try { 
        await spotify.addToQueue(uri); 
        alert("Added to Queue");
    } catch { alert("Failed to add"); }
  };

  return {
    state: { recommendations, scanType, loading, status, seedInfo, dispensing, coinAnimation, machineShake, isPremium, usedTrackIds, receiptTrack, isPrinting },
    actions: { insertCoin, selectModeAndBrew, openInSpotify, tryAddToQueue, printReceipt, closeReceipt }
  };
} //useVendingMachine.js