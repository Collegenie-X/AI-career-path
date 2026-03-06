import { ALL_STARS } from '../data/stars';
import jobsMetadata from '../data/jobs-metadata.json';
import jobsExploreConfig from '../data/jobs-explore-config.json';
import type { StarData, StarJob } from './types';

/**
 * 직업 데이터 관리 유틸리티
 */
export class JobsManager {
  /**
   * 모든 별 데이터 가져오기
   */
  static getAllStars(): StarData[] {
    return ALL_STARS;
  }

  /**
   * 특정 별 ID로 별 데이터 가져오기
   */
  static getStarById(starId: string): StarData | undefined {
    return ALL_STARS.find((star) => star.id === starId);
  }

  /**
   * 별 순서대로 정렬된 별 목록 가져오기
   */
  static getStarsInOrder(): StarData[] {
    const order = jobsExploreConfig.starOrder;
    return order
      .map((id) => ALL_STARS.find((star) => star.id === id))
      .filter((star): star is StarData => star !== undefined);
  }

  /**
   * 모든 직업 데이터 가져오기 (flat array)
   */
  static getAllJobs(): StarJob[] {
    const allJobs: StarJob[] = [];
    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job) => {
        allJobs.push(job as StarJob);
      });
    });
    return allJobs;
  }

  /**
   * 특정 직업 ID로 직업 데이터 가져오기
   */
  static getJobById(jobId: string): { job: StarJob; star: StarData } | undefined {
    for (const star of ALL_STARS) {
      const job = star.jobs.find((j) => j.id === jobId);
      if (job) {
        return { job: job as StarJob, star };
      }
    }
    return undefined;
  }

  /**
   * 특정 별의 모든 직업 가져오기
   */
  static getJobsByStarId(starId: string): StarJob[] {
    const star = this.getStarById(starId);
    return star ? (star.jobs as StarJob[]) : [];
  }

  /**
   * RIASEC 타입으로 추천 별 가져오기
   */
  static getStarsByRiasecTypes(types: string[]): StarData[] {
    const mapping = jobsMetadata.riasecMapping as Record<string, string[]>;
    const starIds = new Set<string>();

    types.forEach((type) => {
      const stars = mapping[type] || [];
      stars.forEach((id) => starIds.add(id));
    });

    return Array.from(starIds)
      .map((id) => this.getStarById(id))
      .filter((star): star is StarData => star !== undefined);
  }

  /**
   * RIASEC 타입으로 추천 직업 가져오기
   */
  static getJobsByRiasecTypes(types: string[]): Array<{ job: StarJob; star: StarData; score: number }> {
    const allJobs: Array<{ job: StarJob; star: StarData }> = [];
    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job) => {
        allJobs.push({ job: job as StarJob, star });
      });
    });

    const scored = allJobs.map(({ job, star }) => {
      let score = 0;
      job.holland.split('+').forEach((t) => {
        if (types.includes(t)) score += 2;
      });
      score += job.futureGrowth;
      return { job, star, score };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * 직업 데이터 유효성 검증
   */
  static validateJob(job: Partial<StarJob>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const required = jobsMetadata.jobFields.required;

    required.forEach((field) => {
      if (!job[field as keyof StarJob]) {
        errors.push(`필수 필드 누락: ${field}`);
      }
    });

    if (job.futureGrowth !== undefined) {
      const { min, max } = jobsMetadata.validationRules.futureGrowth;
      if (job.futureGrowth < min || job.futureGrowth > max) {
        errors.push(`futureGrowth는 ${min}~${max} 사이여야 합니다`);
      }
    }

    if (job.holland) {
      const pattern = new RegExp(jobsMetadata.validationRules.holland.pattern);
      if (!pattern.test(job.holland)) {
        errors.push(`holland 코드 형식이 올바르지 않습니다: ${job.holland}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 통계 정보 가져오기
   */
  static getStatistics() {
    return {
      totalStars: ALL_STARS.length,
      totalJobs: this.getAllJobs().length,
      jobsByStarId: jobsMetadata.jobsByStarId,
      averageJobsPerStar: this.getAllJobs().length / ALL_STARS.length,
      starsWithProfile: ALL_STARS.filter((s) => s.starProfile).length,
      jobsWithTimeline: this.getAllJobs().filter((j) => j.careerTimeline).length,
      jobsWithDailySchedule: this.getAllJobs().filter((j) => j.dailySchedule).length,
    };
  }

  /**
   * 난이도별 직업 수 가져오기
   */
  static getJobCountByDifficulty(): Record<number, number> {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ALL_STARS.forEach((star) => {
      if (star.starProfile) {
        const level = star.starProfile.difficultyLevel;
        counts[level] = (counts[level] || 0) + star.jobs.length;
      }
    });
    return counts;
  }

  /**
   * 준비 기간별 직업 수 가져오기
   */
  static getJobCountByPreparationYears(): Record<number, number> {
    const counts: Record<number, number> = {};
    ALL_STARS.forEach((star) => {
      if (star.starProfile) {
        const years = star.starProfile.avgPreparationYears;
        counts[years] = (counts[years] || 0) + star.jobs.length;
      }
    });
    return counts;
  }
}

/**
 * 직업 검색 유틸리티
 */
export class JobsSearch {
  /**
   * 키워드로 직업 검색
   */
  static searchJobs(keyword: string): Array<{ job: StarJob; star: StarData; matchScore: number }> {
    const lowerKeyword = keyword.toLowerCase();
    const results: Array<{ job: StarJob; star: StarData; matchScore: number }> = [];

    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job) => {
        const jobData = job as StarJob;
        let matchScore = 0;

        if (jobData.name.toLowerCase().includes(lowerKeyword)) matchScore += 10;
        if (jobData.shortDesc.toLowerCase().includes(lowerKeyword)) matchScore += 5;
        if (jobData.description?.toLowerCase().includes(lowerKeyword)) matchScore += 3;
        if (star.name.toLowerCase().includes(lowerKeyword)) matchScore += 2;

        if (matchScore > 0) {
          results.push({ job: jobData, star, matchScore });
        }
      });
    });

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 연봉 범위로 직업 필터링
   */
  static filterBySalaryRange(minSalary: number): Array<{ job: StarJob; star: StarData }> {
    const results: Array<{ job: StarJob; star: StarData }> = [];

    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job) => {
        const jobData = job as StarJob;
        const salaryMatch = jobData.salaryRange.match(/(\d+,?\d*)/);
        if (salaryMatch) {
          const salary = parseInt(salaryMatch[1].replace(/,/g, ''));
          if (salary >= minSalary) {
            results.push({ job: jobData, star });
          }
        }
      });
    });

    return results;
  }

  /**
   * 성장성으로 직업 필터링
   */
  static filterByFutureGrowth(minGrowth: number): Array<{ job: StarJob; star: StarData }> {
    const results: Array<{ job: StarJob; star: StarData }> = [];

    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job) => {
        const jobData = job as StarJob;
        if (jobData.futureGrowth >= minGrowth) {
          results.push({ job: jobData, star });
        }
      });
    });

    return results.sort((a, b) => b.job.futureGrowth - a.job.futureGrowth);
  }
}

export default JobsManager;
