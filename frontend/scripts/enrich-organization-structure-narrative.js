/**
 * organizationStructure를 직무명·한줄 설명 기반 서술형(roleNarrative, competencyNarrative)으로 채우고,
 * promotionCriteria·careerPaths 설명을 커리어 패스 카드와 비슷한 문단 톤으로 확장합니다.
 * 실행: node frontend/scripts/enrich-organization-structure-narrative.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

function clipText(s, max) {
  const t = String(s || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buildOrgDescription(jobName, starName) {
  const starPart = starName ? `「${starName}」 직업군에 속한 ` : '';
  return `${starPart}‘${jobName}’ 직무에서 직급이 올라갈수록 담당 범위·결정·대외 책임이 달라집니다. 위에서 아래로는 책임 범위가 넓은 직급부터, 아래로 갈수록 실행·학습에 집중하는 단계입니다. 아래 ‘커리어 경로 옵션’과 함께 읽으면, 같은 직무 안에서 전문가·관리자 등으로 나뉘는 길을 상상하기 쉽습니다.`;
}

function buildRoleNarrative(jobName, clip, levelNum) {
  const ctx = clip ? `‘${clip}’ 맥락의 ` : '';
  if (levelNum === 3) {
    return `‘${jobName}’ 직무의 시니어·책임 단계에서는 팀·프로젝트의 큰 방향을 함께 정하고, ${ctx}품질 기준과 일정·예산을 책임집니다. 외부·경영진과의 협의를 주도하고, 후배의 성장과 산출물 검토까지 아우르는 역할이 중심입니다.`;
  }
  if (levelNum === 2) {
    return `‘${jobName}’ 직무의 중급 단계에서는 기간·범위가 정해진 과제를 스스로 끝까지 완수하고, 신입·주니어의 실무를 코칭합니다. ${ctx}산출물을 팀 표준에 맞춰 검토·개선하며, 모호한 요구를 구체적인 작업 목록으로 바꾸는 일이 반복됩니다.`;
  }
  return `‘${jobName}’ 직무의 신입·주니어 단계에서는 배정된 일과를 정해진 기한 안에 수행하고, 선배의 지시·피드백에 따라 기본기를 쌓습니다. ${ctx}업무 흐름을 익히며, 실수를 줄이고 재현 가능한 품질을 만드는 데 집중합니다.`;
}

function buildCompetencyNarrative(jobName, levelNum) {
  if (levelNum === 3) {
    return `조직 전체를 보는 시야, 우선순위 결정, 리스크 관리, 그리고 사람을 이끄는 커뮤니케이션이 요구됩니다. 단순 실행이 아니라 ‘왜 이렇게 할지’를 설명하고 합의를 이끌어낼 수 있어야 하며, ‘${jobName}’ 직무의 대외적 책임을 질 수 있는 성숙도가 기대됩니다.`;
  }
  if (levelNum === 2) {
    return `해당 분야의 실무 지식과 문제 해결 능력, 그리고 동료·고객과의 협업을 통해 모호한 요구를 구체적인 작업으로 바꾸는 능력이 필요합니다. 문서화·리뷰·피드백을 루틴으로 남기며, ‘${jobName}’ 직무에서 산출물의 기준을 팀에 공유하는 힘이 중요합니다.`;
  }
  return `기초 이론·도구 습득, 질문과 기록의 습관, 그리고 팀 규칙에 맞춰 협업하는 태도가 핵심입니다. 아직 전략은 배우는 단계이며, 실행력과 학습 속도가 평가에 크게 반영되며, ‘${jobName}’ 직무에서 약속한 품질과 기한을 지키는 책임감이 부담집니다.`;
}

function buildPromotionCriteria(jobName, clip) {
  const mid = clip
    ? `승진 심사에서는 ‘${clip}’과 연결된 성과·포트폴리오, 프로젝트 리드·협업 경험, 그리고 문제를 정의하고 해결한 사례를 구체적으로 확인하는 경우가 많습니다.`
    : `승진 심사에서는 정해진 기한 안에 결과를 안정적으로 내는지, 동료를 도울 수 있는지, 그리고 과제를 끝까지 책임진 경험이 있는지를 함께 봅니다.`;
  return [
    `${jobName} 직무에서 상위 직급으로 갈수록 기대되는 범위·책임이 달라집니다. 연차·실무 경험은 ‘무엇을 해왔는지’뿐 아니라 ‘누구와 어떻게 해냈는지’까지 포함해 해석되는 경우가 많습니다.`,
    mid,
    `리더·시니어 직급으로 갈수록 개인 실적뿐 아니라 팀·조직에 기여하는지(후배 육성, 프로세스 개선, 대외 책임)가 함께 평가됩니다.`,
  ];
}

/** 이미 스크립트로 길게 풀린 문단이 다시 들어오는 것을 방지 (80자 초과면 한 줄 요약으로 간주하지 않음) */
function careerPathShortSummary(path, oldDesc) {
  const raw = String(oldDesc || '').trim();
  if (raw.length > 0 && raw.length <= 80 && !raw.includes('요약하면')) {
    return raw;
  }
  if (path.includes('전문')) return '기술·전문성 심화';
  if (path.includes('관리') || path.includes('매니저')) return '팀·조직 관리';
  return raw.length <= 80 ? raw : '';
}

