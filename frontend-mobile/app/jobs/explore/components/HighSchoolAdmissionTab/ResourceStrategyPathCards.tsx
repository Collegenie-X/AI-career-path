'use client';

import { Route } from 'lucide-react';

const resourceStrategyCards = [
  { icon: '🧭', title: '수시 중심', description: '내신 + 세특 + 활동 기록 아카이브를 꾸준히 만드는 방식' },
  { icon: '🎯', title: '정시 중심', description: '모의고사 기반 약점 보완과 장기 수능 루틴 강화' },
  { icon: '🌍', title: '유학 준비', description: '영어 에세이 + 프로젝트 포트폴리오를 단계적으로 확장' },
  { icon: '⚙️', title: '직업계/실무', description: '실습·자격증·프로젝트로 빠른 진로 확정과 취업 준비' },
];

export function ResourceStrategyPathCards() {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-bold text-cyan-300 flex items-center gap-1.5">
        <Route className="w-3.5 h-3.5" />
        고입 전략 커리어 패스 구조
      </p>
      <div className="grid grid-cols-1 gap-2">
        {resourceStrategyCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl p-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[12px] font-bold text-white mb-1">
              {card.icon} {card.title}
            </p>
            <p className="text-[12px] text-gray-300 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
