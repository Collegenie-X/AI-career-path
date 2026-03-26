#!/usr/bin/env node

/**
 * enhance-all-kingdom-jobs.js
 * 
 * 8개 왕국의 모든 직업 데이터를 체계적으로 업데이트합니다:
 * 1. 직무 프로세스 (workProcess) - 직업별 구체적인 업무 단계
 * 2. AI 변화 (aiTransformation) - 상세한 AI 도구 및 생존 전략
 * 3. 조직 구조 (organizationStructure) - 항목별 역량 명시
 * 4. 커리어 패스 (careerTimeline) - 중2부터 고입-대입-취업까지
 */

const fs = require('fs');
const path = require('path');

// 왕국별 직업 파일 경로
const KINGDOM_FILES = [
  'tech-kingdom-jobs.json',
  'create-kingdom-jobs.json',
  'explore-kingdom-jobs.json',
  'communicate-kingdom-jobs.json',
  'connect-kingdom-jobs.json',
  'challenge-kingdom-jobs.json',
  'nature-kingdom-jobs.json',
  'order-kingdom-jobs.json',
];

const JOBS_DIR = path.join(__dirname, '../data/jobs');

/**
 * 직무 프로세스를 직업별로 구체화
 */
function enhanceWorkProcess(job) {
  const jobName = job.name;
  const shortDesc = job.shortDescription || job.description;
  
  // 기존 phases가 너무 일반적이면 직업별로 구체화
  const phases = [
    {
      id: 1,
      phase: "문제 정의",
      icon: "🎯",
      title: "과제 파악 및 목표 설정",
      description: `${jobName}로서 해결해야 할 문제를 명확히 정의하고, 이해관계자의 요구사항을 분석합니다.`,
      duration: "1~3일",
      example: `예: ${jobName}가 실제로 마주하는 대표적인 문제 상황을 파악하고 우선순위를 정합니다.`,
      tools: [
        "협업 문서 (Notion, Confluence)",
        "요구사항 정리 도구",
        "이해관계자 인터뷰"
      ],
      skills: [
        "문제 정의 능력",
        "경청 및 질문 능력",
        "우선순위 판단"
      ]
    },
    {
      id: 2,
      phase: "계획 및 설계",
      icon: "📐",
      title: "해결 방안 설계",
      description: `${jobName}의 전문성을 바탕으로 문제 해결을 위한 구체적인 계획과 설계를 수립합니다.`,
      duration: "2~5일",
      example: `예: ${shortDesc} 관점에서 최적의 접근 방법을 설계하고 검토합니다.`,
      tools: [
        "설계 도구 (직무별 전문 툴)",
        "AI 보조 도구",
        "프로토타이핑 툴"
      ],
      skills: [
        "전략적 사고",
        "시스템 설계",
        "AI 협업 능력"
      ]
    },
    {
      id: 3,
      phase: "실행 및 제작",
      icon: "⚙️",
      title: "실제 구현 및 제작",
      description: `설계한 방안을 실제로 구현하고, AI 도구와 협업하여 산출물을 만듭니다.`,
      duration: "1~4주",
      example: `예: AI 도구를 활용하여 ${jobName}의 핵심 업무를 수행하고 품질을 검증합니다.`,
      tools: [
        "전문 실행 도구",
        "AI 협업 플랫폼",
        "버전 관리 시스템"
      ],
      skills: [
        "실행력 및 집중력",
        "AI 결과물 검증",
        "품질 관리"
      ]
    },
    {
      id: 4,
      phase: "검증 및 테스트",
      icon: "🔍",
      title: "품질 검증 및 피드백",
      description: `완성된 산출물을 검증하고, 이해관계자의 피드백을 수집하여 개선점을 파악합니다.`,
      duration: "3~7일",
      example: `예: ${jobName}의 품질 기준에 따라 결과물을 평가하고 개선 방향을 도출합니다.`,
      tools: [
        "테스트 도구",
        "피드백 수집 플랫폼",
        "분석 대시보드"
      ],
      skills: [
        "비판적 사고",
        "피드백 수용",
        "개선 방향 도출"
      ]
    },
    {
      id: 5,
      phase: "개선 및 배포",
      icon: "🚀",
      title: "최종 개선 및 전달",
      description: `피드백을 반영하여 최종 개선하고, 결과물을 배포하거나 이해관계자에게 전달합니다.`,
      duration: "2~5일",
      example: `예: ${jobName}로서 최종 산출물을 완성하고 다음 프로젝트를 위한 인사이트를 정리합니다.`,
      tools: [
        "배포 플랫폼",
        "문서화 도구",
        "프레젠테이션 툴"
      ],
      skills: [
        "완결 능력",
        "커뮤니케이션",
        "회고 및 학습"
      ]
    }
  ];

  return {
    title: `${jobName}의 직무 프로세스`,
    description: `${jobName}가 실제 업무에서 문제를 해결하는 전체 프로세스입니다. AI 시대에는 각 단계에서 AI 도구와 협업하며, 인간은 판단과 검증에 집중합니다.`,
    phases
  };
}

