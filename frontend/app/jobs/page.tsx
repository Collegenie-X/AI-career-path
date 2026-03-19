'use client';

import jobsContentData from '@/data/jobs-content.json';
import {
  HeroSection,
  FeatureCard,
  StatsSection,
  CTASection,
  BackgroundEffects,
} from './components';
import { LABELS } from './config';
import type { JobsPageData } from './types';

const jobsContent = jobsContentData as JobsPageData;

export default function JobsPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        paddingBottom: '2rem',
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
              {LABELS.page_title}
            </h1>
            <p className="text-xs text-gray-400">
              {LABELS.page_subtitle}
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
            {LABELS.features_section_title}
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

    </div>
  );
}
