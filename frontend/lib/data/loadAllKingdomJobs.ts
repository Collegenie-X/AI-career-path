/**
 * 왕국별 직업 데이터를 통합 로드하는 유틸리티
 * 8개 왕국의 184개 직업 데이터를 분할된 JSON 파일에서 불러옵니다.
 */

import exploreKingdomJobs from '@/data/jobs/explore-kingdom-jobs.json';
import createKingdomJobs from '@/data/jobs/create-kingdom-jobs.json';
import techKingdomJobs from '@/data/jobs/tech-kingdom-jobs.json';
import natureKingdomJobs from '@/data/jobs/nature-kingdom-jobs.json';
import connectKingdomJobs from '@/data/jobs/connect-kingdom-jobs.json';
import orderKingdomJobs from '@/data/jobs/order-kingdom-jobs.json';
import communicateKingdomJobs from '@/data/jobs/communicate-kingdom-jobs.json';
import challengeKingdomJobs from '@/data/jobs/challenge-kingdom-jobs.json';

export interface JobAiTransformation {
  beforeAI: string;
  afterAI: string;
  replacementRisk: 'low' | 'medium' | 'high';
  aiTools: string[];
  survivalStrategy: string[];
  replacementPressure5?: 1 | 2 | 3 | 4 | 5;
  aiCollaborationRequired5?: 1 | 2 | 3 | 4 | 5;
  collaborationPlaybook?: Array<{
    stepTitle: string;
    humanRole: string;
    aiRole: string;
    scenarioExample: string;
    recommendedTools: string[];
  }>;
}

export interface JobData {
  id: string;
  name: string;
  nameEn: string;
  kingdomId: string;
  icon: string;
  rarity: string;
  riasecProfile: Record<string, number>;
  description: string;
  shortDescription: string;
  aiTransformation?: JobAiTransformation;
  l1?: {
    keywords: string[];
    matchingTip: string;
  };
  l2?: {
    dailySchedule?: Array<{ time: string; activity: string }>;
    salaryRange?: { min: number; max: number; unit: string };
    salaryCurve?: string;
    outlook?: number;
    outlookDescription?: string;
  };
  l3?: {
    interviewQuote?: string;
    interviewerName?: string;
    interviewerTitle?: string;
    requiredSkills?: Array<{ name: string; score: number }>;
    stressLevel?: number;
    freedomLevel?: number;
    rewardLevel?: number;
    entryPath?: string;
  };
}

/**
 * 모든 왕국의 직업 데이터를 통합하여 반환합니다.
 * @returns 184개 직업 데이터 배열
 */
export function loadAllKingdomJobs(): JobData[] {
  return [
    ...exploreKingdomJobs,
    ...createKingdomJobs,
    ...techKingdomJobs,
    ...natureKingdomJobs,
    ...connectKingdomJobs,
    ...orderKingdomJobs,
    ...communicateKingdomJobs,
    ...challengeKingdomJobs,
  ] as JobData[];
}

/**
 * 특정 왕국의 직업 데이터만 반환합니다.
 * @param kingdomId 왕국 ID
 * @returns 해당 왕국의 직업 데이터 배열
 */
export function loadKingdomJobsByKingdomId(kingdomId: string): JobData[] {
  const allJobs = loadAllKingdomJobs();
  return allJobs.filter((job) => job.kingdomId === kingdomId);
}

/**
 * AI 대체 위험도별로 직업을 분류합니다.
 * @returns AI 대체 위험도별 직업 통계
 */
export function getJobsByAiReplacementRisk() {
  const allJobs = loadAllKingdomJobs();
  
  const lowRisk = allJobs.filter((job) => job.aiTransformation?.replacementRisk === 'low');
  const mediumRisk = allJobs.filter((job) => job.aiTransformation?.replacementRisk === 'medium');
  const highRisk = allJobs.filter((job) => job.aiTransformation?.replacementRisk === 'high');
  
  return {
    low: lowRisk,
    medium: mediumRisk,
    high: highRisk,
    stats: {
      lowCount: lowRisk.length,
      mediumCount: mediumRisk.length,
      highCount: highRisk.length,
      total: allJobs.length,
    },
  };
}

/**
 * 특정 직업 ID로 직업 데이터를 찾습니다.
 * @param jobId 직업 ID
 * @returns 직업 데이터 또는 undefined
 */
export function findJobById(jobId: string): JobData | undefined {
  const allJobs = loadAllKingdomJobs();
  return allJobs.find((job) => job.id === jobId);
}

/**
 * AI 도구별로 직업을 그룹화합니다.
 * @returns AI 도구별 직업 맵
 */
export function groupJobsByAiTools(): Map<string, JobData[]> {
  const allJobs = loadAllKingdomJobs();
  const toolMap = new Map<string, JobData[]>();
  
  allJobs.forEach((job) => {
    if (job.aiTransformation?.aiTools) {
      job.aiTransformation.aiTools.forEach((tool) => {
        if (!toolMap.has(tool)) {
          toolMap.set(tool, []);
        }
        toolMap.get(tool)!.push(job);
      });
    }
  });
  
  return toolMap;
}

/**
 * 왕국별 직업 통계를 반환합니다.
 * @returns 왕국별 직업 수 통계
 */
export function getKingdomJobStats() {
  const allJobs = loadAllKingdomJobs();
  const kingdomStats: Record<string, number> = {};
  
  allJobs.forEach((job) => {
    if (!kingdomStats[job.kingdomId]) {
      kingdomStats[job.kingdomId] = 0;
    }
    kingdomStats[job.kingdomId]++;
  });
  
  return kingdomStats;
}
