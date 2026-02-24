'use client';

import { TabBar } from '@/components/tab-bar';
import jobsContentData from '@/data/jobs-content.json';
import {
  HeroSection,
  FeatureCard,
  StatsSection,
  CTASection,
  BackgroundEffects,
} from './components';
import type { JobsPageData } from './types';

const jobsContent = jobsContentData as JobsPageData;

export default function JobsPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Background Effects */}
      <BackgroundEffects />

      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(18,18,42,0.97)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              직업 탐색
            </h1>
            <p className="text-xs text-gray-400">
              나에게 맞는 직업을 찾아보세요
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-2xl">💼</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6 space-y-6">
        {/* Hero Section */}
        <HeroSection data={jobsContent.hero} />

        {/* Features Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            ✨ 주요 기능
          </h2>
          <div className="space-y-3">
            {jobsContent.features.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection data={jobsContent.stats} />

        {/* CTA Section */}
        <CTASection data={jobsContent.cta} />
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
