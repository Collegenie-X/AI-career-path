'use client';

import { useState, useRef } from 'react';
import { ProcessTab } from './ProcessTab';
import { TimelineTab } from './TimelineTab';
import { DailyScheduleTab } from './DailyScheduleTab';
import { ModalHeader } from './ModalHeader';
import { ModalTabs, type ModalTab } from './ModalTabs';
import { JobHeroBanner } from './JobHeroBanner';
import type { Job, StarData } from '../../types';

interface JobDetailModalProps {
  job: Job;
  star: StarData;
  onClose: () => void;
}

export function JobDetailModal({ job, star, onClose }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('process');
  const [processStep, setProcessStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const phases = job.workProcess.phases;
  const isLastPhase = processStep === phases.length - 1;

  const goToStep = (step: number) => {
    if (step >= 0 && step < phases.length) {
      setProcessStep(step);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0 && !isLastPhase) goToStep(processStep + 1);
      else if (dx > 0 && processStep > 0) goToStep(processStep - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div
        className="relative flex flex-col w-full max-w-[430px]"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        }}
      >
        <ModalHeader job={job} star={star} onClose={onClose} />

        <JobHeroBanner job={job} star={star} />

        <ModalTabs activeTab={activeTab} star={star} onTabChange={(tab) => { setActiveTab(tab); setProcessStep(0); }} />

        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onTouchStart={activeTab === 'process' ? handleTouchStart : undefined}
          onTouchEnd={activeTab === 'process' ? handleTouchEnd : undefined}
        >
          {activeTab === 'process' && (
            <ProcessTab
              job={job}
              star={star}
              currentPhase={phases[processStep]}
              processStep={processStep}
              phases={phases}
              isLastPhase={isLastPhase}
              onStepChange={goToStep}
            />
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
