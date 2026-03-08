'use client';

import { useState } from 'react';
import { GraduationCap, Zap } from 'lucide-react';
import admissionData from '@/data/high-school-admission.json';
import type { HighSchoolAdmissionData } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';
import { SchoolTypeCard } from './SchoolTypeCard';
import { DecisionFlowCard } from './DecisionFlowCard';

const typedAdmissionData = admissionData as HighSchoolAdmissionData;

export function HighSchoolAdmissionTab() {
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'guide' | 'flow'>('guide');

  const handleToggleSchool = (schoolId: string) => {
    setExpandedSchoolId((prev) => (prev === schoolId ? null : schoolId));
  };

  const handleSelectSchoolFromFlow = (schoolId: string) => {
    setActiveSection('guide');
    setExpandedSchoolId(schoolId);
    setTimeout(() => {
      const element = document.getElementById(`school-${schoolId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Intro Banner */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(32,201,151,0.1) 100%)',
          border: '1px solid rgba(132,94,247,0.3)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">🏫</div>
          <div>
            <h2 className="text-sm font-bold text-white">{typedAdmissionData.meta.title}</h2>
            <p className="text-[11px] text-gray-300 mt-0.5">{typedAdmissionData.meta.description}</p>
          </div>
        </div>
      </div>

      {/* Section Toggle */}
      <div
        className="flex rounded-xl p-1"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => setActiveSection('guide')}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          style={{
            background: activeSection === 'guide' ? 'rgba(132,94,247,0.3)' : 'transparent',
            color: activeSection === 'guide' ? '#c084fc' : '#9ca3af',
          }}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          {HIGH_SCHOOL_LABELS.section_guide}
        </button>
        <button
          onClick={() => setActiveSection('flow')}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          style={{
            background: activeSection === 'flow' ? 'rgba(251,191,36,0.2)' : 'transparent',
            color: activeSection === 'flow' ? '#fbbf24' : '#9ca3af',
          }}
        >
          <Zap className="w-3.5 h-3.5" />
          {HIGH_SCHOOL_LABELS.section_flow}
        </button>
      </div>

      {/* Decision Flow Section */}
      {activeSection === 'flow' && (
        <DecisionFlowCard
          questions={typedAdmissionData.decisionFlowQuestions}
          schoolTypes={typedAdmissionData.schoolTypes}
          onSelectSchool={handleSelectSchoolFromFlow}
        />
      )}

      {/* School Guide Section */}
      {activeSection === 'guide' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            {HIGH_SCHOOL_LABELS.school_types_title}
          </h3>
          {typedAdmissionData.schoolTypes.map((school) => (
            <div key={school.id} id={`school-${school.id}`}>
              <SchoolTypeCard
                school={school}
                isExpanded={expandedSchoolId === school.id}
                onToggle={() => handleToggleSchool(school.id)}
              />
            </div>
          ))}

          {/* 2028 Changes Banner */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <h4 className="text-xs font-bold text-yellow-400 mb-2">
              📅 {typedAdmissionData.admissionChanges2028.title}
            </h4>
            <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
              {typedAdmissionData.admissionChanges2028.impact}
            </p>
            <div className="space-y-2">
              {typedAdmissionData.admissionChanges2028.changes.map((change) => (
                <div
                  key={change.schoolType}
                  className="flex items-start gap-2 p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: change.change2028 === '유리' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                      color: change.change2028 === '유리' ? '#10b981' : '#f59f00',
                    }}
                  >
                    {change.change2028}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-white">{change.schoolType}</p>
                    <p className="text-[10px] text-gray-400">{change.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
