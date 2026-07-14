import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Link from "next/link";
import { Users, Target, Trophy, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "perform | Entrenamiento de petanca",
  description: "perform — entrenamiento de petanca. Rendimiento. Precisión. Resultado.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#DD5A2F",
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
      <body className={`${inter.className} ${poppins.variable} min-h-screen antialiased`}>
        <header className="glass sticky top-0 z-50 py-4 px-6 mb-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Logo className="text-[1.6rem]" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/contador"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-brand-600 transition-colors"
              >
                <Zap size={18} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Contador</span>
              </Link>
              <Link
                href="/coach"
                className="flex items-center gap-1.5 text-sm font-black text-slate-500 hover:text-brand-600 transition-colors"
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
