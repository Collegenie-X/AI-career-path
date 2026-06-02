import type {
  DreamItemType,
  PeriodType,
  RoadmapMilestoneResult,
  SharedRoadmap,
} from '../types';
import { getRoadmapEffectiveTodoCounts } from './roadmapTodoCounts';

export interface PortfolioWeek {
  key: string;
  /** 이 목표 todo가 속한 RoadmapItem id (인라인 수정 시 타겟) */
  itemId: string;
  /** 목표 todo id (인라인 수정 시 타겟) */
  todoId: string;
  /** 부모 RoadmapItem 제목 */
  itemTitle: string;
  /** 부모 항목의 최종 산출물 (RoadmapItem.targetOutput) */
  itemTargetOutput?: string;
  /** 부모 항목의 완료 기준 (RoadmapItem.successCriteria) */
  itemSuccessCriteria?: string;
  weekLabel: string;
  goalTitle: string;
  /** 계획 단계 산출물 (템플릿 output) */
  plannedOutput?: string;
  /** 실제 기록한 산출물 링크·파일명 */
  recordedOutput?: string;
  /** 이 주차 결과물 사진 */
  outputImageUrl?: string;
  note?: string;
  reviewNote?: string;
  isDone: boolean;
  tasks: { title: string; isDone: boolean }[];
}

export interface PortfolioPhoto {
  src: string;
  caption?: string;
}

export interface PortfolioReport {
  roadmapId: string;
  title: string;
  description: string;
  type: DreamItemType;
  period: PeriodType;
  starColor: string;
  progress: { total: number; done: number; pct: number };
  weeks: PortfolioWeek[];
  photos: PortfolioPhoto[];
  milestones: RoadmapMilestoneResult[];
  finalResult: { title?: string; description?: string; url?: string; imageUrl?: string };
  /** 실제 기록된 산출물(링크·파일) 목록 */
  collectedOutputs: string[];
  /** 결과 자산(사진·산출물·핵심성과)이 하나라도 있는지 */
  hasAnyResultAsset: boolean;
}

/**
 * 실행 로드맵(SharedRoadmap) → 포트폴리오 결과 리포트 모델로 변환.
 * 실행 데이터(주차 완료·산출물·마일스톤·최종 결과)에서 자동 생성되므로,
 * 실행을 진행할수록 리포트가 채워진다.
 */
export function buildPortfolioReport(roadmap: SharedRoadmap): PortfolioReport {
  const counts = getRoadmapEffectiveTodoCounts(roadmap.items ?? []);
  const pct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  // 주차별 그룹핑: 'goal' 진입점마다 새 주차, 이후 'task'는 직전 주차에 귀속
  const weeks: PortfolioWeek[] = [];
  (roadmap.items ?? []).forEach((item, itemIdx) => {
    (item.subItems ?? []).forEach((todo, todoIdx) => {
      if (todo.entryType === 'goal' || weeks.length === 0) {
        weeks.push({
          key: `${itemIdx}-${todoIdx}`,
          itemId: item.id,
          todoId: todo.id,
          itemTitle: item.title,
          itemTargetOutput: item.targetOutput,
          itemSuccessCriteria: item.successCriteria,
          weekLabel: todo.weekLabel ?? `${weeks.length + 1}주차`,
          goalTitle: todo.title,
          plannedOutput: todo.plannedOutput,
          recordedOutput: todo.outputRef,
          outputImageUrl: todo.outputImageUrl,
          note: todo.note,
          reviewNote: todo.reviewNote,
          isDone: Boolean(todo.isDone),
          tasks: [],
        });
      } else {
        const current = weeks[weeks.length - 1];
        current.tasks.push({ title: todo.title, isDone: Boolean(todo.isDone) });
      }
    });
  });

  const milestones = roadmap.milestoneResults ?? [];

  const photos: PortfolioPhoto[] = [];
  // 주차별 결과물 사진
  weeks.forEach((w) => {
    if (w.outputImageUrl) photos.push({ src: w.outputImageUrl, caption: `${w.weekLabel} · ${w.goalTitle}` });
  });
  // 마일스톤·최종 결과 사진
  milestones.forEach((m) => {
    if (m.imageUrl) photos.push({ src: m.imageUrl, caption: m.title });
  });
  if (roadmap.finalResultImageUrl) {
    photos.push({ src: roadmap.finalResultImageUrl, caption: roadmap.finalResultTitle || '최종 결과물' });
  }

  const collectedOutputs = weeks
    .map((w) => w.recordedOutput)
    .filter((o): o is string => Boolean(o && o.trim()));

  const finalResult = {
    title: roadmap.finalResultTitle,
    description: roadmap.finalResultDescription,
    url: roadmap.finalResultUrl,
    imageUrl: roadmap.finalResultImageUrl,
  };

  const hasAnyResultAsset = Boolean(
    photos.length > 0 ||
      collectedOutputs.length > 0 ||
      milestones.length > 0 ||
      finalResult.title ||
      finalResult.description ||
      finalResult.url,
  );

  return {
    roadmapId: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    type: (roadmap.focusItemTypes?.[0] ?? roadmap.items?.[0]?.type ?? 'project') as DreamItemType,
    period: roadmap.period,
    starColor: roadmap.starColor,
    progress: { total: counts.total, done: counts.done, pct },
    weeks,
    photos,
    milestones,
    finalResult,
    collectedOutputs,
    hasAnyResultAsset,
  };
}
