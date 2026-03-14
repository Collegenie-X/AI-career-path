'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import type { HighSchoolType } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';

type SchoolTypeCardProps = {
  school: HighSchoolType;
  isExpanded: boolean;
  onToggle: () => void;
};

export function SchoolTypeCard({ school, isExpanded, onToggle }: SchoolTypeCardProps) {
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
          style={{ background: school.bgColor }}
        >
          {school.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{school.name}</span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: school.bgColor, color: school.color }}
            >
              {school.tag}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-2.5 h-2.5"
                style={{
                  fill: i < school.difficulty ? school.color : 'transparent',
                  color: i < school.difficulty ? school.color : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
            <span className="text-[12px] text-gray-400 ml-1">{HIGH_SCHOOL_LABELS.difficulty_label}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Target Universities Preview */}
      {!isExpanded && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            {school.targetUniversities.slice(0, 3).map((uni) => (
              <span
                key={uni}
                className="text-[11px] px-2 py-0.5 rounded-full text-gray-300"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {uni}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
          {/* Admission Process */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {HIGH_SCHOOL_LABELS.admission_process}
            </h4>
            <div className="space-y-2">
              {school.admissionProcess.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-2 p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="text-base flex-shrink-0">{step.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{step.title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Activities */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {HIGH_SCHOOL_LABELS.key_activities}
            </h4>
            <div className="space-y-1.5">
              {school.keyActivities.map((activity) => (
                <div key={activity.name} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-semibold text-gray-200">{activity.name}</span>
                      <span className="text-[12px] font-bold" style={{ color: school.color }}>
                        {activity.weight}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${activity.weight}%`, background: school.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {HIGH_SCHOOL_LABELS.preparation_timeline}
            </h4>
            <div className="space-y-2">
              {school.timeline.map((item) => (
                <div
                  key={item.period}
                  className="p-2.5 rounded-xl"
                  style={{
                    background: item.priority === 'critical'
                      ? `${school.bgColor}`
                      : 'rgba(255,255,255,0.04)',
                    border: item.priority === 'critical'
                      ? `1px solid ${school.color}40`
                      : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: item.priority === 'critical' ? school.color : 'rgba(255,255,255,0.1)',
                        color: item.priority === 'critical' ? '#fff' : '#9ca3af',
                      }}
                    >
                      {item.period}
                    </span>
                    {item.priority === 'critical' && (
                      <span className="text-[11px] text-yellow-400 font-semibold">⚡ 핵심 시기</span>
                    )}
                  </div>
                  <ul className="space-y-0.5">
                    {item.tasks.map((task) => (
                      <li key={task} className="text-[12px] text-gray-300 flex items-start gap-1">
                        <span className="text-gray-500 mt-0.5">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <p className="text-[12px] font-bold text-emerald-400 mb-1.5">✅ {HIGH_SCHOOL_LABELS.pros}</p>
              <ul className="space-y-1">
                {school.pros.map((pro) => (
                  <li key={pro} className="text-[12px] text-gray-300">{pro}</li>
                ))}
              </ul>
            </div>
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-[12px] font-bold text-red-400 mb-1.5">⚠️ {HIGH_SCHOOL_LABELS.cons}</p>
              <ul className="space-y-1">
                {school.cons.map((con) => (
                  <li key={con} className="text-[12px] text-gray-300">{con}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Admission Tip */}
          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <p className="text-[12px] font-bold text-yellow-400 mb-1">💡 {HIGH_SCHOOL_LABELS.admission_tip}</p>
            <p className="text-[12px] text-gray-300 leading-relaxed">{school.admissionTip}</p>
          </div>

          {/* Representative Schools */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {HIGH_SCHOOL_LABELS.representative_schools}
            </h4>
            <div className="space-y-1.5">
              {school.representativeSchools.map((repSchool) => (
                <div
                  key={repSchool.name}
                  className="flex items-center justify-between p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <p className="text-[12px] font-semibold text-white">{repSchool.name}</p>
                    <p className="text-[12px] text-gray-400">{repSchool.location} · {repSchool.specialty}</p>
                  </div>
                  <span className="text-[12px] text-gray-400">{HIGH_SCHOOL_LABELS.annual_admission_prefix}{repSchool.annualAdmission}{HIGH_SCHOOL_LABELS.annual_admission_suffix}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
