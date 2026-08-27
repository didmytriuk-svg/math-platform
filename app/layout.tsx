import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Платформа матеріалів для викладачів математики",
  description: "Готові презентації, ігри, самостійні та контрольні роботи для викладання математики 5–11 класів.",
  metadataBase: new URL('https://my-platform.vercel.app'),
  openGraph: {
    title: "Платформа матеріалів для викладачів математики",
    description: "Готові презентації, ігри, самостійні та контрольні роботи для викладання математики.",
    url: 'https://my-platform.vercel.app',
    siteName: 'VOLYA.ACADEMY',
    locale: 'uk_UA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="antialiased min-h-screen bg-white text-zinc-900 flex flex-col">
        {/* Верхня панель (Header) */}
        <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Логотип та назва */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl group-hover:scale-105 transition-transform">
                V
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight text-zinc-900 flex items-center gap-1.5">
                  VOLYA<span className="text-blue-600">.</span>ACADEMY
                </div>
                <div className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                  МАТЕМАТИКА 5–11
                </div>
              </div>
            </Link>

            {/* Навігація справа */}
            <div className="flex items-center gap-6">
              <Link 
                href="/catalog" 
                className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Каталог
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
              >
                <span>✨ Тарифи</span>
              </Link>
              <Link 
                href="/admin" 
                className="text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <span>Вчительська</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Основний контент сторінок */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}