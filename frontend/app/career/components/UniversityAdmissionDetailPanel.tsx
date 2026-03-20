'use client';

import { X, CheckCircle2, AlertCircle, BookOpen, Calendar, Target, Users, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UniversityAdmissionCategory } from './UniversityAdmissionList';

interface PreparationGuideItem {
  title: string;
  description: string;
  timeline: string;
  actions: string[];
}

interface ProjectBasedInfo {
  title: string;
  reasons: string[];
  examples: Array<{
    field: string;
    project: string;
    outcome: string;
  }>;
}

interface Major2028Change {
  change: string;
  impact: string;
  strategy: string;
}

interface UniversityAdmissionDetailPanelProps {
  category: UniversityAdmissionCategory & {
    preparationGuide?: {
      essential?: PreparationGuideItem[];
      projectBased?: ProjectBasedInfo;
      major2028Changes?: Major2028Change[];
    };
    cautions?: string[];
    universities?: string[];
  };
  onClose: () => void;
}

export function UniversityAdmissionDetailPanel({
  category,
  onClose,
}: UniversityAdmissionDetailPanelProps) {
  return (
    <div
      className="rounded-none border h-full flex flex-col overflow-hidden"
      style={{
        borderColor: 'rgba(255,255,255,0.12)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        boxShadow:
          '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: category.bgColor,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              backgroundColor: `${category.color}30`,
            }}
          >
            <span>{category.emoji}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {category.name}
              {category.shortName && (
                <span
                  className="text-sm font-semibold px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${category.color}40`,
                    color: category.color,
                  }}
                >
                  {category.shortName}
                </span>
              )}
            </h2>
            <p className="text-sm text-white/70">{category.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Key Features */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5" style={{ color: category.color }} />
            <h3 className="text-lg font-bold text-white">핵심 특징</h3>
          </div>
          <div className="space-y-2">
            {category.keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: category.color }}
                />
                <p className="text-sm text-white/90">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Students */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5" style={{ color: category.color }} />
            <h3 className="text-lg font-bold text-white">이런 학생에게 추천</h3>
          </div>
          <div className="space-y-2">
            {category.targetStudents.map((student, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: category.color }}
                />
                <p className="text-sm text-white/90">{student}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preparation Guide */}
        {category.preparationGuide?.essential && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" style={{ color: category.color }} />
              <h3 className="text-lg font-bold text-white">필수 준비 사항</h3>
            </div>
            <div className="space-y-4">
              {category.preparationGuide.essential.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border"
                  style={{
                    borderColor: `${category.color}30`,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {item.timeline}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mb-3">
                    {item.description}
                  </p>
                  <div className="space-y-1.5">
                    {item.actions.map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span
                          className="text-xs font-bold mt-0.5"
                          style={{ color: category.color }}
                        >
                          •
                        </span>
                        <span className="text-white/80">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project Based Learning */}
        {category.preparationGuide?.projectBased && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb
                className="w-5 h-5"
                style={{ color: category.color }}
              />
              <h3 className="text-lg font-bold text-white">
                {category.preparationGuide.projectBased.title}
              </h3>
            </div>
            <div className="space-y-3">
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <h4 className="font-semibold text-white mb-2">
                  왜 프로젝트 기반 준비가 중요한가?
                </h4>
                <ul className="space-y-2">
                  {category.preparationGuide.projectBased.reasons.map(
                    (reason, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-white/80"
                      >
                        <span
                          className="text-xs mt-1"
                          style={{ color: category.color }}
                        >
                          ✓
                        </span>
                        <span>{reason}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="grid gap-3">
                {category.preparationGuide.projectBased.examples.map(
                  (example, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border"
                      style={{
                        borderColor: `${category.color}20`,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${category.color}30`,
                            color: category.color,
                          }}
                        >
                          {example.field}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">
                        {example.project}
                      </p>
                      <p className="text-xs text-white/70">{example.outcome}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2028 Changes */}
        {category.preparationGuide?.major2028Changes && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle
                className="w-5 h-5"
                style={{ color: category.color }}
              />
              <h3 className="text-lg font-bold text-white">
                2028 대입 제도 변화
              </h3>
            </div>
            <div className="space-y-3">
              {category.preparationGuide.major2028Changes.map(
                (change, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border"
                    style={{
                      borderColor: `${category.color}30`,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="mb-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        변화
                      </span>
                      <p className="text-sm font-semibold text-white mt-2">
                        {change.change}
                      </p>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-bold text-white/60">
                        영향
                      </span>
                      <p className="text-sm text-white/80 mt-1">
                        {change.impact}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white/60">
                        대응 전략
                      </span>
                      <p className="text-sm text-white/80 mt-1">
                        {change.strategy}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Cautions */}
        {category.cautions && category.cautions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle
                className="w-5 h-5"
                style={{ color: '#ef4444' }}
              />
              <h3 className="text-lg font-bold text-white">주의사항</h3>
            </div>
            <div
              className="p-4 rounded-xl border"
              style={{
                borderColor: 'rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.05)',
              }}
            >
              <ul className="space-y-2">
                {category.cautions.map((caution, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-white/90"
                  >
                    <span className="text-red-400 mt-1">⚠️</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Universities */}
        {category.universities && category.universities.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" style={{ color: category.color }} />
              <h3 className="text-lg font-bold text-white">주요 대학 전형</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.universities.map((university, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                    border: `1px solid ${category.color}40`,
                  }}
                >
                  {university}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