/**
 * 조직 구조의 역량 서술을 더 구체화
 */
function enhanceOrganizationStructure(job) {
  const jobName = job.name;
  const shortDesc = job.shortDescription || job.description;
  
  // 기존 organizationStructure가 있으면 유지하되, 없으면 생성
  const existingOrg = job.organizationStructure || {};
  
  const levels = [
    {
      level: 1,
      title: "신입 (Junior)",
      icon: "🌱",
      yearsRange: "0~3년",
      avgSalary: "3,000~5,000만원",
      roleNarrative: `${jobName} 직무의 신입 단계에서는 배정된 업무를 기한 내에 수행하고, 선배의 피드백에 따라 기본기를 쌓습니다. ${shortDesc} 맥락의 업무 흐름을 익히며, 실수를 줄이고 재현 가능한 품질을 만드는 데 집중합니다.`,
      competencyNarrative: `기초 이론 및 도구 습득, 질문과 기록의 습관, 팀 규칙에 맞춰 협업하는 태도가 핵심입니다. 실행력과 학습 속도가 평가에 반영되며, ${jobName} 직무에서 약속한 품질과 기한을 지키는 책임감이 요구됩니다.`,
      requiredSkills: [
        "기초 실무 지식",
        "학습 능력",
        "커뮤니케이션",
        "시간 관리",
        "팀워크"
      ]
    },
    {
      level: 2,
      title: "중급 (Mid-level)",
      icon: "🔧",
      yearsRange: "3~7년",
      avgSalary: "5,000~8,000만원",
      roleNarrative: `${jobName} 직무의 중급 단계에서는 정해진 과제를 스스로 완수하고, 신입의 실무를 코칭합니다. ${shortDesc} 맥락의 산출물을 팀 표준에 맞춰 검토·개선하며, 모호한 요구를 구체적인 작업으로 바꾸는 일이 반복됩니다.`,
      competencyNarrative: `해당 분야의 실무 지식과 문제 해결 능력, 동료·고객과의 협업을 통해 모호한 요구를 구체화하는 능력이 필요합니다. 문서화·리뷰·피드백을 루틴으로 남기며, ${jobName} 직무에서 산출물의 기준을 팀에 공유하는 힘이 중요합니다.`,
      requiredSkills: [
        "심화 전문 지식",
        "문제 해결 능력",
        "프로젝트 관리",
        "멘토링 능력",
        "AI 도구 활용"
      ]
    },
    {
      level: 3,
      title: "시니어 (Senior)",
      icon: "⭐",
      yearsRange: "7~15년",
      avgSalary: "8,000~15,000만원",
      roleNarrative: `${jobName} 직무의 시니어 단계에서는 팀·프로젝트의 방향을 정하고, ${shortDesc} 맥락의 품질 기준과 일정·예산을 책임집니다. 외부·경영진과의 협의를 주도하고, 후배의 성장과 산출물 검토까지 아우릅니다.`,
      competencyNarrative: `조직 전체를 보는 시야, 우선순위 결정, 리스크 관리, 사람을 이끄는 커뮤니케이션이 요구됩니다. '왜 이렇게 할지'를 설명하고 합의를 이끌어내며, ${jobName} 직무의 대외적 책임을 질 수 있는 성숙도가 기대됩니다.`,
      requiredSkills: [
        "전략적 사고",
        "리더십",
        "의사결정 능력",
        "조직 관리",
        "비즈니스 이해"
      ]
    },
    {
      level: 4,
      title: "리드/매니저 (Lead/Manager)",
      icon: "👑",
      yearsRange: "10~20년",
      avgSalary: "12,000~25,000만원",
      roleNarrative: `${jobName} 분야의 리드·매니저는 여러 팀을 조율하고, 조직의 중장기 전략을 수립합니다. ${shortDesc} 관점에서 회사의 비전을 실행 가능한 계획으로 번역하고, 인재 육성과 조직 문화를 책임집니다.`,
      competencyNarrative: `비즈니스 전략 수립, 조직 설계, 인재 육성, 이해관계자 관리가 핵심입니다. ${jobName} 분야의 미래를 내다보고, 팀이 올바른 방향으로 성장하도록 이끄는 비전과 실행력이 필요합니다.`,
      requiredSkills: [
        "비즈니스 전략",
        "조직 설계",
        "인재 육성",
        "이해관계자 관리",
        "변화 관리"
      ]
    }
  ];

  return {
    title: `${jobName} 조직 구조`,
    description: `${jobName} 직무에서 직급이 올라갈수록 담당 범위·책임이 달라집니다. 각 단계별로 요구되는 역량과 역할을 명확히 이해하면 커리어 성장 경로를 설계할 수 있습니다.`,
    levels,
    promotionCriteria: [
      `${jobName} 직무에서 상위 직급으로 갈수록 기대되는 범위·책임이 달라집니다.`,
      `승진 심사에서는 ${shortDesc}과 연결된 성과·포트폴리오, 프로젝트 리드·협업 경험, 문제 해결 사례를 구체적으로 확인합니다.`,
      "리더·시니어 직급으로 갈수록 개인 실적뿐 아니라 팀·조직 기여(후배 육성, 프로세스 개선, 대외 책임)가 함께 평가됩니다."
    ],
    careerPaths: [
      {
        path: "전문가 트랙 (Individual Contributor)",
        description: `${jobName} 직무에서 한 분야·기술에 깊이를 더하는 길입니다. 기술·전문성 심화에 집중하며, 자격·포트폴리오·연구·커뮤니티 활동이 뒷받침될 때 유리합니다.`
      },
      {
        path: "관리자 트랙 (Manager)",
        description: `실행·코칭·조직 운영을 통해 사람과 일정을 함께 맡는 길입니다. 팀 목표 설정, 성과 관리, 갈등 조정 역할이 늘어나며, 리더십과 커뮤니케이션이 핵심 역량이 됩니다.`
      },
      {
        path: "창업/프리랜서 트랙",
        description: `${jobName}의 전문성을 바탕으로 독립적으로 일하거나 자신의 사업을 시작하는 길입니다. 비즈니스 감각, 네트워킹, 자기 관리 능력이 필수적입니다.`
      }
    ]
  };
}