function expandCareerPathDescription(jobName, path, oldDesc) {
  const base = careerPathShortSummary(path, oldDesc);
  const basePart = base ? `요약하면 ‘${base}’에 가깝고, ` : '';
  if (path.includes('전문')) {
    return `‘${path}’는 ‘${jobName}’ 직무에서 한 분야·기술·고객군에 깊이를 더하는 길입니다. ${basePart}실제로는 자격·포트폴리오·연구·커뮤니티 활동이 뒷받침될 때 유리합니다.`;
  }
  if (path.includes('관리') || path.includes('매니저')) {
    return `‘${path}’는 실행·코칭·조직 운영을 통해 사람과 일정을 함께 맡는 길입니다. ${basePart}팀 목표를 설정하고, 성과를 관리하며, 갈등을 조정하는 역할이 늘어납니다.`;
  }
  return `‘${path}’는 ‘${jobName}’ 직무에서 흔히 선택하는 진로 방향 중 하나입니다. ${basePart}회사·업종에 따라 직함과 연차는 다르지만, 같은 그림을 가지고 경로를 설계할 수 있습니다.`;
}

function enrichOrganizationBlock(job, ctx) {
  const org = job.organizationStructure;
  if (!org || !Array.isArray(org.levels) || org.levels.length === 0) return;

  const short = job.shortDesc || job.shortDescription || job.description || '';
  const shortClip = clipText(short, 150);
  const name = job.name || '해당 직무';

  org.title = `${name} 조직 구조`;
  org.description = buildOrgDescription(name, ctx.starName);

  org.levels = org.levels.map((lvl) => {
    const levelNum = Number(lvl.level);
    const roleNarrative = buildRoleNarrative(name, shortClip, levelNum);
    const competencyNarrative = buildCompetencyNarrative(name, levelNum);
    const { roles: _r, requiredSkills: _s, ...rest } = lvl;
    return {
      ...rest,
      roleNarrative,
      competencyNarrative,
    };
  });

  org.promotionCriteria = buildPromotionCriteria(name, shortClip);

  org.careerPaths = (org.careerPaths || []).map((cp) => ({
    path: cp.path,
    description: expandCareerPathDescription(name, cp.path, cp.description),
  }));
}

function processStarFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!data.jobs || !Array.isArray(data.jobs)) return 0;
  let n = 0;
  for (const job of data.jobs) {
    if (job.organizationStructure) {
      enrichOrganizationBlock(job, { starName: data.name });
      n += 1;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return n;
}

function processKingdomFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return 0;
  let n = 0;
  for (const job of data) {
    if (job.organizationStructure) {
      enrichOrganizationBlock(job, { starName: null });
      n += 1;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return n;
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

  console.log(`Done. organizationStructure updated for ${total} job entries (stars+kingdoms may duplicate same job).`);
}

main();
