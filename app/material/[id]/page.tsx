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
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function InlineMaterialViewer({
  title,
  fileUrl,
  externalUrl,
  isInteractive,
  typeSlug,
  typeName,
  content,
}: {
  title: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  isInteractive?: boolean | null;
  typeSlug?: string | null;
  typeName?: string | null;
  content?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);

  const targetUrl = externalUrl || fileUrl || '';
  const lowerUrl = targetUrl.toLowerCase();

  const isHtmlGame =
    Boolean(isInteractive) ||
    typeSlug === 'game' ||
    typeName?.toLowerCase().includes('гра') ||
    typeName?.toLowerCase().includes('інтерактив') ||
    lowerUrl.endsWith('.html') ||
    lowerUrl.endsWith('.htm') ||
    lowerUrl.includes('.html?') ||
    lowerUrl.includes('.htm?') ||
    (content && content.trim().startsWith('<!DOCTYPE html>'));

  const isPdf =
    !isHtmlGame &&
    (lowerUrl.endsWith('.pdf') ||
     lowerUrl.includes('.pdf?') ||
     typeSlug === 'worksheet' ||
     typeSlug === 'control' ||
     typeSlug === 'notes');

  useEffect(() => {
    if (!isHtmlGame) return;

    if (content && content.includes('<html')) {
      setHtmlContent(content);
      return;
    }

    if (fileUrl && (lowerUrl.includes('.html') || lowerUrl.includes('.htm'))) {
      setIsLoadingHtml(true);
      fetch(fileUrl)
        .then((res) => res.text())
        .then((text) => {
          setHtmlContent(text);
        })
        .catch((err) => {
          console.error('Fetch game error:', err);
        })
        .finally(() => {
          setIsLoadingHtml(false);
        });
    }
  }, [fileUrl, content, isHtmlGame, lowerUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const openInNewTab = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (htmlContent) {
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.open();
        newTab.document.write(htmlContent);
        newTab.document.close();
      }
      return;
    }

    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  if (isHtmlGame && (targetUrl || htmlContent)) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-[#0F172A] border border-[#E2E8F4] overflow-hidden transition-all duration-300 shadow-sm flex flex-col ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-none'
            : 'aspect-[4/3] sm:aspect-[16/10] w-full min-h-[520px] rounded-3xl'
        }`}
      >
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-[#0D1117]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-white text-xs shadow-xl">
          <button
            type="button"
            onClick={() => setGameKey((prev) => prev + 1)}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Перезапустити гру"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-semibold">Перезапуск</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/20 mx-1" />

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title={isFullscreen ? 'Згорнути вікно' : 'Розгорнути на весь екран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-[#38BDF8]" />}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isFullscreen ? 'Згорнути' : 'На весь екран'}
            </span>
          </button>

          <button
            type="button"
            onClick={openInNewTab}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1.5 ml-0.5 cursor-pointer text-white"
            title="Відкрити гру у новій вкладці"
          >
            <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
            <span className="hidden sm:inline text-[11px] font-semibold">В окремій вкладці</span>
          </button>
        </div>

        {isLoadingHtml ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-[#38BDF8]" />
            <span className="text-xs font-mono-math">Завантаження інтерактивної гри...</span>
          </div>
        ) : htmlContent ? (
          <iframe
            key={gameKey}
            srcDoc={htmlContent}
            title={title}
            className="w-full h-full border-0 bg-white grow"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allowFullScreen
          />
        ) : (
          <iframe
            key={gameKey}
            src={targetUrl}
            title={title}
            className="w-full h-full border-0 bg-white grow"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  if (isPdf && fileUrl) {
    return (
      <div
        className={`relative bg-[#0D1117] border border-[#E2E8F4] rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none'
            : 'h-[600px] sm:h-[780px] w-full'
        }`}
      >
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2 bg-[#0D1117]/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white text-xs">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            title={isFullscreen ? 'Згорнути' : 'На весь екран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
            title="Відкрити оригінал у новій вкладці"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <iframe
          src={`${fileUrl}#toolbar=1&navpanes=0`}
          title={title}
          className="w-full h-full border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-16/9 sm:aspect-21/9 bg-white border border-[#E2E8F4] rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] border border-[#D5E2FF] flex items-center justify-center text-[#1E56FF] mb-4">
        {typeSlug === 'game' ? <Gamepad2 className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
      </div>

      <h4 className="font-display font-bold text-base sm:text-lg text-[#0D1117] mb-1">
        {typeName || 'Навчальний файл'}
      </h4>
      <p className="text-xs sm:text-sm text-[#5E687E] max-w-md mb-6">
        Цей формат оптимізовано для завантаження на ваш пристрій.
      </p>

      {fileUrl && (
        <a
          href={fileUrl}
          download
          className="font-display font-bold text-xs sm:text-sm px-6 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs"
        >
          Завантажити файл на комп&apos;ютер
        </a>
      )}
    </div>
  );
}

function InlineActionButtons({
  files,
  externalUrl,
  title,
  isInteractive,
  typeName,
}: {
  files: any[];
  externalUrl?: string | null;
  title: string;
  isInteractive?: boolean | null;
  typeName?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Відкрити онлайн-вправу
        </a>
      )}

      {files.map((file, idx) => (
        <a
          key={file.id || idx}
          href={file.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {files.length > 1 ? `Відкрити файл ${idx + 1}` : 'Відкрити матеріал'}
        </a>
      ))}

      {files.map((file, idx) => (
        <a
          key={`dl-${file.id || idx}`}
          href={file.file_url}
          download
          className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {files.length > 1 ? `Завантажити (${file.file_name || `файл ${idx + 1}`})` : 'Завантажити файл'}
        </a>
      ))}

      <button
        type="button"
        onClick={handleShare}
        className="font-display font-bold text-xs sm:text-sm px-4 py-3 rounded-xl bg-white border border-[#E2E8F4] text-[#0D1117] hover:border-[#1E56FF] hover:text-[#1E56FF] transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-[#00BA7C]" />
            Посилання скопійовано!
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-[#5E687E]" />
            Поділитися
          </>
        )}
      </button>
    </div>
  );
}

