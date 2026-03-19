// ─── Job Types ───────────────────────────────────────────────

export interface JobsPageData {
  hero: HeroSection;
  features: FeatureSection[];
  stats: StatsSection;
  cta: CTASection;
}

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  backgroundEmoji: string;
}

export interface FeatureSection {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: {
    text: string;
    href: string;
  };
}

export interface StatsSection {
  title: string;
  items: StatItem[];
}

export interface StatItem {
  icon: string;
  value: string;
  label: string;
  color: string;
}

export interface CTASection {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton: {
    text: string;
    href: string;
  };
}
