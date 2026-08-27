'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CalendarDays,
  MessageSquareWarning,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalMaterials: 0,
    activeTeachers: 0,
    totalGrades: 7,
    totalPlans: 0,
    supportCount: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
          router.push('/admin/login');
          return;
        }

        const cleanEmail = user.email.trim().toLowerCase();
        const masterAdminEmail = 'didmytriuk@gmail.com';

        if (cleanEmail !== masterAdminEmail) {
          router.push('/dashboard');
          return;
        }

        const [materialsRes, subsRes, gradesRes, requestsRes, plansRes, supportRes] = await Promise.all([
          supabase.from('materials').select('id', { count: 'exact', head: true }),
          supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('grades').select('id', { count: 'exact', head: true }),
          supabase.from('subscription_requests').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('calendar_plans').select('id', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('support_messages').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalMaterials: materialsRes.count || 0,
          activeTeachers: subsRes.count || 0,
          totalGrades: gradesRes.count || 7,
          totalPlans: plansRes.count || 0,
          supportCount: supportRes.count || 0,
        });

        setRecentRequests(requestsRes.data || []);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E56FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Шапка адмін-панелі */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-mono-math font-bold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
              Адміністративна панель Volya Academy
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117] mt-2">
              Керування платформою
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display font-bold text-xs px-4 py-2.5 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] transition-all"
            >
              На головну сайту →
            </Link>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider">Матеріалів</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">{stats.totalMaterials}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider">КТП плани</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#1E56FF]">{stats.totalPlans}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider">Активних Pro</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#00BA7C]">{stats.activeTeachers}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider">Паралелі</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">{stats.totalGrades}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider">Звернень</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-amber-600">{stats.supportCount}</p>
          </div>
        </div>

        {/* Основні картки керування */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Керування матеріалами */}
          <Link
            href="/admin/materials"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-7 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-lg text-[#0D1117]">
                  Матеріали уроків
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Презентації, ігри, контрольні та тести для 5–11 класів.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#1E56FF]">
              <span>Керувати</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Керування календарними планами (КТП) */}
          <Link
            href="/admin/calendar-plans"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-7 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-lg text-[#0D1117]">
                  Календарні плани (КТП)
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Завантаження та керування планами на рік.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#1E56FF]">
              <span>Керувати КТП</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Керування підписками та викладачами */}
          <Link
            href="/admin/subscriptions"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-7 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#00BA7C] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-lg text-[#0D1117]">
                  Викладачі та доступи
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Видача річних підписок та обробка заявок.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#00BA7C]">
              <span>Підписки</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Служба підтримки та помилки */}
          <Link
            href="/admin/support"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-7 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-lg text-[#0D1117]">
                  Підтримка та помилки
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Звернення від вчителів із форми на сайті.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-amber-600">
              <span>Звернення ({stats.supportCount})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Блок із заявками з модального вікна оплати */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4FA] pb-4">
            <div>
              <h3 className="font-display font-black text-lg text-[#0D1117]">
                Останні заявки з сайту ({recentRequests.length})
              </h3>
              <p className="text-xs text-[#5E687E] mt-0.5">
                Оплати на рахунок ФОП, що очікують підтвердження
              </p>
            </div>
            <Link
              href="/admin/subscriptions"
              className="font-display font-bold text-xs text-[#1E56FF] hover:underline"
            >
              Перейти до видачі доступу →
            </Link>
          </div>

          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((req: any) => (
                <div key={req.id} className="p-3.5 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-[#0D1117]">{req.full_name}</span>
                    <span className="text-[10px] font-mono-math text-[#5E687E]">
                      {new Date(req.created_at).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#1E56FF]">{req.email}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-[#00BA7C]">
                      {req.tier}
                    </span>
                    {req.contact && <span className="text-[11px] text-[#5E687E]">Контакт: {req.contact}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5E687E] py-8 text-center italic">
              Немає нових заявок з форми тарифів.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}