'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * 입시 약자·전문 용어 사전.
 * key는 본문에 나타나는 토큰 그대로(대소문자·한글 그대로 매칭).
 * 매칭은 길이 내림차순으로 수행해 더 긴 토큰이 먼저 잡히도록 한다.
 */
type GlossaryEntry = { full: string; meaning: string; emoji?: string };

const GLOSSARY: Record<string, GlossaryEntry> = {
  // ── IB(국제 바칼로레아) 관련 ──────────────────────────────────────────
  'IB': { full: 'International Baccalaureate', meaning: '국제 바칼로레아. 전 세계가 인정하는 고교 교육과정. 에세이·토론·프로젝트 중심', emoji: '🎓' },
  'EE': { full: 'Extended Essay', meaning: 'IB 소논문. 4,000단어 영문으로 직접 쓰는 연구 보고서', emoji: '📝' },
  'TOK': { full: 'Theory of Knowledge', meaning: '인식론. "우리는 어떻게 안다고 말할 수 있는가"를 다루는 IB 비판적 사고 수업', emoji: '🧠' },
  'CAS': { full: 'Creativity, Activity, Service', meaning: 'IB 필수 활동. 창의·활동·봉사 영역에서 총 150시간 이상', emoji: '🤝' },
  'HL': { full: 'Higher Level', meaning: 'IB 심화 과목. 6과목 중 3과목을 HL로 골라 깊게 공부', emoji: '⬆️' },
  'SL': { full: 'Standard Level', meaning: 'IB 표준 과목. HL이 아닌 나머지 3과목', emoji: '➡️' },

  // ── 미국·영국 시험 ────────────────────────────────────────────────
  'AP': { full: 'Advanced Placement', meaning: '미국 고교생이 듣는 대학 과목 선이수 시험. 5점 만점', emoji: '🇺🇸' },
  'SAT': { full: 'Scholastic Assessment Test', meaning: '미국 대학입학 자격시험. 수학+영어, 1600점 만점', emoji: '🇺🇸' },
  'ACT': { full: 'American College Testing', meaning: 'SAT의 대안. 영어·수학·읽기·과학 4과목, 36점 만점', emoji: '🇺🇸' },
  'A-Level': { full: 'Advanced Level', meaning: '영국 수능. A*~E 등급. 보통 3과목 선택', emoji: '🇬🇧' },
  '토플': { full: 'TOEFL', meaning: '미국 대학이 요구하는 영어 능력 시험 (120점 만점)', emoji: '🇺🇸' },
  '아이엘츠': { full: 'IELTS', meaning: '영국·호주·캐나다 대학이 요구하는 영어 능력 시험 (9점 만점)', emoji: '🇬🇧' },

  // ── 한국 입시 핵심 용어 ─────────────────────────────────────────────
  '학종': { full: '학생부종합전형', meaning: '학생부(세특·동아리·진로) 전체를 종합 평가하는 수시 전형', emoji: '📚' },
  '교과': { full: '학생부교과전형', meaning: '내신 등급으로 합격을 결정하는 수시 전형', emoji: '📊' },
  '정시': { full: '정시모집', meaning: '대학수학능력시험(수능) 점수로 선발하는 전형', emoji: '🎯' },
  '수시': { full: '수시모집', meaning: '수능 전에 학생부·논술·실기로 선발하는 전형', emoji: '📄' },
  '논술': { full: '논술전형', meaning: '대학별 논술 시험으로 선발하는 수시 전형', emoji: '✍️' },
  '실기': { full: '실기전형', meaning: '예체능 실기 시험 위주로 선발하는 전형', emoji: '🎨' },

  '세특': { full: '세부능력 및 특기사항', meaning: '과목 담당 교사가 학생부에 적는 학생의 수업 활동 기록', emoji: '✍️' },
  '학생부': { full: '학교생활기록부', meaning: '교과 성적·세특·동아리·봉사·진로·출결을 모두 담는 공식 기록', emoji: '📒' },
  '비교과': { full: '비교과 활동', meaning: '교과 성적 외 동아리·봉사·세특·독서 등 활동', emoji: '🎪' },
  '자기소개서': { full: '자기소개서(자소서)', meaning: '학생이 직접 작성하는 자기 어필 글. 2024학년부터 폐지됨', emoji: '📝' },
  '자소서': { full: '자기소개서', meaning: '학생이 직접 작성하는 자기 어필 글. 2024학년부터 폐지됨', emoji: '📝' },

  '수능': { full: '대학수학능력시험', meaning: '매년 11월 셋째 주 목요일에 보는 한국 대학입학 시험', emoji: '📝' },
  '수능최저': { full: '수능최저학력기준', meaning: '수시에서 합격하려면 수능에서 일정 등급 이상을 받아야 하는 조건', emoji: '⚠️' },
  '내신': { full: '학교 내신 성적', meaning: '학교 시험 등수로 산출되는 등급. 2028부터 5등급제', emoji: '🏫' },
  '내신 5등급제': { full: '내신 5등급제', meaning: '2028학년부터 9등급제 → 5등급제로 변경. 상위 10% = 1등급', emoji: '5️⃣' },
  '모의고사': { full: '모의고사', meaning: '학교나 사설 학원에서 보는 수능 모의 시험', emoji: '📋' },
  '모의평가': { full: '대학수학능력시험 모의평가', meaning: '한국교육과정평가원이 매년 6월·9월에 실시하는 공식 수능 모의시험', emoji: '📋' },
  '6평': { full: '6월 모의평가', meaning: '수능 출제기관이 6월에 실시하는 공식 모의 수능', emoji: '6️⃣' },
  '9평': { full: '9월 모의평가', meaning: '수능 출제기관이 9월에 실시하는 공식 모의 수능. 본 수능과 가장 비슷', emoji: '9️⃣' },

  '표준점수': { full: '표준점수', meaning: '시험 난이도에 따라 보정한 점수. 어려운 시험일수록 높게 나옴', emoji: '📈' },
  '백분위': { full: '백분위', meaning: '내가 상위 몇 %인지 알려주는 숫자. 100에 가까울수록 상위', emoji: '🥇' },
  '원점수': { full: '원점수', meaning: '맞은 개수 그대로의 점수. 난이도 보정 전', emoji: '💯' },
  '등급': { full: '등급', meaning: '점수를 9구간(고교 내신은 5구간)으로 나눈 순위 단계', emoji: '🏅' },
  '입결': { full: '입시 결과', meaning: '전년도 합격선·경쟁률 등 대학 입시 결과 데이터', emoji: '📊' },
  '가군': { full: '가군', meaning: '정시 모집 그룹 중 하나. 가/나/다군에서 각 1번씩 지원 가능', emoji: '🇦' },
  '나군': { full: '나군', meaning: '정시 모집 그룹 중 하나. 가/나/다군에서 각 1번씩 지원 가능', emoji: '🇧' },
  '다군': { full: '다군', meaning: '정시 모집 그룹 중 하나. 가/나/다군에서 각 1번씩 지원 가능', emoji: '🇨' },

  '입학사정관': { full: '입학사정관', meaning: '학생부와 면접을 직접 평가하는 대학 직원', emoji: '👀' },
  'N수': { full: 'N차 수험생', meaning: '재수·삼수 등 여러 번 수능에 도전하는 수험생', emoji: '🔁' },
  'N수생': { full: 'N차 수험생', meaning: '재수·삼수 등 여러 번 수능에 도전하는 수험생', emoji: '🔁' },
  '재수': { full: '재수', meaning: '수능을 한 번 더 보기 위해 1년 더 공부하는 것', emoji: '🔁' },
  '삼수': { full: '삼수', meaning: '수능을 두 번 더 본 후 세 번째로 도전하는 것', emoji: '3️⃣' },
  '인강': { full: '인터넷 강의', meaning: '온라인으로 듣는 강의. EBS·메가스터디·대성마이맥 등', emoji: '💻' },

  // ── 대학·기관 ────────────────────────────────────────────────────
  'SKY': { full: '서울대·연세대·고려대', meaning: '국내 최상위 3개 대학을 묶어 부르는 약어', emoji: '🏆' },
  'KAIST': { full: '한국과학기술원', meaning: '대전 소재 이공계 특성화 국립대학', emoji: '🔬' },
  'POSTECH': { full: '포항공과대학교', meaning: '포항 소재 이공계 특성화 사립대학', emoji: '🔬' },
  'UNIST': { full: '울산과학기술원', meaning: '울산 소재 이공계 특성화 국립대학', emoji: '🔬' },
  'DGIST': { full: '대구경북과학기술원', meaning: '대구 소재 이공계 특성화 국립대학', emoji: '🔬' },
  'GIST': { full: '광주과학기술원', meaning: '광주 소재 이공계 특성화 국립대학', emoji: '🔬' },
  'EBS': { full: '한국교육방송공사', meaning: '교육부 산하 공영 방송. 수능·내신 인강 무료 제공', emoji: '📺' },
  '거점국립대': { full: '거점국립대학교', meaning: '권역별 대표 국립대(부산대·경북대·전남대·충남대·전북대 등)', emoji: '🏛️' },

  // ── IB 인증학교 ──────────────────────────────────────────────────
  'KIS': { full: 'Korea International School', meaning: '경기 판교에 있는 대표 IB 인증 국제학교', emoji: '🏫' },
  'NLCS': { full: 'North London Collegiate School', meaning: '제주에 캠퍼스가 있는 영국계 IB 학교', emoji: '🏫' },
  'BHA': { full: 'Branksome Hall Asia', meaning: '제주에 있는 캐나다계 여학교 (IB)', emoji: '🏫' },
  'SJA Jeju': { full: 'St. Johnsbury Academy Jeju', meaning: '제주에 있는 미국계 IB 인증 학교', emoji: '🏫' },
  '채드윅': { full: 'Chadwick International', meaning: '인천 송도에 있는 미국계 IB 인증 학교', emoji: '🏫' },

  // ── 학교 유형 ────────────────────────────────────────────────────
  '자공고': { full: '자율형 공립고', meaning: '교육과정·운영의 자율성을 가진 공립 고등학교', emoji: '🏛️' },
  '자사고': { full: '자율형 사립고', meaning: '커리큘럼·학비를 자율 운영하는 사립 고등학교', emoji: '🏢' },
  '특목고': { full: '특수목적고등학교', meaning: '과학고·외고·국제고·예술고·체육고 등 목적별 고교', emoji: '🎯' },
  '과학고': { full: '과학고등학교', meaning: '수학·과학 영재 양성을 위한 특목고', emoji: '🔬' },
  '영재고': { full: '영재학교', meaning: '전국 단위 선발 영재 양성 학교 (서울과고·경기과고 등)', emoji: '🌟' },
  '외고': { full: '외국어고등학교', meaning: '외국어 심화 교육을 위한 특목고', emoji: '🗣️' },
  '국제고': { full: '국제고등학교', meaning: '글로벌 인재 양성을 위한 특목고. IB 도입 학교 다수', emoji: '🌍' },
  '예술고': { full: '예술고등학교', meaning: '음악·미술·무용 등 예술 영재를 위한 특목고', emoji: '🎭' },
  '체육고': { full: '체육고등학교', meaning: '운동선수 양성을 위한 특목고', emoji: '🏅' },
  '마이스터고': { full: '산업수요 맞춤형 고등학교', meaning: '대기업 기술직 취업을 위한 직업계 고교. 학비 무료', emoji: '🔧' },
  '특성화고': { full: '특성화고등학교', meaning: '직업·기술 계열 고등학교', emoji: '⚡' },
  '일반고': { full: '일반고등학교', meaning: '특목·자사·특성화가 아닌 보통 고등학교', emoji: '📖' },

  // ── 특별전형/사회배려 ────────────────────────────────────────────
  '농어촌': { full: '농어촌전형', meaning: '읍·면 지역에서 6년 이상 거주·재학한 학생을 위한 특별전형', emoji: '🌾' },
  '기회균형': { full: '기회균형전형', meaning: '기초수급·차상위·다자녀 등 사회배려 대상자 특별전형', emoji: '🤝' },
  '지역인재': { full: '지역인재전형', meaning: '거점국립대·지방의대가 해당 지역 학생을 우대 선발하는 전형', emoji: '🏘️' },
  '차상위': { full: '차상위계층', meaning: '기초생활수급자 바로 다음 단계의 저소득층', emoji: '💰' },
  '차상위계층': { full: '차상위계층', meaning: '기초생활수급자 바로 다음 단계의 저소득층', emoji: '💰' },
  '기초수급': { full: '기초생활수급자', meaning: '국가 생계 지원을 받는 저소득 가구', emoji: '🏠' },
  '검정고시': { full: '고등학교 졸업 학력 검정고시', meaning: '정규 고교를 안 다녀도 졸업 학력을 인정받는 시험', emoji: '📜' },

  // ── 대학 학과/직업 ──────────────────────────────────────────────
  '의대': { full: '의과대학', meaning: '의사를 양성하는 6년제 학부', emoji: '🩺' },
  '치대': { full: '치과대학', meaning: '치과의사를 양성하는 6년제 학부', emoji: '🦷' },
  '한의대': { full: '한의과대학', meaning: '한의사를 양성하는 6년제 학부', emoji: '🌿' },
  '약대': { full: '약학대학', meaning: '약사를 양성하는 6년제 학부', emoji: '💊' },
  '수의대': { full: '수의과대학', meaning: '수의사를 양성하는 6년제 학부', emoji: '🐶' },
  '한예종': { full: '한국예술종합학교', meaning: '국내 최고 예술 교육기관 (음악·연극·영화·미술·무용)', emoji: '🎨' },

  // ── 그 외 ────────────────────────────────────────────────────
  'R&E': { full: 'Research & Education', meaning: '학생이 교수·교사 지도로 진행하는 연구 활동', emoji: '🔬' },
  'KPhO': { full: '한국물리올림피아드 (Korean Physics Olympiad)', meaning: '대한물리학회가 주관하는 국내 물리 올림피아드. 국제물리올림피아드(IPhO) 대표 선발 관문', emoji: '⚛️' },
  'KChO': { full: '한국화학올림피아드 (Korean Chemistry Olympiad)', meaning: '대한화학회가 주관하는 국내 화학 올림피아드', emoji: '🧪' },
  'KBO': { full: '한국생물올림피아드 (Korean Biology Olympiad)', meaning: '한국생물올림피아드위원회가 주관하는 국내 생물 올림피아드', emoji: '🧬' },
  'KAO': { full: '한국천문올림피아드 (Korean Astronomy Olympiad)', meaning: '한국천문학회가 주관하는 국내 천문 올림피아드', emoji: '🔭' },
  'Wolfram': { full: 'Wolfram Alpha / Mathematica', meaning: '수식 계산·기호 연산·과학 데이터 분석에 특화된 컴퓨팅 도구', emoji: '🧮' },
  'RPA': { full: 'Robotic Process Automation', meaning: '반복 사무 업무(엑셀·전표·문서 입력 등)를 봇이 자동 수행하는 기술', emoji: '🤖' },
  '통합형 수능': { full: '2028 통합형 수능 개편', meaning: '문·이과 통합, 심화수학 미포함, 절대평가 확대 등을 포함한 2028학년 수능 개편', emoji: '📐' },
  '심화수학': { full: '심화수학 영역', meaning: '미적분·기하 등 이공계 심화 수학. 2028 수능 개편으로 본시험에서 제외', emoji: '➗' },
  '변별력': { full: '변별력', meaning: '시험이 상위권 학생을 얼마나 잘 가려내는지의 정도. 높을수록 점수 편차가 크다', emoji: '📊' },
  '면접': { full: '면접 전형', meaning: '학생부·서류만으로 판단하기 어려운 인성·논리·전공적합성을 평가하는 구술 평가', emoji: '🎤' },
  '번아웃': { full: 'Burnout (소진증후군)', meaning: '장기간 누적된 학습·스트레스로 동기·집중력·체력이 한꺼번에 무너지는 상태', emoji: '🪫' },
  '선행': { full: '선행학습', meaning: '현재 학년 진도보다 앞서 배우는 학습. 과학고·영재고 대비에 흔히 사용', emoji: '⏩' },
  '아포스티유': { full: 'Apostille', meaning: '해외 발급 서류를 한국에서도 인정받게 하는 국제 인증', emoji: '🛂' },
  '공증': { full: '공증', meaning: '서류가 진짜임을 공식적으로 증명하는 절차', emoji: '✅' },
  '동아리': { full: '동아리', meaning: '학교 안 학생 활동 모임. 정규 동아리만 학생부 1순위', emoji: '🎪' },
  '자율동아리': { full: '자율동아리', meaning: '정규 외 학생 자율 동아리. 2024학년부터 학생부에 1개만 기재', emoji: '🌱' },
  '정원외': { full: '정원 외 모집', meaning: '대학의 일반 정원과 별도로 뽑는 자리. 특별전형이 여기 포함', emoji: '➕' },
  '정원 외': { full: '정원 외 모집', meaning: '대학의 일반 정원과 별도로 뽑는 자리. 특별전형이 여기 포함', emoji: '➕' },
  '재외국민': { full: '재외국민 특별전형', meaning: '해외에 일정 기간 거주한 한국인 자녀를 위한 특별전형', emoji: '🌏' },

  // ── 진로/적성 검사 ─────────────────────────────────────────────
  'RIASEC': { full: 'RIASEC 진로 유형', meaning: '홀랜드가 만든 6가지 진로 유형 (현실·탐구·예술·사회·기업·관습)', emoji: '🧭' },
  'Holland': { full: 'Holland Code', meaning: '홀랜드 직업 흥미 검사. RIASEC 6유형 조합으로 표현', emoji: '🧭' },
  '홀랜드': { full: '홀랜드 직업 흥미 검사', meaning: 'RIASEC 6유형 조합으로 진로 적성을 파악하는 검사', emoji: '🧭' },
  'MBTI': { full: 'Myers-Briggs Type Indicator', meaning: '16가지 성격 유형으로 분류하는 성격 검사', emoji: '🧠' },
  'MMI': { full: 'Multiple Mini Interview', meaning: '의대 다중 미니 면접. 짧은 시나리오 면접을 여러 방 돌면서 봄', emoji: '🎤' },

  // ── AI / 디지털 도구 ──────────────────────────────────────────
  'AI': { full: 'Artificial Intelligence', meaning: '인공지능. 사람처럼 학습·추론하는 컴퓨터 시스템', emoji: '🤖' },
  '인공지능': { full: 'Artificial Intelligence', meaning: '사람처럼 학습·추론하는 컴퓨터 시스템', emoji: '🤖' },
  'LLM': { full: 'Large Language Model', meaning: '대규모 언어 모델. ChatGPT·Claude·Gemini 같은 텍스트 AI', emoji: '💬' },
  'ChatGPT': { full: 'OpenAI ChatGPT', meaning: 'OpenAI가 만든 대화형 AI. 글쓰기·번역·코딩·요약 등에 활용', emoji: '🤖' },
  'GPT': { full: 'Generative Pre-trained Transformer', meaning: 'OpenAI의 대형 언어 모델', emoji: '🤖' },
  'GPT-4': { full: 'GPT-4', meaning: 'OpenAI의 4세대 대형 언어 모델', emoji: '🤖' },
  'Claude': { full: 'Anthropic Claude', meaning: 'Anthropic이 만든 대화형 AI. 긴 문서·코드 분석에 강함', emoji: '🤖' },
  'Gemini': { full: 'Google Gemini', meaning: '구글이 만든 멀티모달 AI', emoji: '🤖' },
  'Copilot': { full: 'GitHub Copilot / Microsoft Copilot', meaning: '코드·문서 작성을 자동 보조하는 AI', emoji: '🤖' },
  'Notion AI': { full: 'Notion AI', meaning: '노트·문서 앱 노션의 AI 글쓰기 보조 기능', emoji: '📝' },
  'DeepL': { full: 'DeepL Translator', meaning: '독일에서 만든 번역 AI. 자연스러운 한·영·일 번역', emoji: '🌐' },
  'MidJourney': { full: 'Midjourney', meaning: '글로 그림을 그려 주는 AI 이미지 생성 도구', emoji: '🎨' },
  'Stable Diffusion': { full: 'Stable Diffusion', meaning: '오픈소스 이미지 생성 AI', emoji: '🎨' },
  'DALL-E': { full: 'DALL·E', meaning: 'OpenAI의 이미지 생성 AI', emoji: '🎨' },
  'Suno': { full: 'Suno AI', meaning: '글로 노래를 만들어 주는 AI 음악 생성 도구', emoji: '🎵' },
  'Sora': { full: 'OpenAI Sora', meaning: '글로 영상을 만들어 주는 AI 비디오 생성 도구', emoji: '🎬' },
  'Runway': { full: 'Runway ML', meaning: '영상 편집·생성 AI 도구', emoji: '🎬' },

  // ── 의료 AI 도구 ──────────────────────────────────────────────
  'Lunit INSIGHT': { full: 'Lunit INSIGHT', meaning: '루닛이 만든 의료 영상 판독 AI (X-ray·맘모그래피)', emoji: '🩻' },
  'Aidoc AI': { full: 'Aidoc', meaning: '응급 영상 판독 AI. 출혈·골절 자동 탐지', emoji: '🩺' },
  'IBM Watson Health': { full: 'IBM Watson Health', meaning: 'IBM이 만든 의료 의사결정 보조 AI', emoji: '🏥' },
  'PathAI': { full: 'PathAI', meaning: '병리 슬라이드 자동 분석 AI', emoji: '🔬' },
  'Nuance DAX': { full: 'Nuance DAX', meaning: '의사·환자 대화를 자동으로 진료 기록(EMR)에 입력하는 AI', emoji: '🎤' },
  'DAX Copilot': { full: 'Nuance DAX Copilot', meaning: '의사·환자 대화를 자동으로 EMR에 입력하는 음성 AI', emoji: '🎤' },
  'Epic AI': { full: 'Epic AI', meaning: '미국 최대 EMR 제공사 Epic의 AI 보조 기능', emoji: '🏥' },
  'UpToDate AI': { full: 'UpToDate AI', meaning: '의학 가이드라인 자동 검색 AI', emoji: '📚' },
  'DrFirst AI': { full: 'DrFirst AI', meaning: '약물 상호작용 자동 검사 AI', emoji: '💊' },
  'Philips eICU': { full: 'Philips eICU', meaning: '중환자실 환자 상태를 실시간 모니터링하는 AI', emoji: '🛏️' },
  'Oracle Health AI': { full: 'Oracle Health AI', meaning: '오라클의 의료 데이터 AI 플랫폼', emoji: '🏥' },
  'DeepMind Med-Gemini': { full: 'DeepMind Med-Gemini', meaning: '구글 딥마인드의 의료 특화 AI 모델', emoji: '🤖' },
  'EMR': { full: 'Electronic Medical Record', meaning: '전자 의무 기록. 환자 진료 데이터를 디지털로 저장', emoji: '💻' },
  'EHR': { full: 'Electronic Health Record', meaning: '전자 건강 기록. 병원 간 공유되는 환자 기록', emoji: '💻' },
  'CT': { full: 'Computed Tomography', meaning: '컴퓨터 단층촬영. 몸 단면을 X-ray로 촬영', emoji: '🩻' },
  'MRI': { full: 'Magnetic Resonance Imaging', meaning: '자기공명영상. 자기장으로 몸 내부를 정밀 촬영', emoji: '🧲' },
  'X-ray': { full: 'X-ray', meaning: '엑스선 촬영. 뼈·폐 등을 검사', emoji: '🩻' },
  'CRISPR': { full: 'CRISPR-Cas9', meaning: '유전자 가위. 특정 유전자를 잘라 편집하는 기술', emoji: '🧬' },
  'PubMed': { full: 'PubMed', meaning: '미국 국립의학도서관이 운영하는 의학 논문 검색 사이트', emoji: '📑' },

  // ── 디자인/창작 도구 ──────────────────────────────────────────
  'Figma': { full: 'Figma', meaning: '브라우저에서 함께 작업하는 UI/UX 디자인 도구', emoji: '🎨' },
  'Photoshop': { full: 'Adobe Photoshop', meaning: '이미지 편집의 표준 도구', emoji: '🖼️' },
  'Illustrator': { full: 'Adobe Illustrator', meaning: '벡터 그래픽 디자인 도구. 로고·아이콘 제작', emoji: '✏️' },
  'Premiere': { full: 'Adobe Premiere Pro', meaning: '전문 영상 편집 도구', emoji: '🎬' },
  'After Effects': { full: 'Adobe After Effects', meaning: '모션 그래픽·VFX 합성 도구', emoji: '✨' },
  'Procreate': { full: 'Procreate', meaning: '아이패드용 디지털 드로잉 앱', emoji: '🖌️' },
  'Blender': { full: 'Blender', meaning: '오픈소스 3D 모델링·애니메이션 도구', emoji: '🎮' },
  'Unity': { full: 'Unity', meaning: '게임·VR 콘텐츠를 만드는 게임 엔진', emoji: '🎮' },
  'Unreal': { full: 'Unreal Engine', meaning: '에픽게임즈가 만든 고품질 게임 엔진', emoji: '🎮' },

  // ── 개발 도구·언어 ──────────────────────────────────────────
  'VS Code': { full: 'Visual Studio Code', meaning: '마이크로소프트가 만든 가장 많이 쓰이는 코드 에디터', emoji: '💻' },
  'GitHub': { full: 'GitHub', meaning: '코드를 저장·공유하는 세계 최대 개발자 협업 플랫폼', emoji: '🐙' },
  'Python': { full: 'Python', meaning: '데이터 분석·AI에서 가장 많이 쓰이는 프로그래밍 언어', emoji: '🐍' },
  'JavaScript': { full: 'JavaScript', meaning: '웹 브라우저에서 동작하는 가장 많이 쓰이는 프로그래밍 언어', emoji: '📜' },
  'TypeScript': { full: 'TypeScript', meaning: 'JavaScript에 타입을 추가한 언어', emoji: '🔷' },
  'React': { full: 'React', meaning: '메타가 만든 가장 인기 있는 UI 라이브러리', emoji: '⚛️' },
  'Next.js': { full: 'Next.js', meaning: 'React 기반 풀스택 웹 프레임워크', emoji: '▲' },
  'SQL': { full: 'Structured Query Language', meaning: '데이터베이스 조회·조작 언어', emoji: '🗄️' },
  'API': { full: 'Application Programming Interface', meaning: '프로그램끼리 데이터를 주고받는 약속', emoji: '🔌' },
  'IDE': { full: 'Integrated Development Environment', meaning: '코드 작성·디버깅·실행을 한곳에서 하는 통합 개발 환경', emoji: '🛠️' },
  'CRM': { full: 'Customer Relationship Management', meaning: '고객 관리 시스템 (예: Salesforce)', emoji: '👥' },
  'ERP': { full: 'Enterprise Resource Planning', meaning: '회사 자원 통합 관리 시스템 (예: SAP)', emoji: '🏢' },
  'KPI': { full: 'Key Performance Indicator', meaning: '핵심 성과 지표', emoji: '📊' },
  'OKR': { full: 'Objectives and Key Results', meaning: '목표·핵심 결과로 일을 관리하는 방법', emoji: '🎯' },
  'AB 테스트': { full: 'A/B Test', meaning: '두 안을 동시에 비교해 더 좋은 안을 고르는 실험', emoji: '🆎' },

  // ── 비즈니스·법무 ──────────────────────────────────────────
  'IPO': { full: 'Initial Public Offering', meaning: '주식시장 첫 상장', emoji: '📈' },
  'M&A': { full: 'Mergers and Acquisitions', meaning: '기업 인수·합병', emoji: '🤝' },
  'ESG': { full: 'Environmental, Social, Governance', meaning: '환경·사회·지배구조. 지속가능 경영 평가 기준', emoji: '🌱' },
  'ROI': { full: 'Return on Investment', meaning: '투자 대비 수익률', emoji: '💰' },
  'B2B': { full: 'Business to Business', meaning: '기업 간 거래', emoji: '🏢' },
  'B2C': { full: 'Business to Consumer', meaning: '기업이 일반 소비자에게 판매', emoji: '🛒' },
  'PR': { full: 'Public Relations', meaning: '홍보·언론 대응', emoji: '📣' },
  'UX': { full: 'User Experience', meaning: '사용자 경험. 제품을 쓰면서 느끼는 모든 것', emoji: '👤' },
  'UI': { full: 'User Interface', meaning: '사용자 인터페이스. 화면·버튼 등 보이는 부분', emoji: '🖼️' },

  // ── 자연·환경 ──────────────────────────────────────────
  'GIS': { full: 'Geographic Information System', meaning: '지리 정보 시스템. 지도 위에 데이터 시각화', emoji: '🗺️' },
  'IoT': { full: 'Internet of Things', meaning: '사물 인터넷. 기기들이 인터넷으로 서로 연결', emoji: '📡' },
  'DNA': { full: 'Deoxyribonucleic Acid', meaning: '유전 정보를 담은 분자', emoji: '🧬' },
  'PCR': { full: 'Polymerase Chain Reaction', meaning: '소량의 DNA를 증폭하는 분자생물학 기법', emoji: '🧪' },

  // ── 그 외 자주 등장 ──────────────────────────────────────
  'CCTV': { full: 'Closed Circuit Television', meaning: '폐쇄회로 TV. 보안·감시용 카메라', emoji: '📹' },
  'VR': { full: 'Virtual Reality', meaning: '가상 현실', emoji: '🥽' },
  'AR': { full: 'Augmented Reality', meaning: '증강 현실. 실제 위에 디지털 정보를 겹쳐 보여줌', emoji: '🕶️' },
  '학자금': { full: '학자금 대출', meaning: '학비를 위해 정부·은행에서 빌리는 대출', emoji: '💰' },

  // ── 협업/생산성 도구 ──────────────────────────────────────────
  'Jira': { full: 'Atlassian Jira', meaning: '소프트웨어 개발팀이 가장 많이 쓰는 이슈·일감 관리 도구', emoji: '📋' },
  'Confluence': { full: 'Atlassian Confluence', meaning: '팀 위키·문서 협업 도구. Jira와 같이 자주 쓰임', emoji: '📖' },
  'Slack': { full: 'Slack', meaning: '회사에서 가장 많이 쓰는 업무용 채팅 도구', emoji: '💬' },
  'Notion': { full: 'Notion', meaning: '문서·노트·데이터베이스를 한 곳에서 관리하는 협업 도구', emoji: '📝' },
  'Asana': { full: 'Asana', meaning: '업무·프로젝트 관리 도구', emoji: '✅' },
  'Trello': { full: 'Trello', meaning: '카드형 칸반 보드로 일을 관리하는 도구', emoji: '🗂️' },
  'Linear': { full: 'Linear', meaning: '개발팀이 쓰는 빠르고 깔끔한 이슈 관리 도구', emoji: '⚡' },
  'Microsoft Teams': { full: 'Microsoft Teams', meaning: '마이크로소프트의 업무용 채팅·화상회의 도구', emoji: '💼' },
  'Teams': { full: 'Microsoft Teams', meaning: '마이크로소프트의 업무용 채팅·화상회의 도구', emoji: '💼' },
  'Zoom': { full: 'Zoom', meaning: '화상회의·온라인 강의 플랫폼', emoji: '📹' },
  'Google Meet': { full: 'Google Meet', meaning: '구글의 화상회의 도구', emoji: '📹' },
  'Discord': { full: 'Discord', meaning: '게이머·커뮤니티에서 시작된 음성·채팅 도구', emoji: '🎮' },
  'Miro': { full: 'Miro', meaning: '온라인 화이트보드. 브레인스토밍·다이어그램에 사용', emoji: '🧩' },
  'FigJam': { full: 'FigJam', meaning: 'Figma의 화이트보드. 팀 브레인스토밍 도구', emoji: '🧩' },

  // ── 데이터/분석 도구 ──────────────────────────────────────────
  'Excel': { full: 'Microsoft Excel', meaning: '가장 널리 쓰이는 표 계산·데이터 분석 도구', emoji: '📊' },
  'Google Sheets': { full: 'Google Sheets', meaning: '구글의 클라우드 스프레드시트', emoji: '📊' },
  'Tableau': { full: 'Tableau', meaning: '데이터 시각화·BI(비즈니스 인텔리전스) 도구', emoji: '📈' },
  'Power BI': { full: 'Microsoft Power BI', meaning: '마이크로소프트의 데이터 시각화·BI 도구', emoji: '📈' },
  'Looker': { full: 'Google Looker', meaning: '구글의 클라우드 BI 도구', emoji: '📈' },
  'Mixpanel': { full: 'Mixpanel', meaning: '제품 사용자 행동 분석 도구', emoji: '📊' },
  'GA4': { full: 'Google Analytics 4', meaning: '구글의 웹사이트·앱 트래픽 분석 도구', emoji: '📊' },
  'Google Analytics': { full: 'Google Analytics', meaning: '구글의 웹사이트 트래픽 분석 도구', emoji: '📊' },
  'Amplitude': { full: 'Amplitude', meaning: '제품 사용자 행동 분석 도구', emoji: '📊' },
  'BI': { full: 'Business Intelligence', meaning: '데이터를 시각화·분석해 의사결정에 쓰는 분야', emoji: '📈' },

  // ── 디자인 도구 추가 ──────────────────────────────────────────
  'Sketch': { full: 'Sketch', meaning: 'Mac용 UI 디자인 도구', emoji: '🎨' },
  'XD': { full: 'Adobe XD', meaning: '어도비의 UI/UX 디자인 도구', emoji: '🎨' },
  'Canva': { full: 'Canva', meaning: '템플릿 기반 그래픽 디자인 웹 도구', emoji: '🖌️' },
  'Adobe': { full: 'Adobe', meaning: 'Photoshop·Illustrator·Premiere 등을 만드는 회사', emoji: '🅰️' },
  'InDesign': { full: 'Adobe InDesign', meaning: '잡지·책 등 출판물 편집 도구', emoji: '📰' },
  'Lightroom': { full: 'Adobe Lightroom', meaning: '사진 보정·관리 도구', emoji: '📷' },
  'DaVinci Resolve': { full: 'DaVinci Resolve', meaning: '영상 편집·색 보정 전문 도구', emoji: '🎬' },
  'Final Cut Pro': { full: 'Final Cut Pro', meaning: '애플의 전문 영상 편집 도구', emoji: '🎬' },

  // ── 개발 도구·플랫폼 추가 ──────────────────────────────────────
  'Git': { full: 'Git', meaning: '코드 버전 관리 시스템. 거의 모든 개발자가 사용', emoji: '🌿' },
  'GitLab': { full: 'GitLab', meaning: 'GitHub과 비슷한 코드 협업 플랫폼', emoji: '🦊' },
  'Bitbucket': { full: 'Atlassian Bitbucket', meaning: '아틀라시안의 코드 저장소 서비스', emoji: '🪣' },
  'Docker': { full: 'Docker', meaning: '프로그램을 컨테이너로 묶어 어디서든 실행하게 해주는 도구', emoji: '🐳' },
  'Kubernetes': { full: 'Kubernetes', meaning: '컨테이너를 자동으로 관리·확장하는 시스템', emoji: '☸️' },
  'AWS': { full: 'Amazon Web Services', meaning: '아마존의 클라우드 서비스 (서버·DB·AI 등)', emoji: '☁️' },
  'GCP': { full: 'Google Cloud Platform', meaning: '구글의 클라우드 서비스', emoji: '☁️' },
  'Azure': { full: 'Microsoft Azure', meaning: '마이크로소프트의 클라우드 서비스', emoji: '☁️' },
  'Vercel': { full: 'Vercel', meaning: 'Next.js 등 웹앱을 배포하는 클라우드 플랫폼', emoji: '▲' },
  'Netlify': { full: 'Netlify', meaning: '정적 웹사이트 배포 플랫폼', emoji: '🌐' },
  'Firebase': { full: 'Firebase', meaning: '구글의 모바일·웹 앱 백엔드 서비스', emoji: '🔥' },
  'Supabase': { full: 'Supabase', meaning: 'PostgreSQL 기반 오픈소스 백엔드 서비스', emoji: '🗄️' },
  'PostgreSQL': { full: 'PostgreSQL', meaning: '오픈소스 관계형 데이터베이스', emoji: '🐘' },
  'MySQL': { full: 'MySQL', meaning: '가장 널리 쓰이는 오픈소스 관계형 데이터베이스', emoji: '🐬' },
  'MongoDB': { full: 'MongoDB', meaning: '문서형(NoSQL) 데이터베이스', emoji: '🍃' },
  'Redis': { full: 'Redis', meaning: '메모리에서 빠르게 동작하는 키-값 저장소', emoji: '⚡' },
  'Node.js': { full: 'Node.js', meaning: '서버에서 JavaScript를 실행하는 런타임', emoji: '🟢' },
  'Vue': { full: 'Vue.js', meaning: 'React와 함께 인기 있는 UI 프레임워크', emoji: '💚' },
  'Angular': { full: 'Angular', meaning: '구글이 만든 풀스택 UI 프레임워크', emoji: '🅰️' },
  'Svelte': { full: 'Svelte', meaning: '컴파일 시점에 최적화하는 가벼운 UI 프레임워크', emoji: '🧡' },
  'Java': { full: 'Java', meaning: '엔터프라이즈에서 가장 많이 쓰는 프로그래밍 언어', emoji: '☕' },
  'Kotlin': { full: 'Kotlin', meaning: '안드로이드 공식 언어. Java를 대체하는 추세', emoji: '🎯' },
  'Swift': { full: 'Swift', meaning: 'iOS·macOS 앱 개발 언어 (애플)', emoji: '🍎' },
  'C++': { full: 'C++', meaning: '게임·시스템 프로그래밍에 많이 쓰는 언어', emoji: '➕' },
  'Rust': { full: 'Rust', meaning: '안전성과 속도를 동시에 잡은 신흥 언어', emoji: '🦀' },
  'Go': { full: 'Go (Golang)', meaning: '구글이 만든 서버용 프로그래밍 언어', emoji: '🐹' },
  'Flutter': { full: 'Flutter', meaning: '구글의 크로스플랫폼 모바일 앱 개발 프레임워크', emoji: '💙' },
  'React Native': { full: 'React Native', meaning: 'React로 iOS·안드로이드 앱을 만드는 프레임워크', emoji: '⚛️' },
  'Tailwind': { full: 'Tailwind CSS', meaning: '유틸리티 클래스로 빠르게 디자인하는 CSS 프레임워크', emoji: '🎨' },
  'CSS': { full: 'Cascading Style Sheets', meaning: '웹페이지의 디자인을 정하는 언어', emoji: '🎨' },
  'HTML': { full: 'HyperText Markup Language', meaning: '웹페이지의 구조를 정하는 마크업 언어', emoji: '📄' },

  // ── AI/ML 추가 ──────────────────────────────────────────────
  'TensorFlow': { full: 'TensorFlow', meaning: '구글이 만든 딥러닝 프레임워크', emoji: '🧠' },
  'PyTorch': { full: 'PyTorch', meaning: '메타가 만든 딥러닝 프레임워크. 연구용으로 가장 인기', emoji: '🔥' },
  'Hugging Face': { full: 'Hugging Face', meaning: 'AI 모델·데이터셋을 공유하는 세계 최대 플랫폼', emoji: '🤗' },
  'LangChain': { full: 'LangChain', meaning: 'LLM(대형 언어 모델) 앱을 만드는 프레임워크', emoji: '⛓️' },
  'OpenAI': { full: 'OpenAI', meaning: 'ChatGPT·GPT-4·DALL·E를 만든 AI 회사', emoji: '🤖' },
  'Anthropic': { full: 'Anthropic', meaning: 'Claude를 만든 AI 안전성 중심 회사', emoji: '🤖' },
  'ML': { full: 'Machine Learning', meaning: '머신러닝. 데이터로 스스로 학습하는 AI의 한 분야', emoji: '🤖' },
  'NLP': { full: 'Natural Language Processing', meaning: '자연어 처리. 사람의 말을 컴퓨터가 이해하게 하는 기술', emoji: '💬' },
  'CV': { full: 'Computer Vision', meaning: '컴퓨터 비전. 이미지·영상을 컴퓨터가 이해하게 하는 기술', emoji: '👁️' },

  // ── 의료/실험 도구 추가 ──────────────────────────────────────
  'CTC': { full: 'Clinical Trial Coordinator', meaning: '임상시험을 현장에서 관리하는 코디네이터', emoji: '🏥' },
  'CRC': { full: 'Clinical Research Coordinator', meaning: '임상연구원. 임상시험 진행과 데이터 관리를 담당', emoji: '🏥' },
  'CRO': { full: 'Contract Research Organization', meaning: '임상시험을 대행하는 전문 회사', emoji: '🏥' },
  'IRB': { full: 'Institutional Review Board', meaning: '기관 생명윤리 심의위원회. 임상시험 윤리 검토', emoji: '⚖️' },
  'FDA': { full: 'Food and Drug Administration', meaning: '미국 식품의약국. 약·의료기기 승인 기관', emoji: '🇺🇸' },
  'KFDA': { full: '식품의약품안전처', meaning: '한국의 약·의료기기·식품 안전 관리 기관', emoji: '🇰🇷' },
  'GMP': { full: 'Good Manufacturing Practice', meaning: '의약품 제조 품질 관리 기준', emoji: '🏭' },
  'GLP': { full: 'Good Laboratory Practice', meaning: '비임상 시험 품질 관리 기준', emoji: '🧪' },
  'GCP': { full: 'Good Clinical Practice', meaning: '임상시험 품질 관리 기준', emoji: '🩺' },

  // ── 고빈도 신규 도구 (JSON 사용 빈도 높은 순) ────────────────
  'Midjourney': { full: 'Midjourney', meaning: '글로 그림을 그려 주는 대표 AI 이미지 생성 도구', emoji: '🎨' },
  'Power BI AI': { full: 'Microsoft Power BI + AI', meaning: 'Power BI에 AI 분석·시각화가 통합된 BI 도구', emoji: '📈' },
  'Harvey AI': { full: 'Harvey', meaning: '법률 전문 AI. 판례 검색·계약서 검토를 자동화', emoji: '⚖️' },
  'Runway ML': { full: 'Runway ML', meaning: '영상 편집·합성·AI 생성 도구. 영상에 특화된 Adobe', emoji: '🎬' },
  'Kira Systems': { full: 'Kira Systems', meaning: '계약서 자동 검토 AI. 법률·M&A 실사에 사용', emoji: '📜' },
  'Jasper AI': { full: 'Jasper', meaning: '마케팅 카피·블로그·SNS 글쓰기 AI', emoji: '✍️' },
  'Adobe Firefly': { full: 'Adobe Firefly', meaning: '어도비의 AI 이미지·디자인 생성 도구', emoji: '🔥' },
  'PitchBook AI': { full: 'PitchBook + AI', meaning: '스타트업·투자 데이터 분석 플랫폼', emoji: '💼' },
  'Hootsuite AI': { full: 'Hootsuite + AI', meaning: 'SNS 통합 관리·분석 도구', emoji: '📱' },
  'Thomson Reuters AI': { full: 'Thomson Reuters + AI', meaning: '톰슨로이터의 법률·금융 데이터 AI', emoji: '📚' },
  'Crayon AI': { full: 'Crayon', meaning: '경쟁사 분석 자동화 AI', emoji: '🖍️' },
  'Crunchbase AI': { full: 'Crunchbase + AI', meaning: '스타트업·투자 정보 데이터베이스 + AI 분석', emoji: '💰' },
  'Adobe CC': { full: 'Adobe Creative Cloud', meaning: '어도비의 디자인·영상·사진 도구 묶음', emoji: '🎨' },
  'Adobe AI': { full: 'Adobe + AI', meaning: '어도비 제품군에 통합된 AI 보조 기능 (Firefly·Sensei)', emoji: '🤖' },
  'Canva AI': { full: 'Canva + Magic Studio', meaning: 'Canva의 AI 디자인·글쓰기 보조', emoji: '🖌️' },
  'Suno AI': { full: 'Suno', meaning: '글로 노래를 만들어 주는 AI 음악 생성 도구', emoji: '🎵' },
  'ArcGIS': { full: 'ArcGIS', meaning: 'Esri의 지리정보시스템(GIS) 표준 도구', emoji: '🗺️' },
  'ArcGIS AI': { full: 'ArcGIS + AI', meaning: 'ArcGIS에 통합된 공간 분석 AI', emoji: '🗺️' },
  'GIS AI': { full: 'GIS + AI', meaning: '지리정보시스템에 AI를 결합한 공간 분석', emoji: '🗺️' },
  'Google Earth Engine': { full: 'Google Earth Engine', meaning: '구글의 위성 영상·지구 관측 빅데이터 분석 플랫폼', emoji: '🌍' },
  'QGIS': { full: 'QGIS', meaning: '오픈소스 GIS(지리정보시스템) 도구', emoji: '🗺️' },
  'ChatGPT/Claude': { full: 'ChatGPT / Claude', meaning: 'OpenAI의 ChatGPT와 Anthropic의 Claude 같은 대화형 AI', emoji: '🤖' },
  'ChatGPT o3': { full: 'ChatGPT o3', meaning: 'OpenAI의 추론 강화 모델 (o3 시리즈)', emoji: '🤖' },
  'Google Analytics AI': { full: 'Google Analytics + AI', meaning: '구글 애널리틱스에 통합된 AI 인사이트', emoji: '📊' },
  'PowerPoint AI': { full: 'PowerPoint + Copilot', meaning: '파워포인트에 통합된 AI 슬라이드 작성 보조', emoji: '🖼️' },
  'Figma AI': { full: 'Figma + AI', meaning: 'Figma에 통합된 AI 디자인 보조 (FigJam AI 포함)', emoji: '🎨' },
  'Gamma AI': { full: 'Gamma', meaning: '글 한 줄로 슬라이드·웹사이트를 만들어 주는 AI', emoji: '📊' },
  'Bloomberg Law AI': { full: 'Bloomberg Law + AI', meaning: '블룸버그의 법률 데이터 + AI 분석', emoji: '⚖️' },
  'Khan Academy AI': { full: 'Khan Academy + Khanmigo', meaning: '칸 아카데미의 AI 학습 튜터', emoji: '📚' },
  'BuzzSumo AI': { full: 'BuzzSumo + AI', meaning: 'SNS 트렌드·콘텐츠 분석 + AI', emoji: '📣' },
  'Buffer AI': { full: 'Buffer + AI', meaning: 'SNS 게시물 예약·자동화 + AI', emoji: '📅' },
  'Blueprint AI': { full: 'Blueprint AI', meaning: '건축·설계용 AI 도구', emoji: '📐' },
  'Grammarly AI': { full: 'Grammarly', meaning: '영문 글쓰기 교정 AI 도구', emoji: '✍️' },
  'Grammarly': { full: 'Grammarly', meaning: '영문 글쓰기 교정 AI 도구', emoji: '✍️' },
  'Pinterest AI': { full: 'Pinterest + AI', meaning: '핀터레스트의 이미지 검색·추천 AI', emoji: '📌' },
  'Adobe Bridge': { full: 'Adobe Bridge', meaning: '어도비의 사진·미디어 자료 관리 도구', emoji: '🌉' },
  'Descript AI': { full: 'Descript', meaning: '음성/영상을 글처럼 편집하는 AI 도구', emoji: '🎙️' },
  'Descript': { full: 'Descript', meaning: '음성/영상을 글처럼 편집하는 AI 도구', emoji: '🎙️' },
  'Cision AI': { full: 'Cision + AI', meaning: '언론·미디어 모니터링 AI', emoji: '📰' },
  'Meltwater AI': { full: 'Meltwater + AI', meaning: '미디어·SNS 모니터링 AI', emoji: '🌊' },
  'Brandwatch AI': { full: 'Brandwatch + AI', meaning: 'SNS 브랜드 모니터링·분석 AI', emoji: '🔍' },
  'iNaturalist': { full: 'iNaturalist', meaning: '시민과학자가 함께 만드는 생물 종 식별 플랫폼', emoji: '🦋' },
  'iNaturalist AI': { full: 'iNaturalist + AI', meaning: '사진으로 종을 자동 식별하는 AI', emoji: '🦋' },
  'Overleaf': { full: 'Overleaf', meaning: '논문·LaTeX 문서 협업 편집 도구', emoji: '📝' },
  'Overleaf AI': { full: 'Overleaf + AI', meaning: 'LaTeX 논문 작성 AI 보조', emoji: '📝' },
  'DJI Drone': { full: 'DJI Drone', meaning: 'DJI의 드론 (촬영·측량용)', emoji: '🛸' },
  'k6': { full: 'k6', meaning: '오픈소스 부하 테스트(성능 테스트) 도구', emoji: '⏱️' },
  'R': { full: 'R', meaning: '통계·데이터 분석에 특화된 프로그래밍 언어', emoji: '📊' },
  'SPSS': { full: 'IBM SPSS', meaning: '사회과학·통계 분석 표준 소프트웨어', emoji: '📊' },
  'SPSS AI': { full: 'IBM SPSS + AI', meaning: 'SPSS에 통합된 자동화 통계 분석', emoji: '📊' },
  'MATLAB AI': { full: 'MATLAB + AI', meaning: '공학·수학 계산용 MATLAB의 AI 보조', emoji: '🔢' },
  'AutoCAD AI': { full: 'AutoCAD + AI', meaning: '오토캐드의 AI 설계 보조', emoji: '📐' },
  'SimplePractice': { full: 'SimplePractice', meaning: '심리상담사·치료사용 진료·예약 관리 도구', emoji: '🏥' },
  'Otter.ai': { full: 'Otter.ai', meaning: '회의 음성을 자동으로 글자로 옮기는 AI', emoji: '🦦' },
  'Slack AI': { full: 'Slack + AI', meaning: 'Slack에 통합된 대화 요약·검색 AI', emoji: '💬' },
  'Teams AI': { full: 'Microsoft Teams + Copilot', meaning: 'Teams에 통합된 회의 요약·작업 자동화', emoji: '💼' },
  'Confluence AI': { full: 'Confluence + AI', meaning: 'Confluence 문서 협업에 통합된 AI', emoji: '📖' },
  'Mixpanel AI': { full: 'Mixpanel + AI', meaning: 'Mixpanel 사용자 분석에 AI 인사이트', emoji: '📊' },
  'Tableau AI': { full: 'Tableau + Einstein AI', meaning: 'Tableau에 통합된 자동 인사이트 AI', emoji: '📈' },
  'Linear AI': { full: 'Linear + AI', meaning: 'Linear 이슈 관리에 통합된 AI', emoji: '⚡' },
  'Miro AI': { full: 'Miro + AI', meaning: 'Miro 화이트보드의 AI 다이어그램·정리', emoji: '🧩' },
  'Datadog AI': { full: 'Datadog + AI', meaning: 'Datadog 모니터링에 통합된 AI 이상 탐지', emoji: '🐶' },
  'PagerDuty': { full: 'PagerDuty', meaning: '장애 발생 시 자동으로 담당자에게 알림 보내는 도구', emoji: '📟' },
  'PagerDuty AI': { full: 'PagerDuty + AI', meaning: '장애 알림에 통합된 AI 분류·우선순위', emoji: '📟' },
  'Grafana AI': { full: 'Grafana + AI', meaning: 'Grafana 대시보드에 통합된 AI 이상 탐지', emoji: '📊' },
  'Terraform': { full: 'HashiCorp Terraform', meaning: '클라우드 인프라를 코드로 관리하는 도구 (IaC)', emoji: '🏗️' },
  'Terraform AI': { full: 'Terraform + AI', meaning: '인프라 코드 생성·검토 AI 보조', emoji: '🏗️' },
  'Ansible': { full: 'Ansible', meaning: '서버 설정·배포 자동화 도구', emoji: '🛠️' },
  'Apache Airflow': { full: 'Apache Airflow', meaning: '데이터 파이프라인 워크플로우 관리 도구', emoji: '🌬️' },
  'Airflow': { full: 'Apache Airflow', meaning: '데이터 파이프라인 워크플로우 관리 도구', emoji: '🌬️' },
  'Jupyter': { full: 'Jupyter Notebook', meaning: '데이터 분석·AI 연구에서 가장 많이 쓰는 노트북 도구', emoji: '📓' },
  'REDCap': { full: 'REDCap', meaning: '의학 연구 데이터 수집·관리 시스템', emoji: '🏥' },
  'Salesforce Nonprofit': { full: 'Salesforce Nonprofit Cloud', meaning: '비영리 기관용 Salesforce CRM', emoji: '☁️' },
  'AlphaFold': { full: 'AlphaFold', meaning: '구글 DeepMind의 단백질 구조 예측 AI', emoji: '🧬' },
  'Hugging Face Bias Tools': { full: 'Hugging Face Bias Tools', meaning: 'AI 모델의 편향성을 측정·완화하는 도구 모음', emoji: '⚖️' },
  'IBM AI Fairness 360': { full: 'IBM AI Fairness 360', meaning: 'AI 공정성 점검 오픈소스 툴킷', emoji: '⚖️' },
  'COMPAS AI': { full: 'COMPAS', meaning: '미국 사법 위험 평가 AI (편향 논쟁의 사례)', emoji: '⚖️' },
  'OpenAI API': { full: 'OpenAI API', meaning: 'ChatGPT·DALL·E 등을 프로그램에서 호출하는 API', emoji: '🔌' },
  'Anthropic Claude API': { full: 'Anthropic Claude API', meaning: 'Anthropic Claude를 프로그램에서 호출하는 API', emoji: '🔌' },
  'Claude API': { full: 'Anthropic Claude API', meaning: 'Claude를 프로그램에서 호출하는 API', emoji: '🔌' },
  'Veeva Vault': { full: 'Veeva Vault', meaning: '제약·임상 산업의 표준 문서 관리 시스템', emoji: '🏥' },
  'Aidoc': { full: 'Aidoc', meaning: '응급 영상 판독 AI. 출혈·골절 자동 탐지', emoji: '🩺' },
  'Weights & Biases': { full: 'Weights & Biases', meaning: 'AI 모델 실험 추적·관리 도구', emoji: '📊' },
  'W&B': { full: 'Weights & Biases', meaning: 'AI 모델 실험 추적·관리 도구', emoji: '📊' },
  'MLflow': { full: 'MLflow', meaning: '오픈소스 ML 모델 관리·실험 추적 도구', emoji: '🤖' },
  'Kubeflow': { full: 'Kubeflow', meaning: 'Kubernetes 기반 ML 워크플로우 플랫폼', emoji: '☸️' },
  'Sentry AI': { full: 'Sentry + AI', meaning: 'Sentry 에러 추적에 통합된 AI 분석', emoji: '🚨' },
  'Vercel AI': { full: 'Vercel + AI SDK', meaning: 'Vercel의 AI 앱 개발 SDK·플랫폼', emoji: '▲' },
  'Supabase AI': { full: 'Supabase + AI', meaning: 'Supabase에 통합된 AI 기능', emoji: '🗄️' },
  'AWS AI': { full: 'AWS AI', meaning: 'AWS의 AI/ML 서비스 묶음 (SageMaker·Bedrock 등)', emoji: '☁️' },
  'AWS/GCP/Azure AI': { full: 'AWS · GCP · Azure AI', meaning: '주요 클라우드 3사의 AI 서비스 통칭', emoji: '☁️' },
  'GCP Recommender': { full: 'GCP Recommender', meaning: 'Google Cloud의 자동 최적화 권고 서비스', emoji: '☁️' },
  'Discord AI': { full: 'Discord + AI', meaning: 'Discord 봇·커뮤니티 AI 도구', emoji: '🎮' },
  'Zoom AI': { full: 'Zoom AI Companion', meaning: 'Zoom의 회의 요약·번역 AI', emoji: '📹' },
  'Google Docs AI': { full: 'Google Docs + Gemini', meaning: '구글 문서에 통합된 AI 글쓰기 보조', emoji: '📄' },
  'Google Translate AI': { full: 'Google Translate', meaning: '구글 번역 AI', emoji: '🌐' },
  'Loom AI': { full: 'Loom + AI', meaning: 'Loom 화면 녹화에 통합된 자동 요약 AI', emoji: '🎥' },
  'Hemingway AI': { full: 'Hemingway Editor', meaning: '글의 가독성을 점검·교정해 주는 도구', emoji: '✍️' },
  'ProWritingAid': { full: 'ProWritingAid', meaning: '글쓰기 문법·스타일 검사 도구', emoji: '✍️' },
  'Final Draft AI': { full: 'Final Draft + AI', meaning: '시나리오·각본 작성 표준 도구 + AI', emoji: '🎬' },
  'Scrivener AI': { full: 'Scrivener + AI', meaning: '장편 글쓰기·소설 작가용 도구', emoji: '✍️' },
  'OBS AI': { full: 'OBS Studio + AI', meaning: '오픈소스 방송·녹화 도구의 AI 보조', emoji: '🎥' },
  'Adobe Premiere AI': { full: 'Adobe Premiere + AI', meaning: '영상 편집의 AI 자동 컷·자막 생성', emoji: '🎬' },
  'CapCut AI': { full: 'CapCut + AI', meaning: '바이트댄스의 AI 영상 편집 도구', emoji: '🎬' },
  'Adobe Podcast AI': { full: 'Adobe Podcast', meaning: '음성 노이즈 제거·향상 AI', emoji: '🎙️' },
  'NVIDIA Omniverse': { full: 'NVIDIA Omniverse', meaning: '엔비디아의 3D 협업·시뮬레이션 플랫폼', emoji: '🌐' },
  'NVIDIA Isaac Sim': { full: 'NVIDIA Isaac Sim', meaning: '로봇 시뮬레이션 플랫폼', emoji: '🤖' },
  'NVIDIA Jetson': { full: 'NVIDIA Jetson', meaning: '엣지 AI용 임베디드 컴퓨터 모듈', emoji: '🤖' },
  'Unreal AI': { full: 'Unreal Engine + AI', meaning: '언리얼 엔진의 AI 보조 (NPC·콘텐츠 생성)', emoji: '🎮' },
  'Unreal AI Assist': { full: 'Unreal AI Assist', meaning: '언리얼 엔진 개발 보조 AI', emoji: '🎮' },
  'Unity AI': { full: 'Unity AI', meaning: '유니티의 AI 보조 (Muse 등)', emoji: '🎮' },
  'Unity Muse AI': { full: 'Unity Muse', meaning: '유니티의 생성형 AI 도구', emoji: '🎮' },
  'Blender AI': { full: 'Blender + AI', meaning: 'Blender에 통합된 AI 모델링·텍스처 보조', emoji: '🎮' },
  'SketchUp AI': { full: 'SketchUp + AI', meaning: '3D 건축 모델링 도구의 AI 보조', emoji: '🏠' },
  'Lumion AI': { full: 'Lumion + AI', meaning: '건축 시각화 렌더링 도구의 AI', emoji: '🏛️' },
  'Articulate AI': { full: 'Articulate 360 + AI', meaning: 'e-러닝 콘텐츠 제작 도구의 AI 보조', emoji: '🎓' },
  'Articulate 360 AI': { full: 'Articulate 360 + AI', meaning: 'e-러닝 콘텐츠 제작 도구의 AI 보조', emoji: '🎓' },
  'Canvas LMS AI': { full: 'Canvas LMS + AI', meaning: '대학 학습관리시스템의 AI 보조', emoji: '🎓' },
  'Google Classroom AI': { full: 'Google Classroom + AI', meaning: '구글 클래스룸의 AI 학습 보조', emoji: '🎓' },
  'Reflexion AI': { full: 'Reflexion AI', meaning: '학습 성찰·자기평가 AI 도구', emoji: '🪞' },
  'Anki AI': { full: 'Anki + AI', meaning: '플래시카드 암기 도구의 AI', emoji: '🧠' },
  'Boardmaker AI': { full: 'Boardmaker + AI', meaning: '특수교육용 의사소통 보조도구의 AI', emoji: '🪧' },
  'Proloquo2Go': { full: 'Proloquo2Go', meaning: '발화 어려움이 있는 사람을 위한 AAC 의사소통 앱', emoji: '🗣️' },
  'Tobii AI': { full: 'Tobii + AI', meaning: '시선 추적 기술 + AI', emoji: '👀' },
  'eBird AI': { full: 'eBird + AI', meaning: '시민과학 조류 관찰 데이터 + AI 식별', emoji: '🐦' },
  'GBIF AI': { full: 'GBIF + AI', meaning: '전 세계 생물다양성 데이터베이스 + AI', emoji: '🌍' },
  'IBM RXN': { full: 'IBM RXN for Chemistry', meaning: '화학 반응 예측 AI', emoji: '🧪' },
  'OpenAI Codex': { full: 'OpenAI Codex', meaning: '코드 생성에 특화된 OpenAI 모델', emoji: '🤖' },
  'Google Med-PaLM': { full: 'Google Med-PaLM', meaning: '구글의 의료 특화 대형 언어 모델', emoji: '🩺' },
  'Insilico Medicine': { full: 'Insilico Medicine', meaning: '신약 후보 물질을 AI로 발굴하는 회사', emoji: '💊' },
  'Roche Diagnostics AI': { full: 'Roche Diagnostics + AI', meaning: '로슈 진단의 AI 검진 솔루션', emoji: '🩺' },
  'Paige AI': { full: 'Paige', meaning: '디지털 병리 진단 AI', emoji: '🔬' },
  'IDEXX AI': { full: 'IDEXX + AI', meaning: '수의 진단 검사 + AI', emoji: '🐾' },
  'VetAI': { full: 'VetAI', meaning: '수의사용 AI 진단·기록 보조', emoji: '🐾' },
  'PetPoint': { full: 'PetPoint', meaning: '동물 보호소 관리 시스템', emoji: '🐶' },
  'Bloomberg AI': { full: 'Bloomberg + AI', meaning: '블룸버그 금융 데이터 + AI 분석', emoji: '📈' },
  'Refinitiv AI': { full: 'Refinitiv + AI', meaning: '금융·시장 데이터 AI 분석', emoji: '📈' },
  'FactSet AI': { full: 'FactSet + AI', meaning: '금융 데이터 분석 + AI', emoji: '📈' },
  'Westlaw AI': { full: 'Westlaw + AI', meaning: '미국 판례·법률 데이터베이스 + AI', emoji: '⚖️' },
  'LexisNexis AI': { full: 'LexisNexis + AI', meaning: '법률 데이터베이스 + AI 검색', emoji: '⚖️' },
  'Thomson Reuters CoCounsel': { full: 'Thomson Reuters CoCounsel', meaning: '톰슨로이터의 법률 AI 어시스턴트', emoji: '⚖️' },
  'Luminance AI': { full: 'Luminance', meaning: '계약서 자동 검토 AI', emoji: '⚖️' },
  'Darktrace': { full: 'Darktrace', meaning: '네트워크 위협을 AI로 탐지하는 보안 솔루션', emoji: '🛡️' },
  'Darktrace NDR': { full: 'Darktrace NDR', meaning: 'Darktrace의 네트워크 탐지·대응 솔루션', emoji: '🛡️' },
  'CrowdStrike Falcon': { full: 'CrowdStrike Falcon', meaning: '엔드포인트 보안·EDR 솔루션', emoji: '🛡️' },
  'Snyk AI': { full: 'Snyk + AI', meaning: '코드의 보안 취약점을 자동 검사하는 도구', emoji: '🔒' },
  'GitHub Advanced Security': { full: 'GitHub Advanced Security', meaning: 'GitHub의 코드 보안 검사 기능', emoji: '🔒' },
  'Pentest GPT': { full: 'PentestGPT', meaning: '모의 해킹 자동화 AI', emoji: '🔓' },
  'Slither AI 감사': { full: 'Slither', meaning: '스마트 컨트랙트 보안 감사 도구', emoji: '🔒' },
  'IBM AI Ethics': { full: 'IBM AI Ethics', meaning: 'IBM의 AI 윤리 가이드라인·도구', emoji: '⚖️' },
  'Microsoft AI Fairness': { full: 'Microsoft AI Fairness', meaning: 'MS의 AI 공정성 측정 도구', emoji: '⚖️' },
  'Anthropic Constitutional AI': { full: 'Anthropic Constitutional AI', meaning: 'Anthropic의 AI 안전성 학습 방법론', emoji: '📜' },
  'OpenAI Cirq': { full: 'Google Cirq', meaning: '구글의 양자 컴퓨팅 프레임워크', emoji: '⚛️' },
  'Google Cirq': { full: 'Google Cirq', meaning: '구글의 양자 컴퓨팅 프레임워크', emoji: '⚛️' },
  'Qiskit(IBM)': { full: 'Qiskit', meaning: 'IBM의 양자 컴퓨팅 오픈소스 프레임워크', emoji: '⚛️' },
  'Amazon Braket': { full: 'Amazon Braket', meaning: 'AWS의 양자 컴퓨팅 클라우드 서비스', emoji: '⚛️' },
  'PennyLane': { full: 'PennyLane', meaning: '양자 머신러닝 오픈소스 프레임워크', emoji: '⚛️' },
  'Ultralytics YOLO': { full: 'Ultralytics YOLO', meaning: '실시간 객체 탐지 AI 모델 (YOLO 시리즈)', emoji: '👁️' },
  'Roboflow AI': { full: 'Roboflow + AI', meaning: '컴퓨터 비전 데이터셋·모델 관리 플랫폼', emoji: '📷' },
  'TensorFlow Lite': { full: 'TensorFlow Lite', meaning: '모바일·엣지 기기용 경량 TensorFlow', emoji: '📱' },
  'FastAPI': { full: 'FastAPI', meaning: '파이썬으로 빠르게 API를 만드는 프레임워크', emoji: '⚡' },
  'Mermaid AI': { full: 'Mermaid + AI', meaning: '글로 다이어그램을 그리는 마크다운 도구 + AI', emoji: '🧜' },
  'Draw.io': { full: 'draw.io', meaning: '무료 다이어그램 작성 도구', emoji: '📐' },
  'Galileo AI': { full: 'Galileo AI', meaning: '글로 UI 디자인을 만들어 주는 AI', emoji: '🎨' },
  'Uizard': { full: 'Uizard', meaning: '스케치를 UI 디자인으로 변환하는 AI', emoji: '🎨' },
  'v0.dev': { full: 'v0 by Vercel', meaning: '글로 React 컴포넌트·UI를 만드는 AI', emoji: '▲' },
  'GitBook AI': { full: 'GitBook + AI', meaning: '기술 문서 협업 도구의 AI 보조', emoji: '📚' },
  'Readme AI': { full: 'README AI', meaning: 'GitHub README 자동 생성 AI', emoji: '📝' },
  'Mintlify AI': { full: 'Mintlify', meaning: '개발자 문서 자동 생성·관리 AI', emoji: '📚' },
  'GreenBook': { full: 'GreenBook', meaning: '시장조사 산업 정보 플랫폼', emoji: '📗' },
  'Snyk': { full: 'Snyk', meaning: '코드 보안 취약점 자동 검사 도구', emoji: '🔒' },
  'iInterpret AI': { full: 'iInterpret AI', meaning: '동시 통역 AI', emoji: '🌐' },
  'KUDO AI': { full: 'KUDO + AI', meaning: '실시간 AI 통역·자막 솔루션', emoji: '🌐' },
  'Interprefy AI': { full: 'Interprefy + AI', meaning: '원격 동시통역 플랫폼 + AI', emoji: '🌐' },
  'SDL Trados AI': { full: 'SDL Trados + AI', meaning: '번역 메모리·전문 번역 도구의 AI', emoji: '🌐' },
  'DeepL AI': { full: 'DeepL', meaning: '독일에서 만든 자연스러운 번역 AI', emoji: '🌐' },
  'Phrase AI': { full: 'Phrase + AI', meaning: '소프트웨어 현지화 플랫폼 + AI', emoji: '🌐' },
  'NLP AI': { full: 'NLP + AI', meaning: '자연어 처리 AI', emoji: '💬' },
  'AERMOD AI': { full: 'AERMOD + AI', meaning: '대기 오염 확산 모델링 + AI', emoji: '🌫️' },
  'EPA Air AI': { full: 'EPA Air + AI', meaning: '미국 환경보호청 대기 데이터 + AI', emoji: '🌍' },
  'EPA AI': { full: 'EPA + AI', meaning: '미국 환경보호청 데이터 + AI', emoji: '🌍' },
  'IPCC Data AI': { full: 'IPCC Data + AI', meaning: 'IPCC 기후 데이터 + AI 분석', emoji: '🌡️' },
  'CMIP6': { full: 'CMIP6', meaning: '국제 기후모델 비교 프로젝트 데이터셋', emoji: '🌡️' },
  'Climate FieldView': { full: 'Climate FieldView', meaning: '농장 디지털 관리 플랫폼', emoji: '🌾' },
  'Precision Ag AI': { full: 'Precision Agriculture + AI', meaning: '정밀 농업 + AI 분석', emoji: '🌾' },
  'Crop Sensor AI': { full: 'Crop Sensor + AI', meaning: '작물 센서 데이터 + AI', emoji: '🌾' },
  'Soil Sensor AI': { full: 'Soil Sensor + AI', meaning: '토양 센서 데이터 + AI', emoji: '🌱' },
  'Camera Trap AI': { full: 'Camera Trap + AI', meaning: '야생동물 무인 카메라 + AI 식별', emoji: '📷' },
  'Sensor IoT': { full: 'IoT Sensor', meaning: 'IoT 센서 네트워크', emoji: '📡' },
  'IoT 센서': { full: 'IoT 센서', meaning: '사물 인터넷 센서. 환경·기기 데이터 수집', emoji: '📡' },
  'IoT 센서 네트워크': { full: 'IoT 센서 네트워크', meaning: '여러 IoT 센서를 묶은 데이터 수집망', emoji: '📡' },
  'LiDAR AI': { full: 'LiDAR + AI', meaning: '레이저 기반 거리 측정 센서 + AI', emoji: '🛰️' },
  'Trimble AI': { full: 'Trimble + AI', meaning: '측량·GIS 장비 회사 + AI', emoji: '📐' },
  'AlphaFold AI': { full: 'AlphaFold', meaning: '구글 DeepMind의 단백질 구조 예측 AI', emoji: '🧬' },
  'GATK': { full: 'GATK', meaning: '브로드 연구소의 유전체 분석 도구', emoji: '🧬' },
  'Bioconductor': { full: 'Bioconductor', meaning: '생물정보학용 R 패키지 모음', emoji: '🧬' },
  'Benchling AI': { full: 'Benchling + AI', meaning: '생명과학 연구 데이터·실험 관리 + AI', emoji: '🧪' },
  'PsychoPy': { full: 'PsychoPy', meaning: '심리학 실험 자극 제시 오픈소스', emoji: '🧠' },
  'Sentry': { full: 'Sentry', meaning: '실서비스 에러를 실시간 추적·알림하는 도구', emoji: '🚨' },

  // ── 한글 일반 도구 카테고리 (자주 등장하는 의역어) ─────────────
  'AI 상담 보조 도구': { full: 'AI 상담 보조 도구', meaning: '상담사가 쓰는 일반 AI 보조 도구의 통칭', emoji: '🤝' },
  '케어 플랜 AI': { full: '케어 플랜 AI', meaning: '환자 케어 계획 자동 작성 AI', emoji: '📋' },
  'EHR AI': { full: 'EHR + AI', meaning: '전자 건강기록(EHR)에 통합된 AI', emoji: '💻' },
  'Python 환경 분석': { full: 'Python 환경 분석', meaning: 'Python으로 환경·기후 데이터를 분석', emoji: '🐍' },
  'Python AI': { full: 'Python + AI', meaning: '파이썬으로 만든 AI 분석 도구', emoji: '🐍' },
  '위성 데이터 AI': { full: '위성 데이터 + AI', meaning: '위성에서 수집한 데이터를 AI로 분석', emoji: '🛰️' },
  'GIS AI(ArcGIS)': { full: 'GIS + ArcGIS', meaning: 'ArcGIS를 활용한 공간 분석 AI', emoji: '🗺️' },
  '기후 모델 AI': { full: '기후 모델 AI', meaning: '기후 시뮬레이션·예측 AI', emoji: '🌡️' },
  '자동화 솔루션': { full: '자동화 솔루션', meaning: '업무 자동화 도구의 통칭 (RPA·iPaaS 등)', emoji: '⚙️' },
  '데이터 분석 플랫폼': { full: '데이터 분석 플랫폼', meaning: '데이터를 모아 분석·시각화하는 플랫폼의 통칭', emoji: '📊' },
  'AI 보조 전문 도구': { full: 'AI 보조 전문 도구', meaning: '특정 직군에 특화된 AI 보조 도구의 통칭', emoji: '🤖' },
  'AI 모니터링': { full: 'AI 모니터링', meaning: 'AI를 활용한 실시간 감시·이상 탐지', emoji: '👁️' },
  'Resource Finder AI': { full: 'Resource Finder AI', meaning: '필요한 자원을 자동으로 찾아 주는 AI', emoji: '🔍' },
  'AI 환자 교육 도구': { full: 'AI 환자 교육 도구', meaning: '환자 맞춤 교육 자료 자동 생성 AI', emoji: '📖' },
  '번역 AI': { full: '번역 AI', meaning: '자동 번역 AI의 통칭', emoji: '🌐' },

  // ── 커리어 패스 활동 (전시·자격증·대회·캠프·봉사 등) ────────
  '포트폴리오': { full: '포트폴리오 (Portfolio)', meaning: '내가 만든 작업물·결과물을 모은 묶음. 입시·취업의 핵심 자료', emoji: '📁' },
  '인턴십': { full: '인턴십 (Internship)', meaning: '회사에서 짧게 일하며 실무를 배우는 경험. 보통 방학·학기 단위', emoji: '💼' },
  '인턴': { full: '인턴 (Intern)', meaning: '회사에 잠시 들어가 실무를 배우는 학생·신입', emoji: '💼' },
  '공모전': { full: '공모전', meaning: '주제를 받고 작품을 제출해 심사받는 대회', emoji: '🏆' },
  '경진대회': { full: '경진대회', meaning: '실력을 겨루는 대회 (코딩·과학·디자인 등)', emoji: '🥇' },
  '올림피아드': { full: '올림피아드 (Olympiad)', meaning: '학문 분야별 최상위 대회 (수학·과학·정보·생물 등)', emoji: '🏅' },
  '봉사활동': { full: '봉사활동', meaning: '학교·지역에서 시간을 들여 돕는 활동. 학생부 기재', emoji: '🤝' },
  '봉사': { full: '봉사', meaning: '지역·기관에서 시간을 들여 돕는 활동', emoji: '🤝' },
  '캠프': { full: '캠프 (Camp)', meaning: '며칠~몇 주 진행되는 집중 학습·체험 프로그램', emoji: '🏕️' },
  '동아리': { full: '동아리', meaning: '학교 안 학생 활동 모임. 정규 동아리만 학생부 1순위', emoji: '🎪' },
  '학회': { full: '학회 (Academic Society)', meaning: '학문 분야의 연구 모임. 대학생부터 본격 활동', emoji: '🎓' },
  '자원봉사': { full: '자원봉사', meaning: '대가 없이 자발적으로 돕는 활동', emoji: '💚' },
  '멘토링': { full: '멘토링 (Mentoring)', meaning: '경험 있는 사람이 후배를 1:1로 지도', emoji: '🧭' },
  '서포터즈': { full: '서포터즈', meaning: '기관·브랜드에서 학생 홍보단으로 활동하는 프로그램', emoji: '📢' },

  // ── 자격증 ──────────────────────────────────────────────
  '자격증': { full: '자격증', meaning: '국가·민간이 인정하는 능력 증명서', emoji: '📜' },
  'GTQ': { full: 'GTQ (Graphic Technology Qualification)', meaning: '한국생산성본부 그래픽 자격증 (Photoshop·Illustrator)', emoji: '🎨' },
  'GTQi': { full: 'GTQi (Illustrator)', meaning: '일러스트레이터 활용 자격증', emoji: '✏️' },
  '컬러리스트': { full: '컬러리스트 자격증', meaning: '색채 전문가 국가공인 자격증 (산업·기사)', emoji: '🎨' },
  '시각디자인기사': { full: '시각디자인기사', meaning: '국가기술자격 시각디자인 분야 기사', emoji: '🎨' },
  '컴활': { full: '컴퓨터 활용 능력', meaning: '대한상공회의소 컴퓨터 활용 능력 자격증 (1·2급)', emoji: '💻' },
  '정보처리기사': { full: '정보처리기사', meaning: '국가기술자격 IT 분야 대표 자격증', emoji: '💻' },
  '정보처리산업기사': { full: '정보처리산업기사', meaning: '정보처리기사보다 한 단계 아래의 산업기사 자격', emoji: '💻' },
  'SQLD': { full: 'SQL Developer', meaning: '한국데이터산업진흥원의 SQL 개발자 자격증', emoji: '🗄️' },
  'ADsP': { full: 'ADsP', meaning: '데이터 분석 준전문가 자격증', emoji: '📊' },
  'ADP': { full: 'ADP', meaning: '데이터 분석 전문가 자격증 (ADsP의 상위)', emoji: '📊' },
  '빅데이터분석기사': { full: '빅데이터분석기사', meaning: '국가기술자격 빅데이터 분석 기사', emoji: '📊' },
  'TOEIC': { full: 'TOEIC', meaning: '국제 영어 의사소통 능력 시험 (990점 만점)', emoji: '🇺🇸' },
  'TOEIC Speaking': { full: 'TOEIC Speaking', meaning: 'TOEIC 말하기 시험 (200점 만점)', emoji: '🗣️' },
  'OPIc': { full: 'OPIc', meaning: '컴퓨터 기반 영어 말하기 능력 평가', emoji: '🗣️' },
  'JLPT': { full: 'JLPT', meaning: '일본어능력시험 (N1~N5)', emoji: '🇯🇵' },
  'HSK': { full: 'HSK', meaning: '중국어능력시험 (1~6급, 중국 정부 공인)', emoji: '🇨🇳' },
  'TEPS': { full: 'TEPS', meaning: '서울대 영어능력시험', emoji: '📝' },
  'CFA': { full: 'CFA', meaning: '국제재무분석사 (Chartered Financial Analyst)', emoji: '💼' },
  'CPA': { full: 'CPA', meaning: '공인회계사 (Certified Public Accountant)', emoji: '📒' },
  'AICPA': { full: 'AICPA', meaning: '미국 공인회계사', emoji: '🇺🇸' },
  'CMA': { full: 'CMA', meaning: '미국 관리회계사', emoji: '📈' },
  'PMP': { full: 'PMP', meaning: '국제 프로젝트관리 전문가 자격', emoji: '📋' },
  'AWS Certified': { full: 'AWS Certified', meaning: 'AWS 클라우드 공식 자격증', emoji: '☁️' },
  'GA Certificate': { full: 'GA Certificate', meaning: '구글 애널리틱스 공인 자격증', emoji: '📊' },

  // ── 전시·발표·연구 ───────────────────────────────────────
  '전시회': { full: '전시회', meaning: '작품을 모아 사람들에게 보여 주는 행사', emoji: '🖼️' },
  '졸업전시': { full: '졸업전시', meaning: '대학 졸업 작품을 전시하는 행사', emoji: '🎓' },
  '개인전': { full: '개인전', meaning: '한 작가의 작품만 모아 여는 전시', emoji: '🖼️' },
  '단체전': { full: '단체전', meaning: '여러 작가가 함께 여는 전시', emoji: '👥' },
  '아트페어': { full: '아트페어 (Art Fair)', meaning: '미술 작품을 거래하는 박람회 (KIAF·아트부산 등)', emoji: '🖼️' },
  '비엔날레': { full: '비엔날레 (Biennale)', meaning: '2년마다 열리는 국제 미술·건축 전시', emoji: '🌍' },
  'Red Dot': { full: 'Red Dot Design Award', meaning: '독일의 세계 3대 디자인상 중 하나', emoji: '🔴' },
  'iF Design Award': { full: 'iF Design Award', meaning: '독일의 세계적 디자인상', emoji: '🏅' },
  'IDEA': { full: 'IDEA Design Award', meaning: '미국 산업디자이너협회 디자인상', emoji: '🏅' },
  'Pentaward': { full: 'Pentaward', meaning: '세계 패키지 디자인상', emoji: '📦' },
  'Cannes Lions': { full: 'Cannes Lions', meaning: '세계 최대 광고제 (프랑스 칸)', emoji: '🦁' },
  'D&AD': { full: 'D&AD', meaning: '영국 광고·디자인계의 권위 있는 상', emoji: '🇬🇧' },
  'ADC': { full: 'ADC Awards', meaning: 'Art Directors Club. 미국 광고·디자인 대표 상', emoji: '🎨' },
  'Behance': { full: 'Behance', meaning: '어도비가 운영하는 디자이너 포트폴리오 플랫폼', emoji: '🎨' },
  'Dribbble': { full: 'Dribbble', meaning: '디자이너 작품 공유·구직 플랫폼', emoji: '🏀' },
  '학생부문': { full: '학생부문', meaning: '대회·공모전에서 학생 자격으로 참가하는 부문', emoji: '🎓' },
  '대상': { full: '대상 (Grand Prize)', meaning: '대회·시상식에서 가장 높은 상', emoji: '🥇' },
  '최우수상': { full: '최우수상', meaning: '대상 다음 등급의 우수한 상', emoji: '🥈' },
  '우수상': { full: '우수상', meaning: '본상 단계의 입상', emoji: '🥉' },
  '입상': { full: '입상', meaning: '대회에서 상을 받은 것 (대상·우수상 등 통칭)', emoji: '🏆' },
  '동상': { full: '동상', meaning: '3등에 해당하는 상', emoji: '🥉' },

  // ── 입시 학교/학과 ────────────────────────────────────────
  '미대': { full: '미술대학', meaning: '대학의 미술 단과대 (회화·디자인·조소 등)', emoji: '🎨' },
  '음대': { full: '음악대학', meaning: '대학의 음악 단과대 (성악·기악·작곡 등)', emoji: '🎵' },
  '체대': { full: '체육대학', meaning: '대학의 체육 단과대', emoji: '🏅' },
  '공대': { full: '공과대학', meaning: '대학의 공학 단과대 (전기·컴퓨터·기계 등)', emoji: '⚙️' },
  '경영대': { full: '경영대학', meaning: '대학의 경영학 단과대', emoji: '💼' },
  '법대': { full: '법과대학', meaning: '대학의 법학 단과대 (현재는 로스쿨 위주)', emoji: '⚖️' },
  '로스쿨': { full: '법학전문대학원 (Law School)', meaning: '변호사 양성을 위한 3년제 대학원', emoji: '⚖️' },
  '사범대': { full: '사범대학', meaning: '교사 양성 단과대', emoji: '🍎' },
  '교대': { full: '교육대학', meaning: '초등학교 교사 양성 4년제 대학', emoji: '🍎' },
  '한예종': { full: '한국예술종합학교', meaning: '국립 예술 특성화 대학 (음악·연극·영화·미술·무용)', emoji: '🎭' },
  '홍익대': { full: '홍익대학교', meaning: '디자인·미술 분야 명문 사립대', emoji: '🎨' },
  '국민대': { full: '국민대학교', meaning: '디자인 분야 강세의 사립대', emoji: '🎨' },
  'SADI': { full: 'Samsung Art & Design Institute', meaning: '삼성이 운영하는 디자인 전문 교육기관', emoji: '🎨' },
  'PaTI': { full: '파주타이포그라피학교', meaning: '안상수가 만든 대안 디자인 학교', emoji: '🅰️' },

  // ── 기업·취업 ────────────────────────────────────────────
  '대기업': { full: '대기업', meaning: '직원 수·매출 기준 상위 기업 (삼성·LG·현대 등)', emoji: '🏢' },
  '중견기업': { full: '중견기업', meaning: '대기업과 중소기업 사이 규모의 기업', emoji: '🏬' },
  '스타트업': { full: '스타트업 (Startup)', meaning: '창업 초기 단계의 빠르게 성장하는 회사', emoji: '🚀' },
  '유니콘': { full: '유니콘 (Unicorn)', meaning: '기업가치 1조 원 이상의 비상장 스타트업', emoji: '🦄' },
  '제일기획': { full: '제일기획', meaning: '국내 최대 광고대행사 (삼성 계열)', emoji: '📺' },
  '이노션': { full: '이노션', meaning: '현대차 그룹 광고대행사', emoji: '📺' },
  'HS애드': { full: 'HS애드', meaning: 'LG 그룹 광고대행사', emoji: '📺' },
  '오길비': { full: 'Ogilvy', meaning: '세계적 광고·PR 회사 (WPP 그룹)', emoji: '🌍' },
  '계약직': { full: '계약직', meaning: '근로 기간이 정해진 채용 형태', emoji: '📝' },
  '정규직': { full: '정규직', meaning: '근로 기간 제한 없이 채용된 형태', emoji: '✅' },
  '신입': { full: '신입', meaning: '회사에 처음 입사하는 직급', emoji: '🌱' },
  '경력': { full: '경력', meaning: '관련 업무 경험을 가진 채용 단계', emoji: '💼' },

  // ── 생기부·평가 ─────────────────────────────────────────
  '생기부': { full: '학교생활기록부', meaning: '학생부의 줄임말. 교과·세특·동아리·봉사·진로 기록', emoji: '📒' },
  '독서활동': { full: '독서활동상황', meaning: '학생부의 한 항목. 책 제목·저자가 기재됨', emoji: '📚' },
  '진로활동': { full: '진로활동', meaning: '학생부의 한 항목. 진로 탐색 활동 기록', emoji: '🧭' },
  '창의적 체험활동': { full: '창의적 체험활동 (창체)', meaning: '동아리·자율·진로·봉사로 구성되는 학생부 활동', emoji: '🌟' },
  '진로진학상담': { full: '진로진학상담', meaning: '학교의 진로 담당 교사와 1:1 상담', emoji: '🧭' },

  // ── AI 시대 활동 (실전) ─────────────────────────────────
  'GitHub Pages': { full: 'GitHub Pages', meaning: 'GitHub에서 무료로 정적 웹사이트를 호스팅하는 서비스', emoji: '🐙' },
  'Kaggle': { full: 'Kaggle', meaning: '데이터 사이언스 경진대회·노트북 공유 플랫폼', emoji: '📊' },
  'LeetCode': { full: 'LeetCode', meaning: '알고리즘·코딩 인터뷰 문제 풀이 사이트', emoji: '💻' },
  '백준': { full: '백준 온라인 저지', meaning: '국내 최대 알고리즘 문제 풀이 사이트', emoji: '🧩' },
  '프로그래머스': { full: '프로그래머스', meaning: '국내 코딩 테스트·강의 플랫폼', emoji: '💻' },
  'SW마에스트로': { full: '소프트웨어 마에스트로', meaning: '과기정통부 SW 인재 양성 프로그램 (1년 과정)', emoji: '👨‍💻' },
  'KOI': { full: 'KOI (한국정보올림피아드)', meaning: '국내 최대 정보(코딩) 올림피아드', emoji: '🏆' },
  'IOI': { full: 'IOI (국제정보올림피아드)', meaning: '세계 정보 올림피아드', emoji: '🌍' },
  'KMO': { full: 'KMO (한국수학올림피아드)', meaning: '국내 수학 올림피아드', emoji: '🔢' },
  'IMO': { full: 'IMO (국제수학올림피아드)', meaning: '세계 수학 올림피아드', emoji: '🌍' },
  'KAO': { full: 'KAO (한국천문올림피아드)', meaning: '국내 천문 올림피아드', emoji: '🔭' },
  'KESO': { full: 'KESO (한국지구과학올림피아드)', meaning: '국내 지구과학 올림피아드', emoji: '🌍' },
  '발명': { full: '발명대회', meaning: '학생 발명품 경진대회 (특허청 등 주관)', emoji: '💡' },
  '청소년창업경진대회': { full: '청소년창업경진대회', meaning: '청소년 창업 아이디어·시제품 경진대회', emoji: '🚀' },

  // ── AI 코드 에디터·테스트 도구 ────────────────────────────────
  'Cursor': { full: 'Cursor', meaning: 'AI가 통합된 코드 에디터. VS Code 기반에 ChatGPT/Claude를 내장', emoji: '🖱️' },
  'Cursor AI': { full: 'Cursor', meaning: 'AI가 통합된 코드 에디터. VS Code 기반에 ChatGPT/Claude를 내장', emoji: '🖱️' },
  'GitHub Copilot': { full: 'GitHub Copilot', meaning: 'GitHub과 OpenAI가 만든 AI 코드 자동 완성 도구', emoji: '🤖' },
  'Playwright': { full: 'Playwright', meaning: '마이크로소프트가 만든 브라우저 자동화·E2E 테스트 도구', emoji: '🎭' },
  'Playwright AI': { full: 'Playwright', meaning: 'Playwright + AI. 자연어로 E2E 테스트 작성', emoji: '🎭' },
  'Jest': { full: 'Jest', meaning: '메타가 만든 JavaScript 단위 테스트 프레임워크', emoji: '🧪' },
  'Vitest': { full: 'Vitest', meaning: 'Vite 기반의 빠른 JavaScript 테스트 도구', emoji: '⚡' },
  'Cypress': { full: 'Cypress', meaning: '브라우저 E2E 테스트 자동화 도구', emoji: '🌲' },
  'SonarQube': { full: 'SonarQube', meaning: '코드 품질·취약점·중복을 자동 검사하는 정적 분석 도구', emoji: '🔍' },
  'Postman': { full: 'Postman', meaning: 'API를 직접 호출해 보고 테스트하는 도구', emoji: '📮' },
  'Insomnia': { full: 'Insomnia', meaning: 'Postman과 비슷한 API 테스트·디버깅 도구', emoji: '🌙' },
  'Storybook': { full: 'Storybook', meaning: 'UI 컴포넌트를 따로 만들어 보고 문서화하는 도구', emoji: '📚' },
  'ESLint': { full: 'ESLint', meaning: 'JavaScript 코드 품질·스타일을 자동 점검하는 도구', emoji: '🧹' },
  'Prettier': { full: 'Prettier', meaning: '코드 포맷을 자동으로 맞춰 주는 도구', emoji: '✨' },
  'Webpack': { full: 'Webpack', meaning: '여러 JS·CSS 파일을 하나로 묶는 번들러', emoji: '📦' },
  'Vite': { full: 'Vite', meaning: 'Webpack 대안의 빠른 프론트엔드 빌드 도구', emoji: '⚡' },
  'Sentry': { full: 'Sentry', meaning: '실서비스 에러를 실시간 추적·알림하는 도구', emoji: '🚨' },
  'Datadog': { full: 'Datadog', meaning: '서버·앱의 상태를 모니터링하는 클라우드 플랫폼', emoji: '🐶' },
  'Grafana': { full: 'Grafana', meaning: '서버·앱 지표를 대시보드로 시각화하는 도구', emoji: '📊' },
  'Jenkins': { full: 'Jenkins', meaning: '자동 빌드·테스트·배포(CI/CD) 도구', emoji: '🤵' },
  'CircleCI': { full: 'CircleCI', meaning: '클라우드 기반 CI/CD 자동화 서비스', emoji: '🔄' },
  'GitHub Actions': { full: 'GitHub Actions', meaning: 'GitHub에 내장된 CI/CD 자동화 기능', emoji: '⚙️' },

  // ── 개발 일반 용어 ──────────────────────────────────────────
  'CI/CD': { full: 'Continuous Integration / Continuous Deployment', meaning: '자동으로 코드 합치고·테스트하고·배포하는 흐름', emoji: '🔄' },
  'DevOps': { full: 'Development + Operations', meaning: '개발과 운영을 하나로 묶어 빠르게 배포하는 문화·기술', emoji: '🛠️' },
  'MLOps': { full: 'Machine Learning Operations', meaning: 'AI 모델 배포·운영을 자동화하는 분야', emoji: '🤖' },
  'REST': { full: 'REST API', meaning: 'HTTP로 데이터를 주고받는 가장 흔한 API 방식', emoji: '🔌' },
  'GraphQL': { full: 'GraphQL', meaning: '필요한 데이터만 골라 받는 페이스북의 API 쿼리 언어', emoji: '🟪' },
  'gRPC': { full: 'gRPC', meaning: '구글이 만든 빠른 서버 간 통신 프로토콜', emoji: '🔌' },
  'JSON': { full: 'JavaScript Object Notation', meaning: '키-값 형태로 데이터를 표현하는 가장 흔한 포맷', emoji: '📋' },
  'XML': { full: 'eXtensible Markup Language', meaning: '태그로 데이터를 표현하는 마크업 언어', emoji: '📄' },
  'YAML': { full: 'YAML Ain\'t Markup Language', meaning: '들여쓰기로 데이터를 표현하는 설정 파일 포맷', emoji: '📝' },
  'HTTP': { full: 'HyperText Transfer Protocol', meaning: '웹 브라우저와 서버가 데이터를 주고받는 프로토콜', emoji: '🌐' },
  'HTTPS': { full: 'HTTP Secure', meaning: '암호화된 안전한 HTTP', emoji: '🔒' },
  'OAuth': { full: 'OAuth', meaning: '구글·카카오 로그인처럼 외부 계정으로 인증하는 표준', emoji: '🔑' },
  'JWT': { full: 'JSON Web Token', meaning: '로그인 후 발급되는 인증 토큰의 표준 형식', emoji: '🎫' },
  'SSO': { full: 'Single Sign-On', meaning: '한 번 로그인으로 여러 서비스를 쓰는 인증 방식', emoji: '🔓' },
  'SaaS': { full: 'Software as a Service', meaning: '인터넷으로 제공되는 소프트웨어 서비스', emoji: '☁️' },
  'PaaS': { full: 'Platform as a Service', meaning: '개발 플랫폼을 클라우드로 제공', emoji: '☁️' },
  'IaaS': { full: 'Infrastructure as a Service', meaning: '서버·네트워크 인프라를 클라우드로 제공', emoji: '☁️' },
  'CDN': { full: 'Content Delivery Network', meaning: '전 세계에 콘텐츠를 빠르게 전송하는 네트워크', emoji: '🌍' },
  'DNS': { full: 'Domain Name System', meaning: '도메인을 IP 주소로 변환해 주는 시스템', emoji: '🔗' },
  'IP': { full: 'Internet Protocol', meaning: '인터넷에서 컴퓨터를 식별하는 주소 체계', emoji: '🌐' },
  'TCP': { full: 'Transmission Control Protocol', meaning: '데이터를 안정적으로 전송하는 프로토콜', emoji: '📡' },
  'WebSocket': { full: 'WebSocket', meaning: '서버와 양방향 실시간 통신을 위한 프로토콜', emoji: '🔌' },
  'OS': { full: 'Operating System', meaning: '운영체제. 윈도우·macOS·리눅스 등', emoji: '💻' },
  'CPU': { full: 'Central Processing Unit', meaning: '중앙 처리 장치. 컴퓨터의 두뇌', emoji: '🧠' },
  'GPU': { full: 'Graphics Processing Unit', meaning: '그래픽 처리 장치. AI·게임에 핵심', emoji: '🎮' },
  'RAM': { full: 'Random Access Memory', meaning: '컴퓨터의 작업용 메모리', emoji: '💾' },
  'SSD': { full: 'Solid State Drive', meaning: '빠르고 안정적인 저장 장치', emoji: '💽' },

  // ── 한글 전문 용어 (개발 일반) ─────────────────────────────────
  '디버깅': { full: '디버깅 (Debugging)', meaning: '프로그램의 버그(오류)를 찾아 고치는 과정', emoji: '🐛' },
  '버그': { full: '버그 (Bug)', meaning: '프로그램이 잘못 동작하게 만드는 오류', emoji: '🐞' },
  '로직': { full: '로직 (Logic)', meaning: '프로그램이 동작하는 흐름·규칙', emoji: '🧩' },
  '리팩토링': { full: '리팩토링 (Refactoring)', meaning: '동작은 그대로 두고 코드를 더 깔끔하게 다시 쓰는 작업', emoji: '🔧' },
  '코드 리뷰': { full: '코드 리뷰', meaning: '동료 개발자가 내 코드를 점검·피드백하는 과정', emoji: '👀' },
  '프론트엔드': { full: '프론트엔드 (Frontend)', meaning: '사용자가 보는 화면을 만드는 분야', emoji: '🖥️' },
  '백엔드': { full: '백엔드 (Backend)', meaning: '서버·DB 등 보이지 않는 부분을 만드는 분야', emoji: '⚙️' },
  '풀스택': { full: '풀스택 (Full-stack)', meaning: '프론트엔드·백엔드를 모두 다루는 개발자', emoji: '🥞' },
  '데이터베이스': { full: '데이터베이스 (Database)', meaning: '데이터를 체계적으로 저장·관리하는 시스템', emoji: '🗄️' },
  'DB': { full: 'Database', meaning: '데이터베이스. 데이터를 저장·관리하는 시스템', emoji: '🗄️' },
  '서버': { full: '서버 (Server)', meaning: '요청을 받아 답을 보내는 컴퓨터', emoji: '🖥️' },
  '클라이언트': { full: '클라이언트 (Client)', meaning: '서버에 요청을 보내는 쪽 (예: 브라우저·앱)', emoji: '📱' },
  '쿠키': { full: '쿠키 (Cookie)', meaning: '브라우저에 저장되는 작은 데이터. 로그인 상태 등 기억', emoji: '🍪' },
  '세션': { full: '세션 (Session)', meaning: '로그인 후 일정 시간 동안 유지되는 사용자 상태', emoji: '🔐' },
  '토큰': { full: '토큰 (Token)', meaning: '인증·권한을 담은 짧은 코드. JWT 등', emoji: '🎫' },
  '쿼리': { full: '쿼리 (Query)', meaning: '데이터베이스에 데이터를 요청하는 문장', emoji: '🔍' },
  '캐시': { full: '캐시 (Cache)', meaning: '자주 쓰는 데이터를 빨리 꺼내려고 잠시 저장한 사본', emoji: '⚡' },
  '인덱스': { full: '인덱스 (Index)', meaning: '데이터베이스 검색을 빠르게 해 주는 색인', emoji: '🔖' },
  '배포': { full: '배포 (Deploy)', meaning: '만든 코드를 실제 서비스에 올리는 작업', emoji: '🚀' },
  '롤백': { full: '롤백 (Rollback)', meaning: '문제 생긴 배포를 이전 버전으로 되돌리는 것', emoji: '↩️' },
  '확장성': { full: '확장성 (Scalability)', meaning: '사용자가 늘어나도 잘 견디게 만드는 성질', emoji: '📈' },
  '아키텍처': { full: '아키텍처 (Architecture)', meaning: '소프트웨어의 큰 구조·설계', emoji: '🏗️' },
  '마이크로서비스': { full: '마이크로서비스', meaning: '하나의 큰 시스템을 작은 서비스 여러 개로 쪼개는 구조', emoji: '🧩' },

  // ── 보안·QA 한글 ──────────────────────────────────────────
  '보안': { full: '보안 (Security)', meaning: '데이터·시스템을 해킹·유출에서 지키는 분야', emoji: '🔒' },
  '취약점': { full: '취약점 (Vulnerability)', meaning: '공격자가 악용할 수 있는 약한 부분', emoji: '⚠️' },
  '암호화': { full: '암호화 (Encryption)', meaning: '데이터를 알아볼 수 없게 변환해 보호하는 기술', emoji: '🔐' },
  '인증': { full: '인증 (Authentication)', meaning: '"이 사람이 진짜 본인인가"를 확인', emoji: '🪪' },
  '권한': { full: '권한 (Authorization)', meaning: '"이 사람이 무엇을 할 수 있는가"를 정함', emoji: '🗝️' },
  '테스트': { full: '테스트 (Test)', meaning: '코드가 정확히 동작하는지 확인하는 작업', emoji: '🧪' },
  'QA': { full: 'Quality Assurance', meaning: '품질 보증. 출시 전 결함을 찾아 막는 일', emoji: '✅' },
  'E2E 테스트': { full: 'End-to-End Test', meaning: '사용자 입장에서 전체 흐름을 자동으로 실행해 보는 테스트', emoji: '🔁' },
  '단위 테스트': { full: 'Unit Test', meaning: '함수·컴포넌트 같은 작은 단위 하나씩 동작을 검증', emoji: '🧪' },
  '통합 테스트': { full: 'Integration Test', meaning: '여러 부품을 합쳐 실제로 잘 연결되는지 확인', emoji: '🔗' },
  '성능 테스트': { full: '성능 테스트', meaning: '많은 사용자가 몰릴 때 빠르고 안정적인지 측정', emoji: '⏱️' },
  '회귀 테스트': { full: '회귀 테스트 (Regression Test)', meaning: '코드를 고친 뒤 기존 기능이 안 망가졌는지 다시 검증', emoji: '🔄' },
  '커버리지': { full: '커버리지 (Coverage)', meaning: '테스트가 코드의 몇 %를 검증하는지 나타내는 지표', emoji: '📊' },

  // ── 결제·서비스 도메인 ─────────────────────────────────────
  '결제': { full: '결제 (Payment)', meaning: '온라인에서 돈을 주고받는 시스템 (카드·간편결제 등)', emoji: '💳' },
  'PG': { full: 'Payment Gateway', meaning: '결제대행사. 카드사·은행과 통신해 결제 처리', emoji: '💳' },
  '간편결제': { full: '간편결제', meaning: '카카오페이·네이버페이·토스 등 빠른 결제 서비스', emoji: '📱' },

  // ── 디자인·UX 한글 ───────────────────────────────────────
  '와이어프레임': { full: '와이어프레임 (Wireframe)', meaning: '화면 구조를 단순한 선으로 그린 설계도', emoji: '📐' },
  '프로토타입': { full: '프로토타입 (Prototype)', meaning: '실제로 눌러 볼 수 있는 시제품 형태의 시뮬레이션', emoji: '🧪' },
  '사용자 리서치': { full: '사용자 리서치 (User Research)', meaning: '인터뷰·설문으로 사용자가 진짜 원하는 걸 알아내는 작업', emoji: '👥' },
  '퍼소나': { full: '퍼소나 (Persona)', meaning: '대표적인 가상 사용자 인물상. 디자인의 기준', emoji: '🧑' },

  // ── 기타 자주 등장 ──────────────────────────────────────
  '알고리즘': { full: '알고리즘 (Algorithm)', meaning: '문제를 푸는 절차·계산 방법', emoji: '🧠' },
  '자료구조': { full: '자료구조 (Data Structure)', meaning: '데이터를 효율적으로 다루는 방식 (배열·트리 등)', emoji: '🌲' },
  '오픈소스': { full: '오픈소스 (Open Source)', meaning: '누구나 자유롭게 보고 쓸 수 있는 코드', emoji: '🌐' },
  '라이브러리': { full: '라이브러리 (Library)', meaning: '미리 만들어 둔 코드 묶음', emoji: '📚' },
  '프레임워크': { full: '프레임워크 (Framework)', meaning: '앱을 만드는 큰 틀. React·Next.js 등', emoji: '🏗️' },
  'SDK': { full: 'Software Development Kit', meaning: '특정 플랫폼에서 개발할 때 쓰는 도구 모음', emoji: '🧰' },
  'PoC': { full: 'Proof of Concept', meaning: '아이디어가 실제로 작동하는지 검증하는 시제 구현', emoji: '🧪' },
  'MVP': { full: 'Minimum Viable Product', meaning: '핵심 기능만 갖춘 최소 제품. 빠르게 가설을 검증', emoji: '🚀' },
};

