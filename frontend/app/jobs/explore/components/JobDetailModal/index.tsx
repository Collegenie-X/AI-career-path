'use client';

import { useState } from 'react';
import { ProcessTab } from './ProcessTab';
import { TimelineTab } from './TimelineTab';
import { DailyScheduleTab } from './DailyScheduleTab';
import { ModalHeader } from './ModalHeader';
import { ModalTabs, type ModalTab } from './ModalTabs';
import { ModalControls } from './ModalControls';
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

  const phases = job.workProcess.phases;
  const currentPhase = phases[processStep];
  const isLastPhase = processStep === phases.length - 1;

  const handleNext = () => {
    if (isLastPhase) {
      setActiveTab('daily');
      setProcessStep(0);
    } else {
      setProcessStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    setProcessStep(s => s - 1);
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
        
        <ModalTabs activeTab={activeTab} star={star} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'process' && (
            <ProcessTab 
              job={job}
              star={star}
              currentPhase={currentPhase}
              processStep={processStep}
              phases={phases}
              isLastPhase={isLastPhase}
            />
          )}
          {activeTab === 'daily' && (
            <DailyScheduleTab job={job} star={star} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab job={job} star={star} />
          )}
        </div>

        {activeTab === 'process' && (
          <ModalControls
            processStep={processStep}
            isLastPhase={isLastPhase}
            star={star}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
