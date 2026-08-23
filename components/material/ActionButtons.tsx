'use client';

import { useState } from 'react';
import { Download, Share2, Check, ExternalLink } from 'lucide-react';

interface ActionButtonsProps {
  fileUrl?: string | null;
  externalUrl?: string | null;
  title: string;
}

export function ActionButtons({ fileUrl, externalUrl, title }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback до буфера обміну
      }
    }

    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {fileUrl && (
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Завантажити файл
        </a>
      )}

      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-bold text-xs sm:text-sm px-5 py-3 rounded-xl bg-[#0D1117] text-white hover:bg-[#1E56FF] transition-all shadow-xs inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Відкрити ресурс
        </a>
      )}

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

export default ActionButtons;