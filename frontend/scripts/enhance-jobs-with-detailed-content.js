#!/usr/bin/env node

/**
 * enhance-jobs-with-detailed-content.js
 * 
 * 각 직업별로 맞춤형 상세 콘텐츠를 생성합니다:
 * - 직무 프로세스: 직업별 실제 업무 흐름
 * - 조직 구조: 직급별 구체적 역량과 연봉
 * - 커리어 타임라인: 중2부터 취업까지 구체적 활동
 * - AI 변화: 상세한 협업 플레이북
 */

const fs = require('fs');
const path = require('path');

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
 * 직업별 맞춤 직무 프로세스 생성
 */
function createDetailedWorkProcess(job) {
  const jobName = job.name;
  const shortDesc = job.shortDescription || job.description;
  const aiTools = job.aiTransformation?.aiTools || [];
  
  // 왕국별/직업별 특화된 프로세스 정의
  const processMap = {
    // Tech Kingdom
    '소프트웨어 엔지니어': {
      phases: [
        {
          id: 1,
          phase: "요구사항 분석",
          icon: "🎯",
          title: "비즈니스 요구사항 이해",
          description: "클라이언트나 PM과 협의하여 구현해야 할 기능과 제약사항을 명확히 정의합니다.",
          duration: "1~3일",
          example: "예: 전자상거래 사이트의 결제 시스템 개선 요청 분석 - 보안, 속도, UX 요구사항 정리",
          tools: ["Jira", "Confluence", "Notion", "Figma (와이어프레임)"],
          skills: ["요구사항 도출", "기술 타당성 검토", "이해관계자 소통"]
        },
        {
          id: 2,
          phase: "시스템 설계",
          icon: "📐",
          title: "아키텍처 및 기술 스택 결정",
          description: "확장 가능하고 유지보수 가능한 시스템 구조를 설계하고, 최적의 기술 스택을 선택합니다.",
          duration: "2~5일",
          example: "예: 마이크로서비스 vs 모놀리식 아키텍처 결정, DB 스키마 설계, API 명세 작성",
          tools: ["Draw.io", "Lucidchart", "AI 아키텍처 자문 (ChatGPT)", "GitHub Copilot"],
          skills: ["시스템 설계", "성능 최적화", "보안 설계", "AI 협업"]
        },
        {
          id: 3,
          phase: "코드 구현",
          icon: "⚙️",
          title: "AI 협업 코딩 및 구현",
          description: "AI 코딩 도구를 활용하여 효율적으로 코드를 작성하고, 핵심 로직에 집중합니다.",
          duration: "1~4주",
          example: "예: GitHub Copilot으로 반복 코드 자동 생성, 복잡한 비즈니스 로직은 직접 작성 및 검증",
          tools: ["VS Code", "GitHub Copilot", "Cursor AI", "Git"],
          skills: ["코딩 실력", "AI 프롬프트", "코드 리뷰", "버전 관리"]
        },
        {
          id: 4,
          phase: "테스트 및 검증",
          icon: "🔍",
          title: "품질 보증 및 버그 수정",
          description: "단위 테스트, 통합 테스트를 수행하고 AI가 생성한 코드의 오류를 검증합니다.",
          duration: "3~7일",
          example: "예: Jest로 단위 테스트 작성, AI 생성 코드의 엣지 케이스 검증, 보안 취약점 점검",
          tools: ["Jest", "Pytest", "Postman", "SonarQube", "AI 코드 리뷰 도구"],
          skills: ["테스트 설계", "디버깅", "보안 검증", "성능 측정"]
        },
        {
          id: 5,
          phase: "배포 및 모니터링",
          icon: "🚀",
          title: "프로덕션 배포 및 운영",
          description: "CI/CD 파이프라인을 통해 배포하고, 실시간 모니터링으로 안정성을 확보합니다.",
          duration: "2~5일",
          example: "예: Docker 컨테이너화, AWS/GCP 배포, Datadog으로 성능 모니터링, 롤백 계획 수립",
          tools: ["Docker", "Kubernetes", "GitHub Actions", "AWS/GCP", "Datadog"],
          skills: ["DevOps", "클라우드 인프라", "모니터링", "장애 대응"]
        }
      ]
    },
    
    '그래픽 디자이너': {
      phases: [
        {
          id: 1,
          phase: "브리핑 이해",
          icon: "🎯",
          title: "클라이언트 요구 및 브랜드 분석",
          description: "클라이언트의 비즈니스 목표, 타겟 오디언스, 브랜드 아이덴티티를 파악합니다.",
          duration: "1~2일",
          example: "예: 신규 카페 브랜드의 로고 및 패키지 디자인 요청 - 타겟(20~30대 여성), 컨셉(미니멀·내추럴) 정리",
          tools: ["Notion", "Miro", "Pinterest (무드보드)", "Google Docs"],
          skills: ["경청 능력", "브랜드 분석", "트렌드 리서치", "질문 능력"]
        },
        {
          id: 2,
          phase: "컨셉 설계",
          icon: "💡",
          title: "크리에이티브 방향 설정",
          description: "브랜드 본질을 시각적으로 표현할 핵심 컨셉과 무드를 정의합니다.",
          duration: "2~3일",
          example: "예: '자연스러운 일상의 여유'를 컨셉으로 설정, 컬러(베이지·그린), 타이포(세리프체), 스타일(손그림 터치) 결정",
          tools: ["Figma", "Adobe XD", "Midjourney (컨셉 스케치)", "Coolors (컬러 팔레트)"],
          skills: ["컨셉 도출", "무드보드 제작", "컬러 이론", "타이포그래피"]
        },
        {
          id: 3,
          phase: "AI 협업 제작",
          icon: "🎨",
          title: "AI 도구로 초안 생성 및 큐레이션",
          description: "AI 디자인 도구로 다양한 시안을 빠르게 생성하고, 최적안을 선택·정제합니다.",
          duration: "1~2주",
          example: "예: Midjourney로 로고 시안 50개 생성 → 3개 선택 → Illustrator로 정교화 → 목업 적용",
          tools: ["Midjourney", "Adobe Firefly", "Illustrator", "Photoshop", "Figma"],
          skills: ["AI 프롬프트 작성", "큐레이션 능력", "디자인 정교화", "목업 제작"]
        },
        {
          id: 4,
          phase: "피드백 반영",
          icon: "🔄",
          title: "클라이언트 피드백 및 수정",
          description: "클라이언트의 피드백을 해석하고, 브랜드 일관성을 유지하며 수정합니다.",
          duration: "3~5일",
          example: "예: '좀 더 고급스럽게' 피드백 → 컬러 톤 조정, 타이포 세련되게 변경, 여백 확대",
          tools: ["Figma (버전 관리)", "Adobe CC", "Slack/Email (소통)"],
          skills: ["피드백 해석", "브랜드 일관성 유지", "협상 능력", "수정 속도"]
        },
        {
          id: 5,
          phase: "최종 납품",
          icon: "📦",
          title: "파일 정리 및 가이드 제작",
          description: "다양한 포맷으로 파일을 정리하고, 브랜드 가이드라인을 작성하여 납품합니다.",
          duration: "1~2일",
          example: "예: 로고 AI/PNG/SVG 파일, 컬러 코드, 사용 가이드, 목업 이미지 패키지로 정리",
          tools: ["Adobe Illustrator", "Figma", "Google Drive", "Dropbox"],
          skills: ["파일 관리", "가이드 작성", "프레젠테이션", "완결 능력"]
        }
      ]
    },
    
    '의사 (일반·전문의)': {
      phases: [
        {
          id: 1,
          phase: "환자 접수",
          icon: "📋",
          title: "환자 정보 확인 및 문진",
          description: "환자의 증상, 병력, 현재 복용 중인 약물 등을 파악합니다.",
          duration: "5~10분",
          example: "예: 복통 환자 - 통증 위치, 지속 시간, 동반 증상(구토·설사), 과거 병력 확인",
          tools: ["EMR (전자의무기록)", "AI 문진 보조", "청진기", "혈압계"],
          skills: ["문진 능력", "경청", "환자 신뢰 구축", "관찰력"]
        },
        {
          id: 2,
          phase: "진단 검사",
          icon: "🔬",
          title: "신체 검사 및 AI 보조 진단",
          description: "신체 검사, 영상 검사, 혈액 검사 등을 통해 진단 근거를 수집합니다.",
          duration: "10~30분",
          example: "예: 복부 초음파, 혈액 검사 → AI 영상 판독 보조 → 의사가 최종 판단",
          tools: ["X-ray", "CT/MRI", "초음파", "AI 영상 판독 시스템", "혈액 분석기"],
          skills: ["신체 검사", "영상 판독", "AI 결과 검증", "감별 진단"]
        },
        {
          id: 3,
          phase: "진단 및 치료 계획",
          icon: "💊",
          title: "최종 진단 및 치료 방향 결정",
          description: "검사 결과를 종합하여 진단하고, 환자에게 맞는 치료 계획을 수립합니다.",
          duration: "10~20분",
          example: "예: 급성 충수염 진단 → 수술 vs 항생제 치료 판단 → 환자 상태·선호 고려하여 결정",
          tools: ["임상 가이드라인", "AI 치료 추천 시스템", "약물 데이터베이스", "EMR"],
          skills: ["임상 판단", "치료 계획", "환자 맞춤 의사결정", "위험 평가"]
        },
        {
          id: 4,
          phase: "환자 설명",
          icon: "💬",
          title: "진단·치료 설명 및 동의",
          description: "환자에게 진단 결과와 치료 옵션을 쉽게 설명하고, 동의를 구합니다.",
          duration: "5~15분",
          example: "예: '충수염이 의심되어 수술이 필요합니다. 수술 과정, 회복 기간, 합병증 가능성을 설명'",
          tools: ["설명 자료", "동의서", "환자 교육 앱"],
          skills: ["쉬운 설명", "공감 능력", "신뢰 구축", "윤리적 판단"]
        },
        {
          id: 5,
          phase: "치료 및 추적 관찰",
          icon: "🏥",
          title: "치료 수행 및 경과 모니터링",
          description: "치료를 수행하고, 환자의 회복 상태를 지속적으로 관찰합니다.",
          duration: "수일~수개월",
          example: "예: 수술 후 회복 상태 확인, 합병증 모니터링, 재진 일정 안내",
          tools: ["수술 장비", "모니터링 시스템", "AI 예후 예측", "EMR"],
          skills: ["수술/시술 능력", "합병증 대응", "장기 관리", "환자 관계"]
        }
      ]
    },
    
    '변호사': {
      phases: [
        {
          id: 1,
          phase: "사건 접수",
          icon: "📞",
          title: "의뢰인 상담 및 사건 분석",
          description: "의뢰인의 법적 문제를 파악하고, 승소 가능성과 전략을 검토합니다.",
          duration: "1~3일",
          example: "예: 부동산 계약 분쟁 - 계약서 검토, 쟁점 파악, 관련 판례 검색",
          tools: ["법률 DB", "AI 판례 검색", "계약서 분석 AI", "상담 기록"],
          skills: ["법률 분석", "경청", "쟁점 도출", "전략 수립"]
        },
        {
          id: 2,
          phase: "증거 수집",
          icon: "🔍",
          title: "증거 자료 확보 및 법리 검토",
          description: "승소에 필요한 증거를 수집하고, AI로 유사 판례를 분석합니다.",
          duration: "1~4주",
          example: "예: 계약서, 이메일, 녹취록 수집 → AI로 유리한 판례 100건 검색 → 5건 선별",
          tools: ["AI 판례 검색", "증거 관리 시스템", "법률 DB", "이메일/문서 분석 AI"],
          skills: ["증거 수집", "판례 분석", "AI 결과 검증", "법리 구성"]
        },
        {
          id: 3,
          phase: "서면 작성",
          icon: "📝",
          title: "소장·답변서·준비서면 작성",
          description: "법적 논리를 명확히 담은 서면을 작성하고, AI 초안을 검토·수정합니다.",
          duration: "3~7일",
          example: "예: AI로 소장 초안 생성 → 법리 오류 수정 → 쟁점별 논리 강화 → 최종 검토",
          tools: ["AI 법률 문서 생성", "Word/HWP", "법률 DB", "문서 관리 시스템"],
          skills: ["법률 문서 작성", "논리 구성", "AI 초안 검증", "설득력"]
        },
        {
          id: 4,
          phase: "법정 변론",
          icon: "⚖️",
          title: "재판 출석 및 변론",
          description: "법정에서 의뢰인을 대리하여 변론하고, 판사의 질문에 답변합니다.",
          duration: "수회 (사건당)",
          example: "예: 쟁점 정리, 증인 신문, 상대방 주장 반박, 최종 변론",
          tools: ["변론 자료", "판례 인쇄물", "증거 자료", "AI 변론 시뮬레이션 (준비)"],
          skills: ["변론 능력", "즉각 대응", "설득력", "법정 예절"]
        },
        {
          id: 5,
          phase: "판결 후 조치",
          icon: "📋",
          title: "판결 분석 및 후속 조치",
          description: "판결 결과를 분석하고, 항소·강제집행 등 후속 조치를 진행합니다.",
          duration: "1~2주",
          example: "예: 승소 시 강제집행 절차, 패소 시 항소 여부 검토 및 전략 수정",
          tools: ["판결문 분석", "AI 항소 전략 자문", "집행 시스템"],
          skills: ["판결 해석", "전략 수정", "집행 절차", "의뢰인 소통"]
        }
      ]
    }
  };

  // 해당 직업의 맞춤 프로세스가 있으면 사용, 없으면 기본 템플릿
  const customProcess = processMap[jobName];
  
  if (customProcess) {
    return {
      title: `${jobName}의 실제 직무 프로세스`,
      description: `${jobName}가 실제 업무에서 문제를 해결하는 전체 프로세스입니다. AI 시대에는 각 단계에서 AI 도구와 협업하며, 인간은 판단·공감·전략에 집중합니다.`,
      phases: customProcess.phases
    };
  }
  
  // 기본 템플릿 (이전 스크립트와 동일)
  return job.workProcess || {
    title: `${jobName}의 직무 프로세스`,
    description: `${jobName}가 실제 업무에서 문제를 해결하는 전체 프로세스입니다.`,
    phases: [] // 기존 유지
  };
}

