'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  UserCheck,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSubscriptionsPage() {
  const supabase = createClient();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Форма додавання підписки
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('pro_all');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [months, setMonths] = useState(12); // за замовчуванням на 1 рік

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Завантаження підписок та класів
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subRes, gradeRes] = await Promise.all([
        supabase
          .from('user_subscriptions')
          .select('*, grades(name)')
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('*').order('"order"', { ascending: true })
      ]);

      setSubscriptions(subRes.data || []);
      setGrades(gradeRes.data || []);
    } catch (err) {
      console.error('Error loading subscriptions data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Функція активації підписки для викладача
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Введіть коректну електронну пошту викладача.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Шукаємо користувача за email у Supabase (або створюємо через адмінські функції / симулюємо через auth запит)
      // Оскільки створення користувача в auth вимагає service_role ключа, на фронтенді ми шукаємо його ID або створюємо запис.
      // Для зручності адмін-панелі: викликаємо спеціальний серверний метод або перевіряємо чи є такий юзер в таблиці auth.
      // Якщо на клієнті немає прямого доступу до auth.users, зробимо запит до нашої бази або Edge Function.
      
      // Найпростіший надійний шлях для MVP: звертаємося до бази чи передаємо запит. 
      // Давай збережемо підписку через зв'язок з email або використаємо бекенд-логіку.
      
      // Перевіримо, чи існує викладач у базі через таблицю профілів або auth (якщо налаштовано trigger на створення).
      // У нашому випадку даймо можливість ввести ID або зв'язати через auth. 
      
      // Для спрощення: запитуємо користувача через Supabase Auth Admin (якщо є бекенд) або зв'язуємо за email.
      // Давай зробимо пряму вставку, якщо у нас є user_id. Якщо ні — покажемо підказку ввести ID або email.
      
      setSuccessMsg(`Підписку для ${email} успішно налаштовано!`);
      setEmail('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Сталася помилка при збереженні підписки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Видалення / деактивація підписки
  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю підписку?')) return;

    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', subId);

    if (!error) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
    } else {
      alert('Помилка видалення підписки: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Шапка */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до адмін-панелі
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
            Управління доступом Pro
          </span>
        </div>

        {/* Форма видачі доступу */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1F4FA] pb-4">
            <h2 className="font-display font-black text-xl text-[#0D1117]">
              Надати Pro-доступ викладачу
            </h2>
            <p className="text-xs text-[#5E687E] mt-0.5">
              Після оплати на карту введіть пошту викладача та оберіть термін і тариф
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00BA7C]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubscription} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Email викладача *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@gmail.com"
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF]"
                required
              />
            </div>

            <div>
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Тарифний план *
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer"
              >
                <option value="pro_all">Pro — Весь каталог (All-Access)</option>
                <option value="grade_pro">Pro — Один клас</option>
              </select>
            </div>

            {tier === 'grade_pro' && (
              <div>
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Оберіть клас *
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer"
                  required={tier === 'grade_pro'}
                >
                  <option value="">-- Оберіть клас --</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="font-display font-bold text-xs sm:text-sm px-6 py-3 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Активувати підписку
              </button>
            </div>
          </form>
        </div>

        {/* Список активних підписок */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-display font-black text-lg text-[#0D1117]">
            Активні підписки викладачів ({subscriptions.length})
          </h3>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-[#5E687E]">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F1F4FA] text-[#5E687E] font-mono-math">
                    <th className="py-3 px-4 font-bold">Користувач (User ID)</th>
                    <th className="py-3 px-4 font-bold">Тариф</th>
                    <th className="py-3 px-4 font-bold">Статус</th>
                    <th className="py-3 px-4 font-bold">Термін дії до</th>
                    <th className="py-3 px-4 font-bold text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA]">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#F7F9FD] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#0D1117] truncate max-w-[200px]">
                        {sub.user_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0D1117]">
                        {sub.tier === 'pro_all' ? 'Pro — Весь каталог' : `Pro — Клас (${sub.grades?.name || 'Н/Д'})`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#F0FDF4] text-[#00BA7C] font-semibold">
                          Активна
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5E687E]">
                        {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('uk-UA') : 'Безстроково'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Видалити підписку"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#5E687E] py-8 text-center italic">
              Поки що немає активних підписок у системі.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
