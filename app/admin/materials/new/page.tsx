'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NewMaterialPage() {
  const router = useRouter();
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

  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(true);

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
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [gRes, tRes, sRes, topRes, subRes] = await Promise.all([
          supabase.from('grades').select('id, name, number').order('number'),
          supabase.from('material_types').select('id, name, slug'),
          supabase.from('sections').select('id, name, grade_id'),
          supabase.from('topics').select('id, name, section_id'),
          supabase.from('subjects').select('id, name'),
        ]);

        const data = {
          grades: gRes.data || [],
          materialTypes: tRes.data || [],
          sections: sRes.data || [],
          topics: topRes.data || [],
          subjects: subRes.data || [],
        };

        setTaxonomy(data);

        if (data.subjects?.length > 0) {
          setSelectedSubject(data.subjects[0].id);
        }
      } catch (err) {
        setErrorMsg('Не вдалося завантажити списки класів.');
      } finally {
        setIsLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
  }, [supabase]);

  const availableSections = selectedGrade
    ? taxonomy.sections.filter((s) => s.grade_id === selectedGrade)
    : taxonomy.sections;

  const availableTopics = selectedSection
    ? taxonomy.topics.filter((t) => t.section_id === selectedSection)
    : [];

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
      let uploadedFileUrl: string | null = null;

      // 1. Завантаження файлу в сховище
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Помилка сховища файлів: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        uploadedFileUrl = publicUrlData.publicUrl;
      }

      // 2. Безпечне збереження напряму через клієнт із fallback на API
      const slug = `${title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'material'}-${Date.now().toString().slice(-4)}`;

      const { error: insertError } = await supabase.from('materials').insert({
        title: title.trim(),
        slug,
        description: description.trim() || null,
        content: content.trim() || null,
        subject_id: selectedSubject || null,
        grade_id: selectedGrade,
        section_id: selectedSection || null,
        topic_id: selectedTopic || null,
        material_type_id: selectedType,
        file_url: uploadedFileUrl,
        external_url: externalUrl.trim() || null,
        is_interactive: isInteractive,
        is_published: true,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccessMsg('Матеріал успішно додано!');
      setTimeout(() => {
        router.push('/admin/materials');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Сталася помилка під час створення матеріалу.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTaxonomy) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження структури курсів...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/materials"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до списку матеріалів
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
            Вчительська панель
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="mb-8 pb-6 border-b border-[#F1F4FA]">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Додати навчальний матеріал
            </h1>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Заповніть поля, додайте конспект, файл (PDF, HTML5, PPTX) або інтерактивне посилання
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
                placeholder="Наприклад: Інтерактивний тренажер лінійних рівнянь"
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] focus:bg-white transition placeholder:text-[#94A3B8]"
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
                placeholder="Короткий опис уроку для картки..."
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl p-4 outline-none focus:border-[#1E56FF] focus:bg-white transition placeholder:text-[#94A3B8] resize-y"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-2">
              <label className="flex items-center gap-2 font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#1E56FF]" />
                Конспект уроку та методичні вказівки
              </label>
              <p className="text-[11px] text-[#5E687E]">
                Вставте текст плану заняття, формули, ключові визначення чи розв&apos;язки
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Текст конспекту уроку..."
                className="w-full text-sm font-sans bg-white border border-[#E2E8F4] text-[#0D1117] rounded-xl p-4 outline-none focus:border-[#1E56FF] transition placeholder:text-[#94A3B8] resize-y"
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
                  <option value="">-- Оберіть розділ (необов&apos;язково) --</option>
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
                  <option value="">-- Оберіть тему (необов&apos;язково) --</option>
                  {availableTopics.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F4FA]">
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Прикріплений файл (HTML, PDF, PPTX, DOCX, ZIP)
              </label>
              <div className="relative border-2 border-dashed border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-6 text-center transition-colors bg-[#F7F9FD]">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".html,.htm,.pdf,.pptx,.ppt,.docx,.doc,.zip,.png,.jpg"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  {file ? (
                    <p className="font-display font-bold text-sm text-[#1E56FF]">
                      Обрано: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  ) : (
                    <>
                      <p className="font-display font-bold text-xs sm:text-sm text-[#0D1117]">
                        Натисніть або перетягніть файл сюди
                      </p>
                      <p className="text-[11px] text-[#5E687E] mt-1">
                        HTML-ігри, PDF, PowerPoint, Word, ZIP
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                Або посилання на онлайн-вправу (LearningApps, Wordwall)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://learningapps.org/watch?v=..."
                className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] focus:bg-white transition placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="interactive-check"
                checked={isInteractive}
                onChange={(e) => setIsInteractive(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2E8F4] text-[#1E56FF] focus:ring-[#1E56FF] cursor-pointer"
              />
              <label
                htmlFor="interactive-check"
                className="text-xs font-semibold text-[#0D1117] cursor-pointer"
              >
                Це інтерактивний веб-матеріал (відкривати у вбудованому плеєрі)
              </label>
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
                    Публікація матеріалу...
                  </>
                ) : (
                  'Опублікувати матеріал'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}