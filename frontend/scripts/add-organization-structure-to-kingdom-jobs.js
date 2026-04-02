/**
 * 모든 왕국 JSON에 organizationStructure 데이터를 추가합니다.
 * 직업별 맞춤 조직 구조를 생성합니다.
 */

const fs = require('fs');
const path = require('path');

const jobsDir = path.join(__dirname, '../data/jobs');

const KINGDOMS = [
  'explore-kingdom-jobs.json',
  'create-kingdom-jobs.json',
  'tech-kingdom-jobs.json',
  'nature-kingdom-jobs.json',
  'connect-kingdom-jobs.json',
  'order-kingdom-jobs.json',
  'communicate-kingdom-jobs.json',
  'challenge-kingdom-jobs.json',
];

/** 직업 유형별 조직 구조 템플릿 */
const ORGANIZATION_TEMPLATES = {
  // 의료계 (의사, 간호사, 약사 등)
  medical: {
    levels: [
      {
        level: 1,
        title: '인턴·레지던트',
        icon: '🌱',
        yearsRange: '0~5년',
        roles: ['기본 진료 수행', '선배 의사 보조', '환자 기록 작성'],
        requiredSkills: ['의학 지식', '체력', '학습 의지', '팀워크'],
        avgSalary: '5,000~8,000만원/년',
      },
      {
        level: 2,
        title: '전문의',
        icon: '🩺',
        yearsRange: '5~15년',
        roles: ['독립 진료', '후배 지도', '전문 분야 진료', 'AI 진단 검증'],
        requiredSkills: ['전문 지식', '복합 판단력', '환자 공감', 'AI 리터러시'],
        avgSalary: '8,000~20,000만원/년',
      },
      {
        level: 3,
        title: '과장·부장·교수',
        icon: '⭐',
        yearsRange: '15~30년',
        roles: ['진료과 관리', '연구 및 논문', '병원 정책 참여', 'AI 의료 전략 수립'],
        requiredSkills: ['리더십', '연구 능력', '전략적 사고', '조직 관리'],
        avgSalary: '15,000~30,000만원/년',
      },
    ],
    promotionCriteria: ['임상 경력', '연구 실적', '환자 만족도', '리더십', 'AI 협업 능력'],
    careerPaths: [
      { path: '임상 전문가', description: '특정 질환·수술 전문성 심화' },
      { path: '병원 관리자', description: '진료과장·병원장 트랙' },
      { path: '의학 연구자', description: '대학병원 교수·연구소' },
    ],
  },

  // IT·개발 (개발자, 보안 전문가 등)
  tech: {
    levels: [
      {
        level: 1,
        title: '주니어 개발자',
        icon: '💻',
        yearsRange: '0~3년',
        roles: ['기능 구현', '코드 리뷰 참여', '버그 수정', 'AI 코드 검증'],
        requiredSkills: ['프로그래밍', '문제 해결', '학습 능력', 'Git 협업'],
        avgSalary: '4,000~6,000만원/년',
      },
      {
        level: 2,
        title: '시니어 개발자',
        icon: '🚀',
        yearsRange: '3~8년',
        roles: ['아키텍처 설계', '후배 멘토링', '기술 의사결정', 'AI 도구 통합'],
        requiredSkills: ['시스템 설계', '코드 리뷰', '커뮤니케이션', 'AI 프롬프트 엔지니어링'],
        avgSalary: '7,000~12,000만원/년',
      },
      {
        level: 3,
        title: '테크 리드·CTO',
        icon: '🎯',
        yearsRange: '8~20년',
        roles: ['기술 전략 수립', '팀 빌딩', '제품 기술 방향 결정', 'AI 전환 리더십'],
        requiredSkills: ['리더십', '전략적 사고', '비즈니스 이해', 'AI 거버넌스'],
        avgSalary: '12,000~30,000만원/년',
      },
    ],
    promotionCriteria: ['기술 역량', '프로젝트 임팩트', '리더십', '코드 품질', 'AI 활용 능력'],
    careerPaths: [
      { path: '기술 전문가', description: '특정 기술 스택 심화 (아키텍트)' },
      { path: '관리자', description: '팀 리드·CTO·VP Engineering' },
      { path: '창업가', description: '기술 기반 스타트업 창업' },
    ],
  },

  // 창작·디자인 (디자이너, 작가, 예술가 등)
  creative: {
    levels: [
      {
        level: 1,
        title: '주니어 크리에이터',
        icon: '🎨',
        yearsRange: '0~3년',
        roles: ['작업물 제작', '시니어 보조', '포트폴리오 구축', 'AI 초안 검증'],
        requiredSkills: ['기초 기술', '창의성', '도구 활용', 'AI 프롬프트 디자인'],
        avgSalary: '3,000~5,000만원/년',
      },
      {
        level: 2,
        title: '시니어 크리에이터',
        icon: '✨',
        yearsRange: '3~10년',
        roles: ['독립 프로젝트 수행', '클라이언트 소통', '컨셉 기획', 'AI 협업 설계'],
        requiredSkills: ['전문 기술', '컨셉 설계', '프로젝트 관리', 'AI 도구 마스터'],
        avgSalary: '5,000~10,000만원/년',
      },
      {
        level: 3,
        title: '아트 디렉터·크리에이티브 디렉터',
        icon: '🎬',
        yearsRange: '10~20년',
        roles: ['전체 방향 결정', '팀 관리', '클라이언트 전략 제안', 'AI 크리에이티브 전략'],
        requiredSkills: ['리더십', '전략적 사고', '비즈니스 감각', 'AI 거버넌스'],
        avgSalary: '10,000~25,000만원/년',
      },
    ],
    promotionCriteria: ['포트폴리오 품질', '클라이언트 만족도', '수상 경력', '리더십', 'AI 활용 혁신'],
    careerPaths: [
      { path: '전문 크리에이터', description: '특정 장르·스타일 전문가' },
      { path: '디렉터', description: '팀·프로젝트 총괄' },
      { path: '독립 작가', description: '프리랜서·스튜디오 운영' },
    ],
  },

  // 교육·상담 (교사, 상담사, 코치 등)
  education: {
    levels: [
      {
        level: 1,
        title: '신규 교사·상담사',
        icon: '📚',
        yearsRange: '0~5년',
        roles: ['수업·상담 진행', '학생 관찰', '자료 준비', 'AI 학습 도구 활용'],
        requiredSkills: ['전공 지식', '소통 능력', '공감 능력', 'AI 리터러시'],
        avgSalary: '3,500~5,000만원/년',
      },
      {
        level: 2,
        title: '경력 교사·수석 상담사',
        icon: '🎓',
        yearsRange: '5~15년',
        roles: ['커리큘럼 설계', '후배 멘토링', '학생 맞춤 지도', 'AI 교육 설계'],
        requiredSkills: ['교육 설계', '학생 이해', '문제 해결', 'AI 협업 설계'],
        avgSalary: '5,000~8,000만원/년',
      },
      {
        level: 3,
        title: '교감·교장·센터장',
        icon: '🏫',
        yearsRange: '15~30년',
        roles: ['학교 운영', '정책 수립', '교사 관리', 'AI 교육 전략'],
        requiredSkills: ['리더십', '조직 관리', '정책 이해', 'AI 거버넌스'],
        avgSalary: '7,000~12,000만원/년',
      },
    ],
    promotionCriteria: ['교육 경력', '학생 성과', '연구·저술', '리더십', 'AI 교육 혁신'],
    careerPaths: [
      { path: '교육 전문가', description: '특정 과목·분야 전문 교사' },
      { path: '관리자', description: '교감·교장·센터장' },
      { path: '교육 연구자', description: '교육청·연구소·대학' },
    ],
  },

  // 법률·행정 (변호사, 회계사, 공무원 등)
  legal: {
    levels: [
      {
        level: 1,
        title: '신입 변호사·회계사',
        icon: '⚖️',
        yearsRange: '0~5년',
        roles: ['사건 조사', '문서 작성', '선배 보조', 'AI 법률 검색 활용'],
        requiredSkills: ['법률·회계 지식', '문서 작성', '분석력', 'AI 리터러시'],
        avgSalary: '5,000~8,000만원/년',
      },
      {
        level: 2,
        title: '경력 변호사·회계사',
        icon: '📜',
        yearsRange: '5~15년',
        roles: ['독립 사건 수행', '고객 상담', '전략 수립', 'AI 법률 분석 검증'],
        requiredSkills: ['전문 지식', '협상력', '판단력', 'AI 협업 설계'],
        avgSalary: '8,000~20,000만원/년',
      },
      {
        level: 3,
        title: '파트너·대표',
        icon: '🏛️',
        yearsRange: '15~30년',
        roles: ['로펌·회계법인 운영', '주요 고객 관리', '전략 결정', 'AI 법률 전략'],
        requiredSkills: ['리더십', '비즈니스 개발', '조직 관리', 'AI 거버넌스'],
        avgSalary: '20,000~100,000만원/년',
      },
    ],
    promotionCriteria: ['사건 수행 능력', '고객 확보', '전문성', '리더십', 'AI 활용 혁신'],
    careerPaths: [
      { path: '전문 변호사', description: '특정 분야 전문 (형사·세무·특허)' },
      { path: '파트너', description: '로펌·회계법인 공동 경영' },
      { path: '법조 공무원', description: '판사·검사·법제처' },
    ],
  },

  // 비즈니스·경영 (기획자, 마케터, 컨설턴트 등)
  business: {
    levels: [
      {
        level: 1,
        title: '주니어 매니저',
        icon: '📊',
        yearsRange: '0~3년',
        roles: ['데이터 분석', '보고서 작성', '프로젝트 보조', 'AI 분석 도구 활용'],
        requiredSkills: ['분석력', '문서 작성', '커뮤니케이션', 'AI 리터러시'],
        avgSalary: '4,000~6,000만원/년',
      },
      {
        level: 2,
        title: '시니어 매니저',
        icon: '💼',
        yearsRange: '3~8년',
        roles: ['전략 수립', '팀 리드', '고객 관리', 'AI 전략 설계'],
        requiredSkills: ['전략적 사고', '리더십', '협상력', 'AI 협업 설계'],
        avgSalary: '7,000~12,000만원/년',
      },
      {
        level: 3,
        title: '임원·파트너',
        icon: '🎯',
        yearsRange: '8~20년',
        roles: ['사업 전략 결정', '조직 관리', '비전 제시', 'AI 전환 리더십'],
        requiredSkills: ['리더십', '비즈니스 통찰', '조직 관리', 'AI 거버넌스'],
        avgSalary: '15,000~50,000만원/년',
      },
    ],
    promotionCriteria: ['프로젝트 성과', '매출 기여', '리더십', '전략적 사고', 'AI 혁신 주도'],
    careerPaths: [
      { path: '전문가 트랙', description: '특정 분야 전문 컨설턴트·애널리스트' },
      { path: '관리자 트랙', description: '팀장·본부장·임원' },
      { path: '창업가', description: '스타트업 창업·경영' },
    ],
  },

  // 연구·과학 (연구원, 과학자 등)
  research: {
    levels: [
      {
        level: 1,
        title: '연구원',
        icon: '🔬',
        yearsRange: '0~5년',
        roles: ['실험 수행', '데이터 수집', '논문 작성 보조', 'AI 데이터 분석'],
        requiredSkills: ['연구 방법론', '데이터 분석', '논문 작성', 'AI 도구 활용'],
        avgSalary: '3,500~6,000만원/년',
      },
      {
        level: 2,
        title: '선임연구원',
        icon: '🧪',
        yearsRange: '5~12년',
        roles: ['독립 연구 수행', '연구 설계', '논문 발표', 'AI 연구 설계'],
        requiredSkills: ['전문 지식', '연구 설계', '논문 작성', 'AI 협업'],
        avgSalary: '6,000~10,000만원/년',
      },
      {
        level: 3,
        title: '수석연구원·연구소장',
        icon: '🏆',
        yearsRange: '12~30년',
        roles: ['연구 방향 결정', '팀 관리', '연구비 확보', 'AI 연구 전략'],
        requiredSkills: ['리더십', '연구 전략', '조직 관리', 'AI 거버넌스'],
        avgSalary: '10,000~20,000만원/년',
      },
    ],
    promotionCriteria: ['논문 실적', '연구비 확보', '특허·기술 이전', '리더십', 'AI 연구 혁신'],
    careerPaths: [
      { path: '연구 전문가', description: '특정 분야 세계적 전문가' },
      { path: '연구소장', description: '연구팀·연구소 관리' },
      { path: '대학 교수', description: '연구 + 교육' },
    ],
  },

  // 예술·공연 (배우, 음악가, 예술가 등)
  artist: {
    levels: [
      {
        level: 1,
        title: '신인 아티스트',
        icon: '🎭',
        yearsRange: '0~5년',
        roles: ['작품 활동', '오디션·공모전', '기술 연마', 'AI 협업 실험'],
        requiredSkills: ['기초 기술', '창의성', '끈기', 'AI 도구 활용'],
        avgSalary: '2,000~4,000만원/년',
      },
      {
        level: 2,
        title: '중견 아티스트',
        icon: '🌟',
        yearsRange: '5~15년',
        roles: ['독립 작품 활동', '팬층 구축', '협업 프로젝트', 'AI 크리에이티브 설계'],
        requiredSkills: ['전문 기술', '브랜딩', '협업 능력', 'AI 협업 설계'],
        avgSalary: '4,000~15,000만원/년',
      },
      {
        level: 3,
        title: '스타·거장',
        icon: '👑',
        yearsRange: '15~40년',
        roles: ['대표 작품 활동', '후배 양성', '문화 영향력', 'AI 예술 철학'],
        requiredSkills: ['독창성', '영향력', '리더십', 'AI 거버넌스'],
        avgSalary: '10,000~100,000만원/년',
      },
    ],
    promotionCriteria: ['작품 성과', '대중 인지도', '수상 경력', '영향력', 'AI 혁신 시도'],
    careerPaths: [
      { path: '전문 아티스트', description: '특정 장르 전문가' },
      { path: '프로듀서·감독', description: '작품 기획·제작 총괄' },
      { path: '교육자', description: '예술 교육·강의' },
    ],
  },

  // 공무원·공공 (공무원, 정책 전문가 등)
  public: {
    levels: [
      {
        level: 1,
        title: '9급·8급 공무원',
        icon: '🏛️',
        yearsRange: '0~5년',
        roles: ['민원 처리', '문서 작성', '정책 집행 보조', 'AI 행정 시스템 활용'],
        requiredSkills: ['행정 지식', '문서 작성', '법규 이해', 'AI 리터러시'],
        avgSalary: '3,500~5,000만원/년',
      },
      {
        level: 2,
        title: '7급·6급 공무원',
        icon: '📋',
        yearsRange: '5~15년',
        roles: ['정책 기획', '팀 관리', '예산 집행', 'AI 정책 설계'],
        requiredSkills: ['정책 기획', '조정 능력', '리더십', 'AI 협업 설계'],
        avgSalary: '5,000~8,000만원/년',
      },
      {
        level: 3,
        title: '고위 공무원',
        icon: '🏅',
        yearsRange: '15~35년',
        roles: ['정책 결정', '부처 관리', '국회 협의', 'AI 거버넌스 전략'],
        requiredSkills: ['리더십', '정치적 판단', '조직 관리', 'AI 거버넌스'],
        avgSalary: '8,000~15,000만원/년',
      },
    ],
    promotionCriteria: ['근무 연수', '업무 평가', '시험 성적', '리더십', 'AI 행정 혁신'],
    careerPaths: [
      { path: '전문 직렬', description: '특정 분야 전문 공무원' },
      { path: '관리 직렬', description: '부서장·국장·차관' },
      { path: '정치인', description: '국회의원·지방의원' },
    ],
  },

  // 기본 템플릿 (기타 직업)
  default: {
    levels: [
      {
        level: 1,
        title: '신입',
        icon: '🌱',
        yearsRange: '0~3년',
        roles: ['실무 수행', '선배 지원', '기본 업무 학습', 'AI 도구 활용'],
        requiredSkills: ['기초 지식', '학습 의지', '팀워크', 'AI 리터러시'],
        avgSalary: '3,000~5,000만원/년',
      },
      {
        level: 2,
        title: '중급',
        icon: '🔧',
        yearsRange: '3~7년',
        roles: ['독립 업무 수행', '후배 멘토링', '프로젝트 리드', 'AI 협업 설계'],
        requiredSkills: ['전문 지식', '문제 해결', '커뮤니케이션', 'AI 협업'],
        avgSalary: '5,000~9,000만원/년',
      },
      {
        level: 3,
        title: '시니어',
        icon: '⭐',
        yearsRange: '7~15년',
        roles: ['전략 수립', '팀 관리', '의사 결정', 'AI 전략 리더십'],
        requiredSkills: ['리더십', '전략적 사고', '조직 관리', 'AI 거버넌스'],
        avgSalary: '9,000~20,000만원/년',
      },
    ],
    promotionCriteria: ['실적', '역량 평가', '리더십', '전문성', 'AI 활용 능력'],
    careerPaths: [
      { path: '전문가 트랙', description: '기술·전문성 심화' },
      { path: '관리자 트랙', description: '팀·조직 관리' },
    ],
  },
};

