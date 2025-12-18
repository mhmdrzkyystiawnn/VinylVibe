"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Header({ user }) {
  const userName = user?.display_name || "User";
  const userImg = user?.images?.[0]?.url;

  return (
    <div className="relative">
      {/* Cassette Tape Decoration - Top */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full border-4 border-retro-text/30 bg-retro-bg"></div>
          <div className="w-6 h-6 rounded-full border-4 border-retro-primary/40 bg-retro-bg mt-2"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full border-4 border-retro-primary/40 bg-retro-bg mt-2"></div>
          <div className="w-10 h-10 rounded-full border-4 border-retro-text/30 bg-retro-bg"></div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* LEFT SIDE: Title & Branding */}
        <div className="flex-1 text-center md:text-left">
          <div className="relative inline-block">
            {/* Retro Badge */}
            <div className="absolute -top-4 -left-4 bg-retro-primary text-retro-bg px-3 py-1 rotate-[-8deg] text-[10px] font-black uppercase border-2 border-retro-text shadow-lg z-10">
              LIVE
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-retro-text font-display relative">
              VINYL
              <span className="text-retro-primary">VIBE</span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-retro-primary"></div>
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className="mt-3">
            <p className="text-xs font-mono font-bold uppercase text-retro-dark">
              WELCOME {userName.toUpperCase()}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Profile & Controls */}
        <div className="flex items-center gap-4">
          
          {/* User Profile Card */}
          <div className="bg-linear-to-br from-retro-bg to-[#E5E6C1] border-4 border-retro-text rounded-lg p-3 shadow-[6px_6px_0px_0px_rgba(62,39,35,1)] flex items-center gap-3">
            
            {/* Profile Image */}
            <div className="relative w-14 h-14 shrink-0">
              {userImg ? (
                <Image
                  src={userImg}
                  alt="Profile"
                  fill
                  className="object-cover border-3 border-retro-text shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-retro-primary border-3 border-retro-text flex items-center justify-center font-black text-2xl text-retro-bg">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Online Indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-retro-text rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            </div>

            {/* User Info */}
            <div className="hidden md:block">
              <p className="text-sm font-black leading-tight uppercase font-display">{userName}</p>
              <p className="text-[10px] opacity-70 font-mono font-bold">DJ - ONLINE</p>
            </div>
          </div>

          {/* Logout Button - 90s Power Button Style */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="
              group relative w-14 h-14 bg-retro-dark border-4 border-retro-text rounded-full
              shadow-[4px_4px_0px_0px_rgba(62,39,35,1)]
              hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(62,39,35,1)]
              active:translate-y-1 active:translate-x-1 active:shadow-none
              transition-all duration-100 ease-in-out
              flex items-center justify-center
            "
            title="Power Off"
          >
            <svg 
              className="w-6 h-6 text-retro-bg group-hover:scale-110 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

        </div>
      </div>

      {/* Tape Strip Decoration - Bottom */}
      <div className="mt-4 h-2 bg-linear-to-r from-transparent via-retro-text/20 to-transparent"></div>
    </div>
  );
}