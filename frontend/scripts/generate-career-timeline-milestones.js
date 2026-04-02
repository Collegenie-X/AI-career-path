/**
 * 모든 직업 JSON의 careerTimeline.milestones를 중2~고3 + 대학 + 취업 단계로 채웁니다.
 * 외부 활동·프로젝트·대회·자격증 중심으로 작성하며, 수능·내신 공부는 제외합니다.
 * 
 * 실행: node frontend/scripts/generate-career-timeline-milestones.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

/** 학년·학기 순서 (중2 1학기 ~ 고3 2학기 + 대학 + 취업) */
const TIMELINE_PERIODS = [
  { period: '중2', semester: '1학기', icon: '🌱', stage: 'middle' },
  { period: '중2', semester: '2학기', icon: '📚', stage: 'middle' },
  { period: '중3', semester: '1학기', icon: '🔍', stage: 'middle' },
  { period: '중3', semester: '2학기', icon: '🎯', stage: 'middle' },
  { period: '고1', semester: '1학기', icon: '🚀', stage: 'high' },
  { period: '고1', semester: '2학기', icon: '⚙️', stage: 'high' },
  { period: '고2', semester: '1학기', icon: '💡', stage: 'high' },
  { period: '고2', semester: '2학기', icon: '🏆', stage: 'high' },
  { period: '고3', semester: '1학기', icon: '📝', stage: 'high' },
  { period: '고3', semester: '2학기', icon: '🎓', stage: 'high' },
  { period: '대학', semester: '1~4학년', icon: '🎓', stage: 'college' },
  { period: '취업', semester: '준비·전환', icon: '💼', stage: 'career' },
];

/** Holland 코드별 초기 관심사 */
const HOLLAND_SEEDS = {
  R: ['실험 키트 조립', '로봇 만들기', '기계 분해·조립'],
  I: ['과학 실험 관찰', '탐구 보고서', '논리 퍼즐'],
  A: ['그림 그리기', '글쓰기', '음악·영상 제작'],
  S: ['봉사 활동', '또래 멘토링', '공감 대화'],
  E: ['반장·리더 경험', '기획·홍보', '창업 아이디어'],
  C: ['정리·분류', '데이터 수집', '규칙 만들기'],
};

/** 직업군별 중등 핵심 활동 */
function getMiddleSchoolActivities(job) {
  const name = job.name;
  const holland = (job.holland || '').charAt(0);
  const seed = HOLLAND_SEEDS[holland] || ['기초 탐색'];
  
  const activities = {
    '중2-1': {
      title: `${name} 직업 탐색 시작`,
      activities: [
        `커리어넷·워크넷에서 '${name}' 직업 정보 조사`,
        ...seed.slice(0, 2),
      ],
      achievement: `${name}에 대한 첫 관심과 기초 이해`,
      cost: '무료',
    },
    '중2-2': {
      title: `관련 분야 기초 체험`,
      activities: [
        `${name} 관련 도서 3권 읽기`,
        `온라인 무료 강의 1개 수강`,
        `관련 유튜브 채널 구독·정리`,
      ],
      achievement: `${name} 직무의 핵심 키워드 파악`,
      cost: '도서 3~5만원',
    },
    '중3-1': {
      title: `첫 프로젝트·활동 시작`,
      activities: [
        `동아리 또는 자율 활동으로 미니 프로젝트`,
        `${name} 관련 탐구 보고서 작성`,
        `지역 대회·공모전 정보 수집`,
      ],
      achievement: `첫 산출물 완성 (보고서·작품·발표)`,
      cost: '재료비 2~5만원',
    },
    '중3-2': {
      title: `고입 준비 + 진로 확정`,
      activities: [
        `고등학교 선택과목 전략 수립`,
        `${name} 관련 고교 동아리·프로그램 조사`,
        `포트폴리오 초안 정리 (활동 기록)`,
      ],
      achievement: `고입 지원서 작성, 진로 방향 확정`,
      cost: '무료',
    },
  };
  return activities;
}

