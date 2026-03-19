export const TOP_STRATEGY_HUB_UI_CONFIG = {
  sectionIcons: {
    strategy2028: 'Zap',
    aiProject: 'Rocket',
    paperMaker: 'FlaskConical',
    gradeRoadmap: 'Calendar',
  },
  gradeIcons: {
    grade1: '🌱',
    grade2: '🌿',
    grade3: '🌳',
  },
  detailSectionIcons: {
    necessity: '💡',
    advantage: '✨',
    evidence: '📝',
    checklist: '✅',
    cards: '🎯',
    qa: '💭',
  },
  colors: {
    sections: {
      strategy2028: {
        primary: 'rgba(99,102,241,0.35)',
        secondary: 'rgba(139,92,246,0.35)',
        border: 'rgba(129,140,248,0.8)',
        text: '#e0e7ff',
        shadow: 'rgba(99,102,241,0.4)',
      },
      aiProject: {
        primary: 'rgba(99,102,241,0.35)',
        secondary: 'rgba(139,92,246,0.35)',
        border: 'rgba(129,140,248,0.8)',
        text: '#e0e7ff',
        shadow: 'rgba(99,102,241,0.4)',
      },
      paperMaker: {
        primary: 'rgba(99,102,241,0.35)',
        secondary: 'rgba(139,92,246,0.35)',
        border: 'rgba(129,140,248,0.8)',
        text: '#e0e7ff',
        shadow: 'rgba(99,102,241,0.4)',
      },
      gradeRoadmap: {
        primary: 'rgba(99,102,241,0.35)',
        secondary: 'rgba(139,92,246,0.35)',
        border: 'rgba(129,140,248,0.8)',
        text: '#e0e7ff',
        shadow: 'rgba(99,102,241,0.4)',
      },
    },
    grades: {
      active: {
        primary: 'rgba(34,197,94,0.3)',
        secondary: 'rgba(16,185,129,0.3)',
        border: 'rgba(74,222,128,0.8)',
        text: '#d1fae5',
        shadow: 'rgba(34,197,94,0.4)',
      },
      inactive: {
        background: 'rgba(255,255,255,0.05)',
        border: 'rgba(148,163,184,0.25)',
        text: '#cbd5e1',
      },
    },
    infoBlocks: {
      necessity: {
        background: 'bg-amber-400/10',
        border: 'border-amber-300/40',
        text: 'text-amber-100',
        accent: 'rgba(251,191,36,0.5)',
      },
      advantage: {
        background: 'bg-pink-500/10',
        border: 'border-pink-300/40',
        text: 'text-pink-100',
        accent: 'rgba(236,72,153,0.5)',
      },
      evidence: {
        background: 'bg-sky-500/10',
        border: 'border-sky-300/40',
        text: 'text-sky-100',
        accent: 'rgba(14,165,233,0.5)',
      },
      checklist: {
        background: 'bg-blue-500/10',
        border: 'border-blue-300/40',
        text: 'text-blue-100',
        accent: 'rgba(59,130,246,0.5)',
      },
    },
  },
  animations: {
    buttonHover: 'hover:scale-105 active:scale-95',
    cardHover: 'hover:scale-[1.01]',
    shimmer: 'group-hover:translate-x-full transition-transform duration-700',
  },
} as const;
