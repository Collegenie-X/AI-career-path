'use client';

import { Clock } from 'lucide-react';
import { LABELS, SCHEDULE_TYPE_COLORS, SCHEDULE_TYPE_LABELS } from '../../config';
import dailySchedulesData from '@/data/daily-schedules.json';
import type { Job, StarData, DailySchedule } from '../../types';

interface DailyScheduleTabProps {
  job: Job;
  star: StarData;
}

export function DailyScheduleTab({ job, star }: DailyScheduleTabProps) {
  const schedules = dailySchedulesData as Record<string, DailySchedule>;
  const schedule = job.dailySchedule ?? schedules[job.id];

  if (!schedule) {
    return (
      <div className="px-4 pt-8 pb-6 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🗓️</span>
        <p className="text-gray-400 text-sm text-center">{LABELS.daily_coming_soon}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-6">
      {/* Header */}
      <div
        className="rounded-2xl p-4 mb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${star.color}33, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
      >
        <div className="absolute -right-4 -top-4 text-8xl opacity-10">{job.icon}</div>
        <div className="text-white font-bold text-lg mb-1">{schedule.title}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{schedule.basis}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[38px] top-0 bottom-0 w-0.5"
          style={{ background: `linear-gradient(to bottom, ${star.color}88, ${star.color}11)` }}
        />

        <div className="space-y-2">
          {schedule.schedule.map((item, i) => {
            const typeColor = SCHEDULE_TYPE_COLORS[item.type];
            return (
              <div key={i} className="flex gap-3 items-start relative">
                {/* Time column */}
                <div className="w-[58px] flex-shrink-0 text-right">
                  <span className="text-[11px] font-bold text-gray-400 leading-none">{item.time}</span>
                </div>

                {/* Node */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 relative mt-0.5 text-sm"
                  style={{
                    background: `${typeColor}33`,
                    border: `1.5px solid ${typeColor}88`,
                    boxShadow: `0 0 8px ${typeColor}33`,
                  }}
                >
                  <span style={{ fontSize: '10px' }}>{item.icon}</span>
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl p-3 mb-1"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white text-sm font-semibold leading-tight">{item.activity}</span>
                    <span
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44` }}
                    >
                      {SCHEDULE_TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  {item.detail && (
                    <p className="text-xs text-gray-400 leading-relaxed">{item.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs text-gray-500 leading-relaxed">
          💡 {LABELS.daily_note}
        </p>
      </div>
    </div>
  );
}
