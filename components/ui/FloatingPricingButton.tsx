'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export function FloatingPricingButton() {
  const pathname = usePathname();

  // Приховуємо кнопку на сторінці тарифів та в адмін-панелі
  if (pathname === '/pricing' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <Link
        href="/pricing"
        className="group relative flex items-center gap-2.5 bg-[#0D1117]/90 hover:bg-[#1E56FF] text-white backdrop-blur-md px-4 py-3 rounded-full border border-white/15 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        {/* Живий індикатор / іконка */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:text-white transition-colors animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00BA7C] ring-2 ring-[#0D1117]" />
        </div>

        {/* Текстовий блок */}
        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] font-mono-math uppercase tracking-wider text-[#94A3B8] group-hover:text-blue-100 font-semibold leading-none">
            Річний доступ
          </span>
          <span className="font-display font-black text-xs sm:text-sm text-white tracking-tight mt-0.5">
            Тарифи Pro
          </span>
        </div>

        {/* Стрілочка */}
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </div>
      </Link>
    </div>
  );
}