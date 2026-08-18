"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Cloud,
  CloudOff,
  Compass,
  Plane,
  LogIn,
  LogOut,
  Pencil,
  Lightbulb,
  MapPin,
  Plus,
  Sparkles,
  X
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Image,
  Input,
  Layout,
  Menu,
  Modal,
  Rate,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
  Upload
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { UploadFile, UploadProps } from "antd";
import type { Idea, Place, Post, TripStats } from "@/lib/types";
import {
  bootstrapCloudData,
  saveIdeasToCloud,
  savePlacesToCloud,
  savePostsToCloud,
  signInAdmin,
  signOutAdmin,
  type CloudContext
} from "@/lib/supabase/trip-sync";
import styles from "./app-shell.module.css";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type AppShellProps = {
  posts: Post[];
  places: Place[];
  ideas: Idea[];
  stats: TripStats;
};

type ViewKey = "journal" | "photos" | "places" | "ideas";
type SyncStatus = "local" | "connecting" | "cloud" | "error";

const viewOptions: Array<{ label: string; value: ViewKey }> = [
  { label: "Лента", value: "journal" },
  { label: "Фото", value: "photos" }
];

const workInProgressViewOptions: Array<{ label: string; value: ViewKey }> = [
  { label: "Места", value: "places" },
  { label: "Идеи", value: "ideas" }
];

const showWorkInProgress = false;

const postsStorageKey = "out-of-office.posts.v1";
const ideasStorageKey = "out-of-office.ideas.v1";
const placesStorageKey = "out-of-office.places.v1";
const rostovPostId = "0d567c13-53dd-4854-aec1-f5d459190591";
const moscowPostId = "2637cb5a-46f5-4388-8ce9-c7fe24f51d1f";
const roomPostId = "7820addf-7529-4d5b-9c89-bc34b1d8746f";
const preflightPostId = "8f9f3e0a-1d95-4e3d-a25d-6b8061f0fa25";
const flightPostId = "ab43a8d4-5df8-4f6d-a611-d7894f25f211";
const rostovSeedKey = "rostov-green-drive";
const moscowSeedKey = "moscow-arrival";
const roomSeedKey = "technopark-yes-apart";
const preflightSeedKey = "preflight-charging-work";
const flightSeedKey = "moscow-bangkok-flight";
const greenDrivePlaceId = "ca34850c-9c36-4d93-9f4d-9276c14756fc";
const moscowPlaceId = "ae277e4b-5b35-43b1-aec1-0b8867e28b20";
const roomPlaceId = "1e8c887e-81d5-4a4d-837c-068d9eb77253";

