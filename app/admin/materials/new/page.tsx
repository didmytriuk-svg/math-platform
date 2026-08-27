'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, BookOpen, X, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NewMaterialPage() {
  const router = useRouter();
  const supabase = createClient();

  const [taxonomy, setTaxonomy] = useState<{
    grades: any[];
    materialTypes: any[];
  }>({
    grades: [],
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
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Файли
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        setIsLoading(true);
        const [gRes, tRes] = await Promise.all([
          supabase.from('grades').select('*').order('order'),
          supabase.from('material_types').select('*'),
        ]);

        setTaxonomy({
          grades: gRes.data || [],
          materialTypes: tRes.data || [],
        });
      } catch (err: any) {
        setErrorMsg('Помилка завантаження довідників.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTaxonomy();
  }, [supabase]);

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...chosen]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
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
      // 1. Створюємо запис матеріалу в таблиці materials (без розділів і тем)
      const { data: materialData, error: materialError } = await supabase
        .from('materials')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim() || null,
          grade_id: selectedGrade,
          material_type_id: selectedType,
          external_url: externalUrl.trim() || null,
          is_interactive: isInteractive,
          is_premium: isPremium,
          is_published: true,
        })
        .select()
        .single();

      if (materialError) throw materialError;
      const newMaterialId = materialData.id;

      // 2. Завантажуємо прикріплені файли у сховище та таблицю material_files
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileNameClean = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `documents/${fileNameClean}`;

          const { error: uploadError } = await supabase.storage
            .from('materials')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            throw new Error(`Помилка завантаження файлу ${file.name}: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filePath);

          const { error: insertFileErr } = await supabase.from('material_files').insert({
            material_id: newMaterialId,
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            file_size: file.size,
          });

          if (insertFileErr) {
            throw new Error(`Помилка збереження файлу в базі: ${insertFileErr.message}`);
          }
        }
      }

      setSuccessMsg('Матеріал успішно створено!');
      setTimeout(() => {
        router.push('/admin/materials');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка при створенні матеріалу.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження форми...
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
            Додавання матеріалу
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="mb-8 pb-6 border-b border-[#F1F4FA]">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Додати новий навчальний матеріал
            </h1>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Заповніть параметри розробки, додайте конспект та прикріпіть файли
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
                placeholder="Наприклад: Конспект уроку. Лінійні рівняння"
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
                placeholder="Короткий анонс розробки для каталогу..."
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
                placeholder="Повний текст конспекту, вказівок або завдань для вчителя..."
                className="w-full text-sm font-sans bg-white border border-[#E2E8F4] text-[#0D1117] rounded-xl p-4 outline-none focus:border-[#1E56FF] transition resize-y"
              />
            </div>

            {/* Сітка таксономії (без розділів і тем) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                  Клас *
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
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

              <div className="sm:col-span-2">
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
            </div>

            {/* Керування файлами */}
            <div className="pt-4 border-t border-[#F1F4FA] space-y-4">
              <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider">
                Прикріплені файли
              </label>

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
                    Додати файли (натисніть або перетягніть)
                  </p>
                </div>
              </div>

              {newFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#0D1117]">Обрані файли ({newFiles.length}):</p>
                  {newFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-[#E2E8F4] p-3 rounded-xl text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#1E56FF] shrink-0" />
                        <span className="truncate font-medium">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeNewFile(idx)} className="text-red-500 cursor-pointer p-1">
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
                placeholder="https://..."
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
                    Опублікування...
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