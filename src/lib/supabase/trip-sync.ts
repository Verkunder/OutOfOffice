import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idea, Photo, Place, Post } from "@/lib/types";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "./client";
import type { Database } from "./database.types";

export type CloudContext = {
  client: SupabaseClient<Database>;
  userId: string;
};

export type CloudBootstrapResult =
  | {
      context: CloudContext;
      ideas: Idea[];
      places: Place[];
      posts: Post[];
      seeded: boolean;
    }
  | {
      error: string;
    };

type CloudPost = Database["public"]["Tables"]["posts"]["Row"];
type CloudPhoto = Database["public"]["Tables"]["photos"]["Row"];
type CloudIdea = Database["public"]["Tables"]["ideas"]["Row"];
type CloudPlace = Database["public"]["Tables"]["places"]["Row"];

type CloudPostWithPhotos = CloudPost & {
  photos?: CloudPhoto[];
};

export async function bootstrapCloudData(
  fallbackPosts: Post[],
  fallbackPlaces: Place[],
  fallbackIdeas: Idea[]
): Promise<CloudBootstrapResult> {
  if (!hasSupabaseConfig()) {
    return { error: "Supabase env vars are missing." };
  }

  const client = createBrowserSupabaseClient();
  const {
    data: { session }
  } = await client.auth.getSession();

  let userId = session?.user.id;

  if (!userId) {
    const { data, error } = await client.auth.signInAnonymously();

    if (error || !data.user) {
      return {
        error:
          error?.message ??
          "Anonymous sign-in is unavailable. Enable Anonymous Auth in Supabase."
      };
    }

    userId = data.user.id;
  }

  const context = { client, userId };
  const [postsResult, placesResult, ideasResult] = await Promise.all([
    readCloudPosts(context),
    readCloudPlaces(context),
    readCloudIdeas(context)
  ]);

  if (postsResult.error || placesResult.error || ideasResult.error) {
    return {
      error:
        postsResult.error?.message ??
        placesResult.error?.message ??
        ideasResult.error?.message ??
        "Supabase read failed."
    };
  }

  const cloudPosts = postsResult.posts;
  const cloudPlaces = placesResult.places;
  const cloudIdeas = ideasResult.ideas;

  if (cloudPosts.length === 0 && cloudPlaces.length === 0 && cloudIdeas.length === 0) {
    await savePostsToCloud(context, fallbackPosts);
    await savePlacesToCloud(context, fallbackPlaces);
    await saveIdeasToCloud(context, fallbackIdeas);

    return {
      context,
      posts: fallbackPosts,
      places: fallbackPlaces,
      ideas: fallbackIdeas,
      seeded: true
    };
  }

  return {
    context,
    posts: cloudPosts.length > 0 ? cloudPosts : fallbackPosts,
    places: cloudPlaces.length > 0 ? cloudPlaces : fallbackPlaces,
    ideas: cloudIdeas.length > 0 ? cloudIdeas : fallbackIdeas,
    seeded: false
  };
}

export async function savePostsToCloud(context: CloudContext, posts: Post[]) {
  const persistablePosts = dedupePostsForCloud(
    context.userId,
    posts.filter((post) => isUuid(post.id))
  );

  if (persistablePosts.length === 0) {
    return;
  }

  const postRows = persistablePosts.map((post) => ({
    id: getCloudPostId(context.userId, post),
    client_seed_key: post.seedKey ?? null,
    user_id: context.userId,
    title: post.title,
    body: post.body,
    mood: post.mood,
    location_name: post.locationName,
    visited_at: post.visitedAtIso ?? new Date().toISOString(),
    visibility: "private" as const
  }));

  const { error: postsError } = await context.client.from("posts").upsert(postRows);

  if (postsError) {
    throw postsError;
  }

  const postIds = persistablePosts.map((post) => getCloudPostId(context.userId, post));
  const { error: deletePhotosError } = await context.client
    .from("photos")
    .delete()
    .in("post_id", postIds);

  if (deletePhotosError) {
    throw deletePhotosError;
  }

  const photoRows = persistablePosts.flatMap((post) =>
    post.photos
      .filter((photo) => !photo.src.startsWith("blob:"))
      .map((photo) => ({
        id: crypto.randomUUID(),
        post_id: getCloudPostId(context.userId, post),
        user_id: context.userId,
        storage_path: photo.src,
        caption: photo.caption
      }))
  );

  if (photoRows.length > 0) {
    const { error: photosError } = await context.client.from("photos").insert(photoRows);

    if (photosError) {
      throw photosError;
    }
  }

  await cleanupLegacySeedPosts(context);
}

function dedupePostsForCloud(userId: string, posts: Post[]) {
  const seenPostIds = new Set<string>();

  return posts.filter((post) => {
    const postId = getCloudPostId(userId, post);

    if (seenPostIds.has(postId)) {
      return false;
    }

    seenPostIds.add(postId);
    return true;
  });
}

