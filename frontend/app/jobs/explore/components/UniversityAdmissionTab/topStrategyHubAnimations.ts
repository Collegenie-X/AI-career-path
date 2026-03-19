export const STRATEGY_HUB_ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  button: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  card: {
    hover: { scale: 1.01, y: -2 },
    transition: { duration: 0.2 },
  },
  badge: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { delay: 0.2, type: 'spring' },
  },
  shimmer: {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
} as const;

export const STRATEGY_HUB_KEYFRAMES = `
@keyframes strategy-pulse {
  0%, 100% { 
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  50% { 
    box-shadow: 0 4px 20px rgba(99,102,241,0.5);
  }
}

@keyframes strategy-glow {
  0%, 100% { 
    border-color: rgba(129,140,248,0.6);
  }
  50% { 
    border-color: rgba(129,140,248,0.9);
  }
}

@keyframes grade-unlock {
  0% { 
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  60% { 
    transform: scale(1.1) rotate(5deg);
  }
  100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes card-reveal {
  0% { 
    transform: translateY(20px);
    opacity: 0;
  }
  100% { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes icon-bounce {
  0%, 100% { 
    transform: translateY(0);
  }
  50% { 
    transform: translateY(-4px);
  }
}
`;
