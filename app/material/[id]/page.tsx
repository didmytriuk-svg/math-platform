'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Share2, 
  Check, 
  ExternalLink, 
  Loader2, 
  Gamepad2, 
  BookOpen, 
  Copy, 
  RotateCcw 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();

  const [material, setMaterial] = useState<any>(null);
  const [gradeName, setGradeName] = useState<string | null>(null);
  const [typeName, setTypeName] = useState<string | null>(null);
  const [typeSlug, setTypeSlug] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const { data: mat, error: matErr } = await supabase
          .from('materials')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (matErr || !mat) {
          setError('Матеріал не знайдено або видалено.');
          setIsLoading(false);
          return;
        }

        setMaterial(mat);

        const [gRes, tRes, sRes, topRes] = await Promise.all([
          mat.grade_id ? supabase.from('grades').select('name').eq('id', mat.grade_id).maybeSingle() : Promise.resolve({ data: null }),
          mat.material_type_id ? supabase.from('material_types').select('name, slug').eq('id', mat.material_type_id).maybeSingle() : Promise.resolve({ data: null }),
          mat.section_id ? supabase.from('sections').select('name').eq('id', mat.section_id).maybeSingle() : Promise.resolve({ data: null }),
          mat.topic_id ? supabase.from('topics').select('name').eq('id', mat.topic_id).maybeSingle() : Promise.resolve({ data: null }),
        ]);

        setGradeName(gRes.data?.name || null);
        setTypeName(tRes.data?.name || null);
        setTypeSlug(tRes.data?.slug || null);
        setSectionName(sRes.data?.name || null);
        setTopicName(topRes.data?.name || null);

        if (mat.grade_id) {
          const { data: related } = await supabase
            .from('materials')
            .select(`
              id,
              title,
              slug,
              description,
              preview_url,
              is_premium,
              grades ( name ),
              material_types ( name )
            `)
            .eq('is_published', true)
            .neq('id', mat.id)
            .eq('grade_id', mat.grade_id)
            .limit(3);

          setRelatedMaterials(related || []);
        }
      } catch (err: any) {
        setError(err.message || 'Сталася помилка при завантаженні');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, supabase]);

  const copyLessonContent = () => {
    if (!material?.content) return;
    navigator.clipboard.writeText(material.content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-volya-grid">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження матеріалу...
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-volya-grid px-4">
        <div className="max-w-md w-full bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-xl">
            !
          </div>
          <h2 className="font-display font-black text-xl text-[#0D1117] mb-2">
            Матеріал не знайдено
          </h2>
          <p className="text-xs text-[#5E687E] mb-6">
            {error || 'Не вдалося завантажити дані для цього уроку.'}
          </p>
          <Link
            href="/catalog"
            className="font-display font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Повернутися в каталог
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = material.created_at
    ? new Date(material.created_at).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-volya-grid py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-mono-math text-[#5E687E]">
          <Link href="/catalog" className="hover:text-[#1E56FF] transition-colors">
            Каталог
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />

          {gradeName && (
            <>
              <Link
                href={`/catalog?grade=${material.grade_id}`}
                className="hover:text-[#1E56FF] transition-colors"
              >
                {gradeName}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </>
          )}

          {sectionName && (
            <>
              <span className="text-[#0D1117] font-semibold">{sectionName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </>
          )}

          <span className="text-[#1E56FF] font-bold line-clamp-1">
            {topicName || material.title}
          </span>
        </nav>

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {gradeName && (
                <span className="px-3 py-1 rounded-lg bg-[#1E56FF] text-white font-display font-black text-xs">
                  {gradeName}
                </span>
              )}
              {typeName && (
                <span className="px-3 py-1 rounded-lg bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] font-mono-math font-bold text-xs">
                  {typeName}
                </span>
              )}

              <span className="px-3 py-1 rounded-lg bg-[#F0FDF4] text-[#00BA7C] font-mono-math font-semibold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Доступно для викладача
              </span>
            </div>

            {formattedDate && (
              <span className="flex items-center gap-1.5 text-xs font-mono-math text-[#5E687E]">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#0D1117] tracking-tight leading-tight">
              {material.title}
            </h1>
            {material.description && (
              <p className="mt-4 text-sm sm:text-base text-[#5E687E] leading-relaxed max-w-3xl">
                {material.description}
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-[#F1F4FA]">
            {material.file_url && (
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Відкрити матеріал / файл
              </a>
            )}
          </div>
        </div>

        {material.content && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-bold text-sm text-[#0D1117] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E56FF]" />
                Конспект та методичний план уроку
              </h3>

              <button
                type="button"
                onClick={copyLessonContent}
                className="text-xs font-display font-bold px-3 py-1.5 rounded-xl border border-[#E2E8F4] bg-white text-[#5E687E] hover:text-[#1E56FF] hover:border-[#1E56FF] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedContent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00BA7C]" />
                    Скопійовано!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Скопіювати конспект
                  </>
                )}
              </button>
            </div>

            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-10 shadow-xs">
              <div className="prose prose-slate max-w-none text-sm sm:text-base text-[#0D1117] leading-relaxed whitespace-pre-line font-sans">
                {material.content}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}