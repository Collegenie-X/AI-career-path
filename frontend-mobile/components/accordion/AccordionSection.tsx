'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AccordionSectionProps {
  /** 섹션 헤더 (아이콘, 제목, 카운트 등) */
  header: React.ReactNode;
  /** 섹션 본문 */
  children: React.ReactNode;
  /** 초기 열림 상태 (기본: true) */
  defaultOpen?: boolean;
  /** 헤더 클릭 시 본문 토글 외 추가 동작 */
  onHeaderClick?: () => void;
}

export function AccordionSection({
  header,
  children,
  defaultOpen = true,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-3">
        <CollapsibleTrigger
          className="w-full flex items-center gap-2 text-left transition-all active:opacity-80 cursor-pointer"
        >
          {header}
          <span className="ml-auto flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
