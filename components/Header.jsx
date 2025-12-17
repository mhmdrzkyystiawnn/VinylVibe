"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Header({ user }) {
  return (
    <header className="flex justify-between items-center mb-12 border-b-2 border-retro-dark pb-4">
      <div>
        <h1 className="text-3xl font-display font-bold">DASHBOARD</h1>
        <p className="text-retro-primary opacity-80">
          Welcome back, {user?.display_name || "Guest"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {user?.images?.[0]?.url && (
          <Image
            src={user.images[0].url}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-retro-dark"
          />
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs font-bold bg-retro-dark text-retro-bg px-3 py-2 rounded hover:bg-retro-primary transition"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}