export function AppShell({ posts, places, ideas, stats }: AppShellProps) {
  const [activeView, setActiveView] = useState<ViewKey>("journal");
  const [journalPosts, setJournalPosts] = useState(posts);
  const [journalPlaces, setJournalPlaces] = useState(places);
  const [journalIdeas, setJournalIdeas] = useState(ideas);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [cloudContext, setCloudContext] = useState<CloudContext | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncMessage, setSyncMessage] = useState("Публичный просмотр");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setJournalPosts(
        sortPostsNewestFirst(
          dedupePosts(normalizeStarterPosts(readStoredValue(postsStorageKey, posts), posts))
        )
      );
      setJournalPlaces(normalizeStarterPlaces(readStoredValue(placesStorageKey, places)));
      setJournalIdeas(readStoredValue(ideasStorageKey, ideas));
      setIsStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ideas, places, posts]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    const persistablePosts = journalPosts.map((post) => ({
      ...post,
      photos: post.photos.filter((photo) => !photo.src.startsWith("blob:"))
    }));

    window.localStorage.setItem(postsStorageKey, JSON.stringify(persistablePosts));
  }, [isStorageReady, journalPosts]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    window.localStorage.setItem(ideasStorageKey, JSON.stringify(journalIdeas));
  }, [isStorageReady, journalIdeas]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    window.localStorage.setItem(placesStorageKey, JSON.stringify(journalPlaces));
  }, [isStorageReady, journalPlaces]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    let isCancelled = false;

    async function connectCloud() {
      setSyncStatus("connecting");
      setSyncMessage("Подключаю Supabase");

      const result = await bootstrapCloudData(posts, places, ideas);

      if (isCancelled) {
        return;
      }

      if ("error" in result) {
        setSyncStatus("error");
        setSyncMessage(formatSyncError(result.error));
        return;
      }

      setJournalPosts(sortPostsNewestFirst(dedupePosts(normalizeStarterPosts(result.posts, posts))));
      setJournalPlaces(normalizeStarterPlaces(result.places));
      setJournalIdeas(result.ideas);
      setCloudContext(result.context);
      setIsAdmin(result.isAdmin);
      setSyncStatus("cloud");
      setSyncMessage(result.isAdmin ? "Админ подключен" : "Публичный блог");
    }

    void connectCloud();

    return () => {
      isCancelled = true;
    };
  }, [ideas, isStorageReady, places, posts]);

  useEffect(() => {
    if (!cloudContext) {
      return;
    }

    savePostsToCloud(cloudContext, journalPosts).catch(() => {
      setSyncStatus("error");
      setSyncMessage("Не удалось сохранить записи в Supabase");
    });
  }, [cloudContext, journalPosts]);

  useEffect(() => {
    if (!cloudContext) {
      return;
    }

    saveIdeasToCloud(cloudContext, journalIdeas).catch(() => {
      setSyncStatus("error");
      setSyncMessage("Не удалось сохранить идеи в Supabase");
    });
  }, [cloudContext, journalIdeas]);

  useEffect(() => {
    if (!cloudContext) {
      return;
    }

    savePlacesToCloud(cloudContext, journalPlaces).catch(() => {
      setSyncStatus("error");
      setSyncMessage("Не удалось сохранить места в Supabase");
    });
  }, [cloudContext, journalPlaces]);

  const liveStats = useMemo<TripStats>(() => {
    const completedIdeas = journalIdeas.filter((idea) => idea.status === "done").length;

    return {
      posts: journalPosts.length,
      photos: journalPosts.reduce((sum, post) => sum + post.photos.length, 0),
      places: journalPlaces.length,
      days: getTripDays(journalPosts),
      ideasProgress:
        journalIdeas.length > 0 ? Math.round((completedIdeas / journalIdeas.length) * 100) : 0,
      currentMood: stats.currentMood
    };
  }, [journalIdeas, journalPlaces.length, journalPosts, stats.currentMood]);

  const handleToggleIdea = (ideaId: string) => {
    setJournalIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId
          ? { ...idea, status: idea.status === "done" ? "todo" : "done" }
          : idea
      )
    );
  };

  return (
    <Layout>
      <Sider breakpoint="lg" collapsedWidth="0" width={248} className={styles.sider}>
        <div className={styles.brand}>
          <Avatar size={42} className={styles.brandMark}>
            OO
          </Avatar>
          <div>
            <Text className={styles.brandTitle}>Out Of Office</Text>
            <Text className={styles.brandSubline}>Pattaya journal</Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeView]}
          onClick={({ key }) => setActiveView(key as ViewKey)}
          items={[
            { key: "journal", icon: <BookOpen size={18} />, label: "Дневник" },
            { key: "photos", icon: <Camera size={18} />, label: "Фото" },
            ...(showWorkInProgress
              ? [
                  { key: "places", icon: <MapPin size={18} />, label: "Места" },
                  { key: "ideas", icon: <Lightbulb size={18} />, label: "Идеи" }
                ]
              : [])
          ]}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerTitleBlock}>
            <Text className={styles.kicker}>Thailand · Pattaya</Text>
            <Title level={2} className={styles.pageTitle}>
              Дневник отпуска
            </Title>
          </div>
          <div className={styles.headerActions}>
            <Segmented
              options={
                showWorkInProgress
                  ? [...viewOptions, ...workInProgressViewOptions]
                  : viewOptions
              }
              value={activeView}
              onChange={(value) => setActiveView(value as ViewKey)}
            />
            {isAdmin && (
              <NewPostModal
                onCreate={(post) =>
                  setJournalPosts((currentPosts) => sortPostsNewestFirst([post, ...currentPosts]))
                }
              />
            )}
            <AdminAuthButton
              isAdmin={isAdmin}
              onSignIn={(context) => {
                setCloudContext(context);
                setIsAdmin(true);
                setSyncStatus("cloud");
                setSyncMessage("Админ подключен");
              }}
              onSignOut={() => {
                setCloudContext(null);
                setIsAdmin(false);
                setSyncStatus("cloud");
                setSyncMessage("Публичный блог");
              }}
            />
          </div>
        </Header>

        <Content className={styles.content}>
          <Row gutter={[20, 20]} className={styles.dashboardGrid}>
            <Col xs={24} xl={16}>
              <div className={styles.mainStack}>
                {activeView === "journal" && (
                  <>
                    <Hero posts={journalPosts} />
                    <Card className={styles.sectionCard}>
                      <SectionHeader
                        title="Таймлайн"
                        subtitle="Хронология первого дня, чтобы потом легко собрать историю поездки."
                      />
                      <JournalTimeline
                        isAdmin={isAdmin}
                        posts={journalPosts}
                        onUpdate={(updatedPost) =>
                          setJournalPosts((currentPosts) =>
                            sortPostsNewestFirst(
                              currentPosts.map((post) =>
                                post.id === updatedPost.id ? updatedPost : post
                              )
                            )
                          )
                        }
                      />
                    </Card>
                  </>
                )}

                {activeView === "photos" && (
                  <Card className={styles.sectionCard}>
                    <SectionHeader
                      title="Фотоистории"
                      subtitle="Все кадры первого дня в одном месте."
                    />
                    <PhotoGrid posts={journalPosts} />
                  </Card>
                )}

                {showWorkInProgress && activeView === "places" && (
                  <Card className={styles.sectionCard}>
                    <SectionHeader
                      title="Места"
                      subtitle="Точки маршрута, к которым хочется вернуться заметками."
                      action={
                        isAdmin ? (
                          <NewPlaceModal
                            onCreate={(place) =>
                              setJournalPlaces((currentPlaces) => [place, ...currentPlaces])
                            }
                          />
                        ) : null
                      }
                    />
                    <PlacesBoard places={journalPlaces} />
                  </Card>
                )}

                {showWorkInProgress && activeView === "ideas" && (
                  <Card className={styles.sectionCard}>
                    <SectionHeader
                      title="Идеи"
                      subtitle="То, что стоит дописать, проверить или сделать дальше."
                      action={
                        isAdmin ? (
                          <NewIdeaModal
                            onCreate={(idea) =>
                              setJournalIdeas((currentIdeas) => [idea, ...currentIdeas])
                            }
                          />
                        ) : null
                      }
                    />
                    <IdeasBoard ideas={journalIdeas} isAdmin={isAdmin} onToggle={handleToggleIdea} />
                  </Card>
                )}
              </div>
            </Col>

            <Col xs={24} xl={8}>
              <div className={styles.sideStack}>
                <StatsPanel
                  stats={liveStats}
                  syncMessage={syncMessage}
                  syncStatus={syncStatus}
                />
                {showWorkInProgress && (
                  <>
                    <PlacesPanel
                      isAdmin={isAdmin}
                      places={journalPlaces}
                      onCreate={(place) =>
                        setJournalPlaces((currentPlaces) => [place, ...currentPlaces])
                      }
                    />
                    <IdeasPanel
                      ideas={journalIdeas}
                      isAdmin={isAdmin}
                      onCreate={(idea) =>
                        setJournalIdeas((currentIdeas) => [idea, ...currentIdeas])
                      }
                      onToggle={handleToggleIdea}
                    />
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

function readStoredValue<T>(key: string, fallback: T) {
  try {
    const rawValue = window.localStorage.getItem(key);

    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

type AdminLoginFormValues = {
  email: string;
  password: string;
};

function AdminAuthButton({
  isAdmin,
  onSignIn,
  onSignOut
}: {
  isAdmin: boolean;
  onSignIn: (context: CloudContext) => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm<AdminLoginFormValues>();

  const handleSignOut = async () => {
    await signOutAdmin();
    onSignOut();
  };

  const handleSignIn = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setErrorMessage("");

    const result = await signInAdmin(values.email.trim().toLowerCase(), values.password);

    setLoading(false);

    if ("error" in result) {
      setErrorMessage(result.error ?? "Не удалось войти.");
      return;
    }

    onSignIn(result.context);
    form.resetFields();
    setOpen(false);
  };

  if (isAdmin) {
    return <Button icon={<LogOut size={16} />} onClick={handleSignOut}>Выйти</Button>;
  }

  return (
    <>
      <Button icon={<LogIn size={16} />} onClick={() => setOpen(true)}>
        Админ
      </Button>
      <Modal
        title="Вход администратора"
        open={open}
        onCancel={() => {
          setOpen(false);
          setErrorMessage("");
          form.resetFields();
        }}
        onOk={handleSignIn}
        confirmLoading={loading}
        okText="Войти"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Укажи email администратора" },
              { type: "email", message: "Проверь формат email" }
            ]}
          >
            <Input autoComplete="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введи пароль" }]}
          >
            <Input.Password autoComplete="current-password" placeholder="Пароль" />
          </Form.Item>
          {errorMessage && <Text type="danger">{errorMessage}</Text>}
        </Form>
      </Modal>
    </>
  );
}

