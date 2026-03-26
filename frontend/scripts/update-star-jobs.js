/**
 * Star JSON 파일의 jobs 배열을 새로운 직업 데이터로 업데이트하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jobsDir = path.join(dataDir, 'jobs');
const starsDir = path.join(dataDir, 'stars');

// 왕국별 직업 파일 로드
const kingdomJobFiles = {
  explore: 'explore-kingdom-jobs.json',
  create: 'create-kingdom-jobs.json',
  tech: 'tech-kingdom-jobs.json',
  nature: 'nature-kingdom-jobs.json',
  connect: 'connect-kingdom-jobs.json',
  order: 'order-kingdom-jobs.json',
  communicate: 'communicate-kingdom-jobs.json',
  challenge: 'challenge-kingdom-jobs.json',
};

// 왕국별 star 파일
const starFiles = {
  explore: 'explore-star.json',
  create: 'create-star.json',
  tech: 'tech-star.json',
  nature: 'nature-star.json',
  connect: 'connect-star.json',
  order: 'order-star.json',
  communicate: 'communicate-star.json',
  challenge: 'challenge-star.json',
};

// 각 왕국별로 처리
Object.keys(kingdomJobFiles).forEach((kingdomId) => {
  const jobFilePath = path.join(jobsDir, kingdomJobFiles[kingdomId]);
  const starFilePath = path.join(starsDir, starFiles[kingdomId]);

  try {
    // 직업 데이터 로드
    const jobsContent = fs.readFileSync(jobFilePath, 'utf-8');
    const jobs = JSON.parse(jobsContent);

    // Star 파일 로드
    const starContent = fs.readFileSync(starFilePath, 'utf-8');
    const starData = JSON.parse(starContent);

    // jobs 배열만 업데이트 (나머지 starProfile 등은 유지)
    const updatedStarData = {
      ...starData,
      jobCount: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        icon: job.icon,
        image: `${job.id}-hero.jpg`,
        holland: Object.entries(job.riasecProfile)
          .filter(([_, score]) => score >= 4)
          .map(([key]) => key)
          .join('+') || 'I',
        description: job.description,
        shortDesc: job.shortDescription,
        salaryRange: job.l2?.salaryRange 
          ? `${job.l2.salaryRange.min.toLocaleString()}~${job.l2.salaryRange.max.toLocaleString()}${job.l2.salaryRange.unit}`
          : '정보 없음',
        aiRisk: job.aiTransformation?.replacementRisk === 'low' ? '낮음' 
              : job.aiTransformation?.replacementRisk === 'medium' ? '중간' 
              : '높음',
        futureGrowth: job.l2?.outlook || 3,
        admissionPath: '학종+정시',
        entryProcess: job.l3?.entryPath || '관련 전공 4년',
        // AI 변화 정보 추가
        aiTransformation: job.aiTransformation ? {
          beforeAI: job.aiTransformation.beforeAI,
          afterAI: job.aiTransformation.afterAI,
          replacementRisk: job.aiTransformation.replacementRisk,
          aiTools: job.aiTransformation.aiTools,
          survivalStrategy: job.aiTransformation.survivalStrategy,
        } : undefined,
        // 기존 workProcess는 유지 (첫 3개 직업만 있으면 됨)
        ...(starData.jobs.find(j => j.id === job.id)?.workProcess && {
          workProcess: starData.jobs.find(j => j.id === job.id).workProcess
        }),
        ...(starData.jobs.find(j => j.id === job.id)?.careerRoute && {
          careerRoute: starData.jobs.find(j => j.id === job.id).careerRoute
        }),
        ...(starData.jobs.find(j => j.id === job.id)?.admissionStrategy && {
          admissionStrategy: starData.jobs.find(j => j.id === job.id).admissionStrategy
        }),
      })),
    };

    // Star 파일 저장
    fs.writeFileSync(starFilePath, JSON.stringify(updatedStarData, null, 2), 'utf-8');
    console.log(`✓ Updated ${starFiles[kingdomId]} with ${jobs.length} jobs`);
  } catch (error) {
    console.error(`✗ Error updating ${starFiles[kingdomId]}:`, error.message);
  }
});

console.log('\n✓ All star files updated successfully!');
