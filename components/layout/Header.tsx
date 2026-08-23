import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#1E56FF] text-white rounded-xl flex items-center justify-center font-display font-black text-lg shadow-sm group-hover:bg-[#0D33B3] transition-colors">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-base tracking-tight text-[#0D1117] group-hover:text-[#1E56FF] transition-colors leading-none">
              VOLYA<span className="text-[#1E56FF]">.ACADEMY</span>
            </span>
            <span className="font-mono-math text-[10px] uppercase tracking-wider text-[#5E687E] mt-1 font-semibold">
              Математика 5–11
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-display font-bold text-[#0D1117] hover:text-[#1E56FF] transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/admin"
            className="text-xs font-display font-bold px-4 py-2.5 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs"
          >
            Вчительська →
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;