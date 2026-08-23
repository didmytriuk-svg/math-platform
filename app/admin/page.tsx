'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit,
  Trash2, 
  CheckCircle2, 
  EyeOff, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMaterialsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [materials, setMaterials] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const [materialToDelete, setMaterialToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function fetchMaterials() {
    setIsLoading(true);
    try {
      const [materialsRes, gradesRes] = await Promise.all([
        supabase
          .from('materials')
          .select(`
            id,
            title,
            slug,
            is_published,
            created_at,
            grade_id,
            material_type_id,
            grades ( id, name ),
            material_types ( id, name )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('id, name, number').order('number', { ascending: true })
      ]);

      setMaterials(materialsRes.data || []);
      setGrades(gradesRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMaterials();
  }, []);

  const togglePublishStatus = async (item: any) => {
    setActionLoadingId(item.id);
    const newStatus = !item.is_published;

    try {
      const res = await fetch(`/api/admin/materials/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: newStatus }),
      });

      if (!res.ok) throw new Error('Помилка оновлення статусу');

      setMaterials((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_published: newStatus } : m))
      );
    } catch (err) {
      alert('Не вдалося змінити статус публікації.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/materials/${materialToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Помилка видалення');

      setMaterials((prev) => prev.filter((m) => m.id !== materialToDelete.id));
      setMaterialToDelete(null);
    } catch (err) {
      alert('Не вдалося видалити матеріал.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade ? m.grade_id === selectedGrade : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад у панель керування
          </Link>

          {/* Гарантована робоча кнопка переходу */}
          <button
            type="button"
            onClick={() => router.push('/admin/materials/new')}
            className="font-display font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Додати новий матеріал
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
                Керування матеріалами
              </h1>
              <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
                Повний перелік завантажених матеріалів ({filteredMaterials.length} із {materials.length})
              </p>
            </div>

            <button
              onClick={fetchMaterials}
              disabled={isLoading}
              className="self-start sm:self-auto p-2.5 rounded-xl border border-[#E2E8F4] hover:border-[#1E56FF] text-[#5E687E] hover:text-[#1E56FF] transition-colors cursor-pointer"
              title="Оновити список"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1E56FF]' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F1F4FA]">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за назвою матеріалу..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
              />
            </div>

            <div>
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
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#5E687E]">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
              <span className="text-xs font-mono-math">Завантаження бази матеріалів...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F7F9FD] border-b border-[#E2E8F4] font-display font-bold text-[#0D1117] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Назва матеріалу</th>
                    <th className="py-3.5 px-4">Клас</th>
                    <th className="py-3.5 px-4">Тип</th>
                    <th className="py-3.5 px-4">Статус</th>
                    <th className="py-3.5 px-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA]">
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((m: any) => (
                      <tr key={m.id} className="hover:bg-[#FAFCFF] transition-colors">
                        <td className="py-4 px-4 font-semibold text-[#0D1117] max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{m.title}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono-math text-[#5E687E]">
                          {m.grades?.name || '—'}
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#EFF4FF] text-[#1E56FF] font-mono-math text-[11px] font-bold">
                            {m.material_types?.name || 'Матеріал'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => togglePublishStatus(m)}
                            disabled={actionLoadingId === m.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              m.is_published
                                ? 'bg-[#F0FDF4] text-[#00BA7C] hover:bg-emerald-100'
                                : 'bg-[#FFF7ED] text-[#EA580C] hover:bg-amber-100'
                            }`}
                            title="Клікніть, щоб змінити статус видимості"
                          >
                            {actionLoadingId === m.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : m.is_published ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                            {m.is_published ? 'Опубліковано' : 'Приховано'}
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/material/${m.id}`}
                              target="_blank"
                              className="p-2 rounded-xl text-[#5E687E] hover:text-[#1E56FF] hover:bg-[#EFF4FF] transition-colors"
                              title="Відкрити на сайті"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/admin/materials/${m.id}/edit`}
                              className="p-2 rounded-xl text-[#5E687E] hover:text-[#1E56FF] hover:bg-[#EFF4FF] transition-colors"
                              title="Редагувати матеріал"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setMaterialToDelete(m)}
                              className="p-2 rounded-xl text-[#5E687E] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Видалити матеріал"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[#5E687E]">
                        Матеріалів за обраними критеріями не знайдено.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {materialToDelete && (
        <div className="fixed inset-0 z-50 bg-[#0D1117]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-black text-xl text-[#0D1117]">
                Видалити матеріал?
              </h3>
              <p className="text-xs sm:text-sm text-[#5E687E] mt-2 leading-relaxed">
                Ви дійсно хочете видалити розробку <strong className="text-[#0D1117]">«{materialToDelete.title}»</strong>? Файл та запис з бази буде стерто назавжди.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-display font-bold rounded-xl border border-[#E2E8F4] text-[#0D1117] hover:bg-[#F7F9FD] transition-colors cursor-pointer"
              >
                Скасувати
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-display font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Видалення...
                  </>
                ) : (
                  'Так, видалити'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}