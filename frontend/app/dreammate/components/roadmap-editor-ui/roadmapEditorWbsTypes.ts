import type { RoadmapTodoItem } from '../../types';

/** 주차별로 묶인 뷰 모델 (로드맵 편집기 WBS 트리에서 공통 사용). */
export interface WeekGroupViewModel {
  groupKey: string;
  /** 시작 월 기준 순차 주차(1주차~N주차). 편집기 표시·정렬의 기준. */
  sequentialWeek: number;
  /** 표시·저장용 월 (weekLabel 'N월 M주차'와 일치) */
  month: number;
  /** 해당 월 안에서의 주차(1~4) */
  week: number;
  goal?: RoadmapTodoItem;
  tasks: RoadmapTodoItem[];
}
