'use client';

import { LABELS } from '../config';
import { DreamSpaceCreateGroupButton } from './DreamSpaceCreateGroupButton';

type DreamSpaceListHeaderProps = {
  readonly onRequestCreateGroup: () => void;
  /** 로그인 시에만 그룹 만들기 버튼 표시 */
  readonly allowMutations?: boolean;
};

/** 커리어 패스 `GroupListView` 헤더(제목 + 새 그룹) 레이아웃과 동일한 역할입니다. */
export function DreamSpaceListHeader({
  onRequestCreateGroup,
  allowMutations = true,
}: DreamSpaceListHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-white">{LABELS.spaceTitle}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{LABELS.spaceSubtitle}</p>
      </div>
      {allowMutations ? (
        <DreamSpaceCreateGroupButton
          variant="inlineListHeader"
          label={LABELS.createSpaceButton}
          onClick={onRequestCreateGroup}
          ariaLabel={LABELS.createSpaceButton}
        />
      ) : null}
    </div>
  );
}
