'use client';

import { GRADE_YEARS, LABELS } from '../config';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';
import {
  CareerPathGoalHeaderButton,
  CareerPathNestedRail,
} from './timeline-dream-path/CareerTimelineCareerPathChrome';
import {
  CareerPathTimelineGradeSectionChrome,
  CareerPathTimelineListChromeRoot,
} from './timeline-dream-path/CareerPathTimelineListChrome';
import { CareerPathTimelineTemplateItemRow } from './timeline-dream-path/CareerPathTimelineTemplateItemRow';

type CareerPathDetailPanelTimelineProps = {
  readonly template: CareerPathTemplate;
  readonly collapsedGoalKeys: Set<string>;
  readonly onToggleGoalExpand: (key: string) => void;
  readonly collapsedGradeKeys: Set<string>;
  readonly onToggleGradeExpand: (gradeId: string) => void;
};

/** 템플릿 연도에서 목표 그룹 목록 정규화 (탐색 상세) */
function buildGoalGroupsFromTemplateYear(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yearAny: any,
): { goal: string; items: any[] }[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allGroups: { goal: string; items: any[] }[] = [];
  if (Array.isArray(yearAny.goalGroups) && yearAny.goalGroups.length > 0) {
    allGroups.push(...yearAny.goalGroups);
  }
  if (Array.isArray(yearAny.semesterPlans)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yearAny.semesterPlans.forEach((sp: any) => {
      if (Array.isArray(sp.goalGroups)) allGroups.push(...sp.goalGroups);
    });
  }
  if (allGroups.length === 0) {
    const goals = Array.isArray(yearAny.goals) && yearAny.goals.length > 0
      ? yearAny.goals
      : ['활동 목록'];
    const items = Array.isArray(yearAny.items) ? yearAny.items : [];
    goals.forEach((goal: string, idx: number) => {
      allGroups.push({ goal, items: idx === 0 ? items : [] });
    });
  }
  return allGroups;
}

export function CareerPathDetailPanelTimeline({
  template,
  collapsedGoalKeys,
  onToggleGoalExpand,
  collapsedGradeKeys,
  onToggleGradeExpand,
}: CareerPathDetailPanelTimelineProps) {
  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...template.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );
  const completedSuffix = String(LABELS.timeline_summary_completed_label ?? '완료');

  return (
    <CareerPathTimelineListChromeRoot accentColor={template.starColor}>
      {sortedYears.map((year) => {
        const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yearAny = year as any;
        const allGroups = buildGoalGroupsFromTemplateYear(yearAny);
        const isGradeExpanded = !collapsedGradeKeys.has(year.gradeId);

        return (
          <CareerPathTimelineGradeSectionChrome
            key={year.gradeId}
            accentColor={template.starColor}
            gradeShortLabel={year.gradeLabel}
            gradeFullLabel={grade?.fullLabel ?? year.gradeLabel}
            isGradeExpanded={isGradeExpanded}
            onToggleGrade={() => onToggleGradeExpand(year.gradeId)}
            showGradeProgressBar={false}
            gradeCheckedCount={0}
            gradeTotalCount={0}
            completedSuffixLabel={completedSuffix}
          >
            {allGroups
              .filter((group) => (group.items ?? []).length > 0)
              .map((group, gi) => {
                const goalKey = `${year.gradeId}-${gi}`;
                const isExpanded = !collapsedGoalKeys.has(goalKey);
                return (
                  <div key={goalKey} className="space-y-1">
                    <CareerPathGoalHeaderButton
                      accentColor={template.starColor}
                      title={group.goal}
                      itemCount={(group.items ?? []).length}
                      isExpanded={isExpanded}
                      showChevron
                      onToggle={() => onToggleGoalExpand(goalKey)}
                      variant="accordion"
                      showProgressBar={false}
                    />

                    {isExpanded && (group.items ?? []).length > 0 && (
                      <CareerPathNestedRail accentColor={template.starColor}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(group.items ?? []).map((item: any, itemIndex: number) => (
                          <CareerPathTimelineTemplateItemRow
                            key={item.id ?? `${goalKey}-${itemIndex}`}
                            item={item}
                            accentColor={template.starColor}
                          />
                        ))}
                      </CareerPathNestedRail>
                    )}
                  </div>
                );
              })}
          </CareerPathTimelineGradeSectionChrome>
        );
      })}
    </CareerPathTimelineListChromeRoot>
  );
}
