import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GradeCardProps {
  gradeNumber: number;
  name: string;
  desc: string;
}

export function GradeCard({ gradeNumber, name, desc }: GradeCardProps) {
  return (
    <Link
      href={`/catalog?grade=${gradeNumber}`}
      className="group flex flex-col justify-between rounded-2xl border border-[#CAD1E4]/60 bg-white p-5 transition-all hover:border-[#0F45CF] hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F45CF] text-base font-bold text-white group-hover:bg-[#191B20] transition-colors">
          {gradeNumber}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F45CF] transition-colors" />
      </div>

      <div className="mt-6">
        <h4 className="text-base font-bold text-[#191B20]">
          {name}
        </h4>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {desc}
        </p>
      </div>
    </Link>
  );
}