'use client';

import directoryData from '@/data/university-admission/strategy-hub/recommended-activities-directory.json';

type DirectoryItem = {
  name: string;
  org: string;
  grades: string;
  url: string;
  note?: string;
  schedule2025?: string;
};

type DirectoryGroup = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  items: DirectoryItem[];
};

/** ==text== 마커를 형광펜 강조로 렌더링 */
function HL({ text }: { readonly text: string }) {
  const parts = text.split(/==(.+?)==/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm px-0.5 font-medium not-italic" style={{ background: 'rgba(250,204,21,0.12)', color: 'inherit' }}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * 봉사·캠프·수상·전시 상세 디렉토리.
 * "주요 지원 대학" 카드와 동일한 형식으로, 그룹별 항목을 누르면 일정·자격·규모 팝업이 열립니다.
 */
export function RecommendedActivitiesDirectory() {
  const intro = directoryData.intro;
  const groups = directoryData.groups as DirectoryGroup[];
  return (
    <div className="px-4 pb-6 pt-2 space-y-4">
      {/* 인트로 */}
      <div
        className="rounded-2xl p-3.5"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)', border: '1px solid rgba(129,140,248,0.35)' }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl" aria-hidden>{intro.emoji}</span>
          <h3 className="text-sm font-bold text-white">{intro.title}</h3>
        </div>
        <p className="text-xs text-white/75 leading-relaxed"><HL text={intro.description} /></p>
      </div>

      {/* 그룹별 목록 */}
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: `linear-gradient(135deg, ${group.color}1a 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${group.color}40` }}
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base" aria-hidden>{group.emoji}</span>
              <p className="text-[13px] font-bold text-white">{group.label}</p>
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: `${group.color}25`, color: group.color, border: `1px solid ${group.color}40` }}
              >
                {group.items.length}곳
              </span>
            </div>
            <span className="text-[11px] text-white/45">클릭하면 자세히 보기</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {group.items.map((item, index) => (
              <a
                key={`${group.id}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${group.color}30` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold text-white/90 leading-tight">{item.name}</span>
                    <span className="text-[10px] font-semibold px-1 py-0.5 rounded" style={{ background: `${group.color}1f`, color: group.color }}>
                      {item.grades}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                    {item.org}{item.note ? ` · ${item.note}` : ''}
                  </p>
                  {item.schedule2025 && (
                    <p className="text-[10px] text-white/40 leading-tight mt-0.5">
                      📅 {item.schedule2025}
                    </p>
                  )}
                </div>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 group-hover:underline"
                  style={{ color: group.color, background: `${group.color}15`, border: `1px solid ${group.color}40` }}
                >
                  바로가기 ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-white/40 leading-relaxed text-center px-2">
        ⚠️ 외부 기관의 일정·비용·모집 요강은 변동될 수 있어요. 참여 전 각 공식 홈페이지에서 최신 정보를 꼭 확인하세요.
      </p>

    </div>
  );
}