/** 고등 단계 활동 */
function getHighSchoolActivities(job) {
  const name = job.name;
  const aiTools = job.aiTransformation?.aiTools || [];
  const toolHint = aiTools.length > 0 ? aiTools[0] : '전문 도구';

  return {
    '고1-1': {
      title: `전공 기초 다지기`,
      activities: [
        `${name} 관련 선택과목 수강 시작`,
        `교과 세특 연계 탐구 활동 1건`,
        `관련 동아리 가입 (또는 자율 동아리 창설)`,
      ],
      achievement: `학생부 첫 세특 기록, 동아리 활동 시작`,
      cost: '동아리비 3~5만원',
      setak: `${name} 관련 교과에서 심화 탐구 주제 발표·보고서 제출`,
    },
    '고1-2': {
      title: `실전 도구 습득`,
      activities: [
        `${toolHint} 등 실무 도구 온라인 강의 수강`,
        `미니 프로젝트 1건 완성`,
        `교내 발표대회 또는 전시 참가`,
      ],
      achievement: `실무 도구 기초 습득, 교내 발표 경험`,
      cost: '강의비 5~10만원',
      setak: `프로젝트 결과를 교과 수업 중 발표하여 세특 기록`,
    },
    '고2-1': {
      title: `외부 대회·공모전 도전`,
      activities: [
        `전국 단위 ${name} 관련 공모전 참가`,
        `팀 프로젝트 (2~3인) 협업 경험`,
        `결과물을 포트폴리오에 정리`,
      ],
      awards: [`${name} 관련 공모전 입상 (장려~우수)`],
      achievement: `전국 대회 경험, 협업 역량 증명`,
      cost: '참가비·재료비 5~10만원',
      setak: `공모전 준비 과정을 교과 세특에 연계 (탐구·발표)`,
    },
    '고2-2': {
      title: `심화 프로젝트 + 포트폴리오`,
      activities: [
        `개인 또는 팀 심화 프로젝트 (3개월 이상)`,
        `결과물을 온라인 공개 (GitHub·포트폴리오 사이트 등)`,
        `관련 자격증 취득 (선택)`,
      ],
      achievement: `대표 프로젝트 완성, 포트폴리오 핵심 항목 확보`,
      cost: '자격증 응시료 5~15만원',
      setak: `프로젝트를 교과 수업 중 최종 발표·전시`,
    },
    '고3-1': {
      title: `대입 준비 집중`,
      activities: [
        `학생부 최종 점검 (세특·수상·활동 정리)`,
        `포트폴리오 최종 버전 완성`,
        `모의 면접 연습 (학교·외부 멘토)`,
      ],
      achievement: `대입 서류 완성, 면접 준비 완료`,
      cost: '면접 컨설팅 10~30만원 (선택)',
      setak: `최종 세특 마감, 담임·교과 선생님 최종 확인`,
    },
    '고3-2': {
      title: `수시 지원 + 정시 대비`,
      activities: [
        `수시 6개 대학 지원`,
        `면접 일정 관리 및 최종 연습`,
        `정시 대비 (선택)`,
      ],
      achievement: `대학 합격`,
      cost: '원서 접수비 6만원',
    },
  };
}

/** 대학 단계 */
function getCollegeActivities(job) {
  const name = job.name;
  return {
    title: `${name} 전공 심화 + 실무 경험`,
    activities: [
      `전공 필수·심화 과목 이수`,
      `학회·동아리·프로젝트 팀 활동`,
      `인턴십 또는 현장 실습 (2~3회)`,
      `졸업 프로젝트 또는 논문`,
    ],
    achievement: `${name} 직무에 필요한 전공 지식·실무 경험 확보`,
    cost: '학비 + 생활비 (개인차)',
  };
}

/** 취업 단계 */
function getCareerEntryActivities(job) {
  const name = job.name;
  const entry = job.entryProcess?.trim();
  const activities = entry
    ? [`${entry}`, `포트폴리오·이력서 최종 정리`, `기업·기관 지원 + 면접`]
    : [`${name} 채용 공고 탐색`, `포트폴리오·이력서 작성`, `면접 준비 + 지원`];

  return {
    title: `${name} 취업·전환`,
    activities,
    achievement: `${name} 직무 시작 또는 유사 직무로 경력 시작`,
    cost: '자격증·면접 준비 비용 (개인차)',
  };
}