/** 직업명 기반으로 적절한 템플릿 선택 */
function selectTemplate(jobName) {
  const n = jobName.toLowerCase();
  if (n.includes('의사') || n.includes('간호') || n.includes('약사') || n.includes('의료')) return 'medical';
  if (n.includes('개발자') || n.includes('프로그래머') || n.includes('엔지니어') || n.includes('보안')) return 'tech';
  if (n.includes('디자이너') || n.includes('작가') || n.includes('예술가') || n.includes('감독') || n.includes('크리에이터')) return 'creative';
  if (n.includes('교사') || n.includes('상담사') || n.includes('코치') || n.includes('강사')) return 'education';
  if (n.includes('변호사') || n.includes('회계사') || n.includes('법무') || n.includes('공무원')) return 'legal';
  if (n.includes('마케터') || n.includes('기획자') || n.includes('컨설턴트') || n.includes('애널리스트')) return 'business';
  if (n.includes('연구원') || n.includes('과학자') || n.includes('연구자')) return 'research';
  if (n.includes('배우') || n.includes('가수') || n.includes('음악가') || n.includes('아티스트')) return 'artist';
  return 'default';
}

function buildOrganizationStructure(jobName) {
  const templateKey = selectTemplate(jobName);
  const template = ORGANIZATION_TEMPLATES[templateKey];
  
  return {
    title: `${jobName} 조직 구조`,
    description: template.levels[0].title.includes('인턴') || template.levels[0].title.includes('레지던트')
      ? '의료계 특유의 수련 체계입니다. 병원·의료기관마다 차이가 있습니다.'
      : template.levels[0].title.includes('급')
      ? '공무원 계급 체계입니다. 부처·직렬마다 차이가 있습니다.'
      : '일반적인 직급 체계와 승진 경로입니다. 회사·기관마다 차이가 있습니다.',
    levels: template.levels,
    promotionCriteria: template.promotionCriteria,
    careerPaths: template.careerPaths,
  };
}

function processKingdom(filename) {
  const filePath = path.join(jobsDir, filename);
  const jobs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const updated = jobs.map((job) => {
    if (job.organizationStructure && job.organizationStructure.levels && job.organizationStructure.levels.length > 0) {
      return job;
    }
    return {
      ...job,
      organizationStructure: buildOrganizationStructure(job.name),
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`✓ ${filename}: ${updated.length} jobs updated with organizationStructure`);
}

KINGDOMS.forEach(processKingdom);
console.log('\n✓ All kingdom JSONs now have organizationStructure data.');
