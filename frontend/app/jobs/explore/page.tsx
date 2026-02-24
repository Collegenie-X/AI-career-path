'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import careerMakerData from '@/data/career-maker.json';
import {
  Sparkles, ChevronRight, ChevronLeft, Star,
  Clock, TrendingUp, ArrowRight, Play,
  BookOpen, Briefcase, X,
} from 'lucide-react';

type Kingdom = typeof careerMakerData.kingdoms[0];
type Job = Kingdom['representativeJobs'][0];

/* ─── Star Field ─── */
function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.4) % 4,
    dur: 2 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: 0.3,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Kingdom Card ─── */
function KingdomCard({ kingdom, onClick, index }: { kingdom: Kingdom; onClick: () => void; index: number }) {
  return (
    <button
      className="relative rounded-3xl overflow-hidden text-left w-full transition-all duration-300 active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${kingdom.bgColor}ee 0%, ${kingdom.bgColor}aa 100%)`,
        border: `1px solid ${kingdom.color}33`,
        boxShadow: `0 4px 20px ${kingdom.color}22`,
        animation: `slide-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={onClick}
    >
      <div className="p-4 h-44 flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div
            className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${kingdom.color}30`, color: kingdom.color, border: `1px solid ${kingdom.color}50` }}
          >
            직업 4종
          </div>
          <ChevronRight className="w-4 h-4 mt-1" style={{ color: kingdom.color }} />
        </div>
        <div className="flex flex-col items-center my-2">
          <span className="text-4xl mb-1">{kingdom.emoji}</span>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white text-base">{kingdom.name}</h3>
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: `${kingdom.color}cc` }}>
            {kingdom.description}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Job Card ─── */
function JobCard({ job, color, onClick }: { job: Job; color: string; onClick: () => void }) {
  return (
    <button
      className="w-full glass-card p-4 flex items-center gap-3 text-left transition-all active:scale-95"
      onClick={onClick}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)`, boxShadow: `0 4px 12px ${color}33` }}
      >
        {job.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white">{job.name}</div>
        <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{job.description}</div>
      </div>
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
          <Play className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[9px] font-semibold" style={{ color }}>체험</span>
      </div>
    </button>
  );
}

/* ─── Day In Life Modal ─── */
function DayInLifeModal({ job, kingdom, onClose }: { job: Job; kingdom: Kingdom; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const schedule = job.dayInLife;
  const current = schedule[step];
  const isLast = step === schedule.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{job.icon}</span>
            <div>
              <div className="font-bold text-white">{job.name} 하루 체험</div>
              <div className="text-xs text-gray-400">{kingdom.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 mb-4">
          <div className="flex gap-1.5 mb-1">
            {schedule.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i <= step ? kingdom.color : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500">{step + 1} / {schedule.length} 장면</div>
        </div>

        {/* Scene Card */}
        <div className="px-5 mb-4">
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${kingdom.color}22, ${kingdom.color}11)`, border: `1px solid ${kingdom.color}33` }}
          >
            <div className="absolute top-3 right-3 text-4xl opacity-20">{current.emoji}</div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ backgroundColor: `${kingdom.color}33`, color: kingdom.color }}
            >
              ⏰ {current.time}
            </div>
            <p className="text-white font-semibold text-base leading-relaxed">{current.activity}</p>
          </div>
        </div>

        {/* Job Info — show on last step */}
        {isLast && (
          <div className="px-5 mb-4 space-y-3">
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>연봉 범위</span>
              </div>
              <div className="text-white font-bold">{job.salaryRange}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>입직 경로</span>
              </div>
              <div className="text-white text-sm">{job.entryPath}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>핵심 역량</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: `${kingdom.color}22`, color: kingdom.color }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="px-5 pb-8 flex gap-3">
          {step > 0 && (
            <button
              className="flex-1 h-12 rounded-xl glass flex items-center justify-center gap-2 text-sm font-semibold text-white"
              onClick={() => setStep(s => s - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
          )}
          {!isLast ? (
            <button
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${kingdom.color}, ${kingdom.color}aa)` }}
              onClick={() => setStep(s => s + 1)}
            >
              다음 장면
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${kingdom.color}, ${kingdom.color}aa)` }}
              onClick={onClose}
            >
              체험 완료 ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function JobsExplorePage() {
  const router = useRouter();
  const [selectedKingdom, setSelectedKingdom] = useState<Kingdom | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const kingdoms = careerMakerData.kingdoms;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <StarField />

      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(26,26,46,0.9)' }}
      >
        <div className="flex items-center gap-3">
          {selectedKingdom && (
            <button
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"
              onClick={() => setSelectedKingdom(null)}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="flex-1">
            <h1
              className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
            >
              {selectedKingdom ? `${selectedKingdom.emoji} ${selectedKingdom.name}` : 'Job 간접 경험'}
            </h1>
            <p className="text-xs text-gray-400">
              {selectedKingdom
                ? '4개 대표 직업을 하루 체험해보세요'
                : '8개 왕국의 직업 세계를 탐험하세요'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 py-5 space-y-4">
        {!selectedKingdom ? (
          <>
            {/* Intro Banner */}
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.25) 0%, rgba(59,130,246,0.15) 100%)',
                border: '1px solid rgba(108,92,231,0.3)',
              }}
            >
              <div className="absolute top-2 right-3 text-5xl opacity-10">🌌</div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">하루 직업 체험</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                원하는 <span className="text-white font-bold">왕국</span>을 선택하고, <span className="text-white font-bold">4개 직업</span> 중 하나를 골라
                실제 하루 일과를 간접 체험해보세요!
              </p>
            </div>

            {/* Kingdom Grid */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">8개 왕국 선택</h2>
              <div className="grid grid-cols-2 gap-3">
                {kingdoms.map((k, i) => (
                  <KingdomCard key={k.id} kingdom={k} index={i} onClick={() => setSelectedKingdom(k)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Kingdom Info */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${selectedKingdom.bgColor}ee, ${selectedKingdom.bgColor}88)`,
                border: `1px solid ${selectedKingdom.color}33`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedKingdom.emoji}</span>
                <div>
                  <div className="font-bold text-white text-lg">{selectedKingdom.name}</div>
                  <div className="text-sm mt-0.5" style={{ color: `${selectedKingdom.color}cc` }}>
                    {selectedKingdom.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                4개 대표 직업 — 하루 체험
              </h2>
              <div className="space-y-3">
                {selectedKingdom.representativeJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    color={selectedKingdom.color}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </div>

            {/* Career Path CTA */}
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.1))', border: '1px solid rgba(108,92,231,0.3)' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">커리어 패스 만들기</div>
                <div className="text-xs text-gray-400">이 왕국 직업의 활동·수상 계획 세우기</div>
              </div>
              <button
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
                onClick={() => router.push(`/career?kingdom=${selectedKingdom.id}`)}
              >
                시작
              </button>
            </div>
          </>
        )}
      </div>

      {/* Day In Life Modal */}
      {selectedJob && selectedKingdom && (
        <DayInLifeModal
          job={selectedJob}
          kingdom={selectedKingdom}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <TabBar />
    </div>
  );
}