const GLOSSARY_TOKENS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GLOSSARY_REGEX = new RegExp(`(${GLOSSARY_TOKENS.map(escapeRegex).join('|')})`, 'g');

type Segment = { text: string; highlight: boolean };

function parseHighlight(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /==([^=]+)==/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), highlight: false });
    out.push({ text: m[1], highlight: true });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ text: text.slice(last), highlight: false });
  return out;
}

/**
 * 사전에 등록되지 않은 토큰이라도 "X AI" 같은 흔한 합성어는
 * 베이스 도구(X)의 설명을 활용해 자동 생성된 툴팁을 보여 준다.
 */
function resolveDynamicEntry(token: string): GlossaryEntry | null {
  // "X AI" → X가 사전에 있으면 "X + AI" 형태의 합성 풀이
  const aiSuffixMatch = token.match(/^(.+?)\s+AI$/);
  if (aiSuffixMatch) {
    const base = aiSuffixMatch[1].trim();
    const baseEntry = GLOSSARY[base];
    if (baseEntry) {
      return {
        full: `${baseEntry.full} + AI`,
        meaning: `${baseEntry.meaning} 여기에 AI 분석·자동화 기능이 결합된 버전`,
        emoji: baseEntry.emoji ?? '🤖',
      };
    }
  }
  // "AI X" → 같은 방식
  const aiPrefixMatch = token.match(/^AI\s+(.+)$/);
  if (aiPrefixMatch) {
    const base = aiPrefixMatch[1].trim();
    const baseEntry = GLOSSARY[base];
    if (baseEntry) {
      return {
        full: `AI + ${baseEntry.full}`,
        meaning: `${baseEntry.meaning} 여기에 AI가 통합된 형태`,
        emoji: baseEntry.emoji ?? '🤖',
      };
    }
  }
  // "X/Y" — 두 도구 묶어 쓴 경우 (ChatGPT/Claude 등)
  const slashMatch = token.match(/^(.+?)\s*\/\s*(.+)$/);
  if (slashMatch) {
    const a = GLOSSARY[slashMatch[1].trim()];
    const b = GLOSSARY[slashMatch[2].trim()];
    if (a && b) {
      return {
        full: `${a.full} / ${b.full}`,
        meaning: `${a.meaning} 또는 ${b.meaning}`,
        emoji: a.emoji ?? '🤖',
      };
    }
  }
  return null;
}

