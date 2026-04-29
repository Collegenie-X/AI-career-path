'use client';

import { motion } from 'framer-motion';
import aboutContent from '@/data/about-content.json';

const MEMBER_CONFIG = {
  human: {
    gradient: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
    glow: 'rgba(108,92,231,0.4)',
    borderColor: 'rgba(108,92,231,0.5)',
    tag: '👨‍💻 기획자',
    skills: ['진로 설계', '멘토링', '기획력', 'AI 협업'],
    emoji: '🧠',
  },
  ai: {
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    glow: 'rgba(59,130,246,0.4)',
    borderColor: 'rgba(59,130,246,0.5)',
    tag: '🤖 AI 파트너',
    skills: ['코드 작성', '디자인 구현', '데이터 구조화', '24/7 응답'],
    emoji: '⚡',
  },
};

export function AboutCreatorSectionNew() {
  const { creator } = aboutContent;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-black">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6C5CE7, transparent)' }}
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="web-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3"
            initial={{}}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {creator.badge}
          </motion.p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {creator.title}
            </span>
          </h2>
          <p className="text-lg text-purple-400 font-bold mb-4">{creator.subtitle}</p>
          <p className="text-base text-white/50 max-w-2xl mx-auto">{creator.description}</p>
        </motion.div>

        {/* Cards + connector */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {creator.team.map((member, index) => {
            const config = MEMBER_CONFIG[member.id as keyof typeof MEMBER_CONFIG];
            return (
              <motion.div
                key={member.id}
                className="relative rounded-3xl p-8 border group cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${config.glow.replace('0.4', '0.08')}, transparent)`,
                  borderColor: config.borderColor.replace('0.5', '0.2'),
                }}
                initial={{ x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: config.borderColor,
                  boxShadow: `0 0 40px ${config.glow}`,
                }}
              >
                {/* Tag */}
                <div className="absolute -top-3.5 left-6">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: config.gradient }}
                  >
                    {config.tag}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg"
                    style={{ background: config.gradient }}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {member.avatar}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm" style={{ color: config.glow.replace('0.4', '1').replace('rgba', 'rgb').replace(',0.4)', ')') }}>
                      {member.role}
                    </p>
                  </div>
                  <motion.span
                    className="shrink-0 text-2xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {config.emoji}
                  </motion.span>
                </div>

                <p className="text-sm text-white/65 leading-relaxed mb-6">{member.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {config.skills.map((skill, si) => (
                    <motion.span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        borderColor: config.borderColor.replace('0.5', '0.3'),
                        color: 'rgba(255,255,255,0.7)',
                        background: config.glow.replace('0.4', '0.1'),
                      }}
                      initial={{ scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + si * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Result banner */}
        <motion.div
          className="mt-12 max-w-3xl mx-auto rounded-2xl p-6 text-center border border-purple-500/30"
          style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(59,130,246,0.1))' }}
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            🚀
          </motion.span>
          <p className="mt-2 text-white/70 font-medium">
            <span className="text-purple-300 font-bold">김종필</span> × <span className="text-blue-300 font-bold">AI Agent</span>의 협업으로
            <span className="text-white font-bold"> aicareerpath.com</span>이 탄생했습니다
          </p>
        </motion.div>
      </div>
    </section>
  );
}
