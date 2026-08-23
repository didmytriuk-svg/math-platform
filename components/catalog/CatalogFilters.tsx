'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

interface FilterOption {
  id: string;
  name: string;
  slug?: string;
  grade_id?: string;
  section_id?: string;
}

interface CatalogFiltersProps {
  grades: FilterOption[];
  sections: FilterOption[];
  topics: FilterOption[];
  materialTypes: FilterOption[];
}

export function CatalogFilters({
  grades,
  sections,
  topics,
  materialTypes
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedGrade = searchParams.get('grade') || '';
  const selectedSection = searchParams.get('section') || '';
  const selectedTopic = searchParams.get('topic') || '';
  const selectedType = searchParams.get('type') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const filteredSections = selectedGrade
    ? sections.filter((s) => s.grade_id === selectedGrade)
    : sections;

  const filteredTopics = selectedSection
    ? topics.filter((t) => t.section_id === selectedSection)
    : selectedGrade
    ? topics.filter((t) => t.grade_id === selectedGrade)
    : topics;

  const updateParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateParam({ search: search.trim() ? search.trim() : null });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  const hasActiveFilters = Boolean(
    selectedGrade || selectedSection || selectedTopic || selectedType || search
  );

  const handleReset = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <aside className="bg-white border border-[#E2E8F4] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F4FA]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#1E56FF] rounded-sm" />
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-[#0D1117]">
            Фільтри
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs font-mono-math font-semibold text-[#5E687E] hover:text-[#1E56FF] transition-colors underline cursor-pointer"
          >
            Скинути
          </button>
        )}
      </div>

      {/* Пошук */}
      <div>
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Пошук
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Введіть тему чи назву..."
            className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] focus:bg-white transition placeholder:text-[#94A3B8]"
          />
          {isPending && (
            <span className="absolute right-3.5 top-3 inline-block w-4 h-4 border-2 border-[#1E56FF] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Клас */}
      <div>
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Клас
        </label>
        <select
          value={selectedGrade}
          onChange={(e) =>
            updateParam({ grade: e.target.value, section: null, topic: null })
          }
          className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
        >
          <option value="">Усі класи</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </div>

      {/* Тип матеріалу */}
      <div>
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Тип матеріалу
        </label>
        <select
          value={selectedType}
          onChange={(e) => updateParam({ type: e.target.value })}
          className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
        >
          <option value="">Усі типи</option>
          {materialTypes.map((type) => (
            <option key={type.id} value={type.slug || type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Розділ */}
      <div>
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Розділ
        </label>
        <select
          value={selectedSection}
          onChange={(e) => updateParam({ section: e.target.value, topic: null })}
          className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
        >
          <option value="">Усі розділи</option>
          {filteredSections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}
        </select>
      </div>

      {/* Тема */}
      <div>
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Тема
        </label>
        <select
          value={selectedTopic}
          onChange={(e) => updateParam({ topic: e.target.value })}
          className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
        >
          <option value="">Усі теми</option>
          {filteredTopics.map((top) => (
            <option key={top.id} value={top.id}>
              {top.name}
            </option>
          ))}
        </select>
      </div>

      {/* Сортування */}
      <div className="pt-4 border-t border-[#F1F4FA]">
        <label className="block text-xs font-bold text-[#0D1117] mb-2">
          Сортування
        </label>
        <select
          value={selectedSort}
          onChange={(e) => updateParam({ sort: e.target.value })}
          className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer font-mono-math text-xs"
        >
          <option value="newest">Найновіші спочатку</option>
          <option value="oldest">Найстаріші спочатку</option>
          <option value="title_asc">За алфавітом (А-Я)</option>
        </select>
      </div>
    </aside>
  );
}