import { AboutHeroSection } from './components/AboutHeroSection';
import { AboutCreatorSectionNew } from './components/AboutCreatorSectionNew';
import { AboutPhilosophySectionNew } from './components/AboutPhilosophySectionNew';
import { AboutMissionSectionNew } from './components/AboutMissionSectionNew';
import { AboutFunFactsSection } from './components/AboutFunFactsSection';
import { AboutAIUsageSection } from './components/AboutAIUsageSection';
import { AboutProblemSolutionSectionNew } from './components/AboutProblemSolutionSectionNew';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <AboutHeroSection />
      <AboutCreatorSectionNew />
      <AboutPhilosophySectionNew />
      <AboutMissionSectionNew />
      <AboutFunFactsSection />
      <AboutAIUsageSection />
      <AboutProblemSolutionSectionNew />
    </div>
  );
}