const DYNAMIC_CACHE = new Map<string, GlossaryEntry | null>();
function getEntry(token: string): GlossaryEntry | null {
  if (GLOSSARY[token]) return GLOSSARY[token];
  if (DYNAMIC_CACHE.has(token)) return DYNAMIC_CACHE.get(token) ?? null;
  const dyn = resolveDynamicEntry(token);
  DYNAMIC_CACHE.set(token, dyn);
  return dyn;
}

function renderWithGlossary(text: string, keyPrefix: string): ReactNode[] {
  const safe = typeof text === 'string' ? text : text == null ? '' : String(text);
  if (!safe) return [safe];
  const nodes: ReactNode[] = [];
  const parts = safe.split(GLOSSARY_REGEX);
  parts.forEach((part, i) => {
    if (!part) return;
    if (GLOSSARY[part]) {
      nodes.push(<GlossaryTerm key={`${keyPrefix}-g-${i}`} token={part} />);
    } else {
      nodes.push(<span key={`${keyPrefix}-t-${i}`}>{part}</span>);
    }
  });
  return nodes;
}

/**
 * 본문에 약자가 연속해서 나오는 칩(예: "Power BI AI", "Cursor AI")의 경우
 * 부모에서 이 함수를 호출해 한 덩어리로 툴팁을 띄울 수도 있도록 export.
 */
