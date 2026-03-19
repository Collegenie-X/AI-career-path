export type StrategyActionCard = {
  title: string;
  description: string;
  actionSteps: string[];
  recommendedTiming: string;
  relatedCategoryIds?: string[];
};

export type StrategyDeepQuestionAnswer = {
  question: string;
  answer: string;
};

export type StrategyHubGradeSection = {
  id: string;
  label: string;
  objective: string;
  practicalExamples: string[];
  detailChecklist: string[];
  cards: StrategyActionCard[];
};

export type StrategyHubSection = {
  id: string;
  label: string;
  emoji: string;
  title: string;
  summary: string;
  necessity?: string[];
  admissionsOfficerAdvantageTips?: string[];
  evidencePlacementGuide?: string[];
  deepQa?: StrategyDeepQuestionAnswer[];
  grades: StrategyHubGradeSection[];
};
