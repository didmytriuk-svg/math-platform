'use client';

import Link from 'next/link';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Базовий (Free)',
      price: '0',
      period: 'назавжди',
      description: 'Для швидкого ознайомлення та базових уроків',
      features: [
        'Доступ до каталогу 5–11 класів',
        'Текстові конспекти та методичні плани',
        'Перегляд базових PDF-матеріалів',
        'Демо-версії інтерактивних ігор',
      ],
      cta: 'Перейти в каталог',
      href: '/catalog',
      isPopular: false,
      buttonStyle: 'bg-white border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF]',
    },
    {
      name: 'PRO Викладач',
      price: '199',
      period: 'грн / місяць',
      description: 'Для репетиторів та вчителів, які цінують свій час',
      features: [
        'Повний запуск усіх HTML5-ігор та тренажерів',
        'Нативний повноекранний режим для уроків',
        'Завантаження редагованих файлів (PPTX, DOCX)',
        'Відповіді та критерії оцінювання до контрольних',
        'Швидке копіювання готових планів уроків',
        'Пріоритетна підтримка у Viber/Telegram',
      ],
      cta: 'Оформити PRO доступ',
      href: '#checkout',
      isPopular: true,
      buttonStyle: 'bg-[#1E56FF] text-white hover:bg-[#0D33B3] shadow-md',
    },
    {
      name: 'Навчальний рік',
      price: '1 290',
      period: 'грн / 9 місяців (~143 грн/міс)',
      description: 'Максимальна вигода на весь навчальний період',
      features: [
        'Усі можливості тарифу PRO',
        'Економія понад 30% вартості',
        'Доступ до всіх оновлень та нових тем 2026/2027',
        'Готові роздаткові картки для друку в 1 клік',
        'Сертифікат активного користувача платформи',
      ],
      cta: 'Отримати річний PRO',
      href: '#checkout',
      isPopular: false,
      buttonStyle: 'bg-[#0D1117] text-white hover:bg-[#1E56FF] shadow-md',
    },
  ];

  return (
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono-math font-bold">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Інвестиція, яка окупається за 1 урок репетитора
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Обирайте тариф для комфортного викладання
          </h1>
          <p className="text-sm sm:text-base text-[#5E687E] leading-relaxed">
            Готуйтеся до занять за 5 хвилин. Інтерактивні ігри, готові презентації та контрольні роботи з відповідями без зайвого клопоту.
          </p>
        </div>

        {/* Картки тарифів */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'border-[#1E56FF] shadow-lg ring-2 ring-[#1E56FF]/20 md:-translate-y-2'
                  : 'border-[#E2E8F4] shadow-xs hover:border-[#1E56FF]/50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1E56FF] text-white text-[11px] font-display font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Найпопулярніший вибір
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D1117]">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#5E687E] mt-1.5 min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-4xl text-[#0D1117]">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono-math text-[#5E687E]">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F1F4FA] space-y-3">
                  <p className="text-[11px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
                    Що входить у доступ:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0D1117]">
                        <Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.href}
                  className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm text-center block transition-all ${plan.buttonStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Блок довіри / FAQ */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#0D1117]">
                Гарантія якості розробок
              </h3>
              <p className="text-xs text-[#5E687E]">
                Усі матеріали відповідають чинним програмам МОН України та перевірені на практиці
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F1F4FA] text-xs text-[#5E687E] leading-relaxed">
            <div>
              <strong className="text-[#0D1117] block mb-1">Як активується доступ?</strong>
              Миттєво після оплати карткою через MonoPay або Apple Pay. Матеріали відкриваються автоматично.
            </div>
            <div>
              <strong className="text-[#0D1117] block mb-1">Чи можна скасувати підписку?</strong>
              Так, у будь-який момент в 1 клік без жодних прихованих комісій.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}