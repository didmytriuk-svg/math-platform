'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ListOrdered, PlusCircle, Users, ExternalLink, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AdminHeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Огляд', href: '/admin', icon: LayoutDashboard },
    { label: 'Матеріали', href: '/admin/materials', icon: ListOrdered },
    { label: 'Додати матеріал', href: '/admin/materials/new', icon: PlusCircle },
    { label: 'Викладачі та доступи', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="bg-white border border-[#E2E8F4] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-display font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-2 ${
                isActive
                  ? 'bg-[#1E56FF] text-white shadow-xs'
                  : 'text-[#5E687E] hover:text-[#0D1117] hover:bg-[#F7F9FD]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/"
          target="_blank"
          className="font-display font-bold text-xs px-3.5 py-2 rounded-xl border border-[#E2E8F4] text-[#5E687E] hover:text-[#1E56FF] hover:border-[#1E56FF] transition-all inline-flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          На сайт
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="font-display font-bold text-xs px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Вийти
        </button>
      </div>
    </div>
  );
}