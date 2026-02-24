'use client';

import { ChevronRight } from 'lucide-react';

interface Step {
  emoji: string;
  label: string;
}

interface ProcessStepsProps {
  steps: Step[];
  color: string;
  colorLight: string;
  slideIndex: number;
}

export function ProcessSteps({ steps, color, colorLight, slideIndex }: ProcessStepsProps) {
  return (
    <div
      className="flex items-center gap-2 mt-6 animate-slide-up"
      key={`steps-${slideIndex}`}
      style={{ animationDelay: '0.3s' }}
    >
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl"
            style={{
              backgroundColor: `${color}18`,
              border: `1px solid ${color}33`,
              minWidth: 68,
            }}
          >
            <span className="text-xl">{step.emoji}</span>
            <span
              className="text-[10px] font-semibold text-center leading-tight"
              style={{ color: colorLight }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight
              className="w-4 h-4 flex-shrink-0"
              style={{ color: `${color}66` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
