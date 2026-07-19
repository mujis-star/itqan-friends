import { Hero3D } from "@/components/three/Hero3D";
import { StatsDashboard } from "@/components/layout/StatsDashboard";
import { AboutExperience } from "@/components/sections/AboutExperience";
import { EcosystemWings } from "@/components/sections/EcosystemWings";
import { UpcomingMissions } from "@/components/sections/UpcomingMissions";
import { TimelineAchievements } from "@/components/sections/TimelineAchievements";

export default function Home() {
  return (
    <>
      <Hero3D />
      <StatsDashboard />
      <AboutExperience />
      <EcosystemWings />
      <UpcomingMissions />
      <TimelineAchievements />
    </>
  );
}
