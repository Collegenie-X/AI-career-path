import { AboutHeroSection } from './components/AboutHeroSection';
import { AboutMissionSection } from './components/AboutMissionSection';
import { AboutTeamSection } from './components/AboutTeamSection';
import { AboutCTASection } from './components/AboutCTASection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <AboutHeroSection />
      <AboutMissionSection />
      <AboutTeamSection />
      <AboutCTASection />
    </div>
  );
}
