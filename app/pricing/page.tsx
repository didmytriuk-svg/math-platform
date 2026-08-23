'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Gamepad2, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Send
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const supabase = createClient();

  // Стан модального вікна заявки на оплату
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedGradeId, setSelectedGradeId] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Безкоштовний',
      badge: 'Пробний доступ',
      price: '0 грн',
      period: 'назавжди',
      description: 'Для знайомства з платформою та тестування матеріалів на уроці.',
      features: [
        'Повний доступ до 1 обраного блоку/теми',
        'Всі презентації та ігри першого блоку',
        'Онлайн-перегляд тем та описів усього каталогу',
        'Базові конспекти та плани занять',
      ],
      cta: 'Вільний каталог',
      href: '/catalog',
      isPrimary: false,
    },
    {
      id: 'single_grade',
      name: 'Pro — один клас',
      badge: 'Для однієї паралелі',
      price: '290 грн',
      period: 'на 1 рік (~24 грн/міс)',
      description: 'Повний методичний комплект матеріалів для обраного вами класу.',
      features: [
        'Повний доступ до всіх тем обраного класу (5–11)',
        'Усі презентації PPTX + конспекти DOCX',
        'Усі інтерактивні HTML5-ігри обраного класу',
        'Контрольні та самостійні роботи у 2–4 варіантах',
        'Готові розвʼязки та критерії оцінювання',
      ],
      cta: 'Оформити доступ (290 грн)',
      isPrimary: false,
    },
    {
      id: 'all_access',
      name: 'Pro — весь каталог',
      badge: 'Вибір 90% викладачів',
      price: '890 грн',
      period: 'на 1 рік (~74 грн/міс)',
      description: 'Повний безліміт до всіх 5–11 класів, включно з усіма новими оновленнями.',
      features: [
        'Безлімітний доступ до всіх класів (5, 6, 7, 8, 9, 10, 11)',
        'Усі інтерактивні HTML5-ігри (на весь екран, без реклами)',
        'Завантаження редагованих вихідних файлів (PPTX, DOCX)',
        'Повні пакети контрольних та самостійних з відповідями',
        'Усі нові матеріали, які додаються протягом року',
        'Пріоритетна підтримка методиста',
      ],
      cta: 'Оформити All-Access (890 грн)',
      isPrimary: true,
    },
    {
      id: 'school',
      name: 'School (B2B)',
      badge: 'Для закладів освіти',
      price: '3 900 грн',
      period: 'на 1 рік за всю школу',
      description: 'Корпоративна ліцензія для всіх учителів математики навчального закладу.',
      features: [
        'Необмежена кількість вчителів математики школи',
        'Офіційний договір та рахунок для юросіб/казначейства',
        'Повний безлімітний доступ до всіх 5–11 класів',
        'Брендування матеріалів під заклад (за запитом)',
        'Персональний методичний супровід',
      ],
      cta: 'Рахунок для школи',
      isPrimary: false,
    },
  ];

  const handleOpenCheckout = (plan: any) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setIsSuccess(false);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSendPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('access_requests').insert({
        email: email.trim(),
        full_name: fullName.trim(),
        phone_or_telegram: contactInfo.trim() || null,
        subscription_tier: selectedPlan.id,
        grade_id: selectedPlan.id === 'single_grade' ? selectedGradeId || null : null,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося надіслати заявку. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Пряма активація доступу
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Обирайте рівень доступу до матеріалів
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed">
            Оплата на картку / IBAN без обов&apos;язкових автоматичних списань. Пароль та доступ надсилаються вам одразу після підтвердження.
          </p>
        </div>

        {/* Тарифні картки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                plan.isPrimary
                  ? 'border-[#1E56FF] shadow-xl ring-2 ring-[#1E56FF]/20 lg:-translate-y-2'
                  : 'border-[#E2E8F4] shadow-xs hover:border-[#1E56FF]/40'
              }`}
            >
              {plan.isPrimary && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E56FF] text-white text-[10px] font-display font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  {!plan.isPrimary && (
                    <span className="text-[10px] font-mono-math font-bold text-[#5E687E] uppercase tracking-wider bg-[#F7F9FD] border border-[#E2E8F4] px-2 py-0.5 rounded-md">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="font-display font-black text-xl text-[#0D1117] mt-2">
                    {plan.name}
                  </h3>
                  <p className="text-[11px] text-[#5E687E] mt-1 leading-relaxed min-h-[34px]">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-3xl text-[#0D1117]">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-math text-[#5E687E]">
                    {plan.period}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#F1F4FA] space-y-2.5">
                  <p className="text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
                    Що входить:
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#0D1117] leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#1E56FF] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                {plan.id === 'free' ? (
                  <Link
                    href="/catalog"
                    className="w-full py-3 px-4 rounded-xl font-display font-bold text-xs text-center block transition-all bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF]"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs text-center block transition-all cursor-pointer ${
                      plan.isPrimary
                        ? 'bg-[#1E56FF] text-white hover:bg-[#0D33B3] shadow-md hover:shadow-lg'
                        : 'bg-white border-2 border-[#1E56FF] text-[#1E56FF] hover:bg-[#1E56FF] hover:text-white shadow-2xs'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* МОДАЛЬНЕ ВІКНО ОПЛАТИ ТА ВІДПРАВКИ ЗАЯВКИ */}
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1117]/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-[#5E687E] hover:text-[#0D1117] hover:bg-[#F7F9FD] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-mono-math font-bold text-[#1E56FF] uppercase tracking-wider bg-[#EFF4FF] px-2.5 py-1 rounded-md">
                  Оформлення тарифу
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-[#0D1117] mt-2">
                  {selectedPlan.name} ({selectedPlan.price})
                </h3>
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
                      Після перевірки зарахування оплати ми згенеруємо ваш особистий доступ і надішлемо логін та пароль на пошту <strong>{email}</strong>.
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
                  {/* Блок із реквізитами для переказу */}
                  <div className="p-4 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-display font-bold text-[#0D1117]">
                      <CreditCard className="w-4 h-4 text-[#1E56FF]" />
                      Реквізити для оплати:
                    </div>
                    <div className="text-xs font-mono-math text-[#5E687E] space-y-1">
                      <p>Картка / Монобанка: <strong className="text-[#0D1117]">4441 •••• •••• 1234</strong></p>
                      <p>Отримувач: <strong className="text-[#0D1117]">Діана Дмитрюк</strong></p>
                      <p>Сума до сплати: <strong className="text-[#1E56FF] font-bold">{selectedPlan.price}</strong></p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Форма сповіщення про оплату */}
                  <form onSubmit={handleSendPaymentRequest} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                        Ваше ім&apos;я та прізвище *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Оксана Коваленко"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                        Ваш Email (на нього відкриється доступ) *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@school.edu.ua"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                        Телефон або Telegram (для швидкого зв&apos;язку)
                      </label>
                      <input
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="@username або +380..."
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Відправка...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Я оплатив(ла), підтвердити заявку
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}