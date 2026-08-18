export type Photo = {
  src: string;
  caption: string;
};

export type Post = {
  id: string;
  seedKey?: string;
  title: string;
  body: string;
  mood: string;
  moodColor: string;
  locationName: string;
  visitedAt: string;
  visitedAtIso?: string;
  tags: string[];
  photos: Photo[];
};

export type Place = {
  id: string;
  name: string;
  category: string;
  rating: number;
  notes: string;
};

export type Idea = {
  id: string;
  title: string;
  status: "todo" | "done";
  notes: string;
};

export type TripStats = {
  posts: number;
  photos: number;
  places: number;
  days: number;
  ideasProgress: number;
  currentMood: string;
};
