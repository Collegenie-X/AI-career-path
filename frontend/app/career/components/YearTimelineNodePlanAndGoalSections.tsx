'use client';

import {
  CareerPathGoalHeaderButton,
  CareerPathNestedRail,
} from './timeline-dream-path/CareerTimelineCareerPathChrome';
import type { PlanItem, YearPlan } from './CareerPathBuilder';
import { ItemRow, type PlanItemWithCheck } from './TimelineItemComponents';
import { countCheckedAndTotalForPlanItems } from '../utils/careerPathTimelineItemProgress';

type YearTimelineNodePlanAndGoalSectionsProps = {
  readonly year: YearPlan & { items: PlanItemWithCheck[] };
  readonly color: string;
  readonly expandedGoalIds: Set<string>;
  readonly toggleGoalExpand: (goalId: string) => void;
  readonly showTimelineProgressBars: boolean;
  readonly completedSuffix: string;
  readonly isEditMode: boolean;
  readonly showCheckboxes: boolean;
  readonly dedupeItems: (items: PlanItemWithCheck[]) => PlanItemWithCheck[];
  readonly toggleCheckInGroup: (groupId: string, itemId: string) => void;
  readonly deleteItemFromGroup: (groupId: string, itemId: string) => void;
  readonly saveItemTitleInGroup: (groupId: string, itemId: string, title: string) => void;
  readonly toggleCheckInGoalGroup: (groupId: string, itemId: string) => void;
  readonly toggleCheckInSemesterPlan: (semesterId: string, groupId: string, itemId: string) => void;
  readonly onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
  readonly updateItemSubItem: (itemId: string, subItemId: string) => void;
};

export function YearTimelineNodePlanAndGoalSections({
  year,
  color,
  expandedGoalIds,
  toggleGoalExpand,
  showTimelineProgressBars,
  completedSuffix,
  isEditMode,
  showCheckboxes,
  dedupeItems,
  toggleCheckInGroup,
  deleteItemFromGroup,
  saveItemTitleInGroup,
  toggleCheckInGoalGroup,
  toggleCheckInSemesterPlan,
  onItemInfoClick,
  updateItemSubItem,
}: YearTimelineNodePlanAndGoalSectionsProps) {
  return (
    <>
      {(year.groups ?? []).length > 0 && (
        <div className="space-y-3">
          {(year.groups ?? []).map((group) => {
            const pgKey = `plan-group-${group.id}`;
            const isPgExpanded = expandedGoalIds.has(pgKey);
            const pgProg = countCheckedAndTotalForPlanItems(dedupeItems(group.items as PlanItemWithCheck[]));
            return (
              <div key={group.id} className="space-y-1">
                <CareerPathGoalHeaderButton
                  accentColor={color}
                  title={group.label}
                  itemCount={group.items.length}
                  isExpanded={isPgExpanded}
                  showChevron
                  onToggle={() => toggleGoalExpand(pgKey)}
                  variant="accordion"
                  showProgressBar={showTimelineProgressBars}
                  checkedCount={pgProg.checkedCount}
                  totalCount={pgProg.totalCount}
                  completedSuffixLabel={completedSuffix}
                />
                {isPgExpanded && group.items.length > 0 && (
                  <CareerPathNestedRail accentColor={color}>
                    {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        showCheckbox={showCheckboxes}
                        useLightBorder
                        onToggleCheck={() => toggleCheckInGroup(group.id, item.id)}
                        onDelete={() => deleteItemFromGroup(group.id, item.id)}
                        onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                        onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                      />
                    ))}
                  </CareerPathNestedRail>
                )}
              </div>
            );
          })}
        </div>
      )}

      {year.semester !== 'split' && (year.goalGroups ?? []).filter((g) => (g.items ?? []).length > 0).length > 0 && (
        <div className="space-y-3">
          {(year.goalGroups ?? [])
            .filter((g) => (g.items ?? []).length > 0)
            .map((group) => {
              const isGoalExpanded = expandedGoalIds.has(group.id);
              const prog = countCheckedAndTotalForPlanItems(dedupeItems(group.items as PlanItemWithCheck[]));
              return (
                <div key={group.id} className="space-y-1">
                  <CareerPathGoalHeaderButton
                    accentColor={color}
                    title={group.goal}
                    itemCount={group.items.length}
                    isExpanded={isGoalExpanded}
                    showChevron
                    onToggle={() => toggleGoalExpand(group.id)}
                    variant="accordion"
                    showProgressBar={showTimelineProgressBars}
                    checkedCount={prog.checkedCount}
                    totalCount={prog.totalCount}
                    completedSuffixLabel={completedSuffix}
                  />
                  {isGoalExpanded && group.items.length > 0 && (
                    <CareerPathNestedRail accentColor={color}>
                      {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          color={color}
                          isEditMode={isEditMode}
                          showCheckbox={showCheckboxes}
                          useLightBorder
                          onToggleCheck={() => toggleCheckInGoalGroup(group.id, item.id)}
                          onDelete={() => {}}
                          onTitleSave={() => {}}
                          onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                          onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                        />
                      ))}
                    </CareerPathNestedRail>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {year.semester === 'split' && (year.semesterPlans ?? []).length > 0 && (
        <div className="space-y-3">
          {(year.semesterPlans ?? []).map((sp) => (
            <div key={sp.semesterId} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{sp.semesterId === 'first' ? '🌸' : '🍂'}</span>
                <span className="text-[12px] font-bold text-gray-400">{sp.semesterLabel}</span>
                <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
              </div>
              {sp.goalGroups
                .filter((g) => (g.items ?? []).length > 0)
                .map((group) => {
                  const isGoalExpanded = expandedGoalIds.has(group.id);
                  const prog = countCheckedAndTotalForPlanItems(dedupeItems(group.items as PlanItemWithCheck[]));
                  return (
                    <div key={group.id} className="space-y-1">
                      <CareerPathGoalHeaderButton
                        accentColor={color}
                        title={group.goal}
                        itemCount={group.items.length}
                        isExpanded={isGoalExpanded}
                        showChevron
                        onToggle={() => toggleGoalExpand(group.id)}
                        variant="accordion"
                        showProgressBar={showTimelineProgressBars}
                        checkedCount={prog.checkedCount}
                        totalCount={prog.totalCount}
                        completedSuffixLabel={completedSuffix}
                      />
                      {isGoalExpanded && group.items.length > 0 && (
                        <CareerPathNestedRail accentColor={color}>
                          {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                            <ItemRow
                              key={item.id}
                              item={item}
                              color={color}
                              isEditMode={isEditMode}
                              showCheckbox={showCheckboxes}
                              useLightBorder
                              onToggleCheck={() => toggleCheckInSemesterPlan(sp.semesterId, group.id, item.id)}
                              onDelete={() => {}}
                              onTitleSave={() => {}}
                              onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                              onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                            />
                          ))}
                        </CareerPathNestedRail>
                      )}
                    </div>
                  );
                })}
              {sp.goalGroups.filter((g) => (g.items ?? []).length > 0).length === 0 && (
                <p className="text-xs text-gray-600 pl-2">이 학기에 계획이 없어요</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