function normalizeStarterPosts(posts: Post[], fallbackPosts: Post[]) {
  const migratedPosts = posts.map((post) => {
    const inferredSeedKey = post.seedKey ?? inferSeedKey(post);
    const basePost = { ...post, seedKey: inferredSeedKey, photos: dedupePhotos(post.photos) };

    if (post.id === rostovPostId || inferredSeedKey === rostovSeedKey) {
      if (post.visitedAtIso === "2026-08-16T23:47:00+03:00") {
        return { ...basePost, seedKey: rostovSeedKey };
      }

      return {
        ...basePost,
        seedKey: rostovSeedKey,
        title: "Ростов -> Москва: старт отпуска с ночной зарядки",
        body:
          "Отпуск начался не с моря, а с зарядки авто в Ростове-на-Дону. 16 августа в 23:47 стоим на Green Drive, добираем проценты перед дорогой и постепенно переключаемся в режим отпуска: впереди ночная трасса до Москвы и первый большой кусок пути к Таиланду.",
        locationName: "Ростов-на-Дону",
        visitedAt: "16 августа, 23:47",
        visitedAtIso: "2026-08-16T23:47:00+03:00",
        tags: ["зарядка", "tesla", "ростов", "первый этап"]
      };
    }

    if (post.id === moscowPostId || inferredSeedKey === moscowSeedKey) {
      if (post.visitedAtIso === "2026-08-17T14:40:00+03:00") {
        return { ...basePost, seedKey: moscowSeedKey };
      }

      return {
        ...basePost,
        seedKey: moscowSeedKey,
        title: "Москва как пересадочная точка",
        body:
          "К Москве приехали 17 августа около 14:40: после ночной дороги город встретил парковками, стеклянными фасадами, видом на Остров Мечты и ощущением, что большая часть маршрута уже позади. Это еще не финальная точка отпуска, но уже отдельная глава перед вылетом.",
        locationName: "Москва",
        visitedAt: "17 августа, 14:40",
        visitedAtIso: "2026-08-17T14:40:00+03:00",
        tags: ["москва", "город", "пересадка"]
      };
    }

    if (post.id === roomPostId || inferredSeedKey === roomSeedKey) {
      if (post.visitedAtIso === "2026-08-17T16:50:00+03:00") {
        return { ...basePost, seedKey: roomSeedKey };
      }

      return {
        ...basePost,
        seedKey: roomSeedKey,
        title: "Технопарк, Yes Apart: первая пауза в Москве",
        body:
          "После дороги добрались до Технопарка и заселились в Yes Apart. Номер 18.13 стал первой нормальной паузой маршрута: можно выдохнуть, привести себя в порядок и спокойно собраться перед следующим этапом отпуска.",
        locationName: "Технопарк, отель Yes Apart",
        visitedAt: "17 августа, 16:50",
        visitedAtIso: "2026-08-17T16:50:00+03:00",
        tags: ["технопарк", "yes apart", "отель", "пауза"]
      };
    }

    if (post.id === preflightPostId || inferredSeedKey === preflightSeedKey) {
      return { ...basePost, seedKey: preflightSeedKey };
    }

    if (post.id === flightPostId || inferredSeedKey === flightSeedKey) {
      return { ...basePost, seedKey: flightSeedKey };
    }

    return basePost;
  });

  return restoreMissingStarterPosts(migratedPosts, fallbackPosts);
}

