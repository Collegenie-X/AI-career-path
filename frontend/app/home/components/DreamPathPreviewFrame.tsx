'use client';

import type { DreamPathGradeSection } from '@/types/home-schedule-preview';

const MAX_STARS = 5;

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: MAX_STARS }).map((_, i) => (
        <span key={i} className={`text-[10px] ${i < stars ? 'text-amber-300' : 'text-white/20'}`}>
          ★
        </span>
      ))}
    </span>
  );
}

type DreamPathPreviewFrameProps = {
  frameLabel: string;
  gradeSection: DreamPathGradeSection;
};

export function DreamPathPreviewFrame({ frameLabel, gradeSection }: DreamPathPreviewFrameProps) {
  return (
    <div className="relative w-full" aria-hidden>
      {/* Window chrome */}
      <div className="rounded-2xl border border-white/12 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_28px_80px_rgba(0,0,0,0.6)] bg-[#0d0d1a]">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-white/8 bg-[#111122]">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          </span>
          <span className="text-[11px] font-medium text-white/40 ml-1 truncate">{frameLabel}</span>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[420px] scrollbar-hide p-4 space-y-1">
          {/* Grade header row */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
              style={{ background: gradeSection.gradeColor }}
            >
              {gradeSection.grade}
            </div>
            <span className="text-sm font-bold text-white">{gradeSection.grade === '중1' ? '중학교 1학년' : gradeSection.grade}</span>
          </div>

          {/* Vertical connector line + groups */}
          <div className="ml-5 border-l border-white/10 pl-5 space-y-4">
            {gradeSection.groups.map((group) => (
              <div key={group.title}>
                {/* Group header */}
                <div className="flex items-center justify-between mb-2 py-1.5 px-3 rounded-lg bg-white/[0.04] border border-white/8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{group.icon}</span>
                    <span className="text-xs font-bold text-white/85">{group.title}</span>
                  </div>
                  <span className="text-[10px] text-white/40">{group.count}개 ∧</span>
                </div>

                {/* Activity cards */}
                <div className="space-y-2 ml-2">
                  {group.activities.map((activity) => (
                    <div
                      key={activity.title}
                      className="rounded-xl border border-white/8 bg-[#111827]/80 p-3"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="text-base shrink-0 mt-0.5">{activity.icon}</span>
                        <p className="text-xs font-bold text-white leading-snug">{activity.title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 ml-6">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-white/45">🗓 {activity.month}</span>
                        <span className="text-[10px] text-white/45">{activity.cost}</span>
                        <StarRating stars={activity.stars} />
                      </div>
                      <div className="ml-6 space-y-0.5">
                        <p className="text-[10px] text-white/40">🏫 {activity.place}</p>
                        <p className="text-[10px] text-white/55 leading-relaxed">{activity.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0d0d1a] to-transparent rounded-b-2xl" />
      </div>
    </div>
  );
}
