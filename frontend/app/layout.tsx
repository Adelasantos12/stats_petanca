import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const appFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-app",
  display: "swap",
});

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
      <body className={`${appFont.className} min-h-screen antialiased`}>
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
               {/* Nav items could go here */}
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
