'use client';

import { useState } from 'react';
import { ProcessTab } from './ProcessTab';
import { TimelineTab } from './TimelineTab';
import { DailyScheduleTab } from './DailyScheduleTab';
import { ModalHeader } from './ModalHeader';
import { ModalTabs, type ModalTab } from './ModalTabs';
import type { Job, StarData } from '../../types';

interface JobDetailModalProps {
  job: Job;
  star: StarData;
  onClose: () => void;
}

export function JobDetailModal({ job, star, onClose }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('process');

  return (
    <div className="fixed inset-0 z-50 flex justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div
        className="relative flex flex-col w-full max-w-[430px]"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        }}
      >
        {/* 고정: 제목 상단 + 탭 바만 */}
        <ModalHeader job={job} star={star} onClose={onClose} />
        <ModalTabs activeTab={activeTab} star={star} onTabChange={setActiveTab} />

        {/* 스크롤 영역: 직무 프로세스 등 탭 컨텐츠만 */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {activeTab === 'process' && (
            <ProcessTab job={job} star={star} />
          )}
          {activeTab === 'daily' && (
            <DailyScheduleTab job={job} star={star} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab job={job} star={star} />
          )}
        </div>
      </div>
    </div>
  );
}
