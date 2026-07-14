import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Users, Target, Trophy, Zap } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetancaPro | Stats & Analytics",
  description: "Registro profesional de partidas y performance de petanca",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <header className="glass sticky top-0 z-50 py-4 px-6 mb-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-xl italic">P</span>
              </div>
              <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase">
                Petanca<span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/contador"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Zap size={18} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Contador</span>
              </Link>
              <Link
                href="/coach"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Users size={18} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Coach</span>
              </Link>
              <Link
                href="/player"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-amber-600 transition-colors"
              >
                <Target size={18} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Jugador</span>
              </Link>
              <Link
                href="/tournaments"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Trophy size={18} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Torneos</span>
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 mb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
