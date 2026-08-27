'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const materialId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Словники для випадаючих списків
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [materialTypes, setMaterialTypes] = useState<any[]>([]);

  // Форма
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [materialTypeId, setMaterialTypeId] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Завантажуємо довідники
        const [
          { data: gradesData },
          { data: subjectsData },
          { data: sectionsData },
          { data: topicsData },
          { data: typesData },
        ] = await Promise.all([
          supabase.from('grades').select('*').order('order'),
          supabase.from('subjects').select('*'),
          supabase.from('sections').select('*'),
          supabase.from('topics').select('*'),
          supabase.from('material_types').select('*'),
        ]);

        setGrades(gradesData || []);
        setSubjects(subjectsData || []);
        setSections(sectionsData || []);
        setTopics(topicsData || []);
        setMaterialTypes(typesData || []);

        // Завантажуємо сам матеріал
        const { data: material, error: matError } = await supabase
          .from('materials')
          .select('*')
          .eq('id', materialId)
          .single();

        if (matError) throw matError;

        if (material) {
          setTitle(material.title || '');
          setDescription(material.description || '');
          setGradeId(material.grade_id || '');
          setSubjectId(material.subject_id || '');
          setSectionId(material.section_id || '');
          setTopicId(material.topic_id || '');
          setMaterialTypeId(material.material_type_id || '');
          setIsPublished(material.is_published ?? true);
        }
      } catch (err: any) {
        console.error('Помилка завантаження матеріалу:', err.message);
        setError('Не вдалося завантажити дані матеріалу.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [materialId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('materials')
        .update({
          title,
          description,
          grade_id: gradeId || null,
          subject_id: subjectId || null,
          section_id: sectionId || null,
          topic_id: topicId || null,
          material_type_id: materialTypeId || null,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', materialId);

      if (updateError) throw updateError;

      router.push('/admin/materials');
      router.refresh();
    } catch (err: any) {
      console.error('Помилка оновлення:', err.message);
      setError(err.message || 'Помилка при збереженні змін.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-500">
        Завантаження даних матеріалу...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/materials"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Назад до керування матеріалами
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Редагування матеріалу</h1>
        <p className="text-sm text-zinc-500 mb-8">Змініть необхідні поля та збережіть зміни.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Назва матеріалу</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Опис</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Клас</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Оберіть клас</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Предмет</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Оберіть предмет</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Розділ</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Оберіть розділ</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Тема</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Оберіть тему</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Тип матеріалу</label>
              <select
                value={materialTypeId}
                onChange={(e) => setMaterialTypeId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">Оберіть тип</option>
                {materialTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-zinc-700">
              Опубліковано на платформі
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-100">
            <Link
              href="/admin/materials"
              className="px-6 py-3 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Скасувати
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}