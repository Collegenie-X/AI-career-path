/**
 * 왕국 JSON의 l1/l2/l3 구조를 별 JSON의 workProcess/careerTimeline 구조로 통일합니다.
 * 
 * 목표:
 * 1. 왕국 JSON을 단일 진실 소스(Single Source of Truth)로 만듦
 * 2. 별 JSON은 왕국 JSON을 병합하여 생성 (스크립트로 자동화)
 * 3. 조직 구조도(organizationStructure) 추가
 * 4. dailySchedule 제거 (조직 구조도로 대체)
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jobsDir = path.join(dataDir, 'jobs');
const starsDir = path.join(dataDir, 'stars');

const KINGDOMS = [
  { id: 'explore', file: 'explore-kingdom-jobs.json', star: 'explore-star.json' },
  { id: 'create', file: 'create-kingdom-jobs.json', star: 'create-star.json' },
  { id: 'tech', file: 'tech-kingdom-jobs.json', star: 'tech-star.json' },
  { id: 'nature', file: 'nature-kingdom-jobs.json', star: 'nature-star.json' },
  { id: 'connect', file: 'connect-kingdom-jobs.json', star: 'connect-star.json' },
  { id: 'order', file: 'order-kingdom-jobs.json', star: 'order-star.json' },
  { id: 'communicate', file: 'communicate-kingdom-jobs.json', star: 'communicate-star.json' },
  { id: 'challenge', file: 'challenge-kingdom-jobs.json', star: 'challenge-star.json' },
];

/** 기존 별 JSON의 legacy 직업 ID → 왕국 JSON ID 매핑 */
const LEGACY_TO_KINGDOM_ID = {
  explore: {
    doctor: 'doctor-general',
    'ai-researcher': 'biotech-researcher',
    pharmacist: 'pharmacist',
  },
  create: {
    'ux-designer': 'ux-ui-designer-ai',
    'webtoon-artist': 'webtoon-artist-ai',
    architect: 'architect-ai',
    'film-director': 'film-director-ai',
  },
  tech: {
    'fullstack-developer': 'fullstack-developer-ai',
    'game-developer': 'game-programmer-ai',
    'cybersecurity-expert': 'security-engineer-ai',
  },
  nature: {
    'environmental-scientist': 'environmental-scientist-ai',
    veterinarian: 'conservation-biologist-ai',
    'marine-biologist': 'ocean-conservation-specialist-ai',
  },
  connect: {
    teacher: 'teacher-ai',
    'social-worker': 'social-worker-ai',
    marketer: 'community-organizer-ai',
  },
  order: {
    lawyer: 'lawyer-ai',
    accountant: 'accountant-ai',
    'police-detective': 'compliance-officer-ai',
  },
  communicate: {
    journalist: 'journalist-ai',
    'pd-director': 'video-producer-ai',
    announcer: 'broadcaster-ai',
  },
  challenge: {
    entrepreneur: 'entrepreneur-ai',
    'pro-athlete': 'executive-coach-ai',
    'space-engineer': 'innovation-consultant-ai',
  },
};

function riasecToHolland(profile) {
  if (!profile || typeof profile !== 'object') return 'I';
  const entries = Object.entries(profile)
    .filter(([, v]) => typeof v === 'number' && v >= 4)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return 'I';
  return entries
    .slice(0, 3)
    .map(([k]) => k)
    .join('+');
}

function replacementRiskToKr(risk) {
  if (risk === 'low') return '낮음';
  if (risk === 'high') return '높음';
  return '중간';
}

function salaryFromKingdom(kj) {
  const sr = kj.l2?.salaryRange;
  if (!sr || sr.min == null || sr.max == null) return '—';
  const unit = sr.unit || '만원/년';
  return `${Number(sr.min).toLocaleString()}~${Number(sr.max).toLocaleString()}${unit}`;
}

/** 조직 구조도 기본 템플릿 생성 */
function buildDefaultOrganizationStructure(jobName) {
  return {
    title: `${jobName} 조직 구조`,
    description: '일반적인 직급 체계와 승진 경로입니다. 회사·병원·기관마다 차이가 있습니다.',
    levels: [
      {
        level: 1,
        title: '신입',
        icon: '🌱',
        yearsRange: '0~3년',
        roles: ['실무 수행', '선배 지원', '기본 업무 학습'],
        requiredSkills: ['기초 지식', '학습 의지', '팀워크'],
        avgSalary: '—',
      },
      {
        level: 2,
        title: '중급',
        icon: '🔧',
        yearsRange: '3~7년',
        roles: ['독립 업무 수행', '후배 멘토링', '프로젝트 리드'],
        requiredSkills: ['전문 지식', '문제 해결', '커뮤니케이션'],
        avgSalary: '—',
      },
      {
        level: 3,
        title: '시니어',
        icon: '⭐',
        yearsRange: '7~15년',
        roles: ['전략 수립', '팀 관리', '의사 결정'],
        requiredSkills: ['리더십', '전략적 사고', '조직 관리'],
        avgSalary: '—',
      },
    ],
    promotionCriteria: ['실적', '역량 평가', '리더십', '전문성'],
    careerPaths: [
      { path: '전문가 트랙', description: '기술·전문성 심화' },
      { path: '관리자 트랙', description: '팀·조직 관리' },
    ],
  };
}

/** 기존 별 JSON의 workProcess/careerTimeline을 왕국 JSON으로 역이동 */
function migrateStarToKingdom(kingdomId) {
  const starPath = path.join(starsDir, KINGDOMS.find((k) => k.id === kingdomId).star);
  const kingdomPath = path.join(jobsDir, KINGDOMS.find((k) => k.id === kingdomId).file);

  const starData = JSON.parse(fs.readFileSync(starPath, 'utf-8'));
  const kingdomJobs = JSON.parse(fs.readFileSync(kingdomPath, 'utf-8'));

  const legacyMap = Object.fromEntries((starData.jobs || []).map((j) => [j.id, j]));
  const idMap = LEGACY_TO_KINGDOM_ID[kingdomId] || {};

  const updated = kingdomJobs.map((kj) => {
    const legacyId = Object.keys(idMap).find((oldId) => idMap[oldId] === kj.id) || kj.id;
    const legacy = legacyMap[legacyId];

    const base = {
      ...kj,
      workProcess: legacy?.workProcess || {
        title: `${kj.name}의 직무 프로세스`,
        description: kj.description,
        phases: [],
      },
      careerTimeline: legacy?.careerTimeline || {
        title: `${kj.name} 준비 경로`,
        totalYears: '—',
        totalCost: '—',
        milestones: [],
        keySuccess: [],
      },
      organizationStructure: kj.organizationStructure || buildDefaultOrganizationStructure(kj.name),
    };

    delete base.l2?.dailySchedule;

    return base;
  });

  fs.writeFileSync(kingdomPath, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`✓ ${kingdomId}: ${updated.length} jobs unified (workProcess/careerTimeline/organizationStructure)`);
}

KINGDOMS.forEach((k) => migrateStarToKingdom(k.id));
console.log('\n✓ All kingdom JSONs now have workProcess, careerTimeline, organizationStructure.');
console.log('✓ dailySchedule removed from l2.');
