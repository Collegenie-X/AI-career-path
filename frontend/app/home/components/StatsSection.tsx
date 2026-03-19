'use client';

const STATS = [
  { value: '1,000+', label: '생성된 커리어 패스' },
  { value: '500+', label: '활성 사용자' },
  { value: '95%', label: '사용자 만족도' },
  { value: '80%', label: '평균 목표 달성률' },
] as const;

export function StatsSection() {
  return (
    <section className="py-16 min-[720px]:py-20 px-4">
      <div className="web-container max-w-6xl mx-auto">
        <div className="grid grid-cols-2 min-[720px]:grid-cols-4 gap-8 min-[720px]:gap-12">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="text-4xl min-[720px]:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                {stat.value}
              </div>
              <div className="text-sm text-white/60 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
