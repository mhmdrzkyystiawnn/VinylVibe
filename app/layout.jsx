import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "VinylVibe",
  description: "My Retro Spotify Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-retro-bg text-retro-text font-body">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}