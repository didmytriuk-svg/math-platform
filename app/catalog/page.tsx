'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ChevronRight, 
  Loader2, 
  SearchX,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const initialGrade = searchParams.get('grade') || '';
  const initialType = searchParams.get('type') || '';
  const initialQuery = searchParams.get('q') || '';

  const [materials, setMaterials] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [materialTypes, setMaterialTypes] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    async function loadCatalogData() {
      setIsLoading(true);
      try {
        const [mRes, gRes, tRes, sRes] = await Promise.all([
          supabase
            .from('materials')
            .select(`
              id,
              title,
              slug,
              description,
              file_url,
              external_url,
              is_interactive,
              grade_id,
              material_type_id,
              section_id,
              topic_id,
              created_at,
              grades ( id, name, "order" ),
              material_types ( id, name, slug ),
              sections ( id, name )
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false }),

          supabase.from('grades').select('id, name, "order"').order('"order"', { ascending: true }),
          supabase.from('material_types').select('id, name, slug').order('name', { ascending: true }),
          supabase.from('sections').select('id, name').order('name', { ascending: true }),
        ]);

        setMaterials(mRes.data || []);
        setGrades(gRes.data || []);
        setMaterialTypes(tRes.data || []);
        setSections(sRes.data || []);
      } catch (err) {
        console.error('Catalog load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalogData();
  }, [supabase]);

  const availableSections = useMemo(() => {
    return sections;
  }, [sections]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesQuery = searchQuery.trim()
        ? item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesGrade = selectedGrade
        ? item.grade_id === selectedGrade || item.grades?.id === selectedGrade
        : true;

      const matchesType = selectedType
        ? item.material_type_id === selectedType ||
          item.material_types?.slug === selectedType ||
          item.material_types?.id === selectedType
        : true;

      const matchesSection = selectedSection ? item.section_id === selectedSection : true;

      return matchesQuery && matchesGrade && matchesType && matchesSection;
    });
  }, [materials, searchQuery, selectedGrade, selectedType, selectedSection]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('');
    setSelectedType('');
    setSelectedSection('');
    router.push('/catalog');
  };

  const hasActiveFilters = searchQuery || selectedGrade || selectedType || selectedSection;

  return (
    <div className="min-h-screen bg-volya-grid py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0D1117] tracking-tight">
            Бібліотека навчальних матеріалів
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E]">
            Обирайте клас, тему або потрібний формат розробки для вашого уроку
          </p>
        </div>

        {/* Панель фільтрів та пошуку */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за назвою уроку, формулою чи темою..."
                className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 bg-[#F7F9FD] border border-[#E2E8F4] rounded-2xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0D1117]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-display font-bold text-xs px-4 py-3 rounded-2xl border border-[#E2E8F4] hover:border-red-300 text-[#5E687E] hover:text-red-600 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Скинути фільтри
              </button>
            )}
          </div>

          {/* Кнопки вибору класу та НМТ */}
          <div className="space-y-3 pt-3 border-t border-[#F1F4FA]">
            <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
              Паралель / Підготовка
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGrade('')}
                className={`text-xs font-display font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                  selectedGrade === ''
                    ? 'bg-[#0D1117] text-white shadow-xs'
                    : 'bg-[#F7F9FD] text-[#5E687E] border border-[#E2E8F4] hover:border-[#1E56FF]'
                }`}
              >
                Усі класи
              </button>
              {grades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGrade(g.id)}
                  className={`text-xs font-display font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    selectedGrade === g.id
                      ? 'bg-[#0D1117] text-white shadow-xs'
                      : 'bg-[#F7F9FD] text-[#5E687E] border border-[#E2E8F4] hover:border-[#1E56FF]'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F1F4FA]">
            <div>
              <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1.5">
                Тип матеріалу
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
              >
                <option value="">Усі формати</option>
                {materialTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1.5">
                Розділ програми
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
              >
                <option value="">Усі розділи</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Результати */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono-math text-[#5E687E] px-1">
            <span>
              Знайдено матеріалів: <strong className="text-[#0D1117] font-bold">{filteredMaterials.length}</strong>
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#5E687E]">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E56FF]" />
              <span className="text-xs font-mono-math">Завантаження бібліотеки матеріалів...</span>
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((m) => (
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
                        {m.material_types?.name && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] font-mono-math font-bold text-xs">
                            {m.material_types.name}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono-math font-semibold text-[#00BA7C] bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                        Free
                      </span>
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
                    <span className="text-xs font-mono-math text-[#94A3B8]">
                      {m.sections?.name || 'Математика'}
                    </span>

                    <Link
                      href={`/material/${m.id}`}
                      className="font-display font-bold text-xs px-4 py-2 rounded-xl bg-[#0D1117] text-white group-hover:bg-[#1E56FF] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      Відкрити
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center mx-auto">
                <SearchX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-[#0D1117]">
                  Матеріалів не знайдено
                </h3>
                <p className="text-xs text-[#5E687E] mt-1">
                  За обраними фільтрами розробок поки що немає. Спробуйте змінити критерії пошуку.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="font-display font-bold text-xs px-5 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                Показати всі матеріали
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-volya-grid flex items-center justify-center">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
            Завантаження каталогу...
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}