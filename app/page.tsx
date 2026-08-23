export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Gamepad2, 
  FileText, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  let recentMaterials: any[] = [];
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

    recentMaterials = matRes.data || [];
    grades = gradeRes.data || [];
  } catch (e) {
    console.warn('Database fetch fallback on home');
  }

  const defaultGrades = [
    { id: '5', number: 5, name: '5 клас' },
    { id: '6', number: 6, name: '6 клас' },
    { id: '7', number: 7, name: '7 клас' },
    { id: '8', number: 8, name: '8 клас' },
    { id: '9', number: 9, name: '9 клас' },
    { id: '10', number: 10, name: '10 клас' },
    { id: '11', number: 11, name: '11 клас' },
  ];

  const activeGrades = grades.length > 0 ? grades : defaultGrades;

  const materialTypesList = [
    { title: 'Презентації', slug: 'presentation', desc: 'Готові структуровані слайди до кожного уроку' },
    { title: 'Інтерактивні ігри', slug: 'game', desc: 'HTML5-тренажери усного рахунку на весь екран' },
    { title: 'Контрольні роботи', slug: 'control', desc: 'Варіанти завдань із критеріями та відповідями' },
    { title: 'Самостійні роботи', slug: 'worksheet', desc: 'Картки для швидкої 15-хвилинної перевірки' },
    { title: 'Конспекти уроків', slug: 'notes', desc: 'Методичні плани та формули з копіюванням у 1 клік' },
    { title: 'Домашні завдання', slug: 'homework', desc: 'Диференційовані блоки вправ для учнів' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* 1. ВЕЛИКА ВІДКРИТА HERO-СЕКЦІЯ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] text-xs font-mono-math font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Відкрита база навчальних матеріалів для викладачів</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0D1117] tracking-tight leading-[1.1]">
            Матеріали, з якими урок створюється <span className="text-[#1E56FF]">швидше</span>
          </h1>
          <p className="text-sm sm:text-base text-[#5E687E] max-w-2xl mx-auto leading-relaxed">
            Готові презентації, інтерактивні ігри, самостійні та контрольні роботи з математики для 5–11 класів.
          </p>
        </div>

        {/* Великий чистий пошуковий рядок */}
        <div className="max-w-2xl mx-auto">
          <form
            action="/catalog"
            method="GET"
            className="flex items-center gap-2 p-2 bg-white border border-[#E2E8F4] focus-within:border-[#1E56FF] rounded-2xl shadow-sm transition-all"
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
        </div>
      </section>

      {/* 2. ВЕЛИКИЙ ВИБІР КЛАСУ (5–11 класи) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
              Оберіть клас
            </h2>
            <p className="text-xs text-[#5E687E] mt-0.5">
              Швидкий перехід до структурованої програми паралелі
            </p>
          </div>
          <Link
            href="/catalog"
            className="font-display font-bold text-xs text-[#1E56FF] hover:underline inline-flex items-center gap-1"
          >
            Усі класи
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {activeGrades.map((grade) => (
            <Link
              key={grade.id}
              href={`/catalog?grade=${grade.id}`}
              className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-4 sm:p-5 text-center transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <span className="font-display font-black text-2xl sm:text-3xl text-[#0D1117] group-hover:text-[#1E56FF] transition-colors">
                {grade.number || String(grade.name).replace(/\D/g, '')}
              </span>
              <span className="text-[11px] font-mono-math text-[#5E687E] uppercase tracking-wider font-semibold">
                клас
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ТИПИ МАТЕРІАЛІВ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
            Формати навчальних розробок
          </h2>
          <p className="text-xs text-[#5E687E] mt-0.5">
            Усе необхідне для проведення уроку, контролю знань та інтерактивної практики
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialTypesList.map((type, idx) => (
            <Link
              key={idx}
              href={`/catalog?type=${type.slug}`}
              className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {type.slug === 'game' ? (
                  <Gamepad2 className="w-5 h-5" />
                ) : type.slug === 'notes' ? (
                  <BookOpen className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-sm text-[#0D1117] group-hover:text-[#1E56FF] transition-colors flex items-center gap-1.5">
                  {type.title}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-[#5E687E] leading-relaxed">
                  {type.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. ОСТАННІ ДОДАНІ МАТЕРІАЛИ */}
      {recentMaterials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
                Нові надходження
              </h2>
              <p className="text-xs text-[#5E687E] mt-0.5">
                Останні додані уроки та інтерактивні тренажери
              </p>
            </div>
            <Link
              href="/catalog"
              className="font-display font-bold text-xs text-[#1E56FF] hover:underline"
            >
              Переглянути всі →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMaterials.map((m) => (
              <div
                key={m.id}
                className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-3xl p-6 transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {m.grades?.name && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EFF4FF] text-[#1E56FF] font-display font-bold text-[11px]">
                        {m.grades.name}
                      </span>
                    )}
                    {m.material_types?.name && (
                      <span className="text-[11px] font-mono-math text-[#5E687E]">
                        {m.material_types.name}
                      </span>
                    )}
                    {m.is_premium ? (
                      <span className="ml-auto text-[10px] font-mono-math font-bold px-2 py-0.5 rounded-md bg-[#EFF4FF] text-[#1E56FF] border border-[#D5E2FF]">
                        Pro
                      </span>
                    ) : (
                      <span className="ml-auto text-[10px] font-mono-math font-semibold px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#00BA7C]">
                        Free
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-base text-[#0D1117] group-hover:text-[#1E56FF] transition-colors line-clamp-2">
                    {m.title}
                  </h3>

                  {m.description && (
                    <p className="text-xs text-[#5E687E] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-[#F1F4FA] flex items-center justify-between">
                  <span className="text-[11px] font-mono-math text-[#94A3B8]">
                    {m.is_interactive ? 'Інтерактивна гра' : 'Файл розробки'}
                  </span>
                  <Link
                    href={`/material/${m.id}`}
                    className="font-display font-bold text-xs px-4 py-2 rounded-xl bg-[#0D1117] text-white group-hover:bg-[#1E56FF] transition-colors inline-flex items-center gap-1.5"
                  >
                    Відкрити
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. ЛАКОНІЧНИЙ ПЕРЕХІД ДО ТАРИФІВ У КІНЦІ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono-math font-bold text-[#1E56FF] uppercase tracking-wider">
              Підписка та ліцензії 2026/2027
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
              Отримайте повний доступ до всіх розробок
            </h3>
            <p className="text-xs sm:text-sm text-[#5E687E]">
              Безкоштовний ознайомчий блок, Pro-доступ до окремих класів або ліцензія на всю школу.
            </p>
          </div>

          <Link
            href="/pricing"
            className="font-display font-bold text-xs sm:text-sm px-6 py-3.5 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            Переглянути тарифні плани
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}