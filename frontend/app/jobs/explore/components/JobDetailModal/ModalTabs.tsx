'use client';

import { Briefcase, Calendar, Sun } from 'lucide-react';
import { LABELS } from '../../config';
import type { StarData } from '../../types';

export type ModalTab = 'process' | 'timeline' | 'daily';

interface ModalTabsProps {
  activeTab: ModalTab;
  star: StarData;
  onTabChange: (tab: ModalTab) => void;
}

export function ModalTabs({ activeTab, star, onTabChange }: ModalTabsProps) {
  const tabs = [
    { key: 'process' as const, label: LABELS.modal_process_tab, icon: Briefcase },
    { key: 'daily' as const, label: LABELS.modal_daily_tab, icon: Sun },
    { key: 'timeline' as const, label: LABELS.modal_timeline_tab, icon: Calendar },
  ];

  return (
    <div
      className="flex-shrink-0 px-5 py-2.5 flex gap-1.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {tabs.map(t => {
        const Icon = t.icon;
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all"
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
