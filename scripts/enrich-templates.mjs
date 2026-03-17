#!/usr/bin/env node
/**
 * 커리어 패스 템플릿 풍부화 스크립트
 * - 각 템플릿의 항목 수를 8~12개로 확대
 * - URL·링크·설명 구체화
 * - 프로젝트·논문·인턴·봉사 예시 추가
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// 서울대 컴공은 이미 완료했으므로 KAIST 전기전자부터 확장
const KAIST_EE_ENRICHMENT = {
  mid2: [
    {
      type: 'certification',
      title: 'COS Pro 2급 (Python)',
      months: [6],
      difficulty: 2,
      cost: '3만원',
      organizer: 'YBM',
      url: 'https://www.ybmit.com',
      description: '수시·정시 학생부 기재. SW 역량 인증. 합격률 60~70%.',
      categoryTags: [],
      links: [
        { title: 'COS Pro 공식', url: 'https://www.ybmit.com', kind: 'official' }
      ]
    },
    {
      type: 'activity',
      title: 'Arduino 기초 전자회로 실습',
      months: [3, 4, 5],
      difficulty: 2,
      cost: '5만원 (키트)',
      organizer: '자체',
      description: 'LED·센서·모터 제어. 학생부 동아리 기재. 전기전자 기초.',
      categoryTags: ['project', 'activity'],
      activitySubtype: 'project',
      links: [
        { title: 'Arduino 공식 튜토리얼', url: 'https://www.arduino.cc/en/Tutorial', kind: 'reference' }
      ]
    },
    {
      type: 'activity',
      title: '중학생 로봇 대회 (FLL)',
      months: [9, 10, 11],
      difficulty: 3,
      cost: '무료~10만원',
      organizer: 'FIRST LEGO League',
      url: 'https://www.firstlegoleague.org',
      description: '팀 프로젝트. 로봇 설계·프로그래밍. 학생부 수상 기재.',
      categoryTags: ['project', 'award', 'activity'],
      activitySubtype: 'project',
      links: [
        { title: 'FLL 공식', url: 'https://www.firstlegoleague.org', kind: 'official' }
      ]
    },
    {
      type: 'activity',
      title: '수학·물리 선행 (미적분·전자기학 입문)',
      months: [7, 8, 9, 10, 11, 12],
      difficulty: 3,
      cost: '무료~학원비',
      organizer: '자체',
      description: '고등 수학·물리 선행. KPhO 대비. 수시·정시 기초.',
      categoryTags: ['activity'],
      activitySubtype: 'general'
    },
    {
      type: 'activity',
      title: '과학 동아리 가입 (전자·로봇)',
      months: [3],
      difficulty: 2,
      cost: '무료',
      organizer: '학교',
      description: '정기 모임. 프로젝트 협업. 학생부 동아리 핵심.',
      categoryTags: ['activity'],
      activitySubtype: 'general'
    }
  ],
  mid3: [
    {
      type: 'certification',
      title: '정보처리기능사',
      months: [3],
      difficulty: 2,
      cost: '1.9만원',
      organizer: '한국산업인력공단',
      url: 'https://www.q-net.or.kr',
      description: '수시·정시 학생부 기재. 필기 60점 이상.',
      categoryTags: [],
      links: [
        { title: 'Q-Net 큐넷', url: 'https://www.q-net.or.kr', kind: 'official' }
      ]
    },
    {
      type: 'award',
      title: '한국물리올림피아드 (KPhO) 예선',
      months: [5, 6],
      difficulty: 4,
      cost: '무료',
      organizer: '한국물리학회',
      url: 'https://www.kps.or.kr',
      description: '수시·정시 핵심. 본선 입상 시 최상위 스펙. 전자기학·역학 필수.',
      categoryTags: ['award'],
      links: [
        { title: 'KPhO 공식', url: 'https://www.kps.or.kr/kpho', kind: 'official' }
      ]
    },
    {
      type: 'activity',
      title: 'Raspberry Pi 프로젝트 (IoT 입문)',
      months: [9, 10, 11],
      difficulty: 3,
      cost: '10만원 (키트)',
      organizer: '자체',
      description: '온도·습도 센서 데이터 수집. GitHub 공개. 학생부 자율활동.',
      categoryTags: ['project', 'activity'],
      activitySubtype: 'project',
      links: [
        { title: 'Raspberry Pi 공식', url: 'https://www.raspberrypi.org', kind: 'reference' }
      ]
    },
    {
      type: 'activity',
      title: 'KAIST 과학영재캠프 (여름)',
      months: [7],
      difficulty: 4,
      cost: '무료~10만원',
      organizer: 'KAIST',
      url: 'https://gifted.kaist.ac.kr',
      description: '2박3일. 교수 특강·연구실 투어. 학생부 진로활동.',
      categoryTags: ['camp', 'activity'],
      activitySubtype: 'camp',
      links: [
        { title: 'KAIST 영재교육원', url: 'https://gifted.kaist.ac.kr', kind: 'official' }
      ]
    },
    {
      type: 'activity',
      title: '물리·수학 심화 탐구 (전자기학)',
      months: [11],
      difficulty: 3,
      cost: '무료',
      organizer: '학교',
      description: '맥스웰 방정식 입문. 보고서 작성. 학생부 세특(물리).',
      categoryTags: ['paper', 'activity'],
      activitySubtype: 'research'
    }
  ],
  high1: [
    {
      type: 'certification',
      title: '정보처리산업기사',
      months: [9],
      difficulty: 4,
      cost: '2.5만원',
      organizer: '한국산업인력공단',
      url: 'https://www.q-net.or.kr',
      description: '수시·정시 학생부 기재. 필기 60점 이상. 합격률 30~40%.',
      categoryTags: [],
      links: [
        { title: 'Q-Net 큐넷', url: 'https://www.q-net.or.kr', kind: 'official' }
      ]
    },
    {
      type: 'award',
      title: '한국물리올림피아드 (KPhO) 본선',
      months: [6, 7],
      difficulty: 5,
      cost: '무료',
      organizer: '한국물리학회',
      url: 'https://www.kps.or.kr',
      description: '수시 최상위 스펙. 동상 이상 목표. 정시 가산점.',
      categoryTags: ['award'],
      links: [
        { title: 'KPhO 공식', url: 'https://www.kps.or.kr/kpho', kind: 'official' }
      ]
    },
    {
      type: 'portfolio',
      title: 'STM32 마이크로컨트롤러 프로젝트',
      months: [9, 10, 11],
      difficulty: 4,
      cost: '15만원 (보드)',
      organizer: '자체',
      description: '임베디드 시스템. 모터 제어·센서 통합. GitHub 공개.',
      categoryTags: ['project'],
      links: [
        { title: 'STM32 공식', url: 'https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html', kind: 'reference' }
      ]
    },
    {
      type: 'activity',
      title: '전국 로봇 대회 (FRC)',
      months: [3, 4, 5],
      difficulty: 4,
      cost: '무료~50만원',
      organizer: 'FIRST Robotics Competition',
      url: 'https://www.firstinspires.org/robotics/frc',
      description: '팀 프로젝트. 로봇 설계·제작. 학생부 수상·동아리 기재.',
      categoryTags: ['project', 'award', 'activity'],
      activitySubtype: 'project',
      links: [
        { title: 'FRC 공식', url: 'https://www.firstinspires.org/robotics/frc', kind: 'official' }
      ]
    },
    {
      type: 'activity',
      title: 'KAIST 전기전자공학부 체험 캠프',
      months: [7],
      difficulty: 3,
      cost: '무료~5만원',
      organizer: 'KAIST',
      url: 'https://ee.kaist.ac.kr',
      description: '2박3일. 학과 탐색. 학생부 진로활동.',
      categoryTags: ['camp', 'activity'],
      activitySubtype: 'camp',
      links: [
        { title: 'KAIST 전기전자공학부', url: 'https://ee.kaist.ac.kr', kind: 'official' }
      ]
    }
  ],
  high2: [
    {
      type: 'activity',
      title: '대학 연계 R&E 연구 (전자회로·신호처리)',
      months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      difficulty: 5,
      cost: '무료',
      organizer: 'KAIST·서울대·과학영재학교',
      url: 'https://www.kaist.ac.kr',
      description: '수시 핵심. 교수 멘토링. 논문 작성 + 학술제 발표.',
      categoryTags: ['paper', 'activity'],
      activitySubtype: 'research',
      links: [
        { title: 'KAIST R&E', url: 'https://gifted.kaist.ac.kr', kind: 'official' }
      ]
    },
    {
      type: 'award',
      title: '전국 청소년 전자회로 대회',
      months: [9],
      difficulty: 4,
      cost: '무료',
      organizer: '한국전자회로학회',
      description: '수시·정시 포트폴리오. 회로 설계·제작. 학생부 수상.',
      categoryTags: ['project', 'award']
    },
    {
      type: 'portfolio',
      title: 'FPGA 프로젝트 (Verilog)',
      months: [9, 10, 11],
      difficulty: 5,
      cost: '20만원 (보드)',
      organizer: '자체',
      description: '디지털 회로 설계. GitHub 공개. 학생부 자율활동.',
      categoryTags: ['project'],
      links: [
        { title: 'Xilinx FPGA', url: 'https://www.xilinx.com', kind: 'reference' }
      ]
    },
    {
      type: 'activity',
      title: '전자공학 인턴십 (연구소·기업)',
      months: [7, 8],
      difficulty: 5,
      cost: '무료',
      organizer: '대학 연구소·기업',
      description: '여름방학 4주. 실무 경험. 학생부 진로활동.',
      categoryTags: ['intern', 'activity'],
      activitySubtype: 'intern'
    }
  ]
};

function enrichTemplate(template, enrichmentData) {
  if (!enrichmentData) return template;
  
  return {
    ...template,
    years: template.years.map(year => {
      const enrichment = enrichmentData[year.gradeId];
      if (!enrichment) return year;
      
      return {
        ...year,
        items: enrichment
      };
    }),
    totalItems: Object.values(enrichmentData).reduce((sum, items) => sum + items.length, 0)
  };
}

function enrichFile(relPath) {
  const fullPath = join(ROOT, relPath);
  const raw = readFileSync(fullPath, 'utf-8');
  const data = JSON.parse(raw);
  
  // KAIST 전기전자 템플릿만 확장 (id: tpl-admission-kaist-ee-001)
  const enriched = data.map(template => {
    if (template.id === 'tpl-admission-kaist-ee-001') {
      return enrichTemplate(template, KAIST_EE_ENRICHMENT);
    }
    return template;
  });
  
  writeFileSync(fullPath, JSON.stringify(enriched, null, 2) + '\n', 'utf-8');
  console.log('Enriched:', relPath);
}

const FILES = [
  'frontend/data/career-path-templates-admission.json',
  'app/dreampath-app/src/data/career-path-templates-admission.json'
];

FILES.forEach(enrichFile);
console.log('Done. Templates enriched.');
