'use client';

import { GradientSegmentedTabBar } from '@/components/section-shell/GradientSegmentedTabBar';
import { CAREER_PAGE_TABS, type CareerPageTabId } from '../config';

type CareerTabBarProps = {
  readonly activeTab: CareerPageTabId;
  readonly onTabChange: (tabId: CareerPageTabId) => void;
  /**
   * true: 셸 카드 안에 붙여 넣기 — 바깥 이중 테두리 없이 탭만 표시 (아래 히어로와 한 덩어리)
   */
  readonly embeddedInCareerShell?: boolean;
};

export function CareerTabBar({
  activeTab,
  onTabChange,
  embeddedInCareerShell = false,
}: CareerTabBarProps) {
  return (
    <GradientSegmentedTabBar
      tabs={CAREER_PAGE_TABS.map((tab) => ({ id: tab.id, label: tab.label, emoji: tab.emoji }))}
      activeTab={activeTab}
      onTabChange={onTabChange}
      embeddedInSectionShell={embeddedInCareerShell}
      ariaLabel="커리어 탭 전환"
    />
  );
}
