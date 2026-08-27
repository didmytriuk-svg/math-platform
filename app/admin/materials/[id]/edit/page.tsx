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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Довідники
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
  
  // Файли
  const [fileUrl, setFileUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

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
          setFileUrl(material.file_url || '');
          setPreviewUrl(material.preview_url || '');
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
      let currentFileUrl = fileUrl;
      let currentPreviewUrl = previewUrl;

      // Якщо вибрано новий файл для завантаження
      if (selectedFile) {
        setUploading(true);
        const fileName = `${Date.now()}-${selectedFile.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('materials')
          .upload(fileName, selectedFile);

        if (fileError) throw fileError;

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(fileData.path);

        currentFileUrl = publicUrlData.publicUrl;
      }

      // Якщо вибрано новий прев'ю-файл
      if (selectedPreview) {
        const previewName = `preview-${Date.now()}-${selectedPreview.name}`;
        const { data: prevData, error: prevError } = await supabase.storage
          .from('materials')
          .upload(previewName, selectedPreview);

        if (prevError) throw prevError;

        const { data: publicPrevData } = supabase.storage
          .from('materials')
          .getPublicUrl(prevData.path);

        currentPreviewUrl = publicPrevData.publicUrl;
      }

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
          file_url: currentFileUrl,
          preview_url: currentPreviewUrl,
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
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-400 font-medium">
        Завантаження даних матеріалу...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/admin/materials"
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
        >
          <span>←</span> Назад до керування матеріалами
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 sm:p-10 shadow-sm">
        <div className="mb-8 pb-6 border-b border-zinc-100">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Редагування матеріалу</h1>
          <p className="text-sm text-zinc-500 mt-1">Змініть параметри розробки або замініть файл у сховищі.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">Назва матеріалу</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">Опис</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">Клас</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
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
              <label className="block text-sm font-bold text-zinc-900 mb-2">Предмет</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
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
              <label className="block text-sm font-bold text-zinc-900 mb-2">Розділ</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
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
              <label className="block text-sm font-bold text-zinc-900 mb-2">Тема</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
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
              <label className="block text-sm font-bold text-zinc-900 mb-2">Тип матеріалу</label>
              <select
                value={materialTypeId}
                onChange={(e) => setMaterialTypeId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-zinc-50/50"
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

          {/* Блок завантаження файлів */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">Основний файл матеріалу</label>
              {fileUrl && (
                <div className="text-xs text-blue-600 mb-2 truncate font-medium">
                  Поточний: <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">відкрити файл</a>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">Прев'ю / Зображення</label>
              {previewUrl && (
                <div className="text-xs text-blue-600 mb-2 truncate font-medium">
                  Поточне: <a href={previewUrl} target="_blank" rel="noreferrer" className="underline">переглянути</a>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedPreview(e.target.files?.[0] || null)}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded-lg border-zinc-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-sm font-bold text-zinc-900 cursor-pointer">
              Опубліковано на платформі
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-100">
            <Link
              href="/admin/materials"
              className="px-6 py-3.5 rounded-2xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Скасувати
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {uploading ? 'Завантаження файлу...' : saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}