function InlineRelatedCard({ item }: { item: any }) {
  return (
    <Link
      href={`/material/${item.id}`}
      className="group bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-5 transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          {item.grades?.name && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EFF4FF] text-[#1E56FF] font-display font-bold text-[11px]">
              {item.grades.name}
            </span>
          )}
          {item.material_types?.name && (
            <span className="text-[11px] font-mono-math text-[#5E687E]">
              {item.material_types.name}
            </span>
          )}
        </div>
        <h4 className="font-display font-bold text-sm text-[#0D1117] group-hover:text-[#1E56FF] transition-colors line-clamp-2 mb-2">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs text-[#5E687E] line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#F1F4FA] flex items-center justify-between text-xs font-display font-bold text-[#1E56FF]">
        <span>Відкрити матеріал</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();

  const [material, setMaterial] = useState<any>(null);
  const [materialFiles, setMaterialFiles] = useState<any[]>([]);
  const [gradeName, setGradeName] = useState<string | null>(null);
  const [typeName, setTypeName] = useState<string | null>(null);
  const [typeSlug, setTypeSlug] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [matRes, filesRes] = await Promise.all([
          supabase.from('materials').select('*').eq('id', id).maybeSingle(),
          supabase.from('material_files').select('*').eq('material_id', id)
        ]);

        if (matRes.error || !matRes.data) {
          setError('Матеріал не знайдено або видалено.');
          setIsLoading(false);
          return;
        }

        const mat = matRes.data;
        setMaterial(mat);
        setMaterialFiles(filesRes.data || []);

        // Перевіряємо авторизацію та активну підписку користувача
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || null);
          const { data: subData } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (subData) {
            if (!subData.expires_at || new Date(subData.expires_at) > new Date()) {
              if (subData.tier === 'pro_all' || subData.tier === 'grade_pro') {
                setHasSubscription(true);
              }
            }
          }
        }

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

  // Визначаємо, чи закритий матеріал підпискою
  const isLocked = (material.is_premium || material.access_tier === 'grade_pro' || material.access_tier === 'pro_all') && !hasSubscription;

  const formattedDate = material.created_at
    ? new Date(material.created_at).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const primaryFileUrl = materialFiles[0]?.file_url || material.file_url || null;

  return (
    <div className="min-h-screen bg-volya-grid py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Хлібні крихти */}
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

        {/* Картка опису */}
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

              {isLocked ? (
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-mono-math font-semibold text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Pro підписка
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-[#F0FDF4] text-[#00BA7C] font-mono-math font-semibold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Доступно для викладача
                </span>
              )}
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

          {!isLocked && (
            <div className="pt-6 border-t border-[#F1F4FA]">
              <InlineActionButtons
                files={materialFiles}
                externalUrl={material.external_url}
                title={material.title}
                isInteractive={material.is_interactive}
                typeName={typeName}
              />
            </div>
          )}
        </div>

        {/* БЛОК БЛОКУВАННЯ АБО РОБОЧА ОБЛАСТЬ */}
        {isLocked ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1117] to-[#1E293B] text-white text-center space-y-6 shadow-xl border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-[#1E56FF]/20 text-[#1E56FF] flex items-center justify-center mx-auto border border-[#1E56FF]/30">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-display font-black text-2xl">Цей матеріал доступний за підпискою Pro</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Отримайте необмежений доступ до повного каталогу розробок, презентацій, контрольних та інтерактивних матеріалів для уроків математики 5–11 класів.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="w-full sm:w-auto font-display font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-blue-600 transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Оформити підписку Pro
              </Link>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto font-display font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                Зв'язатися з адміністратором
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Робоча область: Гра / PDF / Список файлів */}
            {(primaryFileUrl || material.external_url || material.content) && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-display font-bold text-sm text-[#0D1117] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1E56FF]" />
                    Інтерактивна область
                  </h3>
                </div>

                <InlineMaterialViewer
                  title={material.title}
                  fileUrl={primaryFileUrl}
                  externalUrl={material.external_url}
                  isInteractive={material.is_interactive}
                  typeSlug={typeSlug}
                  typeName={typeName}
                  content={material.content}
                />
              </section>
            )}

            {/* Блок конспекту */}
            {material.content && !material.content.includes('<html') && (
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
          </>
        )}

        {/* Схожі матеріали */}
        {relatedMaterials.length > 0 && (
          <section className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-[#0D1117]">
                  Інші матеріали для {gradeName || 'цього класу'}
                </h3>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Рекомендовані розробки для уроку
                </p>
              </div>
              <Link
                href="/catalog"
                className="font-display font-bold text-xs text-[#1E56FF] hover:underline"
              >
                Усі матеріали →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMaterials.map((item: any) => (
                <InlineRelatedCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}