export async function saveIdeasToCloud(context: CloudContext, ideas: Idea[]) {
  const persistableIdeas = ideas.filter((idea) => isUuid(idea.id));

  if (persistableIdeas.length === 0) {
    return;
  }

  const { error } = await context.client.from("ideas").upsert(
    persistableIdeas.map((idea) => ({
      id: idea.id,
      user_id: context.userId,
      title: idea.title,
      status: idea.status,
      priority: 2,
      notes: idea.notes
    }))
  );

  if (error) {
    throw error;
  }
}

export async function savePlacesToCloud(context: CloudContext, places: Place[]) {
  const persistablePlaces = places.filter((place) => isUuid(place.id));

  if (persistablePlaces.length === 0) {
    return;
  }

  const { error } = await context.client.from("places").upsert(
    persistablePlaces.map((place) => ({
      id: place.id,
      user_id: context.userId,
      name: place.name,
      category: place.category,
      rating: place.rating,
      notes: place.notes
    }))
  );

  if (error) {
    throw error;
  }
}

async function readCloudPosts(context: CloudContext) {
  const { data, error } = await context.client
    .from("posts")
    .select("*, photos(*)")
    .order("visited_at", { ascending: false });

  return {
    error,
    posts: error ? [] : (data ?? []).map(mapCloudPost)
  };
}

async function readCloudIdeas(context: CloudContext) {
  const { data, error } = await context.client
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: true });

  return {
    error,
    ideas: error ? [] : (data ?? []).map(mapCloudIdea)
  };
}

async function readCloudPlaces(context: CloudContext) {
  const { data, error } = await context.client
    .from("places")
    .select("*")
    .order("created_at", { ascending: true });

  return {
    error,
    places: error ? [] : (data ?? []).map(mapCloudPlace)
  };
}

function mapCloudPost(post: CloudPostWithPhotos): Post {
  return {
    id: post.id,
    seedKey: post.client_seed_key ?? undefined,
    title: post.title,
    body: post.body,
    mood: post.mood ?? "момент",
    moodColor: pickMoodColor(post.mood),
    locationName: post.location_name ?? "Маршрут",
    visitedAt: formatJournalDate(new Date(post.visited_at)),
    visitedAtIso: post.visited_at,
    tags: buildTags(post.mood, post.location_name),
    photos: (post.photos ?? []).map(mapCloudPhoto)
  };
}

function mapCloudPhoto(photo: CloudPhoto): Photo {
  return {
    src: photo.storage_path,
    caption: photo.caption ?? "Фото"
  };
}

function mapCloudIdea(idea: CloudIdea): Idea {
  return {
    id: idea.id,
    title: idea.title,
    status: idea.status,
    notes: idea.notes ?? ""
  };
}

function mapCloudPlace(place: CloudPlace): Place {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    rating: place.rating ?? 4,
    notes: place.notes ?? ""
  };
}

function buildTags(mood: string | null, location: string | null) {
  return [mood, location]
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => tag.toLowerCase());
}

function pickMoodColor(mood?: string | null) {
  const normalizedMood = mood?.toLowerCase() ?? "";

  if (normalizedMood.includes("спокой") || normalizedMood.includes("собран")) {
    return "blue";
  }

  if (normalizedMood.includes("восторг") || normalizedMood.includes("рад")) {
    return "cyan";
  }

  if (normalizedMood.includes("удив")) {
    return "purple";
  }

  return "green";
}

function formatJournalDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getCloudPostId(userId: string, post: Post) {
  return post.seedKey ? buildStableUuid(`${userId}:${post.seedKey}`) : post.id;
}

function buildStableUuid(value: string) {
  let hash = 2166136261;
  let hex = "";

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
    hex += (hash >>> 0).toString(16).padStart(8, "0");
  }

  const normalizedHex = hex.padEnd(32, "0").slice(0, 32).split("");
  normalizedHex[12] = "5";
  normalizedHex[16] = "8";

  return `${normalizedHex.slice(0, 8).join("")}-${normalizedHex
    .slice(8, 12)
    .join("")}-${normalizedHex.slice(12, 16).join("")}-${normalizedHex
    .slice(16, 20)
    .join("")}-${normalizedHex.slice(20, 32).join("")}`;
}

async function cleanupLegacySeedPosts(context: CloudContext) {
  const legacySeedIds = [
    "0d567c13-53dd-4854-aec1-f5d459190591",
    "2637cb5a-46f5-4388-8ce9-c7fe24f51d1f",
    "7820addf-7529-4d5b-9c89-bc34b1d8746f",
    "8f9f3e0a-1d95-4e3d-a25d-6b8061f0fa25"
  ];

  await context.client.from("posts").delete().in("id", legacySeedIds);
}
