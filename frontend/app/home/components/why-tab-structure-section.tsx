'use client';

import { Home, Briefcase, Map, Rocket, ChevronDown, type LucideIcon } from 'lucide-react';
import homeContent from '@/data/home-content.json';

const WHY_STRUCTURE = homeContent.whyThisStructure;
type WhyStructureItem = (typeof WHY_STRUCTURE.items)[number];

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  briefcase: Briefcase,
  map: Map,
  rocket: Rocket,
};

/* ─── 카드 사이 애니메이션 화살표 ─── */
function AnimatedDownArrow({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <ChevronDown
          key={i}
          className="w-5 h-5 -my-1"
          style={{
            color,
            opacity: 0.3 + i * 0.25,
            animation: `arrowBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── 개별 스텝 카드 ─── */
function WhyStructureCard({
  item,
  index,
}: {
  item: WhyStructureItem;
  index: number;
}) {
  const IconComponent = ICON_MAP[item.icon] ?? Home;

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${item.color}20, rgba(255,255,255,0.03))`,
        border: `1.5px solid ${item.color}40`,
        boxShadow: `0 4px 20px ${item.color}15`,
        animation: `fadeSlideIn 0.5s ease-out ${index * 0.12}s both`,
      }}
    >
      {/* 배경 이모지 워터마크 */}
      <div
        className="absolute -right-3 -top-3 text-6xl select-none pointer-events-none"
        style={{ opacity: 0.07 }}
        aria-hidden
      >
        {item.emoji}
      </div>

      <div className="flex items-start gap-3 relative z-10">
        {/* 아이콘 + STEP 배지 */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${item.color}50, ${item.color}25)`,
              border: `1.5px solid ${item.color}60`,
              boxShadow: `0 0 16px ${item.color}40`,
              animation: `pulse-glow 2.5s ease-in-out ${index * 0.4}s infinite`,
            }}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider"
            style={{
              background: `${item.color}30`,
              color: item.color,
              border: `1px solid ${item.color}50`,
            }}
          >
            {item.badge}
          </span>
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-base">{item.emoji}</span>
            <h4
              className="text-sm font-black leading-tight"
              style={{ color: item.color }}
            >
              {item.title}
            </h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 섹션 ─── */
export function WhyTabStructureSection() {
  const { title, subtitle, items, footer } = WHY_STRUCTURE;

  return (
    <div className="px-5 mb-8">
      {/* 섹션 헤더 */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, #6C5CE7, #EC4899)' }}
          />
          <h2 className="text-lg font-black text-white tracking-wide">{title}</h2>
        </div>
        <p className="text-xs text-gray-500 pl-3">{subtitle}</p>
      </div>

      {/* 카드 + 화살표 리스트 */}
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div key={item.id}>
            <WhyStructureCard item={item} index={index} />
            {index < items.length - 1 && (
              <AnimatedDownArrow color={items[index + 1].color} />
            )}
          </div>
        ))}
      </div>

      {/* 푸터 요약 */}
      <div
        className="mt-5 rounded-2xl px-4 py-3.5 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(236,72,153,0.12))',
          border: '1.5px solid rgba(108,92,231,0.4)',
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'repeating-linear-gradient(45deg, #6C5CE7 0px, #6C5CE7 1px, transparent 1px, transparent 12px)',
          }}
          aria-hidden
        />
        <p className="text-xs font-bold text-purple-200 leading-relaxed relative z-10">
          {footer}
        </p>
      </div>

      {/* 화살표 바운스 keyframe */}
      <style jsx global>{`
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); opacity: inherit; }
          50%       { transform: translateY(4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