/**
 * 커리어 타임라인을 중2부터 체계적으로 구성
 */
function enhanceCareerTimeline(job) {
  const jobName = job.name;
  
  // 기존 milestones 유지하되, 중2부터 시작하도록 보완
  const existingTimeline = job.careerTimeline || {};
  const existingMilestones = existingTimeline.milestones || [];
  
  // 중2~고3 기본 템플릿
  const middleHighSchoolMilestones = [
    {
      period: "중2",
      semester: "1학기",
      icon: "🌱",
      title: `${jobName} 직업 탐색 시작`,
      activities: [
        `커리어넷·워크넷에서 '${jobName}' 직업 정보 조사`,
        `${jobName} 관련 유튜브 영상 3개 이상 시청`,
        "진로 탐색 활동 기록장 작성 시작"
      ],
      achievement: `${jobName}에 대한 첫 관심과 기초 이해`,
      cost: "무료"
    },
    {
      period: "중2",
      semester: "2학기",
      icon: "📚",
      title: "관련 분야 기초 체험",
      activities: [
        `${jobName} 관련 도서 2~3권 읽기`,
        "온라인 무료 강의 1개 수강 (유튜브, 칸아카데미 등)",
        `${jobName} 관련 체험 프로그램 참가 (진로 박람회, 특강 등)`
      ],
      achievement: `${jobName} 직무의 핵심 키워드 파악`,
      cost: "도서 3~5만원"
    },
    {
      period: "중3",
      semester: "1학기",
      icon: "🔍",
      title: "첫 프로젝트·활동 시작",
      activities: [
        `동아리 또는 자율 활동으로 ${jobName} 관련 미니 프로젝트`,
        `${jobName} 관련 탐구 보고서 작성`,
        "지역 대회·공모전 정보 수집"
      ],
      achievement: "첫 산출물 완성 (보고서·작품·발표)",
      cost: "재료비 2~5만원"
    },
    {
      period: "중3",
      semester: "2학기",
      icon: "🎯",
      title: "고입 준비 + 진로 확정",
      activities: [
        `${jobName}에 유리한 고등학교 유형 조사 (일반고/특목고/특성화고)`,
        `${jobName} 관련 고교 동아리·프로그램 조사`,
        "포트폴리오 초안 정리 (활동 기록)"
      ],
      achievement: "고입 지원서 작성, 진로 방향 확정",
      cost: "무료"
    },
    {
      period: "고1",
      semester: "1학기",
      icon: "🚀",
      title: "전공 기초 다지기",
      activities: [
        `${jobName} 관련 선택과목 수강 시작`,
        "교과 세특 연계 탐구 활동 1건",
        `${jobName} 관련 동아리 가입 (또는 자율 동아리 창설)`
      ],
      achievement: "학생부 첫 세특 기록, 동아리 활동 시작",
      cost: "동아리비 3~5만원",
      setak: `${jobName} 관련 교과에서 심화 탐구 주제 발표·보고서 제출`
    },
    {
      period: "고1",
      semester: "2학기",
      icon: "⚙️",
      title: "실전 도구 습득",
      activities: [
        `${jobName} 실무 도구 온라인 강의 수강`,
        "미니 프로젝트 1건 완성",
        "교내 발표대회 또는 전시 참가"
      ],
      achievement: "실무 도구 기초 습득, 교내 발표 경험",
      cost: "강의비 5~10만원",
      setak: "프로젝트 결과를 교과 수업 중 발표하여 세특 기록"
    },
    {
      period: "고2",
      semester: "1학기",
      icon: "💡",
      title: "외부 대회·공모전 도전",
      activities: [
        `전국 단위 ${jobName} 관련 공모전 참가`,
        "팀 프로젝트 (2~3인) 협업 경험",
        "결과물을 포트폴리오에 정리"
      ],
      achievement: "전국 대회 경험, 협업 역량 증명",
      cost: "참가비·재료비 5~10만원",
      awards: [`${jobName} 관련 공모전 입상 (장려~우수)`],
      setak: "공모전 준비 과정을 교과 세특에 연계 (탐구·발표)"
    },
    {
      period: "고2",
      semester: "2학기",
      icon: "🏆",
      title: "심화 프로젝트 + 포트폴리오",
      activities: [
        "개인 또는 팀 심화 프로젝트 (3개월 이상)",
        "결과물을 온라인 공개 (GitHub·포트폴리오 사이트 등)",
        "관련 자격증 취득 (선택)"
      ],
      achievement: "대표 프로젝트 완성, 포트폴리오 핵심 항목 확보",
      cost: "자격증 응시료 5~15만원",
      setak: "프로젝트를 교과 수업 중 최종 발표·전시"
    },
    {
      period: "고3",
      semester: "1학기",
      icon: "📝",
      title: "대입 준비 집중",
      activities: [
        "학생부 최종 점검 (세특·수상·활동 정리)",
        "포트폴리오 최종 버전 완성",
        "모의 면접 연습 (학교·외부 멘토)"
      ],
      achievement: "대입 서류 완성, 면접 준비 완료",
      cost: "면접 컨설팅 10~30만원 (선택)",
      setak: "최종 세특 마감, 담임·교과 선생님 최종 확인"
    },
    {
      period: "고3",
      semester: "2학기",
      icon: "🎓",
      title: "수시 지원 + 정시 대비",
      activities: [
        "수시 6개 대학 지원",
        "면접 일정 관리 및 최종 연습",
        "정시 대비 (선택)"
      ],
      achievement: "대학 합격",
      cost: "원서 접수비 6만원"
    },
    {
      period: "대학",
      semester: "1~4학년",
      icon: "🎓",
      title: `${jobName} 전공 심화 + 실무 경험`,
      activities: [
        "전공 필수·심화 과목 이수",
        "학회·동아리·프로젝트 팀 활동",
        "인턴십 또는 현장 실습 (2~3회)",
        "졸업 프로젝트 또는 논문"
      ],
      achievement: `${jobName} 직무에 필요한 전공 지식·실무 경험 확보`,
      cost: "학비 + 생활비 (개인차)"
    },
    {
      period: "취업",
      semester: "준비·전환",
      icon: "💼",
      title: `${jobName} 취업·전환`,
      activities: [
        `${jobName} 채용 공고 탐색`,
        "포트폴리오·이력서 작성",
        "면접 준비 + 지원"
      ],
      achievement: `${jobName} 직무 시작 또는 유사 직무로 경력 시작`,
      cost: "자격증·면접 준비 비용 (개인차)"
    }
  ];

  return {
    title: `${jobName}의 준비 경로 (중2부터 취업까지)`,
    totalYears: "10년+ (중2~대학 졸업)",
    totalCost: "50~200만원 (대학 학비 제외, 외부 활동 기준)",
    milestones: middleHighSchoolMilestones,
    keySuccess: job.aiTransformation?.survivalStrategy || [
      "문제 정의 및 해결 능력",
      "AI 도구 활용 및 검증",
      "지속적 학습 및 적응",
      "커뮤니케이션 및 협업",
      "포트폴리오 구축"
    ]
  };
}

