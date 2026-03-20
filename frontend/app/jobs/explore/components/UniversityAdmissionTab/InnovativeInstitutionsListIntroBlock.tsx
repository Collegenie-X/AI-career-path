'use client';

type InnovativeInstitutionsListIntroBlockProps = {
  readonly emoji: string;
  readonly title: string;
  readonly description: string;
};

/** 혁신 교육기관 마스터-디테일 왼쪽 열 상단 안내 (문구는 JSON에서 전달) */
export function InnovativeInstitutionsListIntroBlock({
  emoji,
  title,
  description,
}: InnovativeInstitutionsListIntroBlockProps) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}
