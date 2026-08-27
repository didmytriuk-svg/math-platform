'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, LogOut, LayoutDashboard, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function Header() {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F4] bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/favicon.png"
              alt="VOLYA.ACADEMY Logo"
              fill
              className="object-contain"
              priority
            />
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

        {/* Навігація */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors px-2 sm:px-3 py-2 rounded-xl"
          >
            Каталог
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-[#0D1117] bg-[#EFF4FF] hover:bg-[#DCE7FF] border border-[#D5E2FF] px-3 py-1.5 rounded-full transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E56FF]" />
            <span>Тарифи</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E56FF]" />
          </Link>

          {/* Стан входу */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-display font-bold text-[#0D1117] leading-none">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono-math font-semibold text-[#1E56FF] mt-0.5">
                  {profile?.role === 'admin'
                    ? 'Адміністратор'
                    : profile?.is_pro
                    ? 'PRO Доступ'
                    : 'Free Акаунт'}
                </span>
              </div>

              {profile?.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="font-display font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Адмінка
                </Link>
              ) : (
                <Link
                  href="/catalog"
                  className="font-display font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Мої матеріали
                </Link>
              )}

              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 rounded-xl border border-[#E2E8F4] text-[#5E687E] hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                title="Вийти з акаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-display font-bold text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Вчительська</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}