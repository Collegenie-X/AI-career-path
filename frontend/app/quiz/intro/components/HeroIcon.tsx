import { Brain, Sparkles } from 'lucide-react';

export function HeroIcon() {
  return (
    <div className="relative mb-5">
      <div className="absolute -inset-4 rounded-full animate-pulse-glow" style={{ border: '2px solid rgba(108,92,231,0.2)' }} />
      <div
        className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center relative z-10"
        style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
          boxShadow: '0 0 40px rgba(108,92,231,0.4)',
        }}
      >
        <Brain className="w-10 h-10 text-white" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-orbit" style={{ animationDuration: '5s' }}>
          <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
        </div>
      </div>
    </div>
  );
}
