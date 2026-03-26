'use client';

import { useState } from 'react';
import { ProcessTab } from './ProcessTab';
import { TimelineTab } from './TimelineTab';
import { AiTransformationTab } from './AiTransformationTab';
import { OrganizationStructureTab } from './OrganizationStructureTab';
import { ModalHeader } from './ModalHeader';
import { ModalTabs, type ModalTab } from './ModalTabs';
import { CareerPathStyleDialog } from '../CareerPathStyleDialog';
import type { Job, StarData } from '../../types';

interface JobDetailModalProps {
  job: Job;
  star: StarData;
  onClose: () => void;
}

export function JobDetailModal({ job, star, onClose }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('process');

  return (
    <CareerPathStyleDialog onClose={onClose}>
      <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 56px)' }}>
        {/* 헤더: 아이콘 + 제목 + 메타데이터 + 닫기 */}
        <ModalHeader job={job} star={star} onClose={onClose} />

        {/* 탭 바 */}
        <ModalTabs activeTab={activeTab} star={star} onTabChange={setActiveTab} />

        {/* 스크롤 영역: 탭 컨텐츠 */}
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {activeTab === 'process' && (
            <ProcessTab job={job} star={star} />
          )}
          {activeTab === 'ai' && (
            <AiTransformationTab job={job} star={star} />
          )}
          {activeTab === 'organization' && (
            <OrganizationStructureTab job={job} star={star} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab job={job} star={star} />
          )}
        </div>
      </div>
    </CareerPathStyleDialog>
  );
}
