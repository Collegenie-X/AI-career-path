/**
 * POST /api/v1/career-plan/execution-plan-ai/generate/
 */

export type ExecutionPlanAiPlanDepthId = 'detailed' | 'brief' | 'simple';

export interface ExecutionPlanAiMilestoneInput {
  title?: string;
  date_iso?: string;
}

export interface ExecutionPlanAiGenerateRequestBody {
  title: string;
  /** 세부·간략·간단 — 로드맵 맥락은 이미 있으므로 레벨/카테고리 대신 분량만 전달 */
  plan_depth: ExecutionPlanAiPlanDepthId;
  /** 하위 호환·선택 */
  category_id?: string;
  student_level?: string;
  level_label?: string;
  difficulty?: number;
  final_goal: string;
  selected_months: number[];
  milestones: ExecutionPlanAiMilestoneInput[];
  constraints: string;
  previous_summary: string;
}

export interface ExecutionPlanAiWeekResponse {
  month: number;
  weekIndexInMonth: number;
  goal: string;
  deliverable: string;
  researchNoteOutline: Record<string, unknown>;
  subTasks: string[];
}

export interface ExecutionPlanAiGenerateResponseBody {
  schema_version: number;
  expected_week_count_used: number;
  summary: string;
  assumptions: string[];
  weeks: ExecutionPlanAiWeekResponse[];
  quota_remaining_after: number;
}
