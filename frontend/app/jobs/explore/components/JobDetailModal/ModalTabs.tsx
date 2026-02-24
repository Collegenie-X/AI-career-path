'use client';

import { Briefcase, Calendar } from 'lucide-react';
import { LABELS } from '../../config';
import type { StarData } from '../../types';

interface ModalTabsProps {
  activeTab: 'process' | 'timeline';
  star: StarData;
  onTabChange: (tab: 'process' | 'timeline') => void;
}

export function ModalTabs({ activeTab, star, onTabChange }: ModalTabsProps) {
  const tabs = [
    { key: 'process' as const, label: LABELS.modal_process_tab, icon: Briefcase },
    { key: 'timeline' as const, label: LABELS.modal_timeline_tab, icon: Calendar },
  ];

  return (
    <div className="flex-shrink-0 px-4 py-2.5 flex gap-2" style={{ background: 'rgba(18,18,42,0.95)' }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all"
            style={active
              ? { background: `linear-gradient(135deg, ${star.color}, ${star.color}bb)`, color: '#fff', boxShadow: `0 4px 12px ${star.color}55` }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
            onClick={() => onTabChange(t.key)}
          >
            <Icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
