'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';

export function AdminHeaderNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        На головну сайту
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
          Вчительська панель
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-display font-bold text-[#5E687E] hover:text-red-600 p-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          title="Вийти з акаунту"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Вийти</span>
        </button>
      </div>
    </div>
  );
}