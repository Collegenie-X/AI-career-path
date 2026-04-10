'use client';

import { motion } from 'framer-motion';

type Achievement = {
  emoji: string;
  label: string;
  xp: string;
  color: string;
};

const ROW_1: Achievement[] = [
  { emoji: '🏆', label: '커리어 목표 설정 완료', xp: '+500 XP', color: '#f59e0b' },
  { emoji: '⚡', label: 'AI 분석 첫 완료', xp: '+200 XP', color: '#6C5CE7' },
  { emoji: '🎯', label: '직무 적합도 분석', xp: '+300 XP', color: '#3b82f6' },
  { emoji: '🌟', label: '로드맵 생성 성공', xp: '+400 XP', color: '#a78bfa' },
  { emoji: '🚀', label: '첫 번째 커리어 스텝', xp: '+150 XP', color: '#60a5fa' },
  { emoji: '🔥', label: '7일 연속 학습', xp: '+700 XP', color: '#f97316' },
  { emoji: '🎓', label: '전공 탐색 완료', xp: '+250 XP', color: '#34d399' },
  { emoji: '💡', label: 'AI 멘토링 첫 세션', xp: '+180 XP', color: '#fbbf24' },
  { emoji: '🌈', label: '적성 검사 완료', xp: '+350 XP', color: '#f472b6' },
  { emoji: '🏅', label: '프로필 100% 완성', xp: '+600 XP', color: '#34d399' },
];

const ROW_2: Achievement[] = [
  { emoji: '📊', label: '역량 지도 완성', xp: '+280 XP', color: '#818cf8' },
  { emoji: '🤝', label: '커뮤니티 첫 참여', xp: '+100 XP', color: '#f59e0b' },
  { emoji: '🧩', label: '직무 퀴즈 만점', xp: '+450 XP', color: '#6C5CE7' },
  { emoji: '📈', label: 'XP 레벨업!', xp: 'LEVEL UP', color: '#f97316' },
  { emoji: '🎮', label: '커리어 게임 클리어', xp: '+1000 XP', color: '#a78bfa' },
  { emoji: '🌍', label: '진로 탐험가', xp: '+320 XP', color: '#60a5fa' },
  { emoji: '⭐', label: '첫 번째 목표 달성', xp: '+550 XP', color: '#fbbf24' },
  { emoji: '🔮', label: 'AI 예측 적중', xp: '+230 XP', color: '#f472b6' },
  { emoji: '🦁', label: '용기의 첫 걸음', xp: '+190 XP', color: '#34d399' },
  { emoji: '💎', label: '다이아 등급 달성', xp: '+800 XP', color: '#818cf8' },
];

function AchievementBadge({ item }: { item: Achievement }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shrink-0 mx-2"
      style={{
        background: `${item.color}10`,
        borderColor: `${item.color}30`,
      }}
    >
      <span className="text-xl">{item.emoji}</span>
      <div>
        <p className="text-xs font-semibold text-white/80 whitespace-nowrap">{item.label}</p>
        <p
          className="text-[10px] font-extrabold tracking-wider"
          style={{ color: item.color }}
        >
          {item.xp}
        </p>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Achievement[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgb(11,11,22) 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg, rgb(11,11,22) 0%, transparent 100%)' }} />

      <div
        className={`flex ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <AchievementBadge key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

export function GameAchievementsMarquee() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden border-y border-white/5">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(108,92,231,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="web-container relative z-10 mb-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-2">
            🎮 ACHIEVEMENT UNLOCKED
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            매일 새로운 업적을{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a29bfe, #60a5fa)' }}
            >
              잠금 해제
            </span>
            하세요
          </h2>
        </motion.div>
      </div>

      <div className="space-y-3">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  );
}
