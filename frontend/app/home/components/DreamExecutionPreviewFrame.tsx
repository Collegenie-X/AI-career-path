'use client';

import type { DreamExecutionProject } from '@/types/home-schedule-preview';

type DreamExecutionPreviewFrameProps = {
  frameLabel: string;
  project: DreamExecutionProject;
};

export function DreamExecutionPreviewFrame({ frameLabel, project }: DreamExecutionPreviewFrameProps) {
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

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[420px] scrollbar-hide p-4 space-y-3">
          {/* Category header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{project.categoryEmoji}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
              {project.categoryLabel}
            </span>
            <span className="text-[11px] text-white/40">{project.period}</span>
          </div>

          {/* Project title */}
          <p className="text-sm font-extrabold text-white leading-snug">{project.title}</p>

          {/* Output tag */}
          <div className="rounded-lg px-3 py-2 text-[11px] font-medium text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 leading-relaxed">
            {project.outputTag}
          </div>

          {/* Criteria tag */}
          <div className="rounded-lg px-3 py-2 text-[11px] font-medium text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 leading-relaxed">
            {project.criteriaTag}
          </div>

          {/* Week accordion rows */}
          <div className="space-y-3 mt-1">
            {project.weeks.map((week) => (
              <div key={week.label}>
                {/* Week header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-white/40">∨</span>
                  <span className="text-xs font-bold text-white/80">{week.label}</span>
                  <span className="text-[10px] text-white/35">({week.count}개)</span>
                </div>

                {/* Goals */}
                <div className="ml-4 space-y-2">
                  {week.goals.map((goal, gi) => (
                    <div key={gi}>
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-[10px] text-white/30 mt-0.5">•</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                            목표
                          </span>
                          <span
                            className={`text-[11px] font-semibold leading-snug ${
                              goal.done ? 'line-through text-white/30' : 'text-white/80'
                            }`}
                          >
                            {goal.text}
                          </span>
                        </div>
                      </div>

                      {/* Sub-tasks */}
                      {goal.tasks.length > 0 && (
                        <div className="ml-6 space-y-1 border-l border-white/8 pl-3">
                          {goal.tasks.map((task, ti) => (
                            <p
                              key={ti}
                              className={`text-[10px] leading-relaxed ${
                                task.done ? 'line-through text-white/25' : 'text-white/50'
                              }`}
                            >
                              • {task.text}
                            </p>
                          ))}
                        </div>
                      )}
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
