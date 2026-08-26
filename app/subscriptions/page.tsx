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
  Copy,
  Check
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSubscriptionsPage() {
  const supabase = createClient();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Форма видачі доступу
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('pro_all');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdDetails, setCreatedDetails] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Отримуємо підписки та класи
      const [subRes, gradeRes] = await Promise.all([
        supabase
          .from('user_subscriptions')
          .select('*, grades(name)')
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('*').order('number', { ascending: true })
      ]);

      setSubscriptions(subRes.data || []);
      setGrades(gradeRes.data || [] );
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Створення підписки та генерація доступу
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCreatedDetails(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Введіть коректну електронну пошту викладача.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Генеруємо випадковий безпечний пароль для викладача
      const generatedPassword = 'math' + Math.random().toString(36.slice(-6)) + '-v7';
      const expiresDate = new Date();
      expiresDate.setFullYear(expiresDate.getFullYear() + 1); // +1 рік

      // 2. Реєструємо викладача в Supabase Auth (або знаходимо існуючого)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: generatedPassword,
      });

      let userId = authData?.user?.id;

      // Якщо користувач вже існує в системі, спробуємо знайти його або оновити підписку
      if (authError && authError.message.includes('already registered')) {
        // Якщо вже зареєстрований, шукаємо його через таблицю або даємо можливість прив'язати
        setErrorMsg('Ця пошта вже зареєстрована. Видалиіть стару підписку або оновіть її.');
        setIsSubmitting(false);
        return;
      }

      if (!userId) {
        throw new Error(authError?.message || 'Не вдалося створити обліковий запис.');
      }

      // 3. Зберігаємо підписку в таблиці user_subscriptions
      const { error: subError } = await supabase.from('user_subscriptions').insert({
        user_id: userId,
        tier: tier,
        grade_id: tier === 'grade_pro' ? selectedGradeId : null,
        is_active: true,
        expires_at: expiresDate.toISOString(),
      });

      if (subError) throw subError;

      // Зберігаємо деталі для виведення адміну
      setCreatedDetails({
        email: email.trim(),
        password: generatedPassword,
        tierName: tier === 'pro_all' ? 'Pro — весь каталог (5–11 класи)' : 'Pro — один клас',
        expiresAt: expiresDate.toLocaleDateString('uk-UA'),
      });

      setEmail('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Сталася помилка при збереженні підписки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Видалення підписки
  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Ви впевнені, що хочете забрати доступ у цього викладача?')) return;

    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', subId);

    if (!error) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
    } else {
      alert('Помилка видалення: ' + error.message);
    }
  };

  // Копіювання повідомлення для клієнта
  const handleCopyMessage = () => {
    if (!createdDetails) return;
    const text = `Вітаємо! Ваш доступ до платформи Volya Academy активовано.\n\n🌐 Сайт: ${window.location.origin}/login\n📧 Логін (Email): ${createdDetails.email}\n🔑 Пароль: ${createdDetails.password}\n⭐ Тариф: ${createdDetails.tierName}\n📅 Діє до: ${createdDetails.expiresAt}\n\nПриємного користування матеріалами на уроках!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Навігація */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ліва колонка: Форма та результат */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#F1F4FA] pb-4">
                <h2 className="font-display font-black text-xl text-[#0D1117]">
                  Видати або оновити доступ
                </h2>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Після підтвердження оплати введіть пошту викладача
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {createdDetails && (
                <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-4">
                  <div className="flex items-center gap-2 text-[#00BA7C] font-display font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Доступ успішно створено!
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E2E8F4] text-xs space-y-1.5 font-mono text-[#0D1117]">
                    <p>🌐 <strong>Сайт:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/login</p>
                    <p>📧 <strong>Логін:</strong> {createdDetails.email}</p>
                    <p>🔑 <strong>Пароль:</strong> {createdDetails.password}</p>
                    <p>⭐ <strong>Тариф:</strong> {createdDetails.tierName}</p>
                    <p>📅 <strong>Діє до:</strong> {createdDetails.expiresAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full font-display font-bold text-xs py-2.5 rounded-xl bg-[#00BA7C] text-white hover:bg-emerald-600 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Скопійовано!' : 'Скопіювати повідомлення для клієнта'}
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-display font-bold text-xs sm:text-sm py-3.5 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Створити доступ та згенерувати пароль
                </button>
              </form>
            </div>
          </div>

          {/* Права колонка: Список викладачів */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#F1F4FA] pb-4">
                <h3 className="font-display font-black text-xl text-[#0D1117]">
                  Список активних викладачів ({subscriptions.length})
                </h3>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Користувачі, які мають активний доступ до матеріалів
                </p>
              </div>

              {isLoading ? (
                <div className="py-12 flex items-center justify-center text-[#5E687E]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] flex items-center justify-between gap-4">
                      <div className="space-y-1 overflow-hidden">
                        <p className="font-mono text-xs font-bold text-[#0D1117] truncate">
                          ID: {sub.user_id}
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

                      <button
                        type="button"
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Видалити підписку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5E687E] py-12 text-center italic">
                  Викладачів поки що немає.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}