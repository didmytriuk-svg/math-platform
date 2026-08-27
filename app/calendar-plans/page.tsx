'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Lock,
  Eye,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CalendarPlansPage() {
  const supabase = createClient();

  const [plans, setPlans] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Стан для модального вікна покупки за 50 грн
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Стан для модального вікна ПРЕВ'Ю
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<any>(null);

  // Перевірка чи є у користувача доступ до КТП
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [plansRes, gradesRes] = await Promise.all([
          supabase
            .from('calendar_plans')
            .select('*, grades(id, name, order)')
            .eq('is_published', true)
            .order('created_at', { ascending: false }),
          supabase.from('grades').select('*').order('order', { ascending: true })
        ]);

        setPlans(plansRes.data || []);
        setGrades(gradesRes.data || []);

        if (typeof window !== 'undefined') {
          const userEmail = localStorage.getItem('volya_user_email');
          if (userEmail) {
            const cleanEmail = userEmail.trim().toLowerCase();
            if (cleanEmail === 'didmytriuk@gmail.com' || cleanEmail === 'dasha.hfun@gmail.com') {
              setHasAccess(true);
            } else {
              const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('*')
                .ilike('email', cleanEmail)
                .maybeSingle();

              if (sub && (sub.tier === 'pro_all' || sub.tier === 'calendar_plans')) {
                setHasAccess(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading calendar plans:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const filteredPlans = plans.filter((p) => {
    if (selectedGradeId === 'all') return true;
    return p.grade_id === selectedGradeId;
  });

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('subscription_requests').insert({
        email: email.trim(),
        full_name: fullName.trim(),
        contact: contact.trim() || null,
        tier: `Окрема покупка КТП: ${selectedPlanTitle}`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося надіслати заявку. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreview = (plan: any) => {
    setPreviewPlan(plan);
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Календарно-тематичне планування (КТП)
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Готові календарні плани на навчальний рік
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed">
            Перегляньте план із водяними знаками прямо на платформі, переконайтесь у якості та придбайте повну версію за 50 грн.
          </p>
        </div>

        {/* Фільтр по класах */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedGradeId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
              selectedGradeId === 'all'
                ? 'bg-[#1E56FF] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F4] text-[#0D1117] hover:bg-[#F7F9FD]'
            }`}
          >
            Усі класи
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGradeId(g.id)}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                selectedGradeId === g.id
                  ? 'bg-[#1E56FF] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F4] text-[#0D1117] hover:bg-[#F7F9FD]'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Список планів */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-[#5E687E]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E56FF]" />
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-white border border-[#E2E8F4] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1E56FF] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#EFF4FF] text-[#1E56FF] font-display font-black text-xs">
                      {plan.grades?.name || 'Клас'}
                    </span>
                    <span className="text-[10px] font-mono text-[#5E687E]">
                      Word (.docx)
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-[#0D1117] leading-snug">
                    {plan.title}
                  </h3>

                  {plan.description && (
                    <p className="text-xs text-[#5E687E] leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#F1F4FA] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5E687E]">
                      {hasAccess ? 'Доступ відкрито' : 'Ціна: 50 грн'}
                    </span>

                    {/* Кнопка попереднього перегляду */}
                    <button
                      type="button"
                      onClick={() => openPreview(plan)}
                      className="px-3 py-2 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] font-display font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1E56FF]" />
                      Переглянути
                    </button>
                  </div>

                  {hasAccess ? (
                    <a
                      href={plan.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#00BA7C] text-white hover:bg-[#059669] font-display font-bold text-xs text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Завантажити повну версію
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setSelectedPlanTitle(plan.title); setIsSuccess(false); setIsModalOpen(true); }}
                      className="w-full py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] font-display font-bold text-xs text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Завантажити / Купити за 50 грн
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-12 text-center space-y-3 max-w-md mx-auto">
            <p className="font-display font-bold text-sm text-[#0D1117]">
              Для цього класу поки немає завантажених планів.
            </p>
            <p className="text-xs text-[#5E687E]">
              Спробуйте обрати інший клас або завітайте пізніше.
            </p>
          </div>
        )}

      </div>

      {/* МОДАЛЬНЕ ВІКНО ПРЕВ'Ю */}
      {isPreviewOpen && previewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D1117]/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white border border-[#E2E8F4] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F4FA] bg-[#F7F9FD] shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E56FF]">
                  Демо-перегляд матеріалу (Тільки для читання)
                </span>
                <h3 className="font-display font-black text-base sm:text-lg text-[#0D1117]">
                  {previewPlan.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-xl text-[#5E687E] hover:text-[#0D1117] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative grow bg-[#F1F4FA] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-around opacity-15 rotate-[-15deg] select-none z-20 overflow-hidden p-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="text-xl sm:text-2xl font-black text-[#0D1117] uppercase tracking-widest p-8">
                    VOLYA.ACADEMY • DEMO PREVIEW
                  </span>
                ))}
              </div>

              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewPlan.file_url)}`}
                className="w-full h-full border-0 relative z-10 bg-white"
                title="Document Preview"
              />

              <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#f3f3f3] z-15 pointer-events-none" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#F1F4FA] bg-white shrink-0">
              <div className="text-xs text-[#5E687E]">
                Подобається матеріал? Отримайте повний чистий файл без водяних знаків за 50 грн.
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  setSelectedPlanTitle(previewPlan.title);
                  setIsSuccess(false);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] font-display font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                Купити повну версію за 50 грн
              </button>
            </div>

          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО ПОКУПКИ ПЛАНУ ЗА 50 ГРН */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1117]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-[#5E687E] hover:text-[#0D1117] hover:bg-[#F7F9FD] transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-mono-math font-bold text-[#1E56FF] uppercase tracking-wider bg-[#EFF4FF] px-2.5 py-1 rounded-md">
                Покупка матеріалу
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#0D1117] mt-2">
                {selectedPlanTitle}
              </h3>
              <p className="text-xs text-[#5E687E] mt-1">
                Вартість доступу до цього плану: <strong className="text-[#1E56FF]">50 грн</strong>
              </p>
            </div>

            {isSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#00BA7C] flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-lg text-[#0D1117]">
                    Заявку успішно надіслано!
                  </h4>
                  <p className="text-xs text-[#5E687E] max-w-sm mx-auto leading-relaxed">
                    Оплата може проходити від 1 до 3 днів. Файл буде надіслано на вашу електронну пошту <strong>{email}</strong> відразу після зарахування коштів. У разі питань звертайтеся за номером <strong>+380 99 043 0875</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-display font-bold text-xs px-6 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all cursor-pointer"
                >
                  Зрозуміло
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-3">
                  <p className="text-xs font-display font-bold text-[#0D1117]">💳 Карта для оплати (рахунок ФОП):</p>
                  <div className="text-xs font-mono text-[#5E687E] space-y-1">
                    <p>Рахунок: <strong className="text-[#0D1117]">5169 3351 0813 8435</strong></p>
                    <p>Отримувач: <strong className="text-[#0D1117]">Дмитрюк Анна Іванівна</strong></p>
                    <p>Сума до сплати: <strong className="text-[#1E56FF] font-bold">50 грн</strong></p>
                  </div>
                  <div className="text-[11px] text-[#5E687E] pt-2 border-t border-[#E2E8F4] space-y-1 leading-relaxed">
                    <p>ℹ️ Оплата може проходити від 1 до 3 днів. Файл буде надіслано відразу після зарахування коштів.</p>
                    <p>📩 У разі якщо файл не надійшов, звертайтеся в підтримку за номером: <strong className="text-[#0D1117]">+380 99 043 0875</strong>.</p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSendRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                      Ваше ім&apos;я та прізвище *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Оксана Коваленко"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                      Ваш Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.edu.ua"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                      Телефон або Telegram
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="@username або +380..."
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all disabled:opacity-50 shadow-xs cursor-pointer mt-4"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Я оплатив(ла), підтвердити замовлення'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}