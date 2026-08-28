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
    setSearchQuery(searchParams.get('q') || '');
    setSelectedGrade(searchParams.get('grade') || '');
    setSelectedType(searchParams.get('type') || '');
  }, [searchParams]);

  useEffect(() => {
    async function loadCatalogData() {
      setIsLoading(true);
      try {
        const [mRes, gRes, tRes, sRes] = await Promise.all([
          supabase.from('materials').select('*').eq('is_published', true).order('created_at', { ascending: false }),
          supabase.from('grades').select('*'),
          supabase.from('material_types').select('*'),
          supabase.from('sections').select('*'),
        ]);

        const rawMaterials = mRes.data || [];
        const rawGrades = gRes.data || [];
        const rawTypes = tRes.data || [];
        const rawSections = sRes.data || [];

        setGrades(rawGrades);
        setMaterialTypes(rawTypes);
        setSections(rawSections);

        const enriched = rawMaterials.map((m) => ({
          ...m,
          grades: rawGrades.find((g: any) => g.id === m.grade_id),
          material_types: rawTypes.find((t: any) => t.id === m.material_type_id),
          sections: rawSections.find((s: any) => s.id === m.section_id),
        }));

        setMaterials(enriched);
      } catch (err) {
        console.error('Catalog load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalogData();
  }, [supabase]);

  // Абсолютно надійна фільтрація
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // 1. Пошук за текстовим запитом
      const matchesQuery = searchQuery.trim()
        ? item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // 2. Фільтрація класів
      let matchesGrade = true;
      if (selectedGrade) {
        const selectedGradeObj = grades.find((g) => g.id === selectedGrade);
        const selectedGradeName = selectedGradeObj ? selectedGradeObj.name?.toLowerCase() : '';
        const itemGradeName = item.grades?.name?.toLowerCase() || '';

        matchesGrade = 
          item.grade_id === selectedGrade ||
          item.grades?.id === selectedGrade ||
          (selectedGradeName && itemGradeName.includes(selectedGradeName)) ||
          itemGradeName.includes(selectedGrade.toLowerCase());
      }

      // 3. Фільтрація типів матеріалів
      let matchesType = true;
      if (selectedType) {
        matchesType = 
          item.material_type_id === selectedType || 
          item.material_types?.slug === selectedType ||
          item.material_types?.id === selectedType ||
          item.material_types?.name?.toLowerCase().includes(selectedType.toLowerCase());
      }

      // 4. Фільтрація розділів
      const matchesSection = selectedSection ? item.section_id === selectedSection : true;

      return matchesQuery && matchesGrade && matchesType && matchesSection;
    });
  }, [materials, grades, searchQuery, selectedGrade, selectedType, selectedSection]);

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F1F4FA]">
            <div>
              <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1.5">
                Паралель / Клас
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
              >
                <option value="">Усі класи</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

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
                {sections.map((s) => (
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
              {filteredMaterials.map((m) => {
                const isItemLocked = m.is_premium || m.access_tier === 'grade_pro' || m.access_tier === 'pro_all';

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
                          {m.material_types?.name && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] font-mono-math font-bold text-xs">
                              {m.material_types.name}
                            </span>
                          )}
                        </div>

                        {isItemLocked ? (
                          <span className="text-[11px] font-mono-math font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                            🔒 Pro
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono-math font-semibold text-[#00BA7C] bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                            Free
                          </span>
                        )}
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
                        {isItemLocked ? 'Деталі' : 'Відкрити'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
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