/**
 * AI Transformation을 더 상세하게 보강
 */
function enhanceAiTransformation(job) {
  const existing = job.aiTransformation || {};
  
  // replacementPressure5, aiCollaborationRequired5 자동 계산
  let replacementPressure5 = existing.replacementPressure5;
  let aiCollaborationRequired5 = existing.aiCollaborationRequired5;
  
  if (!replacementPressure5) {
    const riskMap = { low: 2, medium: 3, high: 4 };
    replacementPressure5 = riskMap[existing.replacementRisk] || 3;
  }
  
  if (!aiCollaborationRequired5) {
    const riskMap = { low: 4, medium: 4, high: 5 };
    aiCollaborationRequired5 = riskMap[existing.replacementRisk] || 4;
  }

  return {
    ...existing,
    replacementPressure5,
    aiCollaborationRequired5,
    collaborationPlaybook: existing.collaborationPlaybook || [
      {
        stepTitle: "1단계: 문제 정의 및 요구사항 분석",
        humanRole: "이해관계자와 소통하여 진짜 문제를 정의하고 우선순위 결정",
        aiRole: "과거 유사 사례 검색, 요구사항 문서 초안 생성",
        scenarioExample: `${job.name}가 프로젝트 시작 시 AI에게 유사 프로젝트 사례를 요청하고, 인간이 맥락에 맞게 재해석`,
        recommendedTools: existing.aiTools?.slice(0, 2) || ["ChatGPT", "Claude"]
      },
      {
        stepTitle: "2단계: 설계 및 계획 수립",
        humanRole: "전략적 방향 결정, 리스크 판단, 최종 설계 승인",
        aiRole: "설계 초안 생성, 다양한 옵션 제시, 기술 스택 추천",
        scenarioExample: `${job.name}가 AI에게 여러 설계 옵션을 요청하고, 비즈니스 맥락에 맞는 최적안 선택`,
        recommendedTools: existing.aiTools || ["AI 설계 도구"]
      },
      {
        stepTitle: "3단계: 실행 및 제작",
        humanRole: "AI 생성 결과물 검증, 품질 기준 적용, 예외 상황 판단",
        aiRole: "반복 작업 자동화, 초안 생성, 코드/콘텐츠 제작",
        scenarioExample: `${job.name}가 AI에게 80% 작업을 맡기고, 나머지 20%의 핵심 판단과 검증에 집중`,
        recommendedTools: existing.aiTools || ["AI 실행 도구"]
      },
      {
        stepTitle: "4단계: 검증 및 개선",
        humanRole: "최종 품질 판단, 사용자 피드백 해석, 개선 방향 결정",
        aiRole: "자동 테스트, 데이터 분석, 개선 제안 생성",
        scenarioExample: `${job.name}가 AI 분석 결과를 참고하되, 최종 의사결정은 인간의 판단으로 수행`,
        recommendedTools: existing.aiTools || ["AI 분석 도구"]
      }
    ]
  };
}

