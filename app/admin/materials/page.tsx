'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, FileText, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMaterialsPage() {
  const supabase = createClient();
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [supabase]);

  async function fetchMaterials() {
    try {
      setIsLoading(true);
      // Отримуємо матеріали разом з назвою класу та типом матеріалу
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          grades ( name ),
          material_types ( name, slug )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити список матеріалів.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ви впевнені, що хочете видалити цей матеріал?')) return;

    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      
      // Оновлюємо локальний стейт
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(`Помилка видалення: ${err.message}`);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження матеріалів...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до адмін-панелі
          </Link>
          <Link
            href="/admin/materials/new"
            className="inline-flex items-center gap-2 text-xs font-display font-bold px-4 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Додати новий матеріал
          </Link>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-[#F1F4FA]">
            <div>
              <h1 className="font-display font-black text-2xl text-[#0D1117]">
                Керування матеріалами ({materials.length})
              </h1>
              <p className="text-xs text-[#5E687E] mt-1">
                Усі опубліковані та чернетки навчальних розробок
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {materials.length === 0 ? (
            <div className="text-center py-12 text-[#5E687E] text-sm">
              Поки що немає жодного матеріалу. Додайте перший!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F4] text-[11px] font-display font-bold text-[#5E687E] uppercase tracking-wider">
                    <th className="py-3 px-4">Назва матеріалу</th>
                    <th className="py-3 px-4">Клас</th>
                    <th className="py-3 px-4">Тип</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA] text-xs">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F9FD] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0D1117] max-w-xs truncate">
                        {m.title}
                      </td>
                      <td className="py-4 px-4 font-medium text-[#5E687E]">
                        {m.grades?.name || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#EFF4FF] text-[#1E56FF] font-medium text-[11px]">
                          {m.material_types?.name || 'Матеріал'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${
                            m.is_published
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {m.is_published ? 'Опубліковано' : 'Чернетка'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Кнопка Редагування */}
                          <Link
                            href={`/admin/materials/${m.id}/edit`}
                            className="p-2 rounded-lg bg-[#EFF4FF] text-[#1E56FF] hover:bg-[#D5E2FF] transition-colors"
                            title="Редагувати"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {/* Кнопка Видалення */}
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Видалити"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}