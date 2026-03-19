import { HeroSectionLanding } from './components/HeroSectionLanding';
import { ManifestoSection } from './components/ManifestoSection';
import { PersonaSection } from './components/PersonaSection';
import { CompetitorTableSection } from './components/CompetitorTableSection';
import { ProcessStepsSection } from './components/ProcessStepsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CTASection } from './components/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSectionLanding />
      <ManifestoSection />
      <PersonaSection />
      <CompetitorTableSection />
      <ProcessStepsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
