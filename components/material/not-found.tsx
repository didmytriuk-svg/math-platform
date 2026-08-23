import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function MaterialNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-volya-grid px-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-[#EFF4FF] text-[#1E56FF] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <SearchX className="w-7 h-7" />
        </div>

        <h2 className="font-display font-black text-xl text-[#0D1117] mb-2">
          Матеріал не знайдено
        </h2>

        <p className="text-xs sm:text-sm text-[#5E687E] leading-relaxed mb-8">
          Можливо, цей урок було перенесено або посилання застаріло.
        </p>

        <Link
          href="/catalog"
          className="font-display font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all inline-flex items-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Повернутися в каталог
        </Link>
      </div>
    </div>
  );
}