'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit3, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMaterialsPage() {
  const supabase = createClient();
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*, grades(name), material_types(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm('Ви дійсно хочете видалити цей матеріал?')) return;

    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert('Помилка видалення: ' + err.message);
    }
  };

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
            className="inline-flex items-center gap-2 text-xs font-display font-bold px-4 py-2.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Додати новий матеріал
          </Link>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1F4FA] pb-4 flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-xl text-[#0D1117]">
                Керування матеріалами ({materials.length})
              </h1>
              <p className="text-xs text-[#5E687E] mt-0.5">
                Усі опубліковані та чернетки навчальних розробок
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
            </div>
          ) : materials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F1F4FA] text-[#5E687E] font-mono-math">
                    <th className="py-3 px-4 font-bold">Назва матеріалу</th>
                    <th className="py-3 px-4 font-bold">Клас</th>
                    <th className="py-3 px-4 font-bold">Тип</th>
                    <th className="py-3 px-4 font-bold">Статус</th>
                    <th className="py-3 px-4 font-bold text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA]">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F9FD] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0D1117] max-w-xs truncate">
                        {m.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#5E687E]">
                        {m.grades?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#1E56FF] font-mono-math font-bold text-[10px]">
                          {m.material_types?.name || 'Матеріал'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.is_published ? (
                          <span className="text-[10px] font-bold text-[#00BA7C] bg-[#F0FDF4] px-2 py-0.5 rounded">Опубліковано</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Чернетка</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/admin/materials/${m.id}/edit`}
                          className="inline-flex p-2 rounded-lg bg-[#F7F9FD] border border-[#E2E8F4] text-[#1E56FF] hover:bg-[#EFF4FF] transition-colors"
                          title="Редагувати"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="inline-flex p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Видалити"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="text-xs text-[#5E687E]">Матеріалів поки немає в базі даних.</p>
              <Link
                href="/admin/materials/new"
                className="inline-block text-xs font-display font-bold text-[#1E56FF] hover:underline"
              >
                Створити перший матеріал →
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}