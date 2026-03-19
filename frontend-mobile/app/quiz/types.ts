export type QuizMode = '10' | '30';

export interface QuizQuestion {
  id: number;
  zone: string;
  zoneIcon: string;
  situation: string;
  description: string;
  feedbackMap: Record<string, string>;
  choices: QuizChoice[];
}

export interface QuizChoice {
  id: string;
  text: string;
  riasecScores: Record<string, number>;
}

export interface FeedbackData {
  text: string;
  zone: string;
  zoneIcon: string;
  isLast: boolean;
}
