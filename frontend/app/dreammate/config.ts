import colors         from '@/data/dreammate/config/colors.json';
import itemTypes      from '@/data/dreammate/config/itemTypes.json';
import autocomplete   from '@/data/dreammate/config/autocomplete.json';
import filters        from '@/data/dreammate/config/filters.json';
import tabs           from '@/data/dreammate/config/tabs.json';
import spaceConfig    from '@/data/dreammate/config/space.json';
import reportReasons  from '@/data/dreammate/config/report.json';
import heroConfig     from '@/data/dreammate/config/hero.json';
import paginationConfig from '@/data/dreammate/config/pagination.json';

import contentCommon  from '@/data/dreammate/content/common.json';
import contentFeed    from '@/data/dreammate/content/feed.json';
import contentLibrary from '@/data/dreammate/content/library.json';
import contentSpace   from '@/data/dreammate/content/space.json';
import contentMy      from '@/data/dreammate/content/my.json';
import contentRoadmap from '@/data/dreammate/content/roadmap.json';
import contentEditor  from '@/data/dreammate/content/editor.json';

import type {
  DreamItemType,
  DreamTabId,
  ParticipationApplicationStatus,
  RoadmapShareScope,
  ResourceCategoryId,
  SpaceProgramType,
  SpaceRecruitmentStatus,
} from './types';

export const DREAM_COLORS = colors as {
  readonly primary:    string;
  readonly accent:     string;
  readonly award:      string;
  readonly activity:   string;
  readonly project:    string;
  readonly paper:      string;
  readonly background: string;
};

export const DREAM_ITEM_TYPES = itemTypes as readonly {
  value: DreamItemType;
  label: string;
  color: string;
  emoji: string;
}[];

export const GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE = autocomplete.goalGroupTemplatesByItemType as readonly {
  itemType: DreamItemType;
  goalTitle: string;
}[];

export const ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES      = autocomplete.roadmapTitleTemplates       as readonly string[];
export const ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES = autocomplete.roadmapDescriptionTemplates as readonly string[];

export const ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE = autocomplete.roadmapItemTitleByItemType as readonly {
  itemType: DreamItemType;
  suggestions: string[];
}[];

export const WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE = autocomplete.weeklyTodoByItemType as readonly {
  itemType: DreamItemType;
  suggestions: string[];
}[];

export const RESOURCE_CATEGORIES = filters.resourceCategories as readonly {
  id:    ResourceCategoryId;
  label: string;
  emoji: string;
  color: string;
}[];

export const PERIOD_FILTERS = filters.periodFilters as readonly {
  id:    string;
  label: string;
  emoji: string;
}[];

export const DREAM_TABS = tabs as readonly {
  id:    DreamTabId;
  label: string;
  emoji: string;
}[];

export const REQUIRE_RESULT_ASSET_FOR_PUBLIC_SHARE = Boolean(
  (spaceConfig as { requireResultAssetForPublicShare?: boolean }).requireResultAssetForPublicShare,
);

export const ROADMAP_SHARE_VISIBILITY_OPTIONS = spaceConfig.shareVisibilityOptions as readonly {
  id:          RoadmapShareScope;
  label:       string;
  description: string;
  emoji:       string;
  color:       string;
}[];

export const SPACE_RECRUITMENT_STATUSES = spaceConfig.recruitmentStatuses as readonly {
  id:    SpaceRecruitmentStatus;
  label: string;
  color: string;
}[];

export const SPACE_PROGRAM_TYPES = spaceConfig.programTypes as readonly {
  id:    SpaceProgramType;
  label: string;
  emoji: string;
  color: string;
}[];

export const PARTICIPATION_FLOW_STEPS = spaceConfig.participationFlowSteps as readonly {
  id:    ParticipationApplicationStatus;
  label: string;
  color: string;
}[];

export const ROADMAP_REPORT_REASONS = reportReasons as readonly {
  id:          string;
  label:       string;
  description: string;
  emoji:       string;
}[];

export const DREAM_LIST_ITEMS_PER_PAGE = (paginationConfig as { itemsPerPage: number }).itemsPerPage;

export const HERO_CONFIG = heroConfig as {
  readonly copyByTab: Record<string, {
    readonly headlineIcon: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly highlight: string;
    readonly description: string;
    readonly cta: string;
  }>;
  readonly visualStyles: Record<string, {
    background: string;
    border: string;
    glowTopColor: string;
    glowBottomColor: string;
    accentColor: string;
  }>;
  readonly statIcons: Record<string, readonly {
    icon: string;
    valueKey?: string;
    value?: string;
    label: string;
    iconBackground: string;
    iconColor: string;
  }[]>;
  readonly borderRadius: {
    container: string;
    statIcon: string;
    ctaButton: string;
    headlineIcon: string;
    glowBlob: string;
  };
};

export const LABELS: { readonly [key: string]: string } = {
  ...contentCommon,
  ...contentFeed,
  ...contentLibrary,
  ...contentSpace,
  ...contentMy,
  ...contentRoadmap,
  ...contentEditor,
};

export {
  ROADMAP_TIMELINE_DISPLAY,
  getRoadmapTreeTodoRowVisualModeFromDetailMode,
  getShowTimelineProgressBarsFromDetailMode,
} from './config/roadmap-timeline-display.config';
export type { RoadmapTimelineDetailMode, RoadmapTreeTodoRowVisualMode } from './config/roadmap-timeline-display.config';
