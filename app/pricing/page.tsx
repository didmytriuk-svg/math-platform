'use client';

import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Gamepad2, 
  FileText, 
  Zap, 
  Users, 
  CheckCircle2 
} from 'lucide-react';

export default function PricingPage() {
  const freeFeatures = [
    'Вільний перегляд каталогу 5–11 класів',
    'Повний доступ до перших вступних блоків уроків',
    'Базові конспекти та плани занять',
    'Демо-версії інтерактивних тренажерів',
    'Перегляд матеріалів онлайн',
  ];

  const yearlyFeatures = [
    'Безлімітний доступ до всіх матеріалів 5–11 класів на весь навчальний рік',
    'Усі інтерактивні HTML5-ігри (на весь екран, без реклами та обмежень)',
    'Завантаження редагованих вихідних файлів (PowerPoint PPTX, Word DOCX)',
    'Повні пакети самостійних та контрольних робіт у 2–4 варіантах',
    'Готові розвʼязки, критерії оцінювання та ключі відповідей до всіх завдань',
    'Швидке копіювання методичних планів уроків в 1 клік',
    'Усі нові теми, оновлення та матеріали, які додаються протягом року',
    'Пряма підтримка та пріоритетні консультації методиста',
  ];

  return (
    <div className="min-h-screen bg-volya-grid py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Заголовок */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono-math font-semibold uppercase tracking-wider text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3.5 py-1 rounded-lg">
            Єдина річна підписка
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0D1117] tracking-tight">
            Річний доступ до всієї платформи
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed">
            Один платіж на весь навчальний рік. Усі класи, теми, презентації, інтерактивні ігри та контрольні роботи з відповідями у вашому повному розпорядженні.
          </p>
        </div>

        {/* Тарифні плани (Free vs Річний All-Access) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Free план */}
          <div className="md:col-span-5 bg-white border border-[#E2E8F4] rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono-math font-bold text-[#5E687E] uppercase tracking-wider">
                  Ознайомлення
                </span>
                <h3 className="font-display font-black text-2xl text-[#0D1117] mt-1">
                  Базовий доступ
                </h3>
                <p className="text-xs text-[#5E687E] mt-2 leading-relaxed">
                  Щоб оцінити формат та якість матеріалів на реальних уроках.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-4xl text-[#0D1117]">0 грн</span>
                  <span className="text-xs font-mono-math text-[#5E687E]">/ назавжди</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F1F4FA] space-y-3">
                <p className="text-[11px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
                  Що доступно:
                </p>
                <ul className="space-y-2.5">
                  {freeFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#0D1117]">
                      <Check className="w-4 h-4 text-[#00BA7C] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/catalog"
                className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm text-center block transition-all bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF]"
              >
                Перейти до безкоштовних тем
              </Link>
            </div>
          </div>

          {/* Річна підписка (Головна картка) */}
          <div className="md:col-span-7 bg-white border-2 border-[#1E56FF] rounded-3xl p-7 sm:p-9 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 right-6 bg-[#1E56FF] text-white text-[11px] font-display font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              All-Access Pass
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono-math font-bold text-[#1E56FF] uppercase tracking-wider bg-[#EFF4FF] px-2.5 py-0.5 rounded-md">
                  Навчальний рік 2026/2027
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117] mt-2">
                  Річна підписка на платформу
                </h3>
                <p className="text-xs sm:text-sm text-[#5E687E] mt-2 leading-relaxed">
                  Повне методичне забезпечення для вчителя школи чи репетитора. Економить до 15 годин підготовки щотижня.
                </p>
              </div>

              <div className="pt-2 bg-[#F7F9FD] border border-[#E2E8F4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-black text-4xl text-[#0D1117]">
                      1 290 грн
                    </span>
                    <span className="text-xs font-mono-math text-[#5E687E]">
                      / на 1 рік
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-math text-[#1E56FF] font-semibold block mt-0.5">
                    Один платіж без автосписань (~107 грн/міс)
                  </span>
                </div>
                <div className="text-right sm:self-center">
                  <span className="text-xs font-display font-bold text-[#00BA7C] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-emerald-200">
                    Окупається за 2–3 уроки
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F4FA] space-y-3">
                <p className="text-[11px] font-mono-math uppercase tracking-wider font-bold text-[#0D1117]">
                  Повний безлімітний пакет включає:
                </p>
                <ul className="grid grid-cols-1 gap-2.5">
                  {yearlyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0D1117]">
                      <CheckCircle2 className="w-4 h-4 text-[#1E56FF] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="#checkout"
                className="w-full py-4 px-6 rounded-xl font-display font-bold text-sm text-center block transition-all bg-[#1E56FF] text-white hover:bg-[#0D33B3] shadow-md hover:shadow-lg"
              >
                Оформити річну підписку (1 290 грн)
              </a>
              <p className="text-center text-[11px] font-mono-math text-[#5E687E] mt-2.5">
                Миттєва активація доступу після оплати карткою чи Apple Pay
              </p>
            </div>
          </div>
        </div>

        {/* Блок переваг підписки */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs">
          <h3 className="font-display font-black text-xl text-[#0D1117] text-center mb-8">
            Чому викладачі обирають річну підписку
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0D1117]">
                  Інтерактивні HTML5-ігри
                </h4>
                <p className="text-xs text-[#5E687E] mt-1 leading-relaxed">
                  Повноекранні математичні тренажери, які підвищують залученість учнів на уроках.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#0D1117]">
                  Редаговані файли PPTX / DOCX
                </h4>
                <p className="text-xs text-[#5E687E] mt-1 leading-relaxed">
                  Завантажуйте вихідні файли, редагуйте під власні потреби чи роздруковуйте завдання.
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
                  Готові критерії оцінювання та розвʼязки завдань для швидкої та безпомилкової перевірки.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-4">
          <h4 className="font-display font-bold text-base text-[#0D1117]">
            Поширені запитання
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5E687E] leading-relaxed pt-2 border-t border-[#F1F4FA]">
            <div>
              <strong className="text-[#0D1117] block mb-1">Чи будуть автоматичні списання через рік?</strong>
              Ні, ми не підключаємо прихованих автосписань. Підписка оплачується один раз на 12 місяців.
            </div>
            <div>
              <strong className="text-[#0D1117] block mb-1">Як отримати доступ для школи або кафедри?</strong>
              Якщо потрібен спільний доступ для кількох викладачів закладу — напишіть нам для отримання рахунку або ліцензії на школу.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}