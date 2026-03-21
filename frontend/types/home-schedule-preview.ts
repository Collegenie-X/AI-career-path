export type DreamPathActivity = {
  icon: string;
  title: string;
  type: string;
  month: string;
  cost: string;
  stars: number;
  place: string;
  desc: string;
};

export type DreamPathGroup = {
  icon: string;
  title: string;
  count: number;
  activities: DreamPathActivity[];
};

export type DreamPathGradeSection = {
  grade: string;
  gradeColor: string;
  groups: DreamPathGroup[];
};

export type DreamPathPreviewData = {
  tabLabel: string;
  title: string;
  lead: string;
  bullets: string[];
  link: { label: string; href: string };
  frameLabel: string;
  gradeSection: DreamPathGradeSection;
};

export type DreamExecutionTask = {
  text: string;
  done: boolean;
};

export type DreamExecutionGoal = {
  text: string;
  done: boolean;
  tasks: DreamExecutionTask[];
};

export type DreamExecutionWeek = {
  label: string;
  count: number;
  goals: DreamExecutionGoal[];
};

export type DreamExecutionProject = {
  categoryEmoji: string;
  categoryLabel: string;
  period: string;
  title: string;
  outputTag: string;
  criteriaTag: string;
  weeks: DreamExecutionWeek[];
};

export type DreamExecutionPreviewData = {
  tabLabel: string;
  title: string;
  lead: string;
  bullets: string[];
  link: { label: string; href: string };
  frameLabel: string;
  project: DreamExecutionProject;
};

export type HomeSchedulePreviewContent = {
  sectionHeader: {
    badge: string;
    title: string;
    subtitle: string;
  };
  dreamPath: DreamPathPreviewData;
  dreamExecution: DreamExecutionPreviewData;
};
