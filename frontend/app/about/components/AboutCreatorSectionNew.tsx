'use client';

import { motion } from 'framer-motion';
import aboutContent from '@/data/about-content.json';

function HumanIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <ellipse cx="18" cy="12" rx="8" ry="9" fill="#FDDBB4" />
      {/* Hair */}
      <path d="M10 9 Q11 2 18 2 Q25 2 26 9 Q22 5 18 6 Q14 5 10 9Z" fill="#3D1F8C" />
      {/* Eyes */}
      <ellipse cx="15" cy="11" rx="1.5" ry="1.8" fill="#2D1B69" />
      <ellipse cx="21" cy="11" rx="1.5" ry="1.8" fill="#2D1B69" />
      <circle cx="15.6" cy="10.3" r="0.6" fill="white" opacity="0.9" />
      <circle cx="21.6" cy="10.3" r="0.6" fill="white" opacity="0.9" />
      {/* Smile */}
      <path d="M14.5 15 Q18 18 21.5 15" stroke="#C97A50" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="12.5" cy="14" rx="2.5" ry="1.5" fill="#F4A096" opacity="0.4" />
      <ellipse cx="23.5" cy="14" rx="2.5" ry="1.5" fill="#F4A096" opacity="0.4" />
      {/* Body / shirt */}
      <path d="M8 34 Q9 24 13 22 L18 25 L23 22 Q27 24 28 34 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="18" y1="3" x2="18" y2="8" stroke="white" strokeWidth="2" />
      <circle cx="18" cy="2.5" r="2" fill="white">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <rect x="6" y="8" width="24" height="20" rx="6" fill="white" opacity="0.95" />
      {/* Screen */}
      <rect x="9" y="11" width="18" height="14" rx="4" fill="#0a1628" opacity="0.85" />
      {/* Eyes */}
      <rect x="11" y="14" width="6" height="5" rx="2" fill="#60A5FA">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="19" y="14" width="6" height="5" rx="2" fill="#60A5FA">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="0.3s" repeatCount="indefinite" />
      </rect>
      {/* Smile */}
      <path d="M12 22 Q18 27 24 22" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Ear sensors */}
      <rect x="3" y="13" width="4" height="7" rx="2" fill="white" opacity="0.8" />
      <rect x="29" y="13" width="4" height="7" rx="2" fill="white" opacity="0.8" />
      {/* Body */}
      <path d="M8 34 Q9 30 12 29 L18 31 L24 29 Q27 30 28 34 Z" fill="white" opacity="0.85" />
    </svg>
  );
}

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

        {/* SVG Illustration — placed between cards, defined here as a variable */}
        {/* Cards + connector */}
        <div className="max-w-2xl mx-auto flex flex-col items-stretch gap-0">
          {/* ── Card 1: 김종필 ── */}
          {(() => {
            const member = creator.team[0];
            const config = MEMBER_CONFIG[member.id as keyof typeof MEMBER_CONFIG];
            return (
              <motion.div
                key={member.id}
                className="relative rounded-3xl p-8 border group cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${config.glow.replace('0.4', '0.08')}, transparent)`,
                  borderColor: config.borderColor.replace('0.5', '0.2'),
                }}
                initial={{ y: -40, opacity: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
                whileHover={{ scale: 1.02, borderColor: config.borderColor, boxShadow: `0 0 40px ${config.glow}` }}
              >
                <div className="absolute -top-3.5 left-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: config.gradient }}>{config.tag}</span>
                </div>
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: config.gradient }} whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                    <HumanIcon />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm" style={{ color: config.glow.replace('0.4', '1').replace('rgba', 'rgb').replace(',0.4)', ')') }}>{member.role}</p>
                  </div>
                  <motion.span className="shrink-0 text-2xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>{config.emoji}</motion.span>
                </div>
                <p className="text-sm text-white/65 leading-relaxed mb-6">{member.description}</p>
                <div className="flex flex-wrap gap-2">
                  {config.skills.map((skill, si) => (
                    <motion.span key={skill} className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: config.borderColor.replace('0.5', '0.3'), color: 'rgba(255,255,255,0.7)', background: config.glow.replace('0.4', '0.1') }} initial={{ scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + si * 0.1 }} whileHover={{ scale: 1.1 }}>{skill}</motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })()}

          {/* ── SVG Illustration (center) ── */}
          <motion.div
            className="flex justify-center my-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
          <svg width="440" height="180" viewBox="0 0 440 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skinGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDDBB4" /><stop offset="100%" stopColor="#F4A96A" />
              </linearGradient>
              <linearGradient id="shirtGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C5CFC" /><stop offset="100%" stopColor="#5A3FD6" />
              </linearGradient>
              <linearGradient id="hairGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3D1F8C" /><stop offset="100%" stopColor="#1a0f3c" />
              </linearGradient>
              <linearGradient id="aiBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="lineGrad2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6C5CE7" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <radialGradient id="glowH" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.3" /><stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </radialGradient>
              <filter id="drop1"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#6C5CE7" floodOpacity="0.4" /></filter>
              <filter id="drop2"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3B82F6" floodOpacity="0.4" /></filter>
            </defs>

            {/* ── 김종필 (Human) ── cx=100 */}
            <circle cx="100" cy="85" r="60" fill="url(#glowH)" />
            {/* Shirt */}
            <path d="M70 148 Q73 122 84 118 L100 126 L116 118 Q127 122 130 148 Z" fill="url(#shirtGrad2)" filter="url(#drop1)" />
            <path d="M91 118 L100 128 L109 118" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />
            {/* Neck */}
            <rect x="94" y="108" width="12" height="12" rx="5" fill="url(#skinGrad2)" />
            {/* Head */}
            <ellipse cx="100" cy="85" rx="22" ry="24" fill="url(#skinGrad2)" filter="url(#drop1)" />
            {/* Hair */}
            <path d="M78 80 Q80 56 100 53 Q120 56 122 80 Q114 68 100 70 Q86 68 78 80Z" fill="url(#hairGrad2)" />
            {/* Ears */}
            <ellipse cx="78" cy="85" rx="4.5" ry="6" fill="url(#skinGrad2)" />
            <ellipse cx="122" cy="85" rx="4.5" ry="6" fill="url(#skinGrad2)" />
            {/* Eyes */}
            <ellipse cx="92" cy="83" rx="4.5" ry="5" fill="#2D1B69" />
            <ellipse cx="108" cy="83" rx="4.5" ry="5" fill="#2D1B69" />
            <circle cx="93.5" cy="81.5" r="1.7" fill="white" opacity="0.9" />
            <circle cx="109.5" cy="81.5" r="1.7" fill="white" opacity="0.9" />
            {/* Eyebrows */}
            <path d="M88 76 Q92 74 96 76" stroke="#2D1B69" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M104 76 Q108 74 112 76" stroke="#2D1B69" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Nose */}
            <path d="M99 88 Q100 91 101 88" stroke="#D4906A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Warm smile */}
            <path d="M90 95 Q100 104 110 95" stroke="#C97A50" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Blush */}
            <ellipse cx="84" cy="92" rx="7" ry="4.5" fill="#F4A096" opacity="0.35" />
            <ellipse cx="116" cy="92" rx="7" ry="4.5" fill="#F4A096" opacity="0.35" />
            {/* Labels */}
            <text x="100" y="162" textAnchor="middle" fill="#a29bfe" fontSize="12" fontWeight="700" fontFamily="system-ui">김종필</text>
            <text x="100" y="176" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="system-ui">기획자 &amp; 개발자</text>

            {/* ── Connection ── */}
            <line x1="158" y1="88" x2="208" y2="88" stroke="url(#lineGrad2)" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
            <circle r="3.5" fill="#a29bfe" opacity="0.85">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M158,88 L208,88" />
            </circle>
            <circle r="2.5" fill="#60A5FA" opacity="0.6">
              <animateMotion dur="1.8s" begin="0.7s" repeatCount="indefinite" path="M158,88 L208,88" />
            </circle>
            {/* Plus */}
            <circle cx="220" cy="88" r="20" fill="#0d0d1a" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <text x="220" y="95" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="system-ui">+</text>
            <line x1="232" y1="88" x2="282" y2="88" stroke="url(#lineGrad2)" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
            <circle r="3.5" fill="#60A5FA" opacity="0.85">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M232,88 L282,88" />
            </circle>
            <circle r="2.5" fill="#a29bfe" opacity="0.6">
              <animateMotion dur="1.8s" begin="0.9s" repeatCount="indefinite" path="M232,88 L282,88" />
            </circle>

            {/* ── AI Agent ── cx=340, wider body */}
            <circle cx="340" cy="85" r="60" fill="url(#glowA)" />
            {/* Wide shirt / body */}
            <path d="M296 148 Q300 120 316 115 L340 125 L364 115 Q380 120 384 148 Z" fill="url(#aiBodyGrad)" filter="url(#drop2)" />
            {/* Neck */}
            <rect x="333" y="108" width="14" height="10" rx="4" fill="#93C5FD" opacity="0.8" />
            {/* Head */}
            <rect x="310" y="52" width="60" height="58" rx="16" fill="url(#aiBodyGrad)" filter="url(#drop2)" />
            {/* Screen */}
            <rect x="318" y="60" width="44" height="42" rx="10" fill="#071525" opacity="0.85" />
            {/* Eyes LED */}
            <rect x="323" y="69" width="13" height="9" rx="3.5" fill="#60A5FA">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="344" y="69" width="13" height="9" rx="3.5" fill="#60A5FA">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="0.4s" repeatCount="indefinite" />
            </rect>
            {/* Smile LED */}
            <path d="M325 88 Q340 98 355 88" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
            {/* Antenna */}
            <line x1="340" y1="52" x2="340" y2="40" stroke="#93C5FD" strokeWidth="3" />
            <circle cx="340" cy="37" r="5" fill="#60A5FA">
              <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" repeatCount="indefinite" />
            </circle>
            {/* Ear sensors */}
            <rect x="306" y="70" width="6" height="14" rx="3" fill="#3B82F6" opacity="0.85" />
            <rect x="368" y="70" width="6" height="14" rx="3" fill="#3B82F6" opacity="0.85" />
            {/* Labels */}
            <text x="340" y="162" textAnchor="middle" fill="#60A5FA" fontSize="12" fontWeight="700" fontFamily="system-ui">AI Agent</text>
            <text x="340" y="176" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="system-ui">개발 파트너 &amp; 멘토</text>
          </svg>
          </motion.div>

          {/* ── Card 2: AI Agent ── */}
          {(() => {
            const member = creator.team[1];
            const config = MEMBER_CONFIG[member.id as keyof typeof MEMBER_CONFIG];
            return (
              <motion.div
                key={member.id}
                className="relative rounded-3xl p-8 border group cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${config.glow.replace('0.4', '0.08')}, transparent)`,
                  borderColor: config.borderColor.replace('0.5', '0.2'),
                }}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 80, delay: 0.15 }}
                whileHover={{ scale: 1.02, borderColor: config.borderColor, boxShadow: `0 0 40px ${config.glow}` }}
              >
                <div className="absolute -top-3.5 left-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: config.gradient }}>{config.tag}</span>
                </div>
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: config.gradient }} whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                    <AIIcon />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm" style={{ color: config.glow.replace('0.4', '1').replace('rgba', 'rgb').replace(',0.4)', ')') }}>{member.role}</p>
                  </div>
                  <motion.span className="shrink-0 text-2xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>{config.emoji}</motion.span>
                </div>
                <p className="text-sm text-white/65 leading-relaxed mb-6">{member.description}</p>
                <div className="flex flex-wrap gap-2">
                  {config.skills.map((skill, si) => (
                    <motion.span key={skill} className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: config.borderColor.replace('0.5', '0.3'), color: 'rgba(255,255,255,0.7)', background: config.glow.replace('0.4', '0.1') }} initial={{ scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + si * 0.1 }} whileHover={{ scale: 1.1 }}>{skill}</motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })()}
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
            <span className="text-white font-bold"> aicareerpath.co.kr</span>이 탄생했습니다
          </p>
        </motion.div>
      </div>
    </section>
  );
}
