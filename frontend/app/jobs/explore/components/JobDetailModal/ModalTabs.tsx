'use client';

import { Briefcase, Calendar, Bot, Building2, Rocket, Sparkles } from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, StarData } from '../../types';

export type ModalTab = 'process' | 'timeline' | 'organization' | 'ai' | 'project' | 'future2032';

interface ModalTabsProps {
  activeTab: ModalTab;
  job: Job;
  star: StarData;
  onTabChange: (tab: ModalTab) => void;
}

export function ModalTabs({ activeTab, job, star, onTabChange }: ModalTabsProps) {
  const tabs = [
    { key: 'process' as const, label: LABELS.modal_process_tab, icon: Briefcase },
    { key: 'ai' as const, label: 'AI 변화', icon: Bot },
    // 2032년 현재 모습이 있는 직업만 노출
    ...(job.future2032
      ? [{ key: 'future2032' as const, label: LABELS.modal_future2032_tab, icon: Sparkles }]
      : []),
    { key: 'organization' as const, label: '조직 구조', icon: Building2 },
    { key: 'timeline' as const, label: LABELS.modal_timeline_tab, icon: Calendar },
    // 프로젝트 트랙이 있는 직업만 노출 (커리어 패스 → 프로젝트 실행 순서)
    ...(job.projectTrack?.projects?.length
      ? [{ key: 'project' as const, label: LABELS.modal_project_tab, icon: Rocket }]
      : []),
  ];

  return (
    <div
      className="flex-shrink-0 px-5 py-2.5 flex gap-1.5 overflow-x-auto"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', scrollbarWidth: 'none' }}
    >
      {tabs.map(t => {
        const Icon = t.icon;
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            className="flex-1 min-w-[62px] h-10 px-1.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold whitespace-nowrap transition-all"
            style={active
              ? { background: `linear-gradient(135deg, ${star.color}, ${star.color}bb)`, color: '#fff', boxShadow: `0 4px 12px ${star.color}55` }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
            onClick={() => onTabChange(t.key)}
          >
            <Icon className="w-3 h-3" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
