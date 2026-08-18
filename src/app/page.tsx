import { AppShell } from "@/components/app-shell";
import { initialIdeas, initialPlaces, initialPosts, tripStats } from "@/lib/trip-data";

export default function Home() {
  return (
    <AppShell
      posts={initialPosts}
      places={initialPlaces}
      ideas={initialIdeas}
      stats={tripStats}
    />
  );
}
