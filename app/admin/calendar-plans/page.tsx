'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  FileText, 
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminCalendarPlansPage() {
  const supabase = createClient();

  const [plans, setPlans] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Форма додавання нового плану
  const [title, setTitle] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, gradesRes] = await Promise.all([
        supabase
          .from('calendar_plans')
          .select('*, grades(name)')
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('*').order('order', { ascending: true })
      ]);

      setPlans(plansRes.data || []);
      setGrades(gradesRes.data || []);
      if (gradesRes.data && gradesRes.data.length > 0) {
        setGradeId(gradesRes.data[0].id);
      }
    } catch (err) {
      console.error('Error loading calendar plans data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Введіть назву календарного плану.');
      return;
    }

    if (!gradeId) {
      setErrorMsg('Оберіть клас.');
      return;
    }

    if (!file) {
      setErrorMsg('Будь ласка, оберіть файл (.docx або .pdf).');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Завантаження файлу у сховище...');

    try {
      const fileExt = file.name.split('.').pop();
      const randomString = Math.random().toString(36).substring(2, 7);
      const fileName = `ktp_${Date.now()}_${randomString}.${fileExt}`;
      const filePath = `calendar-plans/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      setUploadProgress('Збереження даних у базу...');

      const { error: dbError } = await supabase
        .from('calendar_plans')
        .insert({
          title: title.trim(),
          grade_id: gradeId,
          description: description.trim() || null,
          file_url: fileUrl,
          is_published: true,
        });

      if (dbError) throw dbError;

      setSuccessMsg('Календарний план успішно додано!');
      setTitle('');
      setDescription('');
      setFile(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка при завантаженні плану.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей календарний план?')) return;

    const { error } = await supabase
      .from('calendar_plans')
      .delete()
      .eq('id', id);

    if (!error) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Помилка видалення: ' + error.message);
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
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
            Управління КТП
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Форма додавання нового КТП */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="border-b border-[#F1F4FA] pb-3">
                <h2 className="font-display font-black text-lg text-[#0D1117]">
                  Додати новий план
                </h2>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Завантажте КТП для конкретного класу
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#00BA7C] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-1.5">
                    Назва плану *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Алгебра і геометрія (3 год/тиждень)"
                    className="w-full text-xs sm:text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1E56FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-1.5">
                    Клас *
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1E56FF] cursor-pointer"
                    required
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-1.5">
                    Опис / Примітки
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Відповідно до модельної програми..."
                    rows={3}
                    className="w-full text-xs sm:text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl p-3 outline-none focus:border-[#1E56FF] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-1.5">
                    Файл плану (.docx / .pdf) *
                  </label>
                  <div className="border-2 border-dashed border-[#E2E8F4] hover:border-[#1E56FF] rounded-xl p-4 text-center bg-[#F7F9FD] transition relative cursor-pointer">
                    <input
                      type="file"
                      accept=".docx,.pdf,.doc"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <div className="flex flex-col items-center gap-1.5 text-xs text-[#5E687E]">
                      <UploadCloud className="w-6 h-6 text-[#1E56FF]" />
                      <span className="font-bold text-[#0D1117]">
                        {file ? file.name : 'Оберіть файл або перетягніть сюди'}
                      </span>
                      <span className="text-[10px]">DOCX, PDF до 20MB</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-display font-bold text-xs py-3 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploadProgress || 'Збереження...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Опублікувати план
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Список завантажених КТП */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#F1F4FA] pb-4">
                <h3 className="font-display font-black text-xl text-[#0D1117]">
                  Завантажені календарні плани ({plans.length})
                </h3>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Усі календарно-тематичні плани, доступні на платформі
                </p>
              </div>

              {isLoading ? (
                <div className="py-12 flex items-center justify-center text-[#5E687E]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
                </div>
              ) : plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-[#1E56FF] text-white font-mono font-bold text-[10px]">
                            {plan.grades?.name || 'Клас'}
                          </span>
                          <span className="text-[10px] text-[#5E687E]">
                            {new Date(plan.created_at).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-[#0D1117]">
                          {plan.title}
                        </h4>
                        {plan.description && (
                          <p className="text-xs text-[#5E687E] line-clamp-1">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={plan.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F4] text-[#1E56FF] hover:bg-[#EFF4FF] font-display font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Файл
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5E687E] py-12 text-center italic">
                  Календарних планів поки що немає. Завантажте перший план через форму зліва.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}