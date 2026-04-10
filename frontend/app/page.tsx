import { HeroSectionLanding } from './home/components/HeroSectionLanding';
import { DreamSchedulePreviewSection } from './home/components/DreamSchedulePreviewSection';
import { JourneyStepsSection } from './home/components/JourneyStepsSection';
import { ManifestoSection } from './home/components/ManifestoSection';
import { PersonaSection } from './home/components/PersonaSection';
import { CompetitorTableSection } from './home/components/CompetitorTableSection';
import { FeaturesSection } from './home/components/FeaturesSection';
import { CTASection } from './home/components/CTASection';
import { WebHeader } from '@/components/layout/WebHeader';
import { WebFooter } from '@/components/layout/WebFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <WebHeader />
      <main className="flex-1">
        <HeroSectionLanding />
        <PersonaSection />
        <JourneyStepsSection />
        <DreamSchedulePreviewSection />
        <ManifestoSection />
        <CompetitorTableSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <WebFooter />
    </div>
  );
}
