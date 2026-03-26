/**
 * Star JSON 파일에 AI 변화 정보를 추가하는 스크립트
 * 기존 workProcess, careerTimeline 등의 데이터는 유지하면서
 * aiTransformation 정보만 추가합니다.
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

// ID 매칭 함수 (다양한 형식 지원)
function matchJobId(starJobId, kingdomJobId) {
  // 정확히 일치
  if (starJobId === kingdomJobId) return true;
  
  // 하이픈 제거 후 비교
  const normalizedStarId = starJobId.replace(/-/g, '');
  const normalizedKingdomId = kingdomJobId.replace(/-/g, '');
  if (normalizedStarId === normalizedKingdomId) return true;
  
  // 접두사 매칭 (doctor -> doctor-general)
  if (kingdomJobId.startsWith(starJobId)) return true;
  if (starJobId.startsWith(kingdomJobId)) return true;
  
  return false;
}

// 각 왕국별로 처리
Object.keys(kingdomJobFiles).forEach((kingdomId) => {
  const jobFilePath = path.join(jobsDir, kingdomJobFiles[kingdomId]);
  const starFilePath = path.join(starsDir, starFiles[kingdomId]);

  try {
    // 직업 데이터 로드 (AI 변화 정보 포함)
    const jobsContent = fs.readFileSync(jobFilePath, 'utf-8');
    const kingdomJobs = JSON.parse(jobsContent);

    // Star 파일 로드 (기존 데이터)
    const starContent = fs.readFileSync(starFilePath, 'utf-8');
    const starData = JSON.parse(starContent);

    // AI 변화 정보를 매핑으로 저장
    const aiTransformationMap = new Map();
    kingdomJobs.forEach((job) => {
      if (job.aiTransformation) {
        aiTransformationMap.set(job.id, job.aiTransformation);
      }
    });

    // 기존 jobs 배열에 AI 변화 정보만 추가
    const updatedJobs = starData.jobs.map((starJob) => {
      // 매칭되는 AI 변화 정보 찾기
      let aiTransformation = null;
      
      for (const [kingdomJobId, transformation] of aiTransformationMap.entries()) {
        if (matchJobId(starJob.id, kingdomJobId)) {
          aiTransformation = transformation;
          break;
        }
      }

      // AI 변화 정보가 있으면 추가, 없으면 기존 데이터 유지
      if (aiTransformation) {
        return {
          ...starJob,
          aiTransformation,
        };
      }
      
      return starJob;
    });

    // Star 파일 업데이트 (jobCount도 업데이트)
    const updatedStarData = {
      ...starData,
      jobCount: kingdomJobs.length,
      jobs: updatedJobs,
    };

    // Star 파일 저장
    fs.writeFileSync(starFilePath, JSON.stringify(updatedStarData, null, 2), 'utf-8');
    console.log(`✓ Updated ${starFiles[kingdomId]} with AI transformation data (${updatedJobs.filter(j => j.aiTransformation).length}/${updatedJobs.length} jobs)`);
  } catch (error) {
    console.error(`✗ Error updating ${starFiles[kingdomId]}:`, error.message);
  }
});

console.log('\n✓ All star files updated with AI transformation data!');
