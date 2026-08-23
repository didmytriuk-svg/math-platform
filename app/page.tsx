import Link from 'next/link';
import { Search, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MaterialCard } from '@/components/material/MaterialCard';
import { MathParticles } from '@/components/ui/MathParticles';

const GRADES = [
  { number: 5, name: '5 клас', desc: 'Арифметика та дроби' },
  { number: 6, name: '6 клас', desc: 'Пропорції та раціональні числа' },
  { number: 7, name: '7 клас', desc: 'Алгебра та Геометрія' },
  { number: 8, name: '8 клас', desc: 'Квадратні рівняння, чотирикутники' },
  { number: 9, name: '9 клас', desc: 'Функції, вектори, комбінаторика' },
  { number: 10, name: '10 клас', desc: 'Похідна та стереометрія' },
  { number: 11, name: '11 клас', desc: 'Інтеграли та підготовка до НМТ' },
];

const MATERIAL_TYPES = [
  { name: 'Презентації', slug: 'presentation' },
  { name: 'Інтерактивні ігри', slug: 'game' },
  { name: 'Самостійні роботи', slug: 'worksheet' },
  { name: 'Контрольні роботи', slug: 'control' },
  { name: 'Тести до уроку', slug: 'test' },
  { name: 'Домашні завдання', slug: 'homework' },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: latestMaterials } = await supabase
    .from('materials')
    .select(`
      id,
      title,
      slug,
      description,
      preview_url,
      created_at,
      grades ( name ),
      subjects ( name ),
      sections ( name ),
      material_types ( name )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-volya-grid pb-20">
      {/* 1. Hero Section з інтерактивними математичними частинками */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 border-b border-[#E2E8F4] bg-white/75 backdrop-blur-xs overflow-hidden">
        {/* Анімовані вузли та лінії на фоні */}
        <MathParticles />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] font-display font-bold text-xs uppercase tracking-wider mb-6 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#1E56FF]" />
            Відкрита база навчальних матеріалів
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#0D1117] leading-[1.15] mb-6">
            Матеріали, з якими урок створюється <span className="text-[#1E56FF]">швидше</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#5E687E] leading-relaxed mb-10 font-medium">
            Готові презентації, інтерактивні ігри, тести, самостійні та контрольні роботи з математики для 5–11 класів.
          </p>

          {/* Пошуковий рядок */}
          <form
            action="/catalog"
            method="GET"
            className="max-w-2xl mx-auto relative flex items-center bg-white border-2 border-[#0D1117] rounded-2xl p-2 shadow-lg shadow-[#1E56FF]/5 focus-within:border-[#1E56FF] transition-all pointer-events-auto"
          >
            <Search className="w-5 h-5 text-[#5E687E] ml-3" />
            <input
              type="text"
              name="search"
              placeholder="Що ви шукаєте? (наприклад: лінійні рівняння, 7 клас...)"
              className="w-full px-3.5 py-2.5 bg-transparent text-sm sm:text-base font-medium text-[#0D1117] outline-none placeholder:text-[#94A3B8]"
            />
            <button
              type="submit"
              className="font-display font-bold text-xs sm:text-sm px-6 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-2"
            >
              Знайти
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        {/* 2. Швидкий вибір класу */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
                Оберіть клас
              </h2>
              <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
                Швидкий перехід до програми потрібної паралелі
              </p>
            </div>
            <Link
              href="/catalog"
              className="font-display font-bold text-xs text-[#1E56FF] hover:underline inline-flex items-center gap-1"
            >
              Усі класи <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {GRADES.map((grade) => (
              <Link
                key={grade.number}
                href={`/catalog?grade=${grade.number}`}
                className="group flex flex-col justify-between p-5 bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <span className="font-display font-black text-2xl sm:text-3xl text-[#0D1117] group-hover:text-[#1E56FF] transition-colors block mb-1">
                    {grade.number}
                  </span>
                  <span className="font-display font-bold text-xs text-[#0D1117] block">
                    клас
                  </span>
                </div>
                <span className="text-[10px] text-[#5E687E] mt-4 line-clamp-2 leading-tight">
                  {grade.desc}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Типи матеріалів */}
        <section className="bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-xs">
          <div className="mb-6">
            <h2 className="font-display font-black text-lg sm:text-xl text-[#0D1117]">
              Типи навчальних матеріалів
            </h2>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Обирайте формат відповідно до плану вашого заняття
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MATERIAL_TYPES.map((type) => (
              <Link
                key={type.slug}
                href={`/catalog?type=${type.slug}`}
                className="p-4 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] hover:border-[#1E56FF] hover:bg-[#EFF4FF] transition-all text-center group"
              >
                <span className="font-display font-bold text-xs sm:text-sm text-[#0D1117] group-hover:text-[#1E56FF] transition-colors">
                  {type.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Останні матеріали */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
                Нові надходження
              </h2>
              <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
                Останні розробки, готові до використання на уроці
              </p>
            </div>
            <Link
              href="/catalog"
              className="font-display font-bold text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              Весь каталог <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestMaterials && latestMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestMaterials.map((item: any) => (
                <MaterialCard key={item.id} material={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F4] rounded-2xl p-12 text-center">
              <BookOpen className="w-8 h-8 text-[#1E56FF] mx-auto mb-3" />
              <span className="font-display font-black text-xl text-[#0D1117] block mb-2">
                Бібліотека наповнюється
              </span>
              <p className="text-xs text-[#5E687E] max-w-md mx-auto mb-6">
                Перейдіть у каталог для перегляду всіх тем або скористайтеся вчительською панеллю для додавання нових розробок.
              </p>
              <Link
                href="/catalog"
                className="font-display font-bold text-xs px-5 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors inline-block"
              >
                Перейти в каталог
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}