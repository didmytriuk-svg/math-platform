import Link from 'next/link';

export interface MaterialItemData {
  id: string;
  title: string;
  description?: string | null;
  preview_url?: string | null;
  grades?: { name: string } | null;
  subjects?: { name: string } | null;
  sections?: { name: string } | null;
  material_types?: { name: string } | null;
  grade?: string;
  subject?: string;
  section?: string;
  type?: string;
}

export interface MaterialCardProps {
  id?: string;
  title?: string;
  description?: string | null;
  preview_url?: string | null;
  grade?: string;
  subject?: string;
  section?: string;
  type?: string;
  material?: MaterialItemData;
}

export function MaterialCard(props: MaterialCardProps) {
  const id = props.material?.id || props.id || '';
  const title = props.material?.title || props.title || 'Навчальний матеріал';
  const description = props.material?.description || props.description;

  const gradeName = props.material?.grades?.name || props.material?.grade || props.grade;
  const sectionName = props.material?.sections?.name || props.material?.section || props.section;
  const typeName = props.material?.material_types?.name || props.material?.type || props.type || 'Матеріал';

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-[#E2E8F4] hover:border-[#1E56FF] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1E56FF]/10">
      <div>
        {/* Бейджі: Клас + Розділ + Тип матеріалу */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {gradeName && (
              <span className="px-2.5 py-1 rounded-lg bg-[#1E56FF] text-white text-xs font-display font-black">
                {gradeName}
              </span>
            )}
            {sectionName && (
              <span className="text-xs font-semibold text-[#5E687E]">
                {sectionName}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono-math font-bold px-2.5 py-1 rounded-lg bg-[#EFF4FF] text-[#1E56FF] border border-[#D5E2FF]">
            {typeName}
          </span>
        </div>

        {/* Назва матеріалу */}
        <h3 className="font-display font-bold text-lg text-[#0D1117] group-hover:text-[#1E56FF] transition-colors line-clamp-2 mb-2 leading-snug">
          {title}
        </h3>

        {/* Опис */}
        {description && (
          <p className="text-xs sm:text-sm text-[#5E687E] line-clamp-2 leading-relaxed mb-6 font-normal">
            {description}
          </p>
        )}
      </div>

      {/* Нижня панель дії */}
      <div className="pt-4 border-t border-[#F1F4FA] flex items-center justify-between mt-auto">
        <span className="text-xs font-mono-math font-semibold text-[#00BA7C] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00BA7C]" />
          Відкритий доступ
        </span>

        <Link
          href={`/material/${id}`}
          className="text-xs font-display font-bold text-[#0D1117] group-hover:text-[#1E56FF] inline-flex items-center gap-1 transition-colors"
        >
          Відкрити
          <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default MaterialCard;