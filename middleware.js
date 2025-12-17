import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Ambil token dari session user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Ambil URL yang lagi dibuka
  const { pathname } = req.nextUrl;

  // 1. Jika User SUDAH LOGIN dan coba buka halaman "/login"
  //    -> Kita lempar balik ke Dashboard ("/")
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Izinkan request lewat jika:
  //    a) Request ke endpoint Auth NextAuth (/api/auth/...)
  //    b) User sudah punya token (sudah login)
  //    c) User lagi di halaman login (biar gak looping redirect)
  if (pathname.includes("/api/auth") || token || pathname === "/login") {
    return NextResponse.next();
  }

  // 3. Jika User BELUM LOGIN dan coba buka halaman lain (Dashboard)
  //    -> Kita lempar ke halaman Login
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Konfigurasi: Middleware ini jalan di semua halaman KECUALI file static (gambar, font, dll)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};