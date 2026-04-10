import { HeroSectionLanding } from './home/components/HeroSectionLanding';
import { DreamSchedulePreviewSection } from './home/components/DreamSchedulePreviewSection';
import { JourneyStepsSection } from './home/components/JourneyStepsSection';
import { ManifestoSection } from './home/components/ManifestoSection';
import { PersonaSection } from './home/components/PersonaSection';
import { CompetitorTableSection } from './home/components/CompetitorTableSection';
import { FeaturesSection } from './home/components/FeaturesSection';
import { CTASection } from './home/components/CTASection';
import { GameAchievementsMarquee } from './home/components/GameAchievementsMarquee';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSectionLanding />
      <GameAchievementsMarquee />
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
