'use client';

import { motion, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';

function FloatingParticle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-purple-400/30"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.3, 1],
      }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

function OrbitingDot({ radius, speed, color, startAngle }: { radius: number; speed: number; color: string; startAngle: number }) {
  const [angle, setAngle] = useState(startAngle);
  const lastTimeRef = useRef<number | null>(null);

  useAnimationFrame((time) => {
    if (lastTimeRef.current !== null) {
      const delta = time - lastTimeRef.current;
      setAngle((prev) => prev + speed * delta * 0.001);
    }
    lastTimeRef.current = time;
  });

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <div
      className="absolute w-3 h-3 rounded-full shadow-lg"
      style={{
        background: color,
        transform: `translate(${x}px, ${y}px)`,
        left: '50%',
        top: '50%',
        marginLeft: -6,
        marginTop: -6,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  );
}

export function AboutHeroSection() {
  const particles = [
    { x: 5, y: 20, delay: 0, size: 6 },
    { x: 15, y: 70, delay: 0.5, size: 4 },
    { x: 25, y: 40, delay: 1, size: 8 },
    { x: 80, y: 15, delay: 0.3, size: 5 },
    { x: 90, y: 60, delay: 0.8, size: 7 },
    { x: 70, y: 80, delay: 1.2, size: 4 },
    { x: 45, y: 90, delay: 0.6, size: 6 },
    { x: 60, y: 10, delay: 1.5, size: 5 },
    { x: 35, y: 55, delay: 0.2, size: 3 },
    { x: 88, y: 35, delay: 0.9, size: 6 },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Animated SVG */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 100 }}
        >
          <div className="relative w-48 h-48">
            {/* Orbit rings */}
            <motion.div
              className="absolute inset-0 rounded-full border border-purple-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-blue-500/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-purple-400/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Orbiting dots */}
            <div className="absolute inset-0">
              <OrbitingDot radius={90} speed={0.8} color="#a855f7" startAngle={0} />
              <OrbitingDot radius={68} speed={-1.2} color="#3b82f6" startAngle={Math.PI} />
              <OrbitingDot radius={46} speed={1.8} color="#ec4899" startAngle={Math.PI / 2} />
            </div>

            {/* Center SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Rocket body */}
                <motion.path
                  d="M40 8 C48 16 52 28 52 40 L40 52 L28 40 C28 28 32 16 40 8Z"
                  fill="url(#rocketGrad)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                {/* Rocket window */}
                <circle cx="40" cy="32" r="6" fill="rgba(255,255,255,0.9)" />
                <circle cx="40" cy="32" r="3.5" fill="url(#windowGrad)" />
                {/* Rocket fins */}
                <path d="M28 40 L20 52 L32 48Z" fill="url(#finGrad)" />
                <path d="M52 40 L60 52 L48 48Z" fill="url(#finGrad)" />
                {/* Exhaust flames */}
                <motion.ellipse
                  cx="40"
                  cy="56"
                  rx="6"
                  ry="10"
                  fill="url(#flameGrad)"
                  animate={{ ry: [8, 14, 8], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.ellipse
                  cx="40"
                  cy="58"
                  rx="3"
                  ry="6"
                  fill="url(#innerFlameGrad)"
                  animate={{ ry: [4, 8, 4], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
                {/* Stars */}
                <motion.circle
                  cx="18" cy="20" r="1.5" fill="white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.circle
                  cx="62" cy="15" r="2" fill="white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle
                  cx="14" cy="45" r="1.5" fill="white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
                />
                <motion.circle
                  cx="68" cy="38" r="1.5" fill="white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
                />

                <defs>
                  <linearGradient id="rocketGrad" x1="28" y1="8" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="finGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <radialGradient id="windowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </radialGradient>
                  <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="innerFlameGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-semibold tracking-widest uppercase mb-6">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.span>
            About Us
            <motion.span
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.span>
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <span className="block">AI와 함께</span>
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            커리어를 설계하다
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          한 사람의 경험 + AI의 능력 = 모든 학생을 위한 커리어 플랫폼
          <br />
          <span className="text-purple-400 font-semibold">aicareerpath.com</span>이 탄생한 이야기
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="flex flex-col items-center gap-2 text-white/30 text-sm"
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>스크롤하여 더 알아보기</span>
          <motion.div
            className="w-0.5 h-8 bg-gradient-to-b from-purple-400/60 to-transparent mx-auto"
            animate={{ scaleY: [0, 1, 0], y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
