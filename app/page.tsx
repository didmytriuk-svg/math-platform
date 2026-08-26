import Link from 'next/link';
import { 
  FileText, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Отримуємо статистику
  const [materialsRes, subsRes, gradesRes, requestsRes, activeSubsListRes] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('grades').select('id', { count: 'exact', head: true }),
    supabase.from('subscription_requests').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('user_subscriptions').select('*, grades(name)').order('created_at', { ascending: false }).limit(10)
  ]);

  const totalMaterials = materialsRes.count || 0;
  const activeTeachers = subsRes.count || 0;
  const totalGrades = gradesRes.count || 7;
  const recentRequests = requestsRes.data || [];
  const activeSubscriptions = activeSubsListRes.data || [];

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-mono-math text-[#5E687E] uppercase tracking-wider">Всього матеріалів</span>
            <p className="font-display font-black text-3xl text-[#0D1117]">{totalMaterials}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-mono-math text-[#5E687E] uppercase tracking-wider">Активних викладачів (Pro)</span>
            <p className="font-display font-black text-3xl text-[#00BA7C]">{activeTeachers}</p>
          </div>
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-mono-math text-[#5E687E] uppercase tracking-wider">Паралелі (Класи)</span>
            <p className="font-display font-black text-3xl text-[#1E56FF]">{totalGrades}</p>
          </div>
        </div>

        {/* Основні картки керування матеріалами та підписками */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Керування матеріалами */}
          <Link
            href="/admin/materials"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-8 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-xl text-[#0D1117]">
                  Матеріали уроків та каталог
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Додавання нових презентацій, ігор, самостійних та контрольних робіт, редагування і видалення розробок.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#1E56FF]">
              <span>Перейти до матеріалів</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Керування підписками */}
          <Link
            href="/admin/subscriptions"
            className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 sm:p-8 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#00BA7C] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-xl text-[#0D1117]">
                  Повне керування підписками
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Перехід до спеціальної форми видачі доступу за поштою, генерації паролів після оплати на карту.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#00BA7C]">
              <span>Відкрити форму видачі доступу</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* НОВИЙ ДОДАНИЙ БЛОК: Керування викладачами та заявками прямо на головній адмінці */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Колонка 1: Список активних викладачів */}
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F4FA] pb-4">
              <div>
                <h3 className="font-display font-black text-lg text-[#0D1117]">
                  Активні викладачі ({activeSubscriptions.length})
                </h3>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Користувачі з діючими тарифами Pro
                </p>
              </div>
              <Link
                href="/admin/subscriptions"
                className="font-display font-bold text-xs text-[#1E56FF] hover:underline"
              >
                + Додати нового
              </Link>
            </div>

            {activeSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {activeSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="p-3.5 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] flex items-center justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <p className="font-mono text-xs font-bold text-[#0D1117] truncate">
                        {sub.email || `ID: ${sub.user_id}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#1E56FF] font-mono-math font-bold text-[10px]">
                          {sub.tier === 'pro_all' ? 'Pro — Весь каталог' : `Pro — Клас (${sub.grades?.name || 'Н/Д'})`}
                        </span>
                        <span className="text-[10px] text-[#5E687E]">
                          До: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('uk-UA') : 'Безстроково'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5E687E] py-8 text-center italic">
                Активних викладачів у системі поки немає.
              </p>
            )}
          </div>

          {/* Колонка 2: Заявки з модального вікна оплати */}
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F4FA] pb-4">
              <div>
                <h3 className="font-display font-black text-lg text-[#0D1117]">
                  Останні заявки з сайту ({recentRequests.length})
                </h3>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Оплати на карту, що очікують підтвердження
                </p>
              </div>
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
                      <span className="text-[11px] font-bold text-[#00BA7C]">{req.tier}</span>
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
    </div>
  );
}