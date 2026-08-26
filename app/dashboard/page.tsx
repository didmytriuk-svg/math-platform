'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ShieldCheck, 
  BookOpen, 
  LogOut, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        // 1. Перевіряємо поточного залогіненого користувача
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        // 2. Отримуємо активну підписку викладача з таблиці user_subscriptions
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*, grades(name)')
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .maybeSingle();

        setSubscription(subData || { tier: 'free', is_active: false });

        // 3. Завантажуємо матеріали (якщо Pro — всі або фільтруємо за класом)
        const { data: matsData } = await supabase
          .from('materials')
          .select(`
            id,
            title,
            slug,
            description,
            is_premium,
            grades ( id, name ),
            material_types ( id, name )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        setMaterials(matsData || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження особистого кабінету...
        </div>
      </div>
    );
  }

  const hasProAccess = subscription?.is_active && (subscription.tier === 'pro_all' || subscription.tier === 'grade_pro');

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Шапка кабінету */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono-math uppercase tracking-wider text-[#5E687E] font-bold">Особистий кабінет викладача</span>
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#0D1117] mt-0.5">
                {user?.email}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/catalog"
              className="font-display font-bold text-xs px-4 py-2.5 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] transition-all"
            >
              Перейти в каталог →
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="font-display font-bold text-xs px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </button>
          </div>
        </div>

        {/* Статус підписки */}
        <div className={`border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          hasProAccess 
            ? 'bg-gradient-to-br from-[#0D1117] to-[#1E293B] text-white border-transparent shadow-md' 
            : 'bg-white border-[#E2E8F4] text-[#0D1117] shadow-xs'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono-math uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-md ${
                hasProAccess ? 'bg-[#1E56FF] text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                Ваш тарифний план
              </span>
            </div>
            <h2 className="font-display font-black text-2xl">
              {subscription.tier === 'pro_all' && 'Pro — Весь каталог (Безліміт)'}
              {subscription.tier === 'grade_pro' && `Pro — Клас: ${subscription.grades?.name || 'Обраний клас'}`}
              {subscription.tier === 'free' && 'Безкоштовний доступ'}
            </h2>
            <p className={`text-xs ${hasProAccess ? 'text-gray-300' : 'text-[#5E687E]'}`}>
              {hasProAccess 
                ? 'У вас є повний доступ до завантаження та перегляду всіх закритих матеріалів відповідно до вашої підписки.' 
                : 'Оновіть свій тариф до Pro, щоб отримати повний доступ до всіх розробок, презентацій та контрольних робіт.'}
            </p>
          </div>

          {!hasProAccess && (
            <Link
              href="/pricing"
              className="font-display font-bold text-xs px-6 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors inline-flex items-center gap-2 shrink-0 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Отримати Pro-доступ
            </Link>
          )}
        </div>

        {/* Список матеріалів (або доступних розробок) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-black text-xl text-[#0D1117]">
              Доступні матеріали для ваших уроків
            </h3>
            <span className="text-xs font-mono-math text-[#5E687E]">
              Всього розробок: <strong className="text-[#0D1117]">{materials.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((m) => {
              const isLocked = m.is_premium && !hasProAccess;

              return (
                <div
                  key={m.id}
                  className="bg-white border border-[#E2E8F4] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-[#1E56FF] shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {m.grades?.name && (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#EFF4FF] text-[#1E56FF] font-display font-bold text-[11px]">
                            {m.grades.name}
                          </span>
                        )}
                        {m.material_types?.name && (
                          <span className="text-[11px] font-mono-math text-[#5E687E]">
                            {m.material_types.name}
                          </span>
                        )}
                      </div>

                      {m.is_premium ? (
                        <span className="text-[10px] font-mono-math font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          🔒 Pro
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-math font-semibold text-[#00BA7C] bg-[#F0FDF4] px-2 py-0.5 rounded">
                          Free
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#0D1117] line-clamp-2">
                      {m.title}
                    </h4>
                    {m.description && (
                      <p className="text-xs text-[#5E687E] line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F1F4FA] flex items-center justify-between">
                    <span className="text-[11px] font-mono-math text-[#94A3B8]">
                      {isLocked ? 'Потребує підписки' : 'Доступно'}
                    </span>
                    <Link
                      href={`/material/${m.id}`}
                      className="font-display font-bold text-xs px-3 py-1.5 rounded-lg bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-colors inline-flex items-center gap-1"
                    >
                      Відкрити
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
