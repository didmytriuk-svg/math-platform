'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const supabase = createClient();

  // Стан для модального вікна покупки тарифу
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTierTitle, setSelectedTierTitle] = useState('');
  const [tierCode, setTierCode] = useState('');
  const [tierPrice, setTierPrice] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openModal = (title: string, code: string, price: string) => {
    setSelectedTierTitle(title);
    setTierCode(code);
    setTierPrice(price);
    setIsSuccess(false);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('subscription_requests').insert({
        email: email.trim(),
        full_name: fullName.trim(),
        contact: contact.trim() || null,
        tier: tierCode,
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
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Верхня навігація */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На головну сайту
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3.5 py-1.5 rounded-xl">
            Тарифи Volya Academy
          </span>
        </div>

        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Офіційні тарифи платформи
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Оберіть свій формат доступу до матеріалів
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed">
            Інтерактивні презентації, ігри, контрольні та календарні плани для викладання математики 5–11 класів.
          </p>
        </div>

        {/* Сітка тарифів (4 варіанти) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 1. Безкоштовний */}
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5E687E] bg-[#F7F9FD] px-2.5 py-1 rounded-md border border-[#E2E8F4]">
                  Пробний доступ
                </span>
                <h3 className="font-display font-black text-xl text-[#0D1117]">Безкоштовний</h3>
                <p className="text-xs text-[#5E687E]">Для знайомства з платформою та перегляду структури матеріалів.</p>
              </div>

              <div className="space-y-1">
                <span className="font-display font-black text-3xl text-[#0D1117]">0 грн</span>
                <p className="text-[11px] text-[#5E687E]">назавжди</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1F4FA]">
                <p className="text-[11px] font-bold text-[#5E687E] uppercase tracking-wider">що входить:</p>
                <ul className="space-y-2.5 text-xs text-[#5E687E]">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Повний доступ до 1 обраного демо-блоку</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Онлайн-перегляд інтерактивних матеріалів</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Базові структуровані теми занять</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-[#F1F4FA]">
              <Link
                href="/catalog"
                className="w-full py-3 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] font-display font-bold text-xs text-center inline-block transition-colors"
              >
                Переглянути каталог
              </Link>
            </div>
          </div>

          {/* 2. Pro — один клас (390 грн) */}
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E56FF] bg-[#EFF4FF] px-2.5 py-1 rounded-md border border-[#D5E2FF]">
                  Для однієї паралелі
                </span>
                <h3 className="font-display font-black text-xl text-[#0D1117]">Pro — один клас</h3>
                <p className="text-xs text-[#5E687E]">Повний методичний комплект матеріалів для обраного вами класу (5–11).</p>
              </div>

              <div className="space-y-1">
                <span className="font-display font-black text-3xl text-[#0D1117]">390 грн</span>
                <p className="text-[11px] text-[#5E687E]">на 1 рік (~32 грн/міс)</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1F4FA]">
                <p className="text-[11px] font-bold text-[#5E687E] uppercase tracking-wider">що входить:</p>
                <ul className="space-y-2.5 text-xs text-[#5E687E]">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Повний доступ до всіх тем обраного класу</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Інтерактивні презентації для роботи на платформі або в PDF</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Усі інтерактивні ігри обраного класу</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Контрольні та самостійні роботи з відповідями</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-[#F1F4FA]">
              <button
                type="button"
                onClick={() => openModal('Pro — один клас (390 грн)', 'single_grade', '390 грн')}
                className="w-full py-3 rounded-xl bg-white border border-[#1E56FF] text-[#1E56FF] hover:bg-[#EFF4FF] font-display font-bold text-xs text-center inline-block transition-colors cursor-pointer shadow-xs"
              >
                Оформити доступ (390 грн)
              </button>
            </div>
          </div>

          {/* 3. На період розробки (Ранній доступ) — 500 грн */}
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E56FF] bg-[#EFF4FF] px-2.5 py-1 rounded-md border border-[#D5E2FF]">
                  Спеціальна пропозиція
                </span>
                <h3 className="font-display font-black text-xl text-[#0D1117]">На період розробки</h3>
                <p className="text-xs text-[#5E687E]">Доступ під час активного наповнення платформи з можливістю давати фідбек.</p>
              </div>

              <div className="space-y-1">
                <span className="font-display font-black text-3xl text-[#1E56FF]">500 грн</span>
                <p className="text-[11px] text-[#5E687E]">на 1 рік (ранній доступ)</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1F4FA]">
                <p className="text-[11px] font-bold text-[#5E687E] uppercase tracking-wider">що входить:</p>
                <ul className="space-y-2.5 text-xs text-[#5E687E]">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Повний доступ до всієї платформи, що постійно поповнюється</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Тестування інтерактивних матеріалів у процесі створення</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Прямий зв'язок з авторами та вплив на розробку</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-[#F1F4FA]">
              <button
                type="button"
                onClick={() => openModal('На період розробки (Ранній доступ — 500 грн)', 'early_access', '500 грн')}
                className="w-full py-3 rounded-xl bg-white border border-[#1E56FF] text-[#1E56FF] hover:bg-[#EFF4FF] font-display font-bold text-xs text-center inline-block transition-colors cursor-pointer shadow-xs"
              >
                Отримати ранній доступ (500 грн)
              </button>
            </div>
          </div>

          {/* 4. Pro — весь каталог (Хіт) — 1250 грн */}
          <div className="bg-white border-2 border-[#1E56FF] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1E56FF] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
              Вибір викладачів
            </div>

            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E56FF] bg-[#EFF4FF] px-2.5 py-1 rounded-md border border-[#D5E2FF]">
                  Все включено
                </span>
                <h3 className="font-display font-black text-xl text-[#0D1117]">Pro — весь каталог</h3>
                <p className="text-xs text-[#5E687E]">Повний безлімітний річний доступ до всіх інтерактивних матеріалів, презентацій та КТП для 5–11 класів.</p>
              </div>

              <div className="space-y-1">
                <span className="font-display font-black text-3xl text-[#1E56FF]">1 250 грн</span>
                <p className="text-[11px] text-[#5E687E]">на 1 рік (повний безліміт)</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1F4FA]">
                <p className="text-[11px] font-bold text-[#5E687E] uppercase tracking-wider">що входить:</p>
                <ul className="space-y-2.5 text-xs text-[#5E687E]">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Безлімітний доступ до всіх класів (5–11) та предметів</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Усі інтерактивні презентації для роботи на платформі або в PDF</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Повні пакети контрольних і самостійних робіт</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" /> Доступ до всіх річних календарно-тематичних планів (КТП)</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-[#F1F4FA]">
              <button
                type="button"
                onClick={() => openModal('Pro — весь каталог (1 250 грн)', 'pro_all', '1 250 грн')}
                className="w-full py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] font-display font-bold text-xs text-center inline-block transition-colors cursor-pointer shadow-md"
              >
                Оформити All-Access (1 250 грн)
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* МОДАЛЬНЕ ВІКНО ОФОРМЛЕННЯ ТАРИФУ */}
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
                Оформлення підписки
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#0D1117] mt-2">
                {selectedTierTitle}
              </h3>
              <p className="text-xs text-[#5E687E] mt-1">
                Вартість підписки: <strong className="text-[#1E56FF]">{tierPrice}</strong>
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
                    Оплата може проходити від 1 до 3 днів. Доступ буде надано відразу після зарахування коштів на вашу електронну пошту <strong>{email}</strong>. У разі питань звертайтеся за номером <strong>+380 99 043 0875</strong>.
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
                    <p>Сума до сплати: <strong className="text-[#1E56FF] font-bold">{tierPrice}</strong></p>
                  </div>
                  <div className="text-[11px] text-[#5E687E] pt-2 border-t border-[#E2E8F4] space-y-1 leading-relaxed">
                    <p>ℹ️ Оплата може проходити від 1 до 3 днів. Доступ буде надано відразу після зарахування коштів.</p>
                    <p>📩 У разі якщо доступ не з'явився, звертайтеся в підтримку за номером: <strong className="text-[#0D1117]">+380 99 043 0875</strong>.</p>
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