export function GlossaryChip({ token, className }: { token: string; className?: string }) {
  const entry = getEntry(token);
  if (entry) {
    return (
      <span className={className}>
        <GlossaryTermInline token={token} entry={entry} />
      </span>
    );
  }
  // 사전에 없으면 부분 매칭으로 일반 GlossaryText 사용
  return <span className={className}><GlossaryText>{token}</GlossaryText></span>;
}

function GlossaryTermInline({ token, entry }: { token: string; entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({ left: rect.left + rect.width / 2, top: rect.top });
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <span
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      onTouchStart={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      style={{
        display: 'inline',
        cursor: 'help',
        borderBottom: '1px dashed rgba(125,211,252,0.7)',
        position: 'relative',
        padding: '0 1px',
      }}
      role="button"
      aria-label={`${token} 뜻 보기`}
      tabIndex={0}
    >
      {token}
      {open && coords && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: coords.left,
            top: coords.top - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              maxWidth: 280,
              minWidth: 180,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
              border: '1px solid rgba(125,211,252,0.45)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(125,211,252,0.18) inset',
              color: 'white',
              fontWeight: 400,
              textAlign: 'left',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              {entry.emoji && <span>{entry.emoji}</span>}
              <span style={{ fontWeight: 700, color: 'rgb(125,211,252)' }}>{token}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{entry.full}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)' }}>{entry.meaning}</div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -6,
                transform: 'translateX(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                background: 'rgba(30,41,59,0.98)',
                borderRight: '1px solid rgba(125,211,252,0.45)',
                borderBottom: '1px solid rgba(125,211,252,0.45)',
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}

function GlossaryTerm({ token }: { token: string }) {
  const entry = GLOSSARY[token];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({ left: rect.left + rect.width / 2, top: rect.top });
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <span
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      onTouchStart={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      style={{
        display: 'inline',
        cursor: 'help',
        borderBottom: '1px dashed rgba(125,211,252,0.7)',
        color: 'rgb(125,211,252)',
        fontWeight: 600,
        position: 'relative',
        padding: '0 1px',
      }}
      role="button"
      aria-label={`${token} 뜻 보기`}
      tabIndex={0}
    >
      {token}
      {open && coords && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: coords.left,
            top: coords.top - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              maxWidth: 280,
              minWidth: 180,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
              border: '1px solid rgba(125,211,252,0.45)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(125,211,252,0.18) inset',
              color: 'white',
              fontWeight: 400,
              textAlign: 'left',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              {entry.emoji && <span>{entry.emoji}</span>}
              <span style={{ fontWeight: 700, color: 'rgb(125,211,252)' }}>{token}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{entry.full}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)' }}>{entry.meaning}</div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -6,
                transform: 'translateX(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                background: 'rgba(30,41,59,0.98)',
                borderRight: '1px solid rgba(125,211,252,0.45)',
                borderBottom: '1px solid rgba(125,211,252,0.45)',
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}

/**
 * `==형광==` 마크업은 노란 형광펜으로,
 * 등록된 약자·전문 용어(세특·학종·수능최저·IB·EE·CAS·HL·TOK·AP·SAT·SKY 등)는
 * 점선 밑줄 + 호버/탭 시 말풍선 툴팁(이모지 + 풀어 쓴 이름 + 한 줄 설명)으로 렌더링.
 */
export function GlossaryText({
  children,
  className = '',
}: {
  children: string | number | null | undefined;
  className?: string;
}) {
  const safeText = typeof children === 'string' ? children : children == null ? '' : String(children);
  const segments = parseHighlight(safeText);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <span
            key={`h-${i}`}
            className="font-medium"
            style={{
              background: 'linear-gradient(180deg, transparent 78%, rgba(250,204,21,0.14) 78%)',
              padding: '0 1px',
            }}
          >
            {renderWithGlossary(seg.text, `h${i}`)}
          </span>
        ) : (
          <span key={`p-${i}`}>{renderWithGlossary(seg.text, `p${i}`)}</span>
        )
      )}
    </span>
  );
}
