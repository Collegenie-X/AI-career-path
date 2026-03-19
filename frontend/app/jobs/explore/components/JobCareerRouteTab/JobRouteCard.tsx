'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import type { JobCareerRoute } from '../../types';
import { JOB_ROUTE_LABELS } from '../../config';

type JobRouteCardProps = {
  job: JobCareerRoute;
  categoryColor: string;
  isExpanded: boolean;
  onToggle: () => void;
};

export function JobRouteCard({ job, categoryColor, isExpanded, onToggle }: JobRouteCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Card Header */}
      <button
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
        onClick={onToggle}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${categoryColor}20` }}
        >
          {job.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{job.name}</p>
          <p className="text-[12px] text-gray-400 truncate">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${categoryColor}20`, color: categoryColor }}
          >
            {job.salaryRange}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Recommended High Schools Preview */}
      {!isExpanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {job.recommendedHighSchoolNames.map((name) => (
            <span
              key={name}
              className="text-[11px] px-2 py-0.5 rounded-full text-gray-300"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
          {/* Career Path Timeline */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              {JOB_ROUTE_LABELS.career_path}
            </h4>
            <div className="relative pl-0.5">
              {/* Glowing vertical line */}
              <div
                className="absolute left-[18px] top-4 bottom-0 w-0.5 -translate-x-1/2"
                style={{
                  backgroundColor: categoryColor,
                  opacity: 0.5,
                  boxShadow: `0 0 8px ${categoryColor}50`,
                }}
                aria-hidden
              />
              <div className="relative space-y-0">
                {job.careerPath.map((stage, index) => (
                  <div key={stage.stage} className="relative flex gap-4">
                    {/* Left: icon on timeline */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 z-10"
                        style={{
                          background: `${categoryColor}20`,
                          borderColor: categoryColor,
                          boxShadow: `0 0 10px ${categoryColor}40`,
                        }}
                      >
                        {stage.icon}
                      </div>
                      {index < job.careerPath.length - 1 && (
                        <div
                          className="flex-1 w-0.5 min-h-6 mt-1"
                          style={{ backgroundColor: categoryColor, opacity: 0.4 }}
                        />
                      )}
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-white">{stage.stage}</span>
                        <span className="text-xs text-gray-400">{stage.period}</span>
                      </div>
                      <ul className="space-y-1">
                        {stage.tasks.map((task) => (
                          <li key={task} className="text-sm text-gray-300 leading-relaxed flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-0.5">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Universities */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {JOB_ROUTE_LABELS.recommended_universities}
            </h4>
            <div className="space-y-1.5">
              {job.recommendedUniversities.map((uni) => (
                <div
                  key={uni.name}
                  className="flex items-center justify-between p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <p className="text-[12px] font-semibold text-white">{uni.name}</p>
                    <p className="text-[12px] text-gray-400">{uni.admissionType}</p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="text-[12px]"
                        style={{ color: i < uni.difficulty ? categoryColor : 'rgba(255,255,255,0.15)' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Preparation */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {JOB_ROUTE_LABELS.key_preparation}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.keyPreparation.map((item) => (
                <span
                  key={item}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${categoryColor}15`, color: categoryColor }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Future Outlook */}
          <div
            className="p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-emerald-400 mb-0.5">{JOB_ROUTE_LABELS.future_outlook}</p>
              <p className="text-[12px] text-gray-300 leading-relaxed">{job.futureOutlook}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
