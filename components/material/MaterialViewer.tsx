'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Gamepad2, Maximize2, Minimize2 } from 'lucide-react';

interface MaterialViewerProps {
  title: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  isInteractive?: boolean | null;
  typeSlug?: string | null;
  typeName?: string | null;
}

export function MaterialViewer({
  title,
  fileUrl,
  externalUrl,
  isInteractive,
  typeSlug,
  typeName,
}: MaterialViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPdf =
    fileUrl?.toLowerCase().endsWith('.pdf') ||
    fileUrl?.includes('.pdf?') ||
    typeSlug === 'worksheet' ||
    typeSlug === 'control' ||
    typeSlug === 'notes';

  const isEmbedGame = isInteractive && (externalUrl || fileUrl);

  // 1. Інтерактивна гра або веб-вбудова
  if (isEmbedGame) {
    const gameSrc = externalUrl || fileUrl || '';
    return (
      <div
        className={`relative bg-white border border-[#E2E8F4] rounded-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none border-none'
            : 'aspect-4/3 sm:aspect-16/9 w-full shadow-sm'
        }`}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-[#0D1117]/80 backdrop-blur-xs p-1.5 rounded-xl border border-white/10 text-white text-xs">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Згорнути' : 'На весь екран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Відкрити в новій вкладці"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <iframe
          src={gameSrc}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Вбудований перегляд PDF-документа
  if (isPdf && fileUrl) {
    return (
      <div
        className={`relative bg-[#0D1117] border border-[#E2E8F4] rounded-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none'
            : 'h-[600px] sm:h-[750px] w-full shadow-sm'
        }`}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-[#0D1117]/80 backdrop-blur-xs p-1.5 rounded-xl border border-white/10 text-white text-xs">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Згорнути' : 'На весь екран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
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

  // 3. Файли презентацій (PPTX) або архівів без прямого веб-прев'ю
  return (
    <div className="w-full aspect-16/9 sm:aspect-21/9 bg-white border border-[#E2E8F4] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] border border-[#D5E2FF] flex items-center justify-center text-[#1E56FF] mb-4">
        {typeSlug === 'game' ? (
          <Gamepad2 className="w-7 h-7" />
        ) : (
          <FileText className="w-7 h-7" />
        )}
      </div>

      <h4 className="font-display font-bold text-base sm:text-lg text-[#0D1117] mb-1">
        {typeName || 'Навчальний файл'}
      </h4>
      <p className="text-xs sm:text-sm text-[#5E687E] max-w-md mb-6">
        Цей формат оптимізовано для завантаження на ваш пристрій або відкриття у відповідній програмі (PowerPoint, Word).
      </p>

      {fileUrl && (
        <a
          href={fileUrl}
          download
          className="font-display font-bold text-xs sm:text-sm px-6 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-sm"
        >
          Завантажити файл на комп&apos;ютер
        </a>
      )}
    </div>
  );
}

export default MaterialViewer;