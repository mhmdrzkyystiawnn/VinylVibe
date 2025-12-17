/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Server Album Art & Profil Umum
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co', // Server Playlist/Mosaic
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-ak.spotifycdn.com', // Server CDN Profil baru
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com', // Kalau login pake Facebook
      },
    ],
  },
};

export default nextConfig;