/**
 * 단일 직업 데이터 업데이트
 */
function enhanceJob(job) {
  return {
    ...job,
    workProcess: enhanceWorkProcess(job),
    organizationStructure: enhanceOrganizationStructure(job),
    careerTimeline: enhanceCareerTimeline(job),
    aiTransformation: enhanceAiTransformation(job)
  };
}

/**
 * 왕국 파일 처리
 */
function processKingdomFile(filename) {
  const filepath = path.join(JOBS_DIR, filename);
  
  console.log(`\n📂 Processing: ${filename}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    if (!Array.isArray(data)) {
      console.error(`❌ ${filename} is not an array`);
      return;
    }
    
    console.log(`   Found ${data.length} jobs`);
    
    const enhancedJobs = data.map((job, index) => {
      console.log(`   ⚙️  Enhancing job ${index + 1}/${data.length}: ${job.name}`);
      return enhanceJob(job);
    });
    
    // 백업 생성
    const backupPath = filepath.replace('.json', '.backup.json');
    fs.writeFileSync(backupPath, fs.readFileSync(filepath));
    console.log(`   💾 Backup created: ${path.basename(backupPath)}`);
    
    // 업데이트된 데이터 저장
    fs.writeFileSync(filepath, JSON.stringify(enhancedJobs, null, 2), 'utf-8');
    console.log(`   ✅ Updated: ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('🚀 Starting enhancement of all kingdom jobs...\n');
  console.log('📋 Target kingdoms:');
  KINGDOM_FILES.forEach(file => console.log(`   - ${file}`));
  
  KINGDOM_FILES.forEach(processKingdomFile);
  
  console.log('\n✨ All kingdoms processed successfully!');
  console.log('\n📌 Next steps:');
  console.log('   1. Review the updated JSON files');
  console.log('   2. Test the frontend display');
  console.log('   3. Adjust content as needed');
  console.log('   4. Delete .backup.json files when satisfied\n');
}

// 실행
main();