function restoreMissingStarterPosts(posts: Post[], fallbackPosts: Post[]) {
  const existingSeedKeys = new Set(posts.map((post) => post.seedKey ?? inferSeedKey(post)));
  const missingFallbackPosts = fallbackPosts.filter((post) => {
    const seedKey = post.seedKey ?? inferSeedKey(post);

    return seedKey ? !existingSeedKeys.has(seedKey) : false;
  });

  return [...posts, ...missingFallbackPosts];
}

function normalizeStarterPlaces(places: Place[]) {
  return places.map((place) =>
    place.id === greenDrivePlaceId
      ? {
          ...place,
          notes: "Зарядка авто 16 августа в 23:47 перед ночной дорогой в Москву."
        }
      : place.id === moscowPlaceId
        ? {
            ...place,
            notes: "Приехали 17 августа около 14:40 перед следующим этапом отпуска."
          }
        : place.id === roomPlaceId
      ? {
          ...place,
          name: "Yes Apart, Технопарк",
          notes: "Первая спокойная пауза после дороги, номер 18.13."
        }
      : place
  );
}

function sortPostsNewestFirst(posts: Post[]) {
  return [...posts].sort(
    (left, right) =>
      new Date(right.visitedAtIso ?? 0).getTime() - new Date(left.visitedAtIso ?? 0).getTime()
  );
}

function dedupePosts(posts: Post[]) {
  const seenPostKeys = new Set<string>();

  return posts.filter((post) => {
    const postKey = post.seedKey ?? post.id;

    if (seenPostKeys.has(postKey)) {
      return false;
    }

    seenPostKeys.add(postKey);
    return true;
  });
}

function inferSeedKey(post: Post) {
  const photoSources = post.photos.map((photo) => photo.src);

  if (photoSources.includes("/images/day-1/charging-before-flight.jpeg")) {
    return preflightSeedKey;
  }

  if (post.id === flightPostId || post.title.toLowerCase().includes("вылетаем в бангкок")) {
    return flightSeedKey;
  }

  if (photoSources.includes("/images/day-1/green-drive.jpg")) {
    return rostovSeedKey;
  }

  if (photoSources.includes("/images/day-1/room-1813.jpg")) {
    return roomSeedKey;
  }

  if (
    photoSources.includes("/images/day-1/parking-moscow.jpg") ||
    photoSources.includes("/images/day-1/dream-island.jpg")
  ) {
    return moscowSeedKey;
  }

  return undefined;
}

function dedupePhotos(photos: Post["photos"]) {
  const seenPhotoSources = new Set<string>();

  return photos.filter((photo) => {
    if (seenPhotoSources.has(photo.src)) {
      return false;
    }

    seenPhotoSources.add(photo.src);
    return true;
  });
}

function formatSyncError(error: string) {
  if (error.includes("Anonymous sign-ins are disabled")) {
    return "Включи Anonymous Auth в Supabase";
  }

  if (error.includes("Could not find the table")) {
    return "Нужно применить Supabase schema.sql";
  }

  return "Supabase недоступен, работаем локально";
}

