'use client';

const TECH_STACK = [
  { name: 'Next.js', category: '프론트엔드', color: '#ffffff' },
  { name: 'React Native', category: '모바일', color: '#61DAFB' },
  { name: 'TypeScript', category: '언어', color: '#3178C6' },
  { name: 'Tailwind CSS', category: '스타일링', color: '#38BDF8' },
  { name: 'OpenAI API', category: 'AI', color: '#10A37F' },
  { name: 'Supabase', category: '백엔드', color: '#3ECF8E' },
  { name: 'Vercel', category: '배포', color: '#ffffff' },
  { name: 'PostgreSQL', category: '데이터베이스', color: '#336791' },
] as const;

const CONTACT_ITEMS = [
  { label: '이메일', value: 'support@dreampath.com', href: 'mailto:support@dreampath.com' },
  { label: '대표번호', value: '02-1234-5678', href: 'tel:02-1234-5678' },
  { label: '주소', value: '서울특별시 강남구 테헤란로 123, 4층 401호', href: '#' },
  { label: '상담시간', value: '평일 09:00~18:00 (점심 12:30~13:30)', href: '#' },
] as const;

export function AboutTeamSection() {
  return (
    <section className="py-24 md:py-32 bg-white/[0.015]">
      <div className="web-container">
        {/* Tech Stack */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Technology</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">기술 스택</h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            최신 기술로 빠르고 안정적인 서비스를 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-24">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl p-5 bg-white/[0.03] border border-white/8 hover:border-white/18 transition-all text-center"
            >
              <div
                className="text-lg font-bold mb-1"
                style={{ color: tech.color }}
              >
                {tech.name}
              </div>
              <div className="text-xs text-white/40">{tech.category}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Contact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">문의하기</h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/8">
            {CONTACT_ITEMS.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-start gap-6 px-7 py-5 ${
                  index < CONTACT_ITEMS.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <span className="text-sm text-white/40 w-20 shrink-0 pt-0.5">{item.label}</span>
                {item.href !== '#' ? (
                  <a
                    href={item.href}
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-sm text-white/75">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