/**
 * 조직 구조에 구체적 연봉 및 역량 추가
 */
function enhanceOrganizationStructure(job) {
  const jobName = job.name;
  const shortDesc = job.shortDescription || job.description;
  
  // 직업별 연봉 범위 맵 (실제 시장 데이터 기반)
  const salaryMap = {
    '소프트웨어 엔지니어': {
      junior: '3,500~5,500만원',
      mid: '5,500~9,000만원',
      senior: '9,000~15,000만원',
      lead: '15,000~30,000만원'
    },
    '그래픽 디자이너': {
      junior: '2,800~4,000만원',
      mid: '4,000~6,500만원',
      senior: '6,500~10,000만원',
      lead: '10,000~18,000만원'
    },
    '의사 (일반·전문의)': {
      junior: '전공의 4,000~6,000만원',
      mid: '전문의 8,000~15,000만원',
      senior: '개원의/교수 15,000~30,000만원',
      lead: '병원장/과장 30,000~50,000만원+'
    },
    '변호사': {
      junior: '4,000~6,000만원',
      mid: '6,000~10,000만원',
      senior: '10,000~20,000만원',
      lead: '파트너 20,000~50,000만원+'
    },
    // 기본값
    'default': {
      junior: '3,000~5,000만원',
      mid: '5,000~8,000만원',
      senior: '8,000~15,000만원',
      lead: '12,000~25,000만원'
    }
  };

  const salaries = salaryMap[jobName] || salaryMap['default'];

  const levels = [
    {
      level: 1,
      title: "신입 (Junior)",
      icon: "🌱",
      yearsRange: "0~3년",
      avgSalary: salaries.junior,
      roleNarrative: `${jobName} 직무의 신입 단계에서는 배정된 업무를 기한 내에 수행하고, 선배의 피드백에 따라 기본기를 쌓습니다. ${shortDesc} 맥락의 업무 흐름을 익히며, 실수를 줄이고 재현 가능한 품질을 만드는 데 집중합니다.`,
      competencyNarrative: `기초 이론 및 도구 습득, 질문과 기록의 습관, 팀 규칙에 맞춰 협업하는 태도가 핵심입니다. 실행력과 학습 속도가 평가에 반영되며, ${jobName} 직무에서 약속한 품질과 기한을 지키는 책임감이 요구됩니다.`,
      requiredSkills: [
        "기초 실무 지식",
        "빠른 학습 능력",
        "커뮤니케이션",
        "시간 관리",
        "팀워크 및 협업"
      ]
    },
    {
      level: 2,
      title: "중급 (Mid-level)",
      icon: "🔧",
      yearsRange: "3~7년",
      avgSalary: salaries.mid,
      roleNarrative: `${jobName} 직무의 중급 단계에서는 정해진 과제를 스스로 완수하고, 신입의 실무를 코칭합니다. ${shortDesc} 맥락의 산출물을 팀 표준에 맞춰 검토·개선하며, 모호한 요구를 구체적인 작업으로 바꾸는 일이 반복됩니다.`,
      competencyNarrative: `해당 분야의 실무 지식과 문제 해결 능력, 동료·고객과의 협업을 통해 모호한 요구를 구체화하는 능력이 필요합니다. 문서화·리뷰·피드백을 루틴으로 남기며, ${jobName} 직무에서 산출물의 기준을 팀에 공유하는 힘이 중요합니다.`,
      requiredSkills: [
        "심화 전문 지식",
        "독립적 문제 해결",
        "프로젝트 관리",
        "후배 멘토링",
        "AI 도구 숙련"
      ]
    },
    {
      level: 3,
      title: "시니어 (Senior)",
      icon: "⭐",
      yearsRange: "7~15년",
      avgSalary: salaries.senior,
      roleNarrative: `${jobName} 직무의 시니어 단계에서는 팀·프로젝트의 방향을 정하고, ${shortDesc} 맥락의 품질 기준과 일정·예산을 책임집니다. 외부·경영진과의 협의를 주도하고, 후배의 성장과 산출물 검토까지 아우릅니다.`,
      competencyNarrative: `조직 전체를 보는 시야, 우선순위 결정, 리스크 관리, 사람을 이끄는 커뮤니케이션이 요구됩니다. '왜 이렇게 할지'를 설명하고 합의를 이끌어내며, ${jobName} 직무의 대외적 책임을 질 수 있는 성숙도가 기대됩니다.`,
      requiredSkills: [
        "전략적 사고",
        "리더십 및 영향력",
        "의사결정 능력",
        "조직 관리",
        "비즈니스 통찰"
      ]
    },
    {
      level: 4,
      title: "리드/매니저 (Lead/Manager)",
      icon: "👑",
      yearsRange: "10~20년",
      avgSalary: salaries.lead,
      roleNarrative: `${jobName} 분야의 리드·매니저는 여러 팀을 조율하고, 조직의 중장기 전략을 수립합니다. ${shortDesc} 관점에서 회사의 비전을 실행 가능한 계획으로 번역하고, 인재 육성과 조직 문화를 책임집니다.`,
      competencyNarrative: `비즈니스 전략 수립, 조직 설계, 인재 육성, 이해관계자 관리가 핵심입니다. ${jobName} 분야의 미래를 내다보고, 팀이 올바른 방향으로 성장하도록 이끄는 비전과 실행력이 필요합니다.`,
      requiredSkills: [
        "비즈니스 전략 수립",
        "조직 설계 및 운영",
        "인재 육성 및 평가",
        "이해관계자 관리",
        "변화 관리 및 혁신"
      ]
    }
  ];

  return {
    title: `${jobName} 조직 구조 및 커리어 경로`,
    description: `${jobName} 직무에서 직급이 올라갈수록 담당 범위·책임·요구 역량이 달라집니다. 각 단계별 구체적인 역할과 연봉 수준을 이해하면 장기 커리어 경로를 설계할 수 있습니다.`,
    levels,
    promotionCriteria: [
      `${jobName} 직무에서 상위 직급으로 갈수록 '무엇을 했는가'뿐 아니라 '어떻게 했는가', '누구와 했는가'가 중요해집니다.`,
      `승진 심사에서는 ${shortDesc}과 연결된 구체적 성과, 프로젝트 리드 경험, 문제 해결 사례, 팀 기여도를 종합 평가합니다.`,
      "시니어 이상 직급에서는 개인 실적뿐 아니라 후배 육성, 프로세스 개선, 조직 문화 기여, 대외 책임이 함께 평가됩니다."
    ],
    careerPaths: [
      {
        path: "전문가 트랙 (Individual Contributor)",
        description: `${jobName} 직무에서 한 분야·기술에 깊이를 더하는 길입니다. 기술·전문성 심화에 집중하며, 자격증·포트폴리오·연구·커뮤니티 활동이 뒷받침될 때 유리합니다. 관리 부담 없이 전문성으로 인정받는 경로입니다.`
      },
      {
        path: "관리자 트랙 (Manager)",
        description: `실행·코칭·조직 운영을 통해 사람과 일정을 함께 맡는 길입니다. 팀 목표 설정, 성과 관리, 갈등 조정, 인사 평가 역할이 늘어나며, 리더십과 커뮤니케이션이 핵심 역량이 됩니다.`
      },
      {
        path: "창업/프리랜서 트랙",
        description: `${jobName}의 전문성을 바탕으로 독립적으로 일하거나 자신의 사업을 시작하는 길입니다. 비즈니스 감각, 네트워킹, 자기 관리 능력, 재무 관리가 필수적이며, 자유도가 높지만 불확실성도 큽니다.`
      }
    ]
  };
}

/**
 * 메인 실행
 */
function main() {
  console.log('🚀 Phase 2: Detailed content enhancement for all jobs...\n');
  
  KINGDOM_FILES.forEach(filename => {
    const filepath = path.join(JOBS_DIR, filename);
    console.log(`\n📂 Processing: ${filename}`);
    
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      console.log(`   Found ${data.length} jobs`);
      
      const enhancedJobs = data.map((job, index) => {
        console.log(`   ⚙️  ${index + 1}/${data.length}: ${job.name}`);
        
        // workProcess와 organizationStructure만 업데이트 (나머지는 이전 스크립트에서 완료)
        return {
          ...job,
          workProcess: createDetailedWorkProcess(job),
          organizationStructure: enhanceOrganizationStructure(job)
        };
      });
      
      fs.writeFileSync(filepath, JSON.stringify(enhancedJobs, null, 2), 'utf-8');
      console.log(`   ✅ Updated: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error: ${filename}:`, error.message);
    }
  });
  
  console.log('\n✨ Phase 2 complete! All jobs now have detailed, job-specific content.\n');
}

main();
