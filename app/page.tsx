export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  Check,
  ShieldCheck,
  LogIn,
  KeyRound
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MathParticles } from '@/components/ui/MathParticles';

export default async function HomePage() {
  let dbMaterials: any[] = [];
  let grades: any[] = [];

  try {
    const supabase = await createClient();
    const [matRes, gradeRes] = await Promise.all([
      supabase
        .from('materials')
        .select(`
          id,
          title,
          slug,
          description,
          is_premium,
          is_interactive,
          created_at,
          grades ( id, name, number ),
          material_types ( id, name, slug )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('grades').select('id, name, number').order('number', { ascending: true })
    ]);

    dbMaterials = matRes.data || [];
    grades = gradeRes.data || [];
  } catch (e) {
    console.warn('Database fallback on home page');
  }

  const fallbackMaterials = [
    {
      id: 'demo-1',
      title: 'Інтерактивний тренажер: Додавання та віднімання дробів',
      description: 'Веб-гра для швидкого відпрацювання усного рахунку та зведення до спільного знаменника.',
      grades: { name: '5 клас' },
      material_types: { name: 'Гра' },
      subject: 'Математика 5 клас',
      is_interactive: true,
      is_premium: false,
    },
    {
      id: 'demo-2',
      title: 'Презентація: Лінійні рівняння з однією змінною',
      description: 'Повний комплект слайдів для пояснення нової теми в 7 класі з візуальними схемами переносу доданків.',
      grades: { name: '7 клас' },
      material_types: { name: 'Презентація' },
      subject: 'Алгебра',
      is_interactive: false,
      is_premium: false,
    },
    {
      id: 'demo-3',
      title: 'Самостійна робота: Властивості лінійної функції',
      description: 'Роздатковий матеріал на 2 варіанти з критеріями оцінювання та відповідями для вчителя.',
      grades: { name: '7 клас' },
      material_types: { name: 'Самостійна робота' },
      subject: 'Алгебра',
      is_interactive: false,
      is_premium: false,
    },
    {
      id: 'demo-4',
      title: 'Контрольна робота: Квадратні рівняння та теорема Вієта',
      description: 'Підсумкова перевірка знань у 4 варіантах зі шкалою балів та детальними розвʼязками.',
      grades: { name: '8 клас' },
      material_types: { name: 'Контрольна робота' },
      subject: 'Алгебра',
      is_interactive: false,
      is_premium: true,
    },
    {
      id: 'demo-5',
      title: 'Гра-квест: Тригонометричні формули та коло',
      description: 'Інтерактивна вікторина для закріплення радіанної міри кутів та значень sin, cos, tg.',
      grades: { name: '10 клас' },
      material_types: { name: 'Гра' },
      subject: 'Алгебра і початки аналізу',
      is_interactive: true,
      is_premium: true,
    },
    {
      id: 'demo-6',
      title: 'Підготовка до НМТ: Обчислення інтегралів та площ фігур',
      description: 'Практикум із типовими завданнями тестування минулих років та покроковими коментарями.',
      grades: { name: 'НМТ' },
      material_types: { name: 'Тести до уроку' },
      subject: 'Математика НМТ',
      is_interactive: false,
      is_premium: true,
    },
  ];

  const displayMaterials = dbMaterials.length > 0 ? dbMaterials : fallbackMaterials;

  const gradeCardsData = [
    { num: 5, subtitle: 'Арифметика та дроби' },
    { num: 6, subtitle: 'Пропорції та раціональні числа' },
    { num: 7, subtitle: 'Алгебра та Геометрія' },
    { num: 8, subtitle: 'Квадратні рівняння, чотирикутники' },
    { num: 9, subtitle: 'Функції, вектори, комбінаторика' },
    { num: 10, subtitle: 'Похідна та стереометрія' },
    { num: 11, subtitle: 'Інтеграли та підготовка до НМТ' },
  ];

  const materialTypesData = [
    { title: 'Презентації', slug: 'presentation' },
    { title: 'Інтерактивні ігри', slug: 'game' },
    { title: 'Самостійні роботи', slug: 'worksheet' },
    { title: 'Контрольні роботи', slug: 'control' },
    { title: 'Тести до уроку', slug: 'test' },
    { title: 'Домашні завдання', slug: 'homework' },
  ];

  const pricingTiers = [
    {
      id: 'free',
      name: 'Безкоштовний',
      badge: 'Пробний доступ',
      price: '0 грн',
      period: 'назавжди',
      desc: 'Повний перший блок тем будь-якого класу для тестування на уроці.',
      features: [
        'Повний перший блок уроків',
        'Онлайн-перегляд усього каталогу',
        'Текстові плани та конспекти',
      ],
      cta: 'Вільний доступ',
      href: '/catalog',
      isPrimary: false,
      btnStyle: 'bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF]',
    },
    {
      id: 'single',
      name: 'Pro — один клас',
      badge: 'Для однієї паралелі',
      price: '290 грн',
      period: 'на 1 рік (~24 грн/міс)',
      desc: 'Повний комплект матеріалів для викладача конкретного класу.',
      features: [
        'Усі теми обраного класу (5–11)',
        'Усі HTML5-ігри обраної паралелі',
        'Завантаження PPTX та DOCX',
        'Контрольні з готовими відповідями',
      ],
      cta: 'Обрати клас',
      href: '/pricing',
      isPrimary: false,
      btnStyle: 'bg-white border-2 border-[#1E56FF] text-[#1E56FF] hover:bg-[#1E56FF] hover:text-white',
    },
    {
      id: 'all',
      name: 'Pro — весь каталог',
      badge: 'Вибір 90% викладачів',
      price: '890 грн',
      period: 'на 1 рік (~74 грн/міс)',
      desc: 'Повний безліміт до всіх 5–11 класів, включно з усіма новими оновленнями.',
      features: [
        'Безлімітний доступ до всіх 5–11 класів',
        'Усі інтерактивні HTML5-ігри на весь екран',
        'Редаговані слайди PPTX та конспекти DOCX',
        'Пакети контрольних робіт із ключами',
        'Усі оновлення програми протягом року',
      ],
      cta: 'Оформити All-Access',
      href: '/pricing',
      isPrimary: true,
      btnStyle: 'bg-[#1E56FF] text-white hover:bg-[#0D33B3] shadow-md hover:shadow-lg',
    },
    {
      id: 'school',
      name: 'School (B2B)',
      badge: 'Для закладів освіти',
      price: '3 900 грн',
      period: 'на 1 рік за школу',
      desc: 'Корпоративна ліцензія для всієї кафедри математики школи.',
      features: [
        'Доступ для всіх учителів закладу',
        'Офіційний договір та рахунок для юросіб',
        'Повний доступ до всіх 5–11 класів',
        'Персональний супровід методиста',
      ],
      cta: 'Рахунок для школи',
      href: '/pricing',
      isPrimary: false,
      btnStyle: 'bg-[#0D1117] text-white hover:bg-[#1E56FF]',
    },
  ];

  return (
    <div className="bg-volya-grid min-h-screen space-y-16 sm:space-y-24 py-8 sm:py-16 relative">
      <MathParticles />

      {/* 1. HERO СЕКЦІЯ */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 min-h-[440px] flex flex-col justify-center items-center z-10">
        <div className="space-y-8 w-full">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ВІДКРИТА БАЗА НАВЧАЛЬНИХ МАТЕРІАЛІВ</span>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#EFF4FF] border border-[#D5E2FF] text-[#0D1117] hover:text-[#1E56FF] text-xs font-display font-bold shadow-2xs transition-all hover:scale-105"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#1E56FF]" />
              <span>Вхід за паролем</span>
            </Link>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0D1117] tracking-tight leading-[1.1]">
              Матеріали, з якими урок створюється <span className="text-[#1E56FF]">швидше</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5E687E] max-w-2xl mx-auto leading-relaxed">
              Готові презентації, інтерактивні ігри, тести, самостійні та контрольні роботи з математики для 5–11 класів.
            </p>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-3">
            <form
              action="/catalog"
              method="GET"
              className="flex items-center gap-2 p-2 bg-white border border-[#0D1117] rounded-2xl shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 pl-3 grow text-left text-sm text-[#94A3B8]">
                <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Що ви шукаєте? (наприклад: лінійні рівняння, 7 клас...)"
                  className="w-full text-xs sm:text-sm text-[#0D1117] outline-none bg-transparent placeholder:text-[#94A3B8]"
                />
              </div>
              <button
                type="submit"
                className="font-display font-bold text-xs sm:text-sm px-6 py-3 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Знайти
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 text-xs">
              <Link
                href="/login"
                className="font-display font-bold text-[#1E56FF] hover:underline inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/60 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Вже маєте доступ? Увійти до кабінету
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ОБЕРІТЬ КЛАС ТА НМТ (В ЄДИНОМУ СТИЛІ БЕЗ «ГОЛОВНЕ») */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Оберіть клас або напрямок
            </h2>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-0.5">
              Швидкий перехід до програми потрібної паралелі чи підготовки до іспитів
            </p>
          </div>
          <Link
            href="/catalog"
            className="font-display font-bold text-xs sm:text-sm text-[#1E56FF] hover:underline inline-flex items-center gap-1"
          >
            Усі класи →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {/* Картка НМТ в абсолютному єдиному стилі з рештою карток */}
          <Link
            href="/catalog?grade=nmt"
            className="group bg-white border-2 border-[#1E56FF] hover:border-[#0D1117] rounded-2xl p-5 text-left transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#1E56FF] block leading-none tracking-tight">
                НМТ
              </span>
              <span className="text-xs font-display font-bold text-[#0D1117] block mt-1">
                іспит
              </span>
            </div>
            <p className="text-[11px] text-[#5E687E] leading-snug">
              Тести і тренажери
            </p>
          </Link>

          {/* Класи 5–11 */}
          {gradeCardsData.map((item) => {
            const matchedDbGrade = grades.find((g) => g.number === item.num);
            const gradeUrlParam = matchedDbGrade?.id || item.num;

            return (
              <Link
                key={item.num}
                href={`/catalog?grade=${gradeUrlParam}`}
                className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-5 text-left transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between min-h-[170px]"
              >
                <div>
                  <span className="font-display font-black text-3xl sm:text-4xl text-[#0D1117] block leading-none">
                    {item.num}
                  </span>
                  <span className="text-xs font-display font-bold text-[#0D1117] block mt-1">
                    клас
                  </span>
                </div>
                <p className="text-[11px] text-[#5E687E] leading-snug mt-3">
                  {item.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. ТИПИ НАВЧАЛЬНИХ МАТЕРІАЛІВ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
              Типи навчальних матеріалів
            </h2>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-0.5">
              Обирайте формат відповідно до плану вашого заняття
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {materialTypesData.map((t, idx) => (
              <Link
                key={idx}
                href={`/catalog?type=${t.slug}`}
                className="bg-[#F7F9FD] hover:bg-[#EFF4FF] border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-4 text-center font-display font-bold text-xs sm:text-sm text-[#0D1117] hover:text-[#1E56FF] transition-all flex items-center justify-center min-h-[72px]"
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. НОВІ НАДХОДЖЕННЯ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Нові надходження
            </h2>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-0.5">
              Останні розробки, готові до використання на уроці
            </p>
          </div>
          <Link
            href="/catalog"
            className="font-display font-bold text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            Весь каталог →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMaterials.map((m: any) => {
            const isItemLocked = m.is_premium;

            return (
              <div
                key={m.id}
                className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {m.grades?.name && (
                        <span className="px-3 py-1 rounded-lg bg-[#1E56FF] text-white font-display font-black text-xs">
                          {m.grades.name}
                        </span>
                      )}
                      <span className="text-xs font-mono-math text-[#5E687E]">
                        {m.subject || 'Математика'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.material_types?.name && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] font-mono-math font-bold text-xs">
                          {m.material_types.name}
                        </span>
                      )}

                      {isItemLocked ? (
                        <span className="text-[11px] font-mono-math font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          🔒 Pro
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono-math font-semibold text-[#00BA7C] bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-base sm:text-lg text-[#0D1117] group-hover:text-[#1E56FF] transition-colors leading-snug line-clamp-2">
                      {m.title}
                    </h3>
                    {m.description && (
                      <p className="text-xs text-[#5E687E] mt-2 line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F1F4FA] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono-math text-[#5E687E]">
                    Доступно
                  </span>

                  <Link
                    href={m.id.startsWith('demo-') ? '/catalog' : `/material/${m.id}`}
                    className="font-display font-bold text-xs text-[#0D1117] group-hover:text-[#1E56FF] transition-colors inline-flex items-center gap-1"
                  >
                    {isItemLocked ? 'Деталі' : 'Відкрити'} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ТАРИФНІ ПЛАНИ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Тарифна система</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117] tracking-tight">
              Обирайте рівень доступу до матеріалів
            </h2>
            <p className="text-xs text-[#5E687E] leading-relaxed">
              Без прихованих автосписань. Працюйте з безкоштовним розділом або отримайте повний річний доступ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`bg-[#FAFCFF] border rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                  tier.isPrimary
                    ? 'border-[#1E56FF] bg-white shadow-lg ring-1 ring-[#1E56FF] lg:-translate-y-1'
                    : 'border-[#E2E8F4] hover:border-[#1E56FF]/40'
                }`}
              >
                {tier.isPrimary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E56FF] text-white text-[10px] font-display font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    {!tier.isPrimary && (
                      <span className="text-[10px] font-mono-math font-bold text-[#5E687E] uppercase tracking-wider bg-white border border-[#E2E8F4] px-2 py-0.5 rounded-md">
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="font-display font-black text-base sm:text-lg text-[#0D1117] mt-2">
                      {tier.name}
                    </h3>
                    <p className="text-[11px] text-[#5E687E] mt-1 leading-relaxed min-h-[34px]">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
                        {tier.price}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-math text-[#5E687E]">
                      {tier.period}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EDF2FA] space-y-2">
                    <ul className="space-y-2">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#0D1117]">
                          <Check className="w-3.5 h-3.5 text-[#1E56FF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={tier.href}
                    className={`w-full py-2.5 px-3 rounded-xl font-display font-bold text-xs text-center block transition-all ${tier.btnStyle}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F1F4FA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5E687E]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00BA7C]" />
              <span>Матеріали відповідають модельним навчальним програмам МОН України</span>
            </div>
            <Link
              href="/pricing"
              className="font-display font-bold text-xs text-[#1E56FF] hover:underline inline-flex items-center gap-1"
            >
              Детальніше про умови ліцензій
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}