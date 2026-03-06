import type { RIASECScores, RIASECType, RIASECResult } from './types';

interface QuizQuestion {
  id: number;
  zone: string;
  zoneIcon: string;
  situation: string;
  description: string;
  feedbackMap: Record<string, string>;
  choices: QuizChoice[];
}

interface QuizChoice {
  id: string;
  text: string;
  riasecScores: Record<string, number>;
}

export function calculateRIASECScoresFromAnswers(
  questions: QuizQuestion[],
  answers: Record<number, number>
): RIASECScores {
  const scores: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  questions.forEach((question, questionIndex) => {
    const choiceIndex = answers[questionIndex];
    if (choiceIndex === undefined) return;

    const choice = question.choices[choiceIndex];
    if (!choice) return;

    for (const [type, value] of Object.entries(choice.riasecScores)) {
      scores[type as RIASECType] += value;
    }
  });

  return scores;
}

export function getTopTwoTypes(scores: RIASECScores): [RIASECType, RIASECType] {
  const sorted = (Object.entries(scores) as [RIASECType, number][])
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

export function generateKeywordsFromTopTypes(topTypes: [RIASECType, RIASECType]): string[] {
  const keywordMap: Record<RIASECType, string[]> = {
    R: ['실용적', '활동적', '만들기 좋아하는', '도구를 잘 다루는'],
    I: ['분석적', '호기심 많은', '논리적', '탐구하는'],
    A: ['창의적', '감성적', '상상력 풍부한', '표현력 있는'],
    S: ['따뜻한', '배려심 있는', '소통 잘하는', '공감하는'],
    E: ['도전적', '리더십 있는', '설득력 있는', '추진력 있는'],
    C: ['꼼꼼한', '체계적인', '정확한', '계획적인'],
  };

  return [
    keywordMap[topTypes[0]][0],
    keywordMap[topTypes[0]][1],
    keywordMap[topTypes[1]][0],
    keywordMap[topTypes[1]][1],
  ];
}

export function generateRIASECResultFromQuizAnswers(
  questions: QuizQuestion[],
  answers: Record<number, number>
): RIASECResult {
  const scores = calculateRIASECScoresFromAnswers(questions, answers);
  const topTypes = getTopTwoTypes(scores);
  const keywords = generateKeywordsFromTopTypes(topTypes);

  return {
    scores,
    topTypes,
    keywords,
    completedAt: new Date().toISOString(),
  };
}

export function calculateCosineSimilarity(a: RIASECScores, b: RIASECScores): number {
  const keys: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of keys) {
    dotProduct += a[key] * b[key];
    magnitudeA += a[key] * a[key];
    magnitudeB += b[key] * b[key];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}
