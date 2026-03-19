import { Brain, Sparkles } from 'lucide-react';

export function HeroIcon() {
  return (
    <div className="relative mb-6 md:mb-8">
      <div 
        className="absolute -inset-6 md:-inset-8 rounded-full animate-pulse-glow" 
        style={{ border: '2px solid rgba(108,92,231,0.2)' }} 
      />
      <div
        className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-[2rem] flex items-center justify-center relative z-10 transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
          boxShadow: '0 0 60px rgba(108,92,231,0.5)',
        }}
      >
        <Brain className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-orbit" style={{ animationDuration: '5s' }}>
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#FBBF24]" />
        </div>
      </div>
    </div>
  );
}