/** 직업 하나의 milestones 생성 */
function generateMilestones(job) {
  const middle = getMiddleSchoolActivities(job);
  const high = getHighSchoolActivities(job);
  const college = getCollegeActivities(job);
  const career = getCareerEntryActivities(job);

  const milestones = [];

  for (const tp of TIMELINE_PERIODS) {
    const key = `${tp.period}-${tp.semester.charAt(0)}`;
    let m = null;

    if (tp.stage === 'middle') {
      const data = middle[key];
      if (data) {
        m = {
          period: tp.period,
          semester: tp.semester,
          icon: tp.icon,
          title: data.title,
          activities: data.activities,
          achievement: data.achievement,
          cost: data.cost,
        };
        if (data.awards) m.awards = data.awards;
        if (data.setak) m.setak = data.setak;
      }
    } else if (tp.stage === 'high') {
      const data = high[key];
      if (data) {
        m = {
          period: tp.period,
          semester: tp.semester,
          icon: tp.icon,
          title: data.title,
          activities: data.activities,
          achievement: data.achievement,
          cost: data.cost,
        };
        if (data.awards) m.awards = data.awards;
        if (data.setak) m.setak = data.setak;
      }
    } else if (tp.stage === 'college') {
      m = {
        period: tp.period,
        semester: tp.semester,
        icon: tp.icon,
        title: college.title,
        activities: college.activities,
        achievement: college.achievement,
        cost: college.cost,
      };
    } else if (tp.stage === 'career') {
      m = {
        period: tp.period,
        semester: tp.semester,
        icon: tp.icon,
        title: career.title,
        activities: career.activities,
        achievement: career.achievement,
        cost: career.cost,
      };
    }

    if (m) milestones.push(m);
  }

  return milestones;
}

/** keySuccess 생성 (없으면 survivalStrategy 또는 기본) */
function generateKeySuccess(job) {
  const existing = job.careerTimeline?.keySuccess;
  if (existing && existing.length > 0 && existing[0] !== '관련 전공·자격·프로젝트 경험을 꾸준히 쌓기') {
    return existing;
  }
  const survival = job.aiTransformation?.survivalStrategy || [];
  if (survival.length > 0) return survival.slice(0, 5);
  return [
    `${job.name} 관련 교과 세특 누적 (탐구·발표·보고서)`,
    `외부 대회·공모전 입상 경험 (최소 2건)`,
    `실무 도구·기술 습득 (온라인 강의·자격증)`,
    `포트폴리오 프로젝트 완성 (최소 3건)`,
    `인턴십·현장 실습 경험 (대학 중)`,
  ];
}

/** totalYears / totalCost 계산 */
function calculateSummary(job) {
  const existing = job.careerTimeline;
  let totalYears = existing?.totalYears;
  let totalCost = existing?.totalCost;

  if (!totalYears || totalYears === '—' || totalYears === '개인차 큼') {
    totalYears = '중2 ~ 대학 졸업 (약 7~8년)';
  }
  if (!totalCost || totalCost === '—' || totalCost === '개인차 큼') {
    totalCost = '50~150만원 (대학 학비 제외)';
  }

  return { totalYears, totalCost };
}

/** 직업 하나 처리 */
function enrichCareerTimeline(job) {
  if (!job.careerTimeline) {
    job.careerTimeline = {
      title: `${job.name}의 준비 경로`,
      totalYears: '—',
      totalCost: '—',
      milestones: [],
      keySuccess: [],
    };
  }

  const { totalYears, totalCost } = calculateSummary(job);
  job.careerTimeline.title = `${job.name}의 준비 경로`;
  job.careerTimeline.totalYears = totalYears;
  job.careerTimeline.totalCost = totalCost;
  job.careerTimeline.milestones = generateMilestones(job);
  job.careerTimeline.keySuccess = generateKeySuccess(job);
}

function processStarFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!data.jobs || !Array.isArray(data.jobs)) return 0;
  for (const job of data.jobs) {
    enrichCareerTimeline(job);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data.jobs.length;
}

function processKingdomFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return 0;
  for (const job of data) {
    enrichCareerTimeline(job);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data.length;
}

function main() {
  const starsDir = path.join(DATA, 'stars');
  const jobsDir = path.join(DATA, 'jobs');
  let total = 0;

  const starFiles = fs.readdirSync(starsDir).filter((f) => f.endsWith('.json'));
  for (const f of starFiles) {
    const p = path.join(starsDir, f);
    const c = processStarFile(p);
    total += c;
    console.log(`stars/${f}: ${c} jobs`);
  }

  const jobFiles = fs
    .readdirSync(jobsDir)
    .filter((f) => f.endsWith('-kingdom-jobs.json'));
  for (const f of jobFiles) {
    const p = path.join(jobsDir, f);
    const c = processKingdomFile(p);
    total += c;
    console.log(`jobs/${f}: ${c} jobs`);
  }

  console.log(`Done. careerTimeline.milestones generated for ${total} job entries.`);
}

main();
