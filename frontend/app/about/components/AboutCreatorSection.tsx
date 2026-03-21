'use client';

import aboutContent from '@/data/about-content.json';

export function AboutCreatorSection() {
  const { creator } = aboutContent;

  return (
    <section className="py-24 md:py-32">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {creator.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{creator.title}</h2>
          <p className="text-xl text-purple-400 font-semibold mb-4">{creator.subtitle}</p>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">{creator.description}</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {creator.team.map((member, index) => (
            <div
              key={member.id}
              className="rounded-2xl p-8 bg-white/[0.03] border border-white/8 hover:border-purple-500/30 transition-all duration-300"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 200}ms both` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0"
                  style={{
                    background:
                      member.id === 'human'
                        ? 'linear-gradient(135deg, #6C5CE7, #a29bfe)'
                        : 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                  }}
                >
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-purple-400">{member.role}</p>
                </div>
              </div>
              <p className="text-base text-white/65 leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
