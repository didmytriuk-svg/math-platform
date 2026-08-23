import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F4] bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#1E56FF] flex items-center justify-center text-white font-display font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
            V
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-[#0D1117] block leading-none">
              VOLYA<span className="text-[#1E56FF]">.ACADEMY</span>
            </span>
            <span className="text-[10px] font-mono-math font-bold tracking-wider text-[#5E687E] uppercase block mt-0.5">
              Математика 5–11
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors px-3 py-2 rounded-xl"
          >
            Каталог
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Тарифи PRO</span>
          </Link>

          <Link
            href="/admin"
            className="font-display font-bold text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs"
          >
            Вчительська →
          </Link>
        </nav>
      </div>
    </header>
  );
}