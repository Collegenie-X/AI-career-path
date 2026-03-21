import { HeroSectionLanding } from './components/HeroSectionLanding';
import { DreamSchedulePreviewSection } from './components/DreamSchedulePreviewSection';
import { JourneyStepsSection } from './components/JourneyStepsSection';
import { ManifestoSection } from './components/ManifestoSection';
import { PersonaSection } from './components/PersonaSection';
import { CompetitorTableSection } from './components/CompetitorTableSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CTASection } from './components/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSectionLanding />
      <PersonaSection />
      <JourneyStepsSection />
      <DreamSchedulePreviewSection />
      <ManifestoSection />
      <CompetitorTableSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
