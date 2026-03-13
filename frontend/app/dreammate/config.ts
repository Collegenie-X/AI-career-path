import dreamConfig from '@/data/dreammate/config.json';
import dreamContent from '@/data/dreammate/content.json';
import type {
  DreamItemType,
  DreamTabId,
  ParticipationApplicationStatus,
  RoadmapShareScope,
  ResourceCategoryId,
  SpaceProgramType,
  SpaceRecruitmentStatus,
} from './types';

export const DREAM_COLORS = dreamConfig.colors as {
  readonly primary: string;
  readonly accent: string;
  readonly award: string;
  readonly activity: string;
  readonly project: string;
  readonly paper: string;
  readonly background: string;
};

export const DREAM_ITEM_TYPES = dreamConfig.itemTypes as readonly {
  value: DreamItemType;
  label: string;
  color: string;
  emoji: string;
}[];

export const GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE = dreamConfig.goalGroupTemplatesByItemType as readonly {
  itemType: DreamItemType;
  goalTitle: string;
}[];

export const ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES = dreamConfig.roadmapTitleAutoCompleteTemplates as readonly string[];

export const ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES = dreamConfig.roadmapDescriptionAutoCompleteTemplates as readonly string[];

export const ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE = dreamConfig.roadmapItemTitleAutoCompleteByItemType as readonly {
  itemType: DreamItemType;
  suggestions: string[];
}[];

export const WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE = dreamConfig.weeklyTodoAutoCompleteByItemType as readonly {
  itemType: DreamItemType;
  suggestions: string[];
}[];

export const RESOURCE_CATEGORIES = dreamConfig.resourceCategories as readonly {
  id: ResourceCategoryId;
  label: string;
  emoji: string;
  color: string;
}[];

export const PERIOD_FILTERS = dreamConfig.periodFilters as readonly {
  id: string;
  label: string;
  emoji: string;
}[];

export const DREAM_TABS = dreamConfig.tabs as readonly {
  id: DreamTabId;
  label: string;
  emoji: string;
}[];

export const ROADMAP_SHARE_VISIBILITY_OPTIONS = dreamConfig.roadmapShareVisibilityOptions as readonly {
  id: RoadmapShareScope;
  label: string;
  description: string;
  emoji: string;
  color: string;
}[];

export const SPACE_RECRUITMENT_STATUSES = dreamConfig.spaceRecruitmentStatuses as readonly {
  id: SpaceRecruitmentStatus;
  label: string;
  color: string;
}[];

export const SPACE_PROGRAM_TYPES = dreamConfig.spaceProgramTypes as readonly {
  id: SpaceProgramType;
  label: string;
  emoji: string;
  color: string;
}[];

export const ROADMAP_REPORT_REASONS = dreamConfig.roadmapReportReasons as readonly {
  id: string;
  label: string;
  description: string;
  emoji: string;
}[];

export const PARTICIPATION_FLOW_STEPS = dreamConfig.participationFlowSteps as readonly {
  id: ParticipationApplicationStatus;
  label: string;
  color: string;
}[];

export const LABELS = dreamContent as { readonly [key: string]: string };
