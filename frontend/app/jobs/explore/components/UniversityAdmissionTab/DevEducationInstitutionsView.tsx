'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

type DevEducationInstitution = {
  id: string;
  name: string;
  fullName?: string;
  emoji: string;
  color: string;
  bgColor: string;
  organizer: string;
  type: string;
  duration: string;
  admissionProcess: string;
  features: string[];
  curriculum: string[];
  targetStudents: string[];
  careerPath: string[];
  website: string;
  pros: string[];
  cons: string[];
};

type DevEducationInstitutionsViewProps = {
  institutions: DevEducationInstitution[];
};

export function DevEducationInstitutionsView({ institutions }: DevEducationInstitutionsViewProps) {
  const [selectedInstitution, setSelectedInstitution] = useState<DevEducationInstitution | null>(null);

  return (
    <div className="space-y-3">
      {/* 인트로 */}
      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">개발자 교육기관</h3>
        </div>
        <p className="text-xs text-white/70">
          대학 졸업 후 또는 대학 대신 선택할 수 있는 실전 개발자 양성 교육기관입니다.
        </p>
      </div>

      {/* 교육기관 카드 목록 */}
      <div className="space-y-2">
        {institutions.map((institution) => (
          <button
            key={institution.id}
            onClick={() => setSelectedInstitution(institution)}
            className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: institution.bgColor,
              border: `1px solid ${institution.color}40`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: institution.color + '20',
                  border: `2px solid ${institution.color}`,
                }}
              >
                {institution.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-0.5">{institution.name}</h4>
                {institution.fullName && (
                  <p className="text-xs text-white/60 mb-1">{institution.fullName}</p>
                )}
                <p className="text-xs text-white/70 mb-2">{institution.organizer}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: institution.color + '30',
                      color: 'white',
                    }}
                  >
                    {institution.type}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  >
                    {institution.duration}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* 상세 모달 */}
      {selectedInstitution && (
        <DevEducationInstitutionDetailModal
          institution={selectedInstitution}
          onClose={() => setSelectedInstitution(null)}
        />
      )}
    </div>
  );
}

function DevEducationInstitutionDetailModal({
  institution,
  onClose,
}: {
  institution: DevEducationInstitution;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum' | 'admission' | 'career'>('info');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)',
          border: `2px solid ${institution.color}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="sticky top-0 z-10 p-4"
          style={{
            background: institution.bgColor,
            borderBottom: `1px solid ${institution.color}40`,
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: institution.color + '20',
                border: `2px solid ${institution.color}`,
              }}
            >
              {institution.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1">{institution.name}</h2>
              {institution.fullName && (
                <p className="text-xs text-white/60 mb-1">{institution.fullName}</p>
              )}
              <p className="text-xs text-white/70">{institution.organizer}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="text-white">✕</span>
            </button>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'info' as const, label: '정보', emoji: '📋' },
              { id: 'curriculum' as const, label: '커리큘럼', emoji: '📚' },
              { id: 'admission' as const, label: '선발', emoji: '🎯' },
              { id: 'career' as const, label: '진로', emoji: '🚀' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab.id ? institution.color + '30' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.id ? institution.color : 'rgba(255,255,255,0.1)'}`,
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-4 space-y-3">
          {activeTab === 'info' && (
            <>
              {/* 기본 정보 */}
              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <div className="space-y-2">
                  <InfoRow label="유형" value={institution.type} />
                  <InfoRow label="교육 기간" value={institution.duration} />
                  <InfoRow label="웹사이트" value={institution.website} link />
                </div>
              </div>

              {/* 특징 */}
              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-2">주요 특징</h4>
                <div className="space-y-1.5">
                  {institution.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-white/80">
                      <span style={{ color: institution.color }}>•</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 장단점 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/30">
                  <h4 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    장점
                  </h4>
                  <div className="space-y-1">
                    {institution.pros.map((pro, index) => (
                      <p key={index} className="text-xs text-white/80">
                        ✓ {pro}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30">
                  <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    단점
                  </h4>
                  <div className="space-y-1">
                    {institution.cons.map((con, index) => (
                      <p key={index} className="text-xs text-white/80">
                        • {con}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'curriculum' && (
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-2">커리큘럼</h4>
              <div className="space-y-1.5">
                {institution.curriculum.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-white/80 p-2 rounded-lg"
                    style={{ background: institution.bgColor }}
                  >
                    <span style={{ color: institution.color }}>→</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admission' && (
            <>
              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-2">선발 과정</h4>
                <p className="text-xs text-white/80">{institution.admissionProcess}</p>
              </div>

              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-2">지원 대상</h4>
                <div className="space-y-1.5">
                  {institution.targetStudents.map((target, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-white/80">
                      <span style={{ color: institution.color }}>✓</span>
                      <span>{target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'career' && (
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-2">진로 경로</h4>
              <div className="space-y-1.5">
                {institution.careerPath.map((path, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-white/80 p-2 rounded-lg"
                    style={{ background: institution.bgColor }}
                  >
                    <span style={{ color: institution.color }}>→</span>
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-white/60 min-w-[60px]">{label}</span>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs text-white/90">{value}</span>
      )}
    </div>
  );
}
