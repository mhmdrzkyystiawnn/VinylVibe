"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Header({ user }) {
  // Fallback jika tidak ada user
  const userName = user?.display_name || "User";
  const userImg = user?.images?.[0]?.url;

  return (
    <header className="mb-12 sticky top-4 z-50 px-2 md:px-0">
      {/* --- RETRO CONTAINER BOX --- 
          Border tebal (3px) + Hard Shadow (6px offset)
      */}
      <div className="bg-retro-bg border-3 border-retro-text shadow-[6px_6px_0px_0px_var(--color-retro-text)] relative">
        
        {/* 1. TOP BAR (Fake OS Bar) */}
        <div className="bg-retro-text text-retro-bg px-3 py-1 flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b-3 border-retro-text">
          <span>SYSTEM_READY</span>
          <span className="flex gap-1">
            {/* Dekorasi kotak kecil ala tombol close/minimize */}
            <span className="w-3 h-3 bg-retro-bg border border-retro-text block"></span>
            <span className="w-3 h-3 bg-retro-light border border-retro-text block"></span>
          </span>
        </div>

        {/* 2. MAIN CONTENT */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LEFT SIDE: Title & Marquee */}
          <div className="w-full md:w-auto overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none relative inline-block">
              DASHBOARD
              {/* Titik merah kecil sebagai aksen */}
              <span className="text-retro-primary">.</span>
            </h1>
            
            {/* Running Text Container */}
            <div className="border-t-2 border-dashed border-retro-text/30 mt-2 pt-1 w-full max-w-[250px]">
               <p className="text-xs font-bold uppercase text-retro-primary whitespace-nowrap animate-marquee">
                  WELCOME BACK, {userName}. SYSTEM ONLINE MUSIC LIBRARY LOADED 
               </p>
            </div>
          </div>

          {/* RIGHT SIDE: Profile & Action */}
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end border-t-2 border-retro-text md:border-t-0 pt-4 md:pt-0">
            
            {/* User Profile - Kotak bukan Bulat */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-tight uppercase">{userName}</p>
                <p className="text-[10px] opacity-70">ADMINISTRATOR</p>
              </div>
              
              <div className="relative w-12 h-12 flex-shrink-0">
                {userImg ? (
                  <Image
                    src={userImg}
                    alt="Profile"
                    fill
                    className="object-cover border-2 border-retro-text shadow-[2px_2px_0px_0px_var(--color-retro-text)]"
                  />
                ) : (
                  <div className="w-full h-full bg-retro-primary border-2 border-retro-text flex items-center justify-center font-bold text-retro-bg">
                    ?
                  </div>
                )}
              </div>
            </div>

            {/* Retro Button: "3D Pressable Effect" */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="
                group relative px-6 py-2 bg-retro-primary text-retro-bg font-bold font-display uppercase tracking-wider
                border-2 border-retro-text
                shadow-[4px_4px_0px_0px_var(--color-retro-text)]
                hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-retro-text)]
                active:translate-y-[4px] active:translate-x-[4px] active:shadow-none
                transition-all duration-100 ease-in-out
              "
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}