function Hero({ posts }: { posts: Post[] }) {
  const tripDays = getTripDays(posts);
  const latestPost = posts[0];
  const flightPost = posts.find((post) => (post.seedKey ?? inferSeedKey(post)) === flightSeedKey);

  return (
    <section className={styles.hero}>
      <Image
        src="/images/day-1/road-to-moscow.jpg"
        alt="Road to Moscow under cloudy sky"
        preview={false}
        className={styles.heroImage}
      />
      <div className={styles.heroOverlay}>
        <Tag color="green">
          {tripDays} {formatRussianPlural(tripDays, ["день", "дня", "дней"])} в пути · Ростов →
          Москва → вылет
        </Tag>
        <Title level={1}>Маршрут набирает главы</Title>
        <Paragraph>
          {latestPost
            ? `Сейчас в дневнике главное: ${latestPost.title.toLowerCase()}.`
            : "Ночная зарядка, дорога, московские виды и подготовка к вылету собираются в живой дневник."}
        </Paragraph>
        {flightPost && <FlightPlanCard />}
      </div>
    </section>
  );
}

function FlightPlanCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <Plane size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Следующий этап</Text>
        <Text className={styles.flightRoute}>{"Москва -> Бангкок"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Вылет</Text>
        <strong>18 авг · 22:25</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>В пути</Text>
        <strong>9 часов</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Бангкок</Text>
        <strong>19 авг · 11:25</strong>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <Title level={3}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>
      </div>
      {action}
    </div>
  );
}

type NewPostFormValues = {
  title: string;
  visitedAt: Dayjs;
  mood?: string;
  location?: string;
  body: string;
  photos?: UploadFile[];
  tags?: string;
};

