import { AboutCreatorSection } from './components/AboutCreatorSection';
import { AboutPhilosophySection } from './components/AboutPhilosophySection';
import { AboutWorkStyleSection } from './components/AboutWorkStyleSection';
import { AboutMissionSection } from './components/AboutMissionSection';
import { AboutAIUsageSection } from './components/AboutAIUsageSection';
import { AboutProblemSolutionSection } from './components/AboutProblemSolutionSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <AboutCreatorSection />
      <AboutPhilosophySection />
      <AboutWorkStyleSection />
      <AboutMissionSection />
      <AboutAIUsageSection />
      <AboutProblemSolutionSection />
    </div>
  );
}
