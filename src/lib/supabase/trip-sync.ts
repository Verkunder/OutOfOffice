import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idea, Photo, Place, Post } from "@/lib/types";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "./client";
import type { Database } from "./database.types";

export type CloudContext = {
  client: SupabaseClient<Database>;
  userId: string;
  isAdmin: boolean;
};

export type CloudBootstrapResult =
  | {
      context: CloudContext | null;
      isAdmin: boolean;
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

export async function signInAdmin(email: string, password: string) {
  if (!hasSupabaseConfig()) {
    return { error: "Supabase env vars are missing." };
  }

  const client = createBrowserSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return {
      error:
        error?.message === "Invalid login credentials"
          ? "Аккаунт Supabase Auth не найден или пароль неверный. Создай пользователя в Authentication -> Users с этим email."
          : error?.message ?? "Не удалось войти."
    };
  }

  const isAdmin = await checkIsAdmin(client);

  if (!isAdmin) {
    await client.auth.signOut();
    return { error: "Этот email не добавлен в admin_emails." };
  }

  return { context: { client, userId: data.user.id, isAdmin } satisfies CloudContext };
}

export async function signOutAdmin() {
  if (!hasSupabaseConfig()) {
    return;
  }

  await createBrowserSupabaseClient().auth.signOut();
}

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
  const isAdmin = await checkIsAdmin(client);
  const context = session?.user.id && isAdmin ? { client, userId: session.user.id, isAdmin } : null;
  const [postsResult, placesResult, ideasResult] = await Promise.all([
    readCloudPosts(client),
    context ? readCloudPlaces(context) : Promise.resolve({ error: null, places: [] }),
    context ? readCloudIdeas(context) : Promise.resolve({ error: null, ideas: [] })
  ]);

  if (postsResult.error || (context && (placesResult.error || ideasResult.error))) {
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

  if (context && cloudPosts.length === 0 && cloudPlaces.length === 0 && cloudIdeas.length === 0) {
    await savePostsToCloud(context, fallbackPosts);
    await savePlacesToCloud(context, fallbackPlaces);
    await saveIdeasToCloud(context, fallbackIdeas);

    return {
      context,
      isAdmin,
      posts: fallbackPosts,
      places: fallbackPlaces,
      ideas: fallbackIdeas,
      seeded: true
    };
  }

  return {
    context,
    isAdmin,
    posts: cloudPosts.length > 0 ? cloudPosts : fallbackPosts,
    places: cloudPlaces.length > 0 ? cloudPlaces : fallbackPlaces,
    ideas: cloudIdeas.length > 0 ? cloudIdeas : fallbackIdeas,
    seeded: false
  };
}

async function checkIsAdmin(client: SupabaseClient<Database>) {
  const {
    data: { session }
  } = await client.auth.getSession();
  const email = session?.user.email;

  if (!email) {
    return false;
  }

  const { data, error } = await client
    .from("admin_emails")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  return !error && Boolean(data);
}

