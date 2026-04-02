/**
 * data/jobs/*-kingdom-jobs.json 의 직업 목록을 data/stars/*-star.json 의 jobs 에 반영합니다.
 * 기존 별 JSON에만 있던 풍부한 workProcess / careerTimeline 은 legacy ID 매핑으로 병합합니다.
 * jobCount 는 항상 jobs.length 와 일치시킵니다.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jobsDir = path.join(dataDir, 'jobs');
const starsDir = path.join(dataDir, 'stars');

const KINGDOM_FILES = [
  { kingdomId: 'explore', file: 'explore-kingdom-jobs.json', star: 'explore-star.json' },
  { kingdomId: 'create', file: 'create-kingdom-jobs.json', star: 'create-star.json' },
  { kingdomId: 'tech', file: 'tech-kingdom-jobs.json', star: 'tech-star.json' },
  { kingdomId: 'nature', file: 'nature-kingdom-jobs.json', star: 'nature-star.json' },
  { kingdomId: 'connect', file: 'connect-kingdom-jobs.json', star: 'connect-star.json' },
  { kingdomId: 'order', file: 'order-kingdom-jobs.json', star: 'order-star.json' },
  { kingdomId: 'communicate', file: 'communicate-kingdom-jobs.json', star: 'communicate-star.json' },
  { kingdomId: 'challenge', file: 'challenge-kingdom-jobs.json', star: 'challenge-star.json' },
];

/** 왕국 직업 id → 기존 별 JSON에 있던 직업 id (풀 콘텐츠 병합용) */
const LEGACY_ID_BY_KINGDOM_JOB_ID = {
  explore: {
    'doctor-general': 'doctor',
    pharmacist: 'pharmacist',
    'biotech-researcher': 'ai-researcher',
  },
  create: {
    'ux-ui-designer-ai': 'ux-designer',
    'webtoon-artist-ai': 'webtoon-artist',
    'architect-ai': 'architect',
    'film-director-ai': 'film-director',
  },
  tech: {
    'fullstack-developer-ai': 'fullstack-developer',
    'game-programmer-ai': 'game-developer',
    'security-engineer-ai': 'cybersecurity-expert',
  },
  nature: {
    'environmental-scientist-ai': 'environmental-scientist',
    'conservation-biologist-ai': 'veterinarian',
    'ocean-conservation-specialist-ai': 'marine-biologist',
  },
  connect: {
    'teacher-ai': 'teacher',
    'social-worker-ai': 'social-worker',
    'community-organizer-ai': 'marketer',
  },
  order: {
    'lawyer-ai': 'lawyer',
    'accountant-ai': 'accountant',
    'compliance-officer-ai': 'police-detective',
  },
  communicate: {
    'journalist-ai': 'journalist',
    'video-producer-ai': 'pd-director',
    'broadcaster-ai': 'announcer',
  },
  challenge: {
    'entrepreneur-ai': 'entrepreneur',
    'executive-coach-ai': 'pro-athlete',
    'innovation-consultant-ai': 'space-engineer',
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
  if (risk === 'medium') return '중간';
  return '중간';
}

function salaryFromKingdom(kj) {
  const sr = kj.l2?.salaryRange;
  if (!sr || sr.min == null || sr.max == null) return '—';
  const unit = sr.unit || '만원/년';
  return `${Number(sr.min).toLocaleString()}~${Number(sr.max).toLocaleString()}${unit}`;
}

function buildGenericWorkProcess(kj) {
  const name = kj.name;
  const desc = kj.description || '';
  return {
    title: `${name}의 직무 프로세스`,
    description: desc,
    phases: [
      {
        id: 1,
        phase: '이해',
        icon: '🔍',
        title: '과제·상황 파악',
        description: `${name} 업무에서 우선 해결할 과제와 이해관계자 요구를 정리합니다.`,
        duration: '가변',
        tools: ['협업 문서', '업무 메모'],
        skills: ['관찰력', '문제 정의'],
      },
      {
        id: 2,
        phase: '실행',
        icon: '⚙️',
        title: '실행·검증',
        description: desc.length > 0 ? desc.slice(0, 200) : '핵심 업무를 수행하고 중간 결과를 점검합니다.',
        duration: '가변',
        tools: ['전문 도구', 'AI 보조'],
        skills: ['실행력', '품질 관리'],
      },
      {
        id: 3,
        phase: '개선',
        icon: '📈',
        title: '피드백·개선',
        description: '결과를 검토하고 다음 사이클을 설계합니다.',
        duration: '가변',
        tools: ['리포트', '대시보드'],
        skills: ['피드백 수용', '개선 루프'],
      },
    ],
  };
}

function buildGenericCareerTimeline(kj) {
  return {
    title: `${kj.name}의 준비 경로`,
    totalYears: '10년+',
    totalCost: '개인차 큼',
    milestones: [],
    keySuccess: ['관련 전공·자격·프로젝트 경험을 꾸준히 쌓기'],
  };
}

function buildJobFromKingdomOnly(kj) {
  const holland = riasecToHolland(kj.riasecProfile);
  const aiRisk = replacementRiskToKr(kj.aiTransformation?.replacementRisk);
  return {
    id: kj.id,
    name: kj.name,
    icon: kj.icon,
    image: `${kj.id}-hero.jpg`,
    holland,
    description: kj.description,
    shortDesc: kj.shortDescription,
    salaryRange: salaryFromKingdom(kj),
    aiRisk,
    futureGrowth: kj.l2?.outlook ?? 4,
    admissionPath: '학종+정시',
    entryProcess: kj.l3?.entryPath || '관련 전공 및 실무 경로',
    aiTransformation: kj.aiTransformation,
    workProcess: kj.workProcess || buildGenericWorkProcess(kj),
    careerTimeline: kj.careerTimeline || buildGenericCareerTimeline(kj),
    organizationStructure: kj.organizationStructure,
  };
}

function mergeKingdomWithLegacy(kj, legacy) {
  const base = buildJobFromKingdomOnly(kj);
  return {
    ...legacy,
    ...base,
    workProcess: kj.workProcess || legacy.workProcess,
    careerTimeline: kj.careerTimeline || legacy.careerTimeline,
    organizationStructure: kj.organizationStructure || legacy.organizationStructure,
    aiTransformation: kj.aiTransformation ?? legacy.aiTransformation,
    holland: base.holland,
    salaryRange: base.salaryRange,
    futureGrowth: kj.l2?.outlook ?? legacy.futureGrowth,
    entryProcess: kj.l3?.entryPath || legacy.entryProcess,
    description: kj.description,
    shortDesc: kj.shortDescription,
    name: kj.name,
    id: kj.id,
    icon: kj.icon,
    image: `${kj.id}-hero.jpg`,
  };
}

function run() {
  KINGDOM_FILES.forEach(({ kingdomId, file, star }) => {
    const kingdomPath = path.join(jobsDir, file);
    const starPath = path.join(starsDir, star);
    const kingdomJobs = JSON.parse(fs.readFileSync(kingdomPath, 'utf-8'));
    const starData = JSON.parse(fs.readFileSync(starPath, 'utf-8'));

    const legacyMap = Object.fromEntries((starData.jobs || []).map((j) => [j.id, j]));
    const idMap = LEGACY_ID_BY_KINGDOM_JOB_ID[kingdomId] || {};

    const mergedJobs = kingdomJobs.map((kj) => {
      const legacyKey = idMap[kj.id] ?? kj.id;
      const legacy = legacyMap[legacyKey];
      if (legacy) {
        return mergeKingdomWithLegacy(kj, legacy);
      }
      return buildJobFromKingdomOnly(kj);
    });

    const next = {
      ...starData,
      jobCount: mergedJobs.length,
      jobs: mergedJobs,
    };

    fs.writeFileSync(starPath, JSON.stringify(next, null, 2), 'utf-8');
    console.log(`✓ ${star}: ${mergedJobs.length} jobs (kingdom ${kingdomJobs.length})`);
  });
  console.log('\nDone. jobCount === jobs.length for all stars.');
}

run();
