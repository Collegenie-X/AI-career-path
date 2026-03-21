export type CareerPathActivity = {
  icon: string;
  title: string;
  type: string;
  month: string;
  cost: string;
  stars: number;
  place: string;
  desc: string;
};

export type CareerPathGroup = {
  icon: string;
  title: string;
  count: number;
  activities: CareerPathActivity[];
};

export type CareerPathGradeSection = {
  grade: string;
  gradeColor: string;
  groups: CareerPathGroup[];
};

export type CareerPathPreviewData = {
  tabLabel: string;
  title: string;
  lead: string;
  bullets: string[];
  link: { label: string; href: string };
  frameLabel: string;
  gradeSection: CareerPathGradeSection;
};

export type CareerExecutionTask = {
  text: string;
  done: boolean;
};

export type CareerExecutionGoal = {
  text: string;
  done: boolean;
  tasks: CareerExecutionTask[];
};

export type CareerExecutionWeek = {
  label: string;
  count: number;
  goals: CareerExecutionGoal[];
};

export type CareerExecutionProject = {
  categoryEmoji: string;
  categoryLabel: string;
  period: string;
  title: string;
  outputTag: string;
  criteriaTag: string;
  weeks: CareerExecutionWeek[];
};

export type CareerExecutionPreviewData = {
  tabLabel: string;
  title: string;
  lead: string;
  bullets: string[];
  link: { label: string; href: string };
  frameLabel: string;
  project: CareerExecutionProject;
};

export type HomeSchedulePreviewContent = {
  sectionHeader: {
    badge: string;
    title: string;
    subtitle: string;
  };
  careerPath: CareerPathPreviewData;
  careerExecution: CareerExecutionPreviewData;
};
