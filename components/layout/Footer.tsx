import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#CAD1E4]/60 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#191B20] text-white font-bold text-xs">
              VA
            </div>
            <p className="text-xs font-bold text-[#191B20]">
              VOLYA ACADEMY — Навчальні матеріали 5–11 класів
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <Link href="/catalog" className="hover:text-[#0F45CF]">Каталог</Link>
            <Link href="/admin" className="hover:text-[#0F45CF]">Керування</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}