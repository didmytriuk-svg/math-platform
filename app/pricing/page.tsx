'use client';

import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  Building2, 
  User, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Download,
  Gamepad2,
  FileText
} from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      id: 'free',
      name: 'Безкоштовний',
      badge: 'Пробний доступ',
      price: '0 грн',
      period: 'назавжди',
      description: 'Для знайомства з платформою та тестування матеріалів на уроці.',
      target: 'Для всіх вчителів',
      features: [
        'Повний доступ до 1 обраного блоку/теми',
        'Всі презентації та ігри першого блоку',
        'Онлайн-перегляд тем та описів усього каталогу',
        'Базові конспекти та плани занять',
      ],
      limitations: [
        'Завантаження файлів інших блоків закрите',
        'Контрольні з відповідями інших тем закриті',
      ],
      cta: 'Спробувати безкоштовно',
      href: '/catalog',
      isPopular: false,
      buttonClass: 'bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF]',
    },
    {
      id: 'single-grade',
      name: 'Pro — один клас',
      badge: 'Для однієї паралелі',
      price: '290 грн',
      period: 'на 1 рік (~24 грн/міс)',
      description: 'Повний методичний комплект матеріалів для обраного вами класу.',
      target: 'Вчитель однієї паралелі',
      features: [
        'Повний доступ до всіх тем обраного класу (5–11)',
        'Усі презентації PPTX + конспекти DOCX',
        'Усі інтерактивні HTML5-ігри обраного класу',
        'Контрольні та самостійні роботи у 2–4 варіантах',
        'Готові розвʼязки та критерії оцінювання',
      ],
      limitations: [],
      cta: 'Обрати клас (290 грн/рік)',
      href: '#checkout-single',
      isPopular: false,
      buttonClass: 'bg-white border-2 border-[#1E56FF] text-[#1E56FF] hover:bg-[#1E56FF] hover:text-white shadow-2xs',
    },
    {
      id: 'all-access',
      name: 'Pro — весь каталог',
      badge: 'Вибір 90% викладачів',
      price: '890 грн',
      period: 'на 1 рік (~74 грн/міс)',
      description: 'Повний безліміт до всіх 5–11 класів, включно з усіма новими оновленнями.',
      target: 'Вчителі з кількома класами та репетитори',
      features: [
        'Безлімітний доступ до всіх класів (5, 6, 7, 8, 9, 10, 11)',
        'Усі інтерактивні HTML5-ігри (на весь екран, без реклами)',
        'Завантаження редагованих вихідних файлів (PPTX, DOCX)',
        'Повні пакети контрольних та самостійних з відповідями',
        'Усі нові матеріали, які додаються протягом року',
        'Пріоритетна підтримка методиста',
      ],
      limitations: [],
      cta: 'Отримати повний доступ',
      href: '#checkout-all',
      isPopular: true,
      buttonClass: 'bg-[#1E56FF] text-white hover:bg-[#0D33B3] shadow-md hover:shadow-lg',
    },
    {
      id: 'school',
      name: 'School (B2B)',
      badge: 'Для закладів освіти',
      price: '3 900 грн',
      period: 'на 1 рік за всю школу',
      description: 'Корпоративна ліцензія для всіх учителів математики навчального закладу.',
      target: 'Школи, ліцеї та освітні центри',
      features: [
        'Необмежена кількість вчителів математики школи',
        'Офіційний договір та рахунок для юросіб/казначейства',
        'Повний безлімітний доступ до всіх 5–11 класів',
        'Брендування матеріалів під заклад (за запитом)',
        'Персональний методичний супровід',
      ],
      limitations: [],
      cta: 'Оформити рахунок для школи',
      href: '#contact-school',
      isPopular: false,
      buttonClass: 'bg-[#0D1117] text-white hover:bg-[#1E56FF] shadow-xs',
    },
  ];

  return (
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Прозорі тарифи без прихованих автосписань
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Обирайте рівень доступу до матеріалів
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed">
            Почніть із безкоштовного ознайомчого блоку або отримайте повний комплект для одного класу чи всієї паралелі 5–11 класів.
          </p>
        </div>

        {/* Тарифна сітка 4 планів */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                plan.isPopular
                  ? 'border-[#1E56FF] shadow-xl ring-2 ring-[#1E56FF]/20 lg:-translate-y-2'
                  : 'border-[#E2E8F4] shadow-xs hover:border-[#1E56FF]/40'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E56FF] text-white text-[10px] font-display font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  {!plan.isPopular && (
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
                    {plan.limitations.map((lim, idx) => (
                      <li key={`lim-${idx}`} className="flex items-start gap-2 text-xs text-[#94A3B8] leading-tight line-through">
                        <span className="w-3.5 h-3.5 text-[#94A3B8] text-center font-mono-math shrink-0">✕</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={plan.href}
                  className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs text-center block transition-all ${plan.buttonClass}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Блок порівняння та довіри */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
              Методичний стандарт платформи
            </h3>
            <p className="text-xs text-[#5E687E] mt-1">
              Усі матеріали розроблені відповідно до чинних модельних програм МОН України
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#F1F4FA]">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0D1117]">
                  HTML5-ігри без обмежень
                </h4>
                <p className="text-xs text-[#5E687E] mt-1 leading-relaxed">
                  Інтерактивні тренажери запускаються на весь екран прямо на уроці без сторонньої реклами.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0D1117]">
                  Редаговані файли
                </h4>
                <p className="text-xs text-[#5E687E] mt-1 leading-relaxed">
                  Завантажуйте готові слайди PowerPoint (PPTX) та документи Word (DOCX) для власного редагування.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0D1117]">
                  Контрольні з відповідями
                </h4>
                <p className="text-xs text-[#5E687E] mt-1 leading-relaxed">
                  Готові варіанти з критеріями оцінювання, які заощаджують години на перевірку зошитів.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}