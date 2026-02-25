'use client';

import { useState, useMemo } from 'react';
import {
  Heart, Users, ChevronRight,
  Sparkles, Plus, BookOpen, Star, Globe,
} from 'lucide-react';
import { ITEM_TYPES } from '../config';
import templates from '@/data/career-path-templates.json';
import { CareerPathDetailDialog } from './CareerPathDetailDialog';
import type { CareerPlan } from './CareerPathBuilder';

type Template = typeof templates[0];

type CareerPathListProps = {
  onUseTemplate: (template: Template) => void;
  onNewPath: () => void;
  myPublicPlans?: CareerPlan[];
  onViewMyPlan?: (plan: CareerPlan) => void;
};

const STAR_FILTERS = [
  { id: 'all',         label: '전체', emoji: '✨' },
  { id: 'explore',    label: '탐구',  emoji: '🔬' },
  { id: 'create',     label: '창작',  emoji: '🎨' },
  { id: 'tech',       label: '기술',  emoji: '💻' },
  { id: 'nature',     label: '자연',  emoji: '🌱' },
  { id: 'connect',    label: '연결',  emoji: '🤝' },
  { id: 'order',      label: '질서',  emoji: '⚖️' },
  { id: 'communicate',label: '소통',  emoji: '📡' },
  { id: 'challenge',  label: '도전',  emoji: '🚀' },
];

/* ─── Accordion card ─── */
function TemplateRow({ template, onUse, onShowDetail }: { 
  template: Template; 
  onUse: () => void;
  onShowDetail: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(template.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLocalLikes(n => liked ? n - 1 : n + 1);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        border: `1px solid ${template.starColor}18`,
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
      onClick={onShowDetail}
    >
      <div className="w-full flex items-center gap-3 px-4 py-3.5">
        {/* Job emoji */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${template.starColor}28, ${template.starColor}10)`,
            border: `1px solid ${template.starColor}30`,
          }}
        >
          {template.jobEmoji}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug line-clamp-1">{template.title}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-gray-400">{template.starEmoji} {template.starName}</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">{template.totalItems}개</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">{template.years.length}학년</span>
            {template.authorType === 'official' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#6C5CE720', color: '#a78bfa' }}>공식</span>
            )}
          </div>
        </div>

        {/* Right side: like + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
            style={liked ? { color: '#FF6477' } : { color: '#555570' }}
          >
            <Heart className="w-3.5 h-3.5" fill={liked ? '#FF6477' : 'none'} />
            <span className="text-[10px] font-semibold">{localLikes}</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}

/* ─── My public plan card ─── */
function MyPublicPlanCard({ plan, onClick }: { plan: CareerPlan; onClick: () => void }) {
  const totalItems = plan.years.reduce((s, y) => s + y.items.length + (y.groups ?? []).reduce((gs, g) => gs + g.items.length, 0), 0);
  const sharedDate = plan.sharedAt
    ? new Date(plan.sharedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99]"
      style={{
        border: `1px solid ${plan.starColor}30`,
        background: `linear-gradient(135deg, ${plan.starColor}12, ${plan.starColor}06)`,
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${plan.starColor}28, ${plan.starColor}10)`,
            border: `1px solid ${plan.starColor}30`,
          }}
        >
          {plan.jobEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug line-clamp-1">{plan.title}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-gray-400">{plan.starEmoji} {plan.starName}</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">{plan.years.length}학년 · {totalItems}개</span>
            {sharedDate && (
              <>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-500">{sharedDate} 공개</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <Globe style={{ width: 9, height: 9 }} />공개중
          </span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main list ─── */
export function CareerPathList({ onUseTemplate, onNewPath, myPublicPlans, onViewMyPlan }: CareerPathListProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    return activeFilter === 'all'
      ? templates
      : templates.filter(t => t.starId === activeFilter);
  }, [activeFilter]);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      {/* Extra bottom padding so fixed button doesn't cover last card */}
      <div className="space-y-4 pb-24">

      {/* ── Hero header ── */}
      <div
        className="relative rounded-3xl overflow-hidden px-5 py-6"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)',
          border: '1.5px solid rgba(108,92,231,0.35)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
            <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>커리어 패스 탐색</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-1.5">
            나의 진로 로드맵,<br />
            <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              여기서 찾아보세요
            </span>
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            다양한 직업의 커리어 패스를 참고하거나<br />나만의 패스를 직접 만들어 보세요.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(108,92,231,0.25)' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <div className="text-sm font-black text-white">{templates.length}</div>
                <div className="text-[9px] text-gray-500 -mt-0.5">커리어 패스</div>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
                <Star className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-black text-white">8</div>
                <div className="text-[9px] text-gray-500 -mt-0.5">왕국</div>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34,197,94,0.18)' }}>
                <Users className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-black text-white">
                  {templates.reduce((s, t) => s + t.uses, 0).toLocaleString()}
                </div>
                <div className="text-[9px] text-gray-500 -mt-0.5">총 사용</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kingdom filter chips ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {STAR_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={activeFilter === f.id
              ? { backgroundColor: '#6C5CE7', color: '#fff', boxShadow: '0 0 10px #6C5CE755' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* ── 내가 공유한 패스 섹션 ── */}
      {(myPublicPlans ?? []).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
            <span className="text-xs font-bold text-white">내가 공유한 패스</span>
            <span className="text-[10px] text-gray-500">{(myPublicPlans ?? []).length}개 공개중</span>
          </div>
          {(myPublicPlans ?? []).map(plan => (
            <MyPublicPlanCard
              key={plan.id}
              plan={plan}
              onClick={() => onViewMyPlan?.(plan)}
            />
          ))}
          <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>
      )}

      {/* ── Count line ── */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold text-gray-400">
          {filtered.length}개 커리어 패스
        </span>
        <span className="text-[10px] text-gray-600">탭해서 펼쳐보기</span>
      </div>

        {/* ── Accordion list ── */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">해당 왕국의 커리어 패스가 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(template => (
              <TemplateRow
                key={template.id}
                template={template}
                onUse={() => onUseTemplate(template)}
                onShowDetail={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedTemplate && (
        <CareerPathDetailDialog
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </>
  );
}
