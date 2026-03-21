'use client';

import { Map, CalendarX, Lock, AlertCircle, Database, Bot, Users, FileText } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = {
  'map-off': Map,
  'calendar-x': CalendarX,
  'lock': Lock,
  'alert-circle': AlertCircle,
  'database': Database,
  'bot': Bot,
  'users': Users,
  'file-text': FileText,
} as const;

export function AboutProblemSolutionSection() {
  const { problemSolution } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-white/[0.015]">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {problemSolution.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{problemSolution.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {problemSolution.problems.map((problem, index) => {
            const Icon = ICON_MAP[problem.icon as keyof typeof ICON_MAP];
            return (
              <div
                key={problem.id}
                className="rounded-2xl p-7 bg-white/[0.03] border border-white/8 hover:border-red-500/30 hover:scale-105 transition-all duration-300 group"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms both` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                  style={{ background: `${problem.color}18` }}
                >
                  <Icon className="w-6 h-6" style={{ color: problem.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{problem.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{problem.description}</p>
              </div>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {problemSolution.solution.title}
            </h3>
            <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemSolution.solution.features.map((feature, index) => {
              const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
              return (
                <div
                  key={feature.id}
                  className="rounded-2xl p-7 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 hover:scale-105 transition-all duration-300 group"
                  style={{ animation: `fadeInUp 0.6s ease-out ${(index + 4) * 100}ms both` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
