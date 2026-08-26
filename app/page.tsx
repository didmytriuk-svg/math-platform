import Link from 'next/link';
import { 
  FileText, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Отримуємо статистику та останні заявки з бази даних
  const [materialsRes, subsRes, gradesRes, requestsRes] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('grades').select('id', { count: 'exact', head: true }),
    supabase.from('subscription_requests').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  const totalMaterials = materialsRes.count || 0;
  const activeTeachers = subsRes.count || 0;
  const totalGrades = gradesRes.count || 7;
  const recentRequests = requestsRes.data || [];

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

        {/* Основні картки керування */}
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
                  Додавання нових презентацій, інтерактивних ігор, самостійних та контрольних робіт, редагування і видалення розробок.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#1E56FF]">
              <span>Перейти до матеріалів</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Керування підписками та викладачами */}
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
                  Викладачі та доступи (Pro)
                </h2>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  Генерація паролів після оплати на карту, видача та управління річними підписками викладачів, перегляд активних користувачів.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#00BA7C]">
              <span>Керувати підписками</span>
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
                Оплати на карту, що очікують підтвердження
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
  );
}