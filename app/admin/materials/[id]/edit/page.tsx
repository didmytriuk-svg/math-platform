'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, BookOpen, X, FileText, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();

  const [taxonomy, setTaxonomy] = useState<{
    subjects: any[];
    grades: any[];
    sections: any[];
    topics: any[];
    materialTypes: any[];
  }>({
    subjects: [],
    grades: [],
    sections: [],
    topics: [],
    materialTypes: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Форма стану
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Файли
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const [gRes, tRes, sRes, topRes, subRes, matRes, filesRes] = await Promise.all([
          supabase.from('grades').select('id, name, number').order('number'),
          supabase.from('material_types').select('id, name, slug'),
          supabase.from('sections').select('id, name, grade_id'),
          supabase.from('topics').select('id, name, section_id'),
          supabase.from('subjects').select('id, name'),
          supabase.from('materials').select('*').eq('id', id).single(),
          supabase.from('material_files').select('*').eq('material_id', id),
        ]);

        if (matRes.error || !matRes.data) {
          throw new Error('Матеріал не знайдено.');
        }

        const mat = matRes.data;
        setTitle(mat.title || '');
        setDescription(mat.description || '');
        setContent(mat.content || '');
        setSelectedSubject(mat.subject_id || '');
        setSelectedGrade(mat.grade_id || '');
        setSelectedSection(mat.section_id || '');
        setSelectedTopic(mat.topic_id || '');
        setSelectedType(mat.material_type_id || '');
        setExternalUrl(mat.external_url || '');
        setIsInteractive(Boolean(mat.is_interactive));
        setIsPremium(Boolean(mat.is_premium));

        setExistingFiles(filesRes.data || []);

        setTaxonomy({
          grades: gRes.data || [],
          materialTypes: tRes.data || [],
          sections: sRes.data || [],
          topics: topRes.data || [],
          subjects: subRes.data || [],
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Помилка завантаження даних матеріалу.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, supabase]);

  const availableSections = selectedGrade
    ? taxonomy.sections.filter((s) => s.grade_id === selectedGrade)
    : taxonomy.sections;

  const availableTopics = selectedSection
    ? taxonomy.topics.filter((t) => t.section_id === selectedSection)
    : [];

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...chosen]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingFile = async (fileId: string) => {
    try {
      const { error } = await supabase.from('material_files').delete().eq('id', fileId);
      if (error) throw error;
      setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err: any) {
      alert(`Не вдалося видалити файл: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Вкажіть назву матеріалу.');
      return;
    }
    if (!selectedGrade) {
      setErrorMsg('Оберіть клас.');
      return;
    }
    if (!selectedType) {
      setErrorMsg('Оберіть тип матеріалу.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Оновлюємо основний запис матеріалу
      const { error: updateError } = await supabase
        .from('materials')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim() || null,
          subject_id: selectedSubject || null,
          grade_id: selectedGrade,
          section_id: selectedSection || null,
          topic_id: selectedTopic || null,
          material_type_id: selectedType,
          external_url: externalUrl.trim() || null,
          is_interactive: isInteractive,
          is_premium: isPremium,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. Завантажуємо нові додані файли
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileNameClean = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `documents/${fileNameClean}`;

          const { error: uploadError } = await supabase.storage
            .from('materials')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadError) continue;

          const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filePath);

          await supabase.from('material_files').insert({
            material_id: id,
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            file_size: file.size,
          });
        }
      }

      setSuccessMsg('Матеріал успішно оновлено!');
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка при збереженні змін.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження даних матеріалу...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до адмін-панелі
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
            Редагування матеріалу
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="mb-8 pb-6 border-b border-[#F1F4FA]">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Редагувати навчальний матеріал
            </h1>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Змініть параметри, конспект, керуйте файлами або оновіть преміум-доступ
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#00BA7C]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Назва матеріалу *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] focus:bg-white transition"
                required
              />
            </div>

            <div>
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Короткий опис
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl p-4 outline-none focus:border-[#1E56FF] focus:bg-white transition resize-y"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-2">
              <label className="flex items-center gap-2 font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#1E56FF]" />
                Конспект уроку та методичні вказівки
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full text-sm font-sans bg-white border border-[#E2E8F4] text-[#0D1117] rounded-xl p-4 outline-none focus:border-[#1E56FF] transition resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Клас *
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedSection('');
                    setSelectedTopic('');
                  }}
                  className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
                  required
                >
                  <option value="">-- Оберіть клас --</option>
                  {taxonomy.grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Тип матеріалу *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer font-medium"
                  required
                >
                  <option value="">-- Оберіть тип --</option>
                  {taxonomy.materialTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Розділ
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setSelectedTopic('');
                  }}
                  disabled={!selectedGrade}
                  className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer font-medium disabled:opacity-50"
                >
                  <option value="">-- Оберіть розділ --</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Тема
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={!selectedSection}
                  className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] cursor-pointer font-medium disabled:opacity-50"
                >
                  <option value="">-- Оберіть тему --</option>
                  {availableTopics.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Керування файлами */}
            <div className="pt-4 border-t border-[#F1F4FA] space-y-4">
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider">
                Прикріплені файли
              </label>

              {/* Наявні файли в базі */}
              {existingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#5E687E]">Вже завантажені файли:</p>
                  {existingFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between bg-slate-50 border border-[#E2E8F4] p-3 rounded-xl text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#1E56FF] shrink-0" />
                        <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-[#1E56FF] hover:underline">
                          {f.file_name || 'Файл документа'}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteExistingFile(f.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer flex items-center gap-1"
                        title="Видалити файл"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Завантаження нових файлів */}
              <div className="relative border-2 border-dashed border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-6 text-center transition-colors bg-[#F7F9FD]">
                <input
                  type="file"
                  multiple
                  onChange={handleNewFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".html,.htm,.pdf,.pptx,.ppt,.docx,.doc,.zip,.png,.jpg"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-display font-bold text-xs sm:text-sm text-[#0D1117]">
                    Додати нові файли (натисніть або перетягніть)
                  </p>
                </div>
              </div>

              {newFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#0D1117]">Нові файли до завантаження ({newFiles.length}):</p>
                  {newFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-[#E2E8F4] p-3 rounded-xl text-xs">
                      <span className="truncate font-medium">{f.name}</span>
                      <button type="button" onClick={() => removeNewFile(idx)} className="text-red-500 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Посилання на онлайн-вправу (LearningApps, Wordwall тощо)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] transition"
              />
            </div>

            {/* Чекбокси */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="interactive-check"
                  checked={isInteractive}
                  onChange={(e) => setIsInteractive(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F4] text-[#1E56FF] cursor-pointer"
                />
                <label htmlFor="interactive-check" className="text-xs font-semibold text-[#0D1117] cursor-pointer">
                  Це інтерактивний веб-матеріал
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="premium-check"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F4] text-amber-600 cursor-pointer"
                />
                <label htmlFor="premium-check" className="text-xs font-semibold text-[#0D1117] cursor-pointer">
                  Зробити матеріал преміальним (доступ за підпискою)
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F1F4FA] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="font-display font-bold text-sm px-8 py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] disabled:opacity-50 transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Збереження змін...
                  </>
                ) : (
                  'Зберегти зміни'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}