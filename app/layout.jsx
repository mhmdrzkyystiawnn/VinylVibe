import { Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import yang tadi kita buat

// Setup Font
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata = {
  title: "VinylVibe",
  description: "My Retro Spotify Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${spaceMono.variable} antialiased bg-retro-bg text-retro-text font-body`}>
        {/* Bungkus semua konten dengan Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}