'use client';

import { Target, Eye, Heart } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: '미션',
    description:
      '모든 학생이 자신의 적성과 꿈을 발견하고, AI의 도움으로 체계적인 커리어 패스를 만들어 나갈 수 있도록 지원합니다.',
    color: '#6C5CE7',
  },
  {
    icon: Eye,
    title: '비전',
    description:
      '진로 탐색이 더 이상 막연하지 않도록, 데이터 기반의 개인화된 진로 가이드를 제공하는 국내 최고의 AI 진로 플랫폼이 되겠습니다.',
    color: '#3B82F6',
  },
  {
    icon: Heart,
    title: '가치',
    description:
      '학생 한 명 한 명의 가능성을 믿고, 게임처럼 즐기며 성장할 수 있는 환경을 만드는 것이 우리의 핵심 가치입니다.',
    color: '#A855F7',
  },
] as const;

const STORY_PARAGRAPHS = [
  '저는 진로를 정하지 못한 채 고등학교를 졸업했습니다. 무엇을 잘하는지, 어떤 직업이 나에게 맞는지 알 수 없었고, 그 막막함은 오랫동안 저를 따라다녔습니다.',
  'DreamPath는 그 경험에서 시작되었습니다. AI 기술이 발전한 지금, 학생들이 더 이상 막연한 불안 속에서 진로를 고민하지 않아도 되도록 만들고 싶었습니다.',
  '적성 검사, 커리어 패스 설계, 실전 프로젝트까지 — 한 플랫폼에서 게임처럼 즐기며 자신의 꿈을 향해 나아갈 수 있는 공간을 만들었습니다.',
];

export function AboutMissionSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="web-container">
        {/* Mission/Vision/Values */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Our Purpose</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">미션과 비전</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-2xl p-7 bg-white/[0.03] border border-white/8 hover:border-white/18 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${value.color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        {/* Founder Story */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">창업 이야기</h2>
          </div>

          <div
            className="rounded-2xl p-8 md:p-10 bg-white/[0.03] border border-white/8"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            <div className="space-y-5">
              {STORY_PARAGRAPHS.map((paragraph, index) => (
                <p key={index} className="text-base text-white/65 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/8 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}
              >
                김
              </div>
              <div>
                <p className="text-white font-semibold">김종필</p>
                <p className="text-sm text-white/50">DreamPath 대표</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