export async function savePostsToCloud(context: CloudContext, posts: Post[]) {
  if (!context.isAdmin) {
    return;
  }

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
    visibility: "public" as const
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

function dedupeItemsForCloud<T extends { id: string }>(
  userId: string,
  items: T[],
  getCloudId: (userId: string, item: T) => string
) {
  const seenIds = new Set<string>();

  return items.filter((item) => {
    const itemId = getCloudId(userId, item);

    if (seenIds.has(itemId)) {
      return false;
    }

    seenIds.add(itemId);
    return true;
  });
}

export async function saveIdeasToCloud(context: CloudContext, ideas: Idea[]) {
  if (!context.isAdmin) {
    return;
  }

  const persistableIdeas = dedupeItemsForCloud(
    context.userId,
    ideas.filter((idea) => isUuid(idea.id)),
    getCloudIdeaId
  );

  if (persistableIdeas.length === 0) {
    return;
  }

  const { error } = await context.client.from("ideas").upsert(
    persistableIdeas.map((idea) => ({
      id: getCloudIdeaId(context.userId, idea),
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

  await cleanupLegacySeedIdeas(context);
}

export async function savePlacesToCloud(context: CloudContext, places: Place[]) {
  if (!context.isAdmin) {
    return;
  }

  const persistablePlaces = dedupeItemsForCloud(
    context.userId,
    places.filter((place) => isUuid(place.id)),
    getCloudPlaceId
  );

  if (persistablePlaces.length === 0) {
    return;
  }

  const { error } = await context.client.from("places").upsert(
    persistablePlaces.map((place) => ({
      id: getCloudPlaceId(context.userId, place),
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

  await cleanupLegacySeedPlaces(context);
}

async function readCloudPosts(client: SupabaseClient<Database>) {
  const { data, error } = await client
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
  const cleanSource = photo.storage_path.split("?")[0].toLowerCase();
  const type = /\.(mov|mp4|m4v|webm|ogg)$/.test(cleanSource) ? "video" : "image";

  return {
    src: photo.storage_path,
    caption: photo.caption ?? (type === "video" ? "Видео" : "Фото"),
    type
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

function getCloudPlaceId(userId: string, place: Place) {
  const seedKey = getPlaceSeedKey(place);

  return seedKey ? buildStableUuid(`${userId}:place:${seedKey}`) : place.id;
}

function getCloudIdeaId(userId: string, idea: Idea) {
  const seedKey = getIdeaSeedKey(idea);

  return seedKey ? buildStableUuid(`${userId}:idea:${seedKey}`) : idea.id;
}

function buildStableUuid(value: string) {
  const seeds = [2166136261, 333555777, 1013904223, 2779096485];
  const hex = seeds
    .map((seed) => {
      let hash = seed;

      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index) + index + seed;
        hash = Math.imul(hash, 16777619);
      }

      return (hash >>> 0).toString(16).padStart(8, "0");
    })
    .join("");

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
    "8f9f3e0a-1d95-4e3d-a25d-6b8061f0fa25",
    "ab43a8d4-5df8-4f6d-a611-d7894f25f211",
    "1c84db3a-ed35-4ca1-b235-650b44e58c44",
    "0d8790c9-2d8b-4292-93dd-82ab10dbc161",
    "d93e2c90-235c-4ff9-b4b8-0f9b84c8e008",
    "47bed2e5-23ce-468d-b8db-55ce247b1585",
    "f8f72ed1-1c48-4c88-a6dc-2a8d5722847a",
    "b3f58dd2-7efe-48f4-b2aa-4b2c1c77f940",
    "fa4ef914-11ee-4065-88fe-239a583cc46b",
    "9e09ea09-83c5-4eb5-a480-440723b8c5ae",
    "b53b9ce0-e423-4665-9c5c-8362580b5e44",
    "bd0c0fc6-73d1-4c0a-b812-5df1f0f717fc"
  ];

  await context.client.from("posts").delete().in("id", legacySeedIds);
}

function getPlaceSeedKey(place: Place) {
  if (place.id === "ca34850c-9c36-4d93-9f4d-9276c14756fc" || place.name === "Green Drive") {
    return "green-drive";
  }

  if (place.id === "ae277e4b-5b35-43b1-aec1-0b8867e28b20" || place.name === "Москва") {
    return "moscow";
  }

  if (place.id === "1e8c887e-81d5-4a4d-837c-068d9eb77253" || place.name.includes("Yes Apart")) {
    return "yes-apart-technopark";
  }

  return undefined;
}

function getIdeaSeedKey(idea: Idea) {
  if (idea.id === "9dd5caca-e554-4b9b-a91b-2e4d0463d558") {
    return "sort-day-one-photos";
  }

  if (idea.id === "23491839-af1e-42c8-b299-96632e502619") {
    return "road-note-details";
  }

  if (idea.id === "86c27311-96a1-48ed-9f5b-169172d1bc115") {
    return "thailand-day-template";
  }

  return undefined;
}

async function cleanupLegacySeedPlaces(context: CloudContext) {
  await context.client
    .from("places")
    .delete()
    .in("id", [
      "ca34850c-9c36-4d93-9f4d-9276c14756fc",
      "ae277e4b-5b35-43b1-aec1-0b8867e28b20",
      "1e8c887e-81d5-4a4d-837c-068d9eb77253"
    ]);
}

async function cleanupLegacySeedIdeas(context: CloudContext) {
  await context.client
    .from("ideas")
    .delete()
    .in("id", [
      "9dd5caca-e554-4b9b-a91b-2e4d0463d558",
      "23491839-af1e-42c8-b299-96632e502619",
      "86c27311-96a1-48ed-9f5b-169172d1bc115"
    ]);
}
