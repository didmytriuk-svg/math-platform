import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F4] bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#1E56FF] flex items-center justify-center text-white font-display font-black text-sm shadow-xs transition-transform group-hover:scale-105">
            V
          </div>
          <div>
            <span className="font-display font-black text-base sm:text-lg tracking-tight text-[#0D1117] block leading-none">
              VOLYA<span className="text-[#1E56FF]">.ACADEMY</span>
            </span>
            <span className="text-[10px] font-mono-math font-bold tracking-wider text-[#5E687E] uppercase block mt-0.5">
              Математика 5–11
            </span>
          </div>
        </Link>

        {/* Права частина меню як на скриншоті */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors px-3 py-2 rounded-xl"
          >
            Каталог
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-display font-bold text-[#0D1117] bg-[#EFF4FF] hover:bg-[#DCE7FF] border border-[#D5E2FF] px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E56FF]" />
            <span>Тарифи</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E56FF]" />
          </Link>

          <Link
            href="/admin"
            className="font-display font-bold text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            Вчительська
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}