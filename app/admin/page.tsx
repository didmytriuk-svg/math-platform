'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  AlertCircle,
  FileText,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminHeaderNav } from '@/components/admin/AdminHeaderNav';

export default function AdminMaterialsListPage() {
  const supabase = createClient();

  const [materials, setMaterials] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matRes, gradeRes] = await Promise.all([
        supabase
          .from('materials')
          .select(`
            id,
            title,
            slug,
            is_published,
            is_premium,
            is_interactive,
            grade_id,
            created_at,
            grades ( id, name ),
            material_types ( id, name, slug )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('id, name, number').order('number', { ascending: true })
      ]);

      if (matRes.error) throw matRes.error;
      setMaterials(matRes.data || []);
      setGrades(gradeRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Не вдалося завантажити матеріали');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updErr } = await supabase
        .from('materials')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (updErr) throw updErr;
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_published: !currentStatus } : m))
      );
    } catch (err: any) {
      alert(`Помилка зміни статусу: ${err.message}`);
    }
  };

  const deleteMaterial = async (id: string, title: string) => {
    if (!window.confirm(`Ви дійсно бажаєте видалити матеріал:\n"${title}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error: delErr } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(`Помилка видалення: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = searchQuery.trim()
      ? m.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesGrade = selectedGrade ? m.grade_id === selectedGrade : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Навігація адмінки */}
        <AdminHeaderNav />

        {/* Заголовок та кнопка створення */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Керування матеріалами
            </h1>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Повний перелік завантажених матеріалів ({filteredMaterials.length} із {materials.length})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="p-3 rounded-xl border border-[#E2E8F4] text-[#5E687E] hover:text-[#1E56FF] hover:border-[#1E56FF] bg-white transition-all shadow-2xs"
              title="Оновити список"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin/materials/new"
              className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Додати новий матеріал
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Фільтри пошуку */}
        <div className="bg-white border border-[#E2E8F4] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative grow w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою матеріалу..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full sm:w-56 text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
          >
            <option value="">Усі класи</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Таблиця матеріалів */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs font-mono-math text-[#5E687E]">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
              Завантаження списку матеріалів...
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F4] bg-[#F7F9FD] text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
                    <th className="py-4 px-6">Назва матеріалу</th>
                    <th className="py-4 px-4">Клас</th>
                    <th className="py-4 px-4">Тип</th>
                    <th className="py-4 px-4">Доступ</th>
                    <th className="py-4 px-4">Статус</th>
                    <th className="py-4 px-6 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA] text-xs">
                  {filteredMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 font-display font-bold text-[#0D1117] max-w-xs sm:max-w-md truncate">
                        <div className="flex items-center gap-2.5">
                          {m.is_interactive ? (
                            <Gamepad2 className="w-4 h-4 text-[#1E56FF] shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#5E687E] shrink-0" />
                          )}
                          <span className="truncate">{m.title}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono-math font-semibold text-[#0D1117] whitespace-nowrap">
                        {m.grades?.name || '—'}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] text-[#1E56FF] font-mono-math font-bold text-[10px]">
                          {m.material_types?.name || 'Матеріал'}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {m.is_premium ? (
                          <span className="text-[10px] font-mono-math font-bold px-2 py-0.5 rounded-md bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF]">
                            PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono-math font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-[#00BA7C]">
                            Free
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => togglePublish(m.id, m.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono-math font-bold cursor-pointer transition-colors ${
                            m.is_published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.is_published ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                          />
                          {m.is_published ? 'Опубліковано' : 'Чернетка'}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/material/${m.id}`}
                            target="_blank"
                            className="p-2 rounded-xl text-[#5E687E] hover:text-[#1E56FF] hover:bg-[#EFF4FF] transition-colors"
                            title="Переглянути на сайті"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/materials/${m.id}/edit`}
                            className="p-2 rounded-xl text-[#5E687E] hover:text-[#0D1117] hover:bg-zinc-100 transition-colors"
                            title="Редагувати"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteMaterial(m.id, m.title)}
                            disabled={isDeleting === m.id}
                            className="p-2 rounded-xl text-[#5E687E] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Видалити"
                          >
                            {isDeleting === m.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-[#5E687E]">Матеріалів не знайдено.</p>
              <Link
                href="/admin/materials/new"
                className="font-display font-bold text-xs px-4 py-2 bg-[#1E56FF] text-white rounded-xl inline-block"
              >
                Створити перший матеріал
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}