'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import schedulePreviewContent from '@/data/home-schedule-preview.json';
import type { HomeSchedulePreviewContent } from '@/types/home-schedule-preview';
import { DreamPathPreviewFrame } from './DreamPathPreviewFrame';
import { DreamExecutionPreviewFrame } from './DreamExecutionPreviewFrame';

const content = schedulePreviewContent as HomeSchedulePreviewContent;

type TabId = 'dreamPath' | 'dreamExecution';

type DescriptionColumnProps = {
  title: string;
  lead: string;
  bullets: string[];
  link: { label: string; href: string };
};

function DescriptionColumn({ title, lead, bullets, link }: DescriptionColumnProps) {
  return (
    <div className="flex flex-col justify-center">
      <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">{title}</h3>
      <p className="text-sm md:text-base text-white/55 leading-relaxed mb-5">{lead}</p>
      <ul className="space-y-3 mb-8">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-white/70">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400/90" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href={link.href}
        className="inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-bold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {link.label}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function DreamSchedulePreviewSection() {
  const { sectionHeader, dreamPath, dreamExecution } = content;
  const [activeTab, setActiveTab] = useState<TabId>('dreamPath');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'dreamPath', label: dreamPath.tabLabel },
    { id: 'dreamExecution', label: dreamExecution.tabLabel },
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-hidden border-y border-white/5">
      <StarfieldCanvas count={40} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="web-container relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-10">
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-widest mb-2">
            {sectionHeader.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{sectionHeader.title}</h2>          
        </div>

        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="min-h-[380px]">
          {activeTab === 'dreamPath' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <DescriptionColumn
                title={dreamPath.title}
                lead={dreamPath.lead}
                bullets={dreamPath.bullets}
                link={dreamPath.link}
              />
              <DreamPathPreviewFrame
                frameLabel={dreamPath.frameLabel}
                gradeSection={dreamPath.gradeSection}
              />
            </div>
          )}
          {activeTab === 'dreamExecution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <DescriptionColumn
                title={dreamExecution.title}
                lead={dreamExecution.lead}
                bullets={dreamExecution.bullets}
                link={dreamExecution.link}
              />
              <DreamExecutionPreviewFrame
                frameLabel={dreamExecution.frameLabel}
                project={dreamExecution.project}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