function NewPostModal({ onCreate }: { onCreate: (post: Post) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<NewPostFormValues>();

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 6,
    multiple: true,
    listType: "picture-card",
    accept: "image/*"
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);

    onCreate({
      id: crypto.randomUUID(),
      title: values.title,
      body: values.body,
      mood: values.mood || "момент",
      moodColor: pickMoodColor(values.mood),
      locationName: values.location || "Pattaya",
      visitedAt: formatJournalDate(values.visitedAt),
      visitedAtIso: values.visitedAt.toISOString(),
      tags: buildPostTags(values.tags, values.mood, values.location),
      photos: await buildUploadedPhotos(values.photos)
    });

    setSaving(false);
    handleClose();
  };

  return (
    <>
      <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
        Запись
      </Button>
      <Modal
        title="Новая запись"
        open={open}
        onCancel={handleClose}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" initialValues={{ visitedAt: dayjs() }}>
          <Form.Item
            label="Заголовок"
            name="title"
            rules={[{ required: true, message: "Добавь заголовок записи" }]}
          >
            <Input placeholder="Например: первый вечер у моря" />
          </Form.Item>
          <Form.Item
            label="Дата и время"
            name="visitedAt"
            rules={[{ required: true, message: "Выбери дату и время" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD.MM.YYYY HH:mm"
              className={styles.datePicker}
              placeholder="Выбери момент"
            />
          </Form.Item>
          <Form.Item label="Эмоция" name="mood">
            <Input placeholder="восторг, спокойствие, удивление" />
          </Form.Item>
          <Form.Item label="Место" name="location">
            <Input placeholder="Москва, Green Drive, отель" />
          </Form.Item>
          <Form.Item label="Теги" name="tags">
            <Input placeholder="дорога, пляж, еда" />
          </Form.Item>
          <Form.Item
            label="Запись"
            name="body"
            rules={[{ required: true, message: "Добавь пару строк впечатления" }]}
          >
            <Input.TextArea rows={5} placeholder="Что случилось и как это ощущалось?" />
          </Form.Item>
          <Form.Item
            label="Фото"
            name="photos"
            valuePropName="fileList"
            getValueFromEvent={(event: { fileList?: UploadFile[] } | UploadFile[]) =>
              Array.isArray(event) ? event : event?.fileList
            }
          >
            <Upload {...uploadProps}>
              <div className={styles.uploadButton}>
                <Camera size={18} />
                Загрузить
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

async function buildUploadedPhotos(files?: UploadFile[]) {
  const photos = await Promise.all(
    (files ?? []).map(async (file, index) => {
      const originalFile = file.originFileObj;
      const src =
        originalFile instanceof File
          ? await readFileAsDataUrl(originalFile)
          : file.thumbUrl ?? file.url ?? "";

      return {
        src,
        caption: file.name || `Фото ${index + 1}`
      };
    })
  );

  return photos.filter((photo) => photo.src.length > 0);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function buildPostTags(tags?: string, mood?: string, location?: string) {
  const manualTags = (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(
    new Set(
      [...manualTags, mood, location]
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => tag.toLowerCase())
    )
  );
}

function pickMoodColor(mood?: string) {
  const normalizedMood = mood?.toLowerCase() ?? "";

  if (normalizedMood.includes("спокой")) {
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

function formatJournalDate(date: Dayjs) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date.toDate());
}

function groupPostsByDay(posts: Post[]) {
  const sortedPosts = sortPostsNewestFirst(posts);
  const sortedDayKeys = Array.from(new Set(sortedPosts.map((post) => getPostDateKey(post))));
  const earliestTime = Math.min(...sortedPosts.map((post) => getPostDate(post).getTime()));
  const earliestDay = startOfDay(
    new Date(Number.isFinite(earliestTime) ? earliestTime : Date.now())
  );

  return sortedDayKeys.map((dateKey) => {
    const groupPosts = sortedPosts.filter((post) => getPostDateKey(post) === dateKey);
    const dayDate = startOfDay(getPostDate(groupPosts[0]));
    const tripDay = Math.floor((dayDate.getTime() - earliestDay.getTime()) / 86400000) + 1;

    return {
      dateKey,
      tripDay,
      title: formatDayTitle(dayDate),
      posts: groupPosts,
      photos: groupPosts.reduce((sum, post) => sum + post.photos.length, 0)
    };
  });
}

function getTripDays(posts: Post[]) {
  const dayKeys = new Set(posts.map((post) => getPostDateKey(post)));

  return Math.max(dayKeys.size, 1);
}

function getPostDateKey(post: Post) {
  const date = getPostDate(post);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function getPostDate(post: Post) {
  const date = new Date(post.visitedAtIso ?? "");

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayTitle(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long"
  }).format(date);
}

function formatPostTime(post: Post) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(getPostDate(post));
}

function formatRussianPlural(value: number, forms: [string, string, string]) {
  const absValue = Math.abs(value) % 100;
  const lastDigit = absValue % 10;

  if (absValue > 10 && absValue < 20) {
    return forms[2];
  }

  if (lastDigit > 1 && lastDigit < 5) {
    return forms[1];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  return forms[2];
}

function getPhotoEditKey(src: string, index: number) {
  return `${src}:${index}`;
}

type NewPlaceFormValues = {
  name: string;
  category?: string;
  rating?: number;
  notes?: string;
};

function NewPlaceModal({ onCreate }: { onCreate: (place: Place) => void }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<NewPlaceFormValues>();

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSave = async () => {
    const values = await form.validateFields();

    onCreate({
      id: crypto.randomUUID(),
      name: values.name,
      category: values.category || "место",
      rating: values.rating ?? 4,
      notes: values.notes || "Нужно дополнить впечатлениями."
    });

    handleClose();
  };

  return (
    <>
      <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
        Место
      </Button>
      <Modal
        title="Новое место"
        open={open}
        onCancel={handleClose}
        onOk={handleSave}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: "место", rating: 4 }}
        >
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: "Добавь название места" }]}
          >
            <Input placeholder="Например: ночной рынок, кафе, пляж" />
          </Form.Item>
          <Form.Item label="Категория" name="category">
            <Input placeholder="кафе, отель, пляж, маршрут" />
          </Form.Item>
          <Form.Item label="Оценка" name="rating">
            <Rate allowHalf />
          </Form.Item>
          <Form.Item label="Заметка" name="notes">
            <Input.TextArea rows={4} placeholder="Чем запомнилось это место?" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

type NewIdeaFormValues = {
  title: string;
  notes?: string;
};

function NewIdeaModal({ onCreate }: { onCreate: (idea: Idea) => void }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<NewIdeaFormValues>();

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSave = async () => {
    const values = await form.validateFields();

    onCreate({
      id: crypto.randomUUID(),
      title: values.title,
      status: "todo",
      notes: values.notes || "Поймать момент и раскрыть позже."
    });

    handleClose();
  };

  return (
    <>
      <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
        Идея
      </Button>
      <Modal
        title="Новая идея"
        open={open}
        onCancel={handleClose}
        onOk={handleSave}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Идея"
            name="title"
            rules={[{ required: true, message: "Добавь короткую формулировку" }]}
          >
            <Input placeholder="Например: снять утренний пляж" />
          </Form.Item>
          <Form.Item label="Заметка" name="notes">
            <Input.TextArea rows={4} placeholder="Что нужно не забыть?" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function JournalTimeline({
  isAdmin,
  posts,
  onUpdate
}: {
  isAdmin: boolean;
  posts: Post[];
  onUpdate: (post: Post) => void;
}) {
  const dayGroups = groupPostsByDay(posts);

  return (
    <div className={styles.timelineDays}>
      {dayGroups.map((group) => (
        <section className={styles.timelineDay} key={group.dateKey}>
          <div className={styles.dayHeader}>
            <div>
              <Text className={styles.cardEyebrow}>День {group.tripDay}</Text>
              <Title level={4}>{group.title}</Title>
            </div>
            <Space size={6} wrap>
              <Tag>{group.posts.length} {formatRussianPlural(group.posts.length, ["запись", "записи", "записей"])}</Tag>
              <Tag>{group.photos} фото</Tag>
            </Space>
          </div>

          <Timeline
            items={group.posts.map((post) => ({
              color: post.moodColor,
              content: (
                <Card className={styles.entryCard}>
                  <div className={styles.entryHeader}>
                    <div className={styles.entryTitleGroup}>
                      <Text type="secondary">{formatPostTime(post)}</Text>
                      <Title level={4}>{post.title}</Title>
                    </div>
                    <Space align="start" className={styles.entryActions}>
                      <Tag color={post.moodColor}>{post.mood}</Tag>
                      {isAdmin && <EditPostModal post={post} onUpdate={onUpdate} />}
                    </Space>
                  </div>
                  <Paragraph className={styles.entryBody}>{post.body}</Paragraph>
                  {post.photos.length > 0 && (
                    <Image.PreviewGroup>
                      <div className={styles.entryImages}>
                        {post.photos.map((photo, index) => (
                          <Image
                            key={`${post.id}-${photo.src}-${index}`}
                            src={photo.src}
                            alt={photo.caption}
                          />
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  )}
                  <Flex
                    justify="space-between"
                    align="center"
                    className={styles.entryMeta}
                    style={{ paddingTop: 24 }}
                  >
                    <Text type="secondary">
                      <MapPin size={14} /> {post.locationName}
                    </Text>
                    <Space size={6}>
                      {post.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Flex>
                </Card>
              )
            }))}
          />
        </section>
      ))}
    </div>
  );
}

function EditPostModal({
  post,
  onUpdate
}: {
  post: Post;
  onUpdate: (post: Post) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedPhotoKeys, setRemovedPhotoKeys] = useState<string[]>([]);
  const [form] = Form.useForm<NewPostFormValues>();

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 6,
    multiple: true,
    listType: "picture-card",
    accept: "image/*"
  };

  const handleOpen = () => {
    form.setFieldsValue({
      title: post.title,
      visitedAt: post.visitedAtIso ? dayjs(post.visitedAtIso) : dayjs(),
      mood: post.mood,
      location: post.locationName,
      body: post.body,
      tags: post.tags.join(", "),
      photos: []
    });
    setRemovedPhotoKeys([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRemovedPhotoKeys([]);
    form.resetFields();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    const keptPhotos = post.photos.filter(
      (photo, index) => !removedPhotoKeys.includes(getPhotoEditKey(photo.src, index))
    );

    onUpdate({
      ...post,
      title: values.title,
      body: values.body,
      mood: values.mood || "момент",
      moodColor: pickMoodColor(values.mood),
      locationName: values.location || "Pattaya",
      visitedAt: formatJournalDate(values.visitedAt),
      visitedAtIso: values.visitedAt.toISOString(),
      tags: buildPostTags(values.tags, values.mood, values.location),
      photos: [...keptPhotos, ...(await buildUploadedPhotos(values.photos))]
    });

    setSaving(false);
    handleClose();
  };

  return (
    <>
      <Button
        aria-label="Редактировать запись"
        icon={<Pencil size={15} />}
        onClick={handleOpen}
        size="small"
      />
      <Modal
        title="Редактировать запись"
        open={open}
        onCancel={handleClose}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Заголовок"
            name="title"
            rules={[{ required: true, message: "Добавь заголовок записи" }]}
          >
            <Input placeholder="Например: первый вечер у моря" />
          </Form.Item>
          <Form.Item
            label="Дата и время"
            name="visitedAt"
            rules={[{ required: true, message: "Выбери дату и время" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD.MM.YYYY HH:mm"
              className={styles.datePicker}
              placeholder="Выбери момент"
            />
          </Form.Item>
          <Form.Item label="Эмоция" name="mood">
            <Input placeholder="восторг, спокойствие, удивление" />
          </Form.Item>
          <Form.Item label="Место" name="location">
            <Input placeholder="Москва, Green Drive, отель" />
          </Form.Item>
          <Form.Item label="Теги" name="tags">
            <Input placeholder="дорога, пляж, еда" />
          </Form.Item>
          <Form.Item
            label="Запись"
            name="body"
            rules={[{ required: true, message: "Добавь пару строк впечатления" }]}
          >
            <Input.TextArea rows={5} placeholder="Что случилось и как это ощущалось?" />
          </Form.Item>
          {post.photos.length > 0 && (
            <div className={styles.existingPhotos}>
              <Text type="secondary">Текущие фото</Text>
              <div className={styles.existingPhotoGrid}>
                {post.photos.map((photo, index) => {
                  const photoKey = getPhotoEditKey(photo.src, index);
                  const isRemoved = removedPhotoKeys.includes(photoKey);

                  return (
                    <div
                      className={styles.existingPhotoItem}
                      data-removed={isRemoved}
                      key={`${post.id}-${photo.src}-${index}`}
                    >
                      <Image src={photo.src} alt={photo.caption} preview={false} />
                      <button
                        aria-label={isRemoved ? "Вернуть фото" : "Удалить фото"}
                        className={styles.removePhotoButton}
                        onClick={() =>
                          setRemovedPhotoKeys((currentKeys) =>
                            currentKeys.includes(photoKey)
                              ? currentKeys.filter((key) => key !== photoKey)
                              : [...currentKeys, photoKey]
                          )
                        }
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Form.Item
            label="Добавить фото"
            name="photos"
            valuePropName="fileList"
            getValueFromEvent={(event: { fileList?: UploadFile[] } | UploadFile[]) =>
              Array.isArray(event) ? event : event?.fileList
            }
          >
            <Upload {...uploadProps}>
              <div className={styles.uploadButton}>
                <Camera size={18} />
                Загрузить
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function PhotoGrid({ posts }: { posts: Post[] }) {
  const photos = posts.flatMap((post) =>
    post.photos.map((photo) => ({ ...photo, postTitle: post.title }))
  );

  return (
    <Row gutter={[12, 12]}>
      {photos.map((photo, index) => (
        <Col xs={12} md={8} key={`${photo.postTitle}-${photo.src}-${index}`}>
          <Card className={styles.photoCard} cover={<Image src={photo.src} alt={photo.caption} />}>
            <Text strong>{photo.caption}</Text>
            <Text type="secondary">{photo.postTitle}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function PlacesBoard({ places }: { places: Place[] }) {
  return (
    <div className={styles.placesGrid}>
      {places.map((place) => (
        <Card className={styles.placeCard} key={place.id}>
          <Flex justify="space-between" gap={12} align="flex-start">
            <div>
              <Text className={styles.cardEyebrow}>{place.category}</Text>
              <Title level={4}>{place.name}</Title>
            </div>
            <Rate disabled allowHalf value={place.rating} className={styles.rate} />
          </Flex>
          <Paragraph>{place.notes}</Paragraph>
        </Card>
      ))}
    </div>
  );
}

function IdeasBoard({
  ideas,
  isAdmin,
  onToggle
}: {
  ideas: Idea[];
  isAdmin: boolean;
  onToggle: (ideaId: string) => void;
}) {
  return (
    <div className={styles.ideaBoard}>
      {ideas.map((idea) => (
        <button
          className={styles.ideaRow}
          disabled={!isAdmin}
          key={idea.id}
          type="button"
          onClick={() => {
            if (isAdmin) {
              onToggle(idea.id);
            }
          }}
        >
          <span className={styles.ideaStatus} data-done={idea.status === "done"}>
            <CheckCircle2 size={18} />
          </span>
          <span className={styles.ideaCopy}>
            <Text strong delete={idea.status === "done"}>
              {idea.title}
            </Text>
            <Text type="secondary">{idea.notes}</Text>
          </span>
          <Tag color={idea.status === "done" ? "green" : "blue"}>
            {idea.status === "done" ? "готово" : "хочу"}
          </Tag>
        </button>
      ))}
    </div>
  );
}

function StatsPanel({
  stats,
  syncMessage,
  syncStatus
}: {
  stats: TripStats;
  syncMessage: string;
  syncStatus: SyncStatus;
}) {
  const syncBadgeStatus =
    syncStatus === "cloud" ? "success" : syncStatus === "error" ? "warning" : "processing";

  return (
    <Card className={styles.panelCard}>
      <Flex align="center" justify="space-between">
        <Space>
          <Avatar className={styles.iconAvatar} icon={<Sparkles size={18} />} />
          <div>
            <Text strong>Пульс поездки</Text>
            <Text type="secondary" className={styles.blockText}>
              {stats.currentMood}
            </Text>
          </div>
        </Space>
        <Badge status="processing" text="live" />
      </Flex>
      <div className={styles.syncStatus}>
        {syncStatus === "cloud" ? <Cloud size={16} /> : <CloudOff size={16} />}
        <Badge status={syncBadgeStatus} text={syncMessage} />
      </div>
      <Row gutter={12} className={styles.statsRow}>
        <Col span={8}>
          <Statistic title="Записей" value={stats.posts} />
        </Col>
        <Col span={8}>
          <Statistic title="Фото" value={stats.photos} />
        </Col>
        <Col span={8}>
          <Statistic title="Дней" value={stats.days} />
        </Col>
      </Row>
    </Card>
  );
}

function PlacesPanel({
  isAdmin,
  places,
  onCreate
}: {
  isAdmin: boolean;
  places: Place[];
  onCreate: (place: Place) => void;
}) {
  return (
    <Card
      className={styles.panelCard}
      title={
        <Space>
          <Compass size={18} />
          Места
        </Space>
      }
      extra={isAdmin ? <NewPlaceModal onCreate={onCreate} /> : null}
    >
      <div className={styles.panelList}>
        {places.map((place) => (
          <div className={styles.panelItem} key={place.id}>
            <Flex justify="space-between" gap={8}>
              <Text strong>{place.name}</Text>
              <Rate disabled allowHalf value={place.rating} className={styles.rate} />
            </Flex>
            <div className={styles.itemDescription}>
              <Tag>{place.category}</Tag>
              <Text type="secondary">{place.notes}</Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function IdeasPanel({
  ideas,
  isAdmin,
  onCreate,
  onToggle
}: {
  ideas: Idea[];
  isAdmin: boolean;
  onCreate: (idea: Idea) => void;
  onToggle: (ideaId: string) => void;
}) {
  return (
    <Card
      className={styles.panelCard}
      title={
        <Space>
          <Lightbulb size={18} />
          Идеи
        </Space>
      }
      extra={isAdmin ? <NewIdeaModal onCreate={onCreate} /> : null}
    >
      <div className={styles.panelList}>
        {ideas.map((idea) => (
          <button
            className={styles.panelItemButton}
            disabled={!isAdmin}
            key={idea.id}
            type="button"
            onClick={() => {
              if (isAdmin) {
                onToggle(idea.id);
              }
            }}
          >
            <Text strong>{idea.title}</Text>
            <div className={styles.itemDescription}>
              <Tag color={idea.status === "done" ? "green" : "blue"}>
                {idea.status === "done" ? "готово" : "хочу"}
              </Tag>
              <Text type="secondary">{idea.notes}</Text>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
