"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
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
  Maximize2,
  Plus,
  Search,
  Sparkles,
  Waves,
  X
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Carousel,
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
type PhotoFilter = "all" | "photos" | "videos";

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
const vdnhPostId = "1c84db3a-ed35-4ca1-b235-650b44e58c44";
const flightStoryPostId = "0d8790c9-2d8b-4292-93dd-82ab10dbc161";
const thailandRoadPostId = "d93e2c90-235c-4ff9-b4b8-0f9b84c8e008";
const mayaanaPostId = "47bed2e5-23ce-468d-b8db-55ce247b1585";
const pattayaNightPostId = "f8f72ed1-1c48-4c88-a6dc-2a8d5722847a";
const firstSeaPostId = "b3f58dd2-7efe-48f4-b2aa-4b2c1c77f940";
const poolChillPostId = "fa4ef914-11ee-4065-88fe-239a583cc46b";
const marketEveningPostId = "9e09ea09-83c5-4eb5-a480-440723b8c5ae";
const dolceVitaPostId = "b53b9ce0-e423-4665-9c5c-8362580b5e44";
const seaDayPostId = "bd0c0fc6-73d1-4c0a-b812-5df1f0f717fc";
const khaoKheowPostId = "0662d537-84b6-4cf6-afa0-0ebdb90470c8";
const ayutthayaPostId = "2f9b0d5d-7e8d-4f15-95b4-cda41c2a0c71";
const terminal21FirstPostId = "9ffca100-b6b6-4816-b07e-3fb7779a8402";
const terminal21SecondPostId = "8f466c9a-7fb1-40b4-90e6-f24f70cfbf46";
const show99PostId = "951b3081-988f-4885-a4a6-2142a1f8e9bb";
const returnFlightPostId = "75be3c51-1836-492b-b18a-42b542d4eb96";
const rostovSeedKey = "rostov-green-drive";
const moscowSeedKey = "moscow-arrival";
const roomSeedKey = "technopark-yes-apart";
const preflightSeedKey = "preflight-charging-work";
const flightSeedKey = "moscow-bangkok-flight";
const vdnhSeedKey = "vdnh-before-flight";
const flightStorySeedKey = "moscow-bangkok-flight-story";
const thailandRoadSeedKey = "bangkok-to-pattaya-road";
const mayaanaSeedKey = "mayaana-beach-resort-arrival";
const pattayaNightSeedKey = "pattaya-night-food-foggy-sanctuary";
const firstSeaSeedKey = "first-sea-breakfast-ganesha";
const poolChillSeedKey = "pool-sea-pina-colada-chill";
const marketEveningSeedKey = "local-restaurant-market-evening";
const dolceVitaSeedKey = "dolce-vita-catamaran-islands";
const seaDaySeedKey = "full-day-by-the-sea";
const khaoKheowSeedKey = "khao-kheow-open-zoo";
const ayutthayaSeedKey = "ayutthaya-historic-city";
const terminal21FirstSeedKey = "terminal-21-pattaya-first-walk";
const terminal21SecondSeedKey = "terminal-21-pattaya-second-walk";
const show99SeedKey = "pattaya-show-99";
const returnFlightSeedKey = "bangkok-moscow-flight-tesla-road";
const ayutthayaHeroImage = "/images/day-9/ayutthaya-hero.jpeg";
const greenDrivePlaceId = "ca34850c-9c36-4d93-9f4d-9276c14756fc";
const moscowPlaceId = "ae277e4b-5b35-43b1-aec1-0b8867e28b20";
const roomPlaceId = "1e8c887e-81d5-4a4d-837c-068d9eb77253";
const ayutthayaPlaceId = "7aa1d2c5-0e56-4f5b-a7f0-0bd543c20157";

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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const selectedPost = useMemo(
    () => journalPosts.find((post) => post.id === selectedPostId) ?? null,
    [journalPosts, selectedPostId]
  );

  const handleOpenPost = (post: Post, photoIndex = 0) => {
    setSelectedPostId(post.id);
    setSelectedPhotoIndex(photoIndex);
  };

  const handleClosePost = () => {
    setSelectedPostId(null);
    setSelectedPhotoIndex(0);
  };

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
          <span className={styles.brandMark} aria-label="Out Of Office" role="img" />
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
            <span className={styles.headerMark} aria-hidden="true" />
            <div>
              <Text className={styles.kicker}>Thailand · Pattaya</Text>
              <Title level={2} className={styles.pageTitle}>
                Дневник отпуска
              </Title>
            </div>
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
                    <TripNavigator onOpen={handleOpenPost} posts={journalPosts} />
                    <Card className={styles.sectionCard} id="timeline">
                      <SectionHeader
                        title="Таймлайн"
                        subtitle="Живая хронология маршрута: дорога, перелет, Паттайя и новые главы по мере поездки."
                      />
                      <JournalTimeline
                        isAdmin={isAdmin}
                        onOpen={handleOpenPost}
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
                      subtitle="Все фото и видео по главам поездки: дорога, Паттайя, острова, море и новые дни."
                    />
                    <PhotoGrid posts={journalPosts} onOpen={handleOpenPost} />
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
          <PostDetailsModal
            onClose={handleClosePost}
            onPhotoChange={setSelectedPhotoIndex}
            post={selectedPost}
            selectedPhotoIndex={selectedPhotoIndex}
          />
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

    if (post.id === vdnhPostId || inferredSeedKey === vdnhSeedKey) {
      return { ...basePost, seedKey: vdnhSeedKey };
    }

    if (post.id === flightStoryPostId || inferredSeedKey === flightStorySeedKey) {
      return { ...basePost, seedKey: flightStorySeedKey };
    }

    if (post.id === thailandRoadPostId || inferredSeedKey === thailandRoadSeedKey) {
      return { ...basePost, seedKey: thailandRoadSeedKey };
    }

    if (post.id === mayaanaPostId || inferredSeedKey === mayaanaSeedKey) {
      return { ...basePost, seedKey: mayaanaSeedKey };
    }

    if (post.id === pattayaNightPostId || inferredSeedKey === pattayaNightSeedKey) {
      return { ...basePost, seedKey: pattayaNightSeedKey };
    }

    if (post.id === firstSeaPostId || inferredSeedKey === firstSeaSeedKey) {
      return { ...basePost, seedKey: firstSeaSeedKey };
    }

    if (post.id === poolChillPostId || inferredSeedKey === poolChillSeedKey) {
      return { ...basePost, seedKey: poolChillSeedKey };
    }

    if (post.id === marketEveningPostId || inferredSeedKey === marketEveningSeedKey) {
      return { ...basePost, seedKey: marketEveningSeedKey };
    }

    if (post.id === dolceVitaPostId || inferredSeedKey === dolceVitaSeedKey) {
      return { ...basePost, seedKey: dolceVitaSeedKey };
    }

    if (post.id === seaDayPostId || inferredSeedKey === seaDaySeedKey) {
      return { ...basePost, seedKey: seaDaySeedKey };
    }

    if (post.id === khaoKheowPostId || inferredSeedKey === khaoKheowSeedKey) {
      return { ...basePost, seedKey: khaoKheowSeedKey };
    }

    if (post.id === ayutthayaPostId || inferredSeedKey === ayutthayaSeedKey) {
      const fallbackPost = fallbackPosts.find(
        (fallbackPost) => (fallbackPost.seedKey ?? inferSeedKey(fallbackPost)) === ayutthayaSeedKey
      );

      return fallbackPost
        ? { ...fallbackPost, id: basePost.id, seedKey: ayutthayaSeedKey }
        : { ...basePost, seedKey: ayutthayaSeedKey };
    }

    if (post.id === terminal21FirstPostId || inferredSeedKey === terminal21FirstSeedKey) {
      return { ...basePost, seedKey: terminal21FirstSeedKey };
    }

    if (post.id === terminal21SecondPostId || inferredSeedKey === terminal21SecondSeedKey) {
      return { ...basePost, seedKey: terminal21SecondSeedKey };
    }

    if (post.id === show99PostId || inferredSeedKey === show99SeedKey) {
      return { ...basePost, seedKey: show99SeedKey };
    }

    if (post.id === returnFlightPostId || inferredSeedKey === returnFlightSeedKey) {
      return { ...basePost, seedKey: returnFlightSeedKey };
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

  if (
    post.id === vdnhPostId ||
    photoSources.includes("/images/day-2/vdnh-main-gate-portrait.jpeg")
  ) {
    return vdnhSeedKey;
  }

  if (
    post.id === flightStoryPostId ||
    photoSources.includes("/images/day-2/night-flight-city-lights.jpeg")
  ) {
    return flightStorySeedKey;
  }

  if (
    post.id === thailandRoadPostId ||
    photoSources.includes("/images/day-2/pattaya-road-sign.jpeg")
  ) {
    return thailandRoadSeedKey;
  }

  if (
    post.id === mayaanaPostId ||
    photoSources.includes("/images/day-2/mayaana-welcome-drinks.jpeg")
  ) {
    return mayaanaSeedKey;
  }

  if (
    post.id === pattayaNightPostId ||
    photoSources.includes("/images/day-2/sanctuary-of-truth-fog-night.jpeg")
  ) {
    return pattayaNightSeedKey;
  }

  if (
    post.id === firstSeaPostId ||
    photoSources.includes("/images/day-3/first-sea-couple-selfie.jpeg")
  ) {
    return firstSeaSeedKey;
  }

  if (
    post.id === poolChillPostId ||
    photoSources.includes("/images/day-4/pina-colada-pool.jpeg")
  ) {
    return poolChillSeedKey;
  }

  if (
    post.id === marketEveningPostId ||
    photoSources.includes("/videos/day-5/pattaya-market-walk.mov")
  ) {
    return marketEveningSeedKey;
  }

  if (
    post.id === dolceVitaPostId ||
    photoSources.includes("/images/day-6/snorkeling-water-kiss.jpeg") ||
    photoSources.includes("/images/day-6/pineapple-on-catamaran.jpeg")
  ) {
    return dolceVitaSeedKey;
  }

  if (
    post.id === seaDayPostId ||
    photoSources.includes("/images/day-7/sea-day-flower-hair.jpeg") ||
    photoSources.includes("/images/day-7/sea-day-cocktails-pool.jpeg")
  ) {
    return seaDaySeedKey;
  }

  if (
    post.id === khaoKheowPostId ||
    photoSources.includes("/images/day-8/khao-kheow-giraffe-feeding.jpeg") ||
    photoSources.includes("/videos/day-8/khao-kheow-zoo-cart.mov")
  ) {
    return khaoKheowSeedKey;
  }

  if (
    post.id === terminal21FirstPostId ||
    photoSources.includes("/images/day-10/terminal-21-gate2-high-five.jpeg") ||
    photoSources.includes("/images/day-10/terminal-21-plane-couple.jpeg")
  ) {
    return terminal21FirstSeedKey;
  }

  if (
    post.id === terminal21SecondPostId ||
    photoSources.includes("/images/day-11/terminal-21-paris-tower.jpeg") ||
    photoSources.includes("/images/day-11/terminal-21-japan-masks.jpeg")
  ) {
    return terminal21SecondSeedKey;
  }

  if (post.id === show99PostId || post.title.toLowerCase().includes("шоу 99")) {
    return show99SeedKey;
  }

  if (
    post.id === returnFlightPostId ||
    photoSources.includes("/images/day-13/bangkok-moscow-seat-selfie.jpeg") ||
    photoSources.includes("/images/day-13/flight-map-near-samara.jpeg")
  ) {
    return returnFlightSeedKey;
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

function isVideoMedia(photo: Post["photos"][number]) {
  const cleanSource = photo.src.split("?")[0].toLowerCase();

  return photo.type === "video" || /\.(mov|mp4|m4v|webm|ogg)$/.test(cleanSource);
}

function MediaPreview({ photo, preview = true }: { photo: Post["photos"][number]; preview?: boolean }) {
  if (isVideoMedia(photo)) {
    return (
      <video
        className={styles.mediaVideo}
        controls
        playsInline
        preload="metadata"
        src={photo.src}
        title={photo.caption}
      />
    );
  }

  return <Image src={photo.src} alt={photo.caption} preview={preview} />;
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
  const mayaanaPost = posts.find((post) => (post.seedKey ?? inferSeedKey(post)) === mayaanaSeedKey);
  const pattayaNightPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === pattayaNightSeedKey
  );
  const firstSeaPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === firstSeaSeedKey
  );
  const poolChillPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === poolChillSeedKey
  );
  const marketEveningPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === marketEveningSeedKey
  );
  const dolceVitaPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === dolceVitaSeedKey
  );
  const seaDayPost = posts.find((post) => (post.seedKey ?? inferSeedKey(post)) === seaDaySeedKey);
  const khaoKheowPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === khaoKheowSeedKey
  );
  const ayutthayaPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === ayutthayaSeedKey
  );
  const terminal21SecondPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === terminal21SecondSeedKey
  );
  const returnFlightPost = posts.find(
    (post) => (post.seedKey ?? inferSeedKey(post)) === returnFlightSeedKey
  );
  const routeSummary = returnFlightPost
    ? "Ростов → Москва → Бангкок → Паттайя → Москва → Ростов"
    : ayutthayaPost
      ? "Ростов → Москва → Бангкок → Паттайя → Аюттхая"
      : "Ростов → Москва → Бангкок → Паттайя";
  const heroAlt = returnFlightPost
    ? "Возвращение в Москву после перелета"
    : ayutthayaPost
    ? "Исторические храмы Аюттхаи"
    : "Кхао Кхео и свежая глава путешествия";
  const fallbackHeroImage =
    returnFlightPost?.photos.find((photo) => photo.src.includes("moscow-city-night-arrival"))
      ?.src ??
    returnFlightPost?.photos.find((photo) => photo.src.includes("bangkok-moscow-seat-selfie"))
      ?.src ??
    terminal21SecondPost?.photos.find((photo) => photo.src.includes("terminal-21-paris-tower"))
      ?.src ??
    khaoKheowPost?.photos.find((photo) => photo.src.includes("khao-kheow-giraffe-feeding"))?.src ??
    khaoKheowPost?.photos.find((photo) => photo.src.includes("khao-kheow-elephant-feeding"))?.src ??
    seaDayPost?.photos.find((photo) => photo.src.includes("sea-day-flower-hair"))?.src ??
    dolceVitaPost?.photos.find((photo) => photo.src.includes("snorkeling-water-kiss"))?.src ??
    marketEveningPost?.photos.find((photo) => photo.src.includes("evening-market"))?.src ??
    poolChillPost?.photos.find((photo) => photo.src.includes("pina-colada"))?.src ??
    firstSeaPost?.photos.find((photo) => photo.src.includes("first-sea-couple"))?.src ??
    pattayaNightPost?.photos.at(-1)?.src ??
    mayaanaPost?.photos.find((photo) => photo.src.includes("sanctuary-of-truth"))?.src ??
    "/images/day-1/road-to-moscow.jpg";
  const heroImage = returnFlightPost
    ? fallbackHeroImage
    : ayutthayaPost
      ? ayutthayaHeroImage
      : fallbackHeroImage;

  return (
    <section className={styles.hero}>
      <Image
        src={heroImage}
        alt={heroAlt}
        preview={false}
        className={styles.heroImage}
      />
      <div className={styles.heroOverlay}>
        <Tag color="green">
          {tripDays} {formatRussianPlural(tripDays, ["день", "дня", "дней"])} в пути ·{" "}
          {routeSummary}
        </Tag>
        <Title level={1}>
          {returnFlightPost
            ? "Возвращение"
            : ayutthayaPost
            ? "Аюттхая"
            : terminal21SecondPost
            ? "Terminal 21"
            : khaoKheowPost
            ? "Кхао Кхео"
            : seaDayPost
            ? "День у моря"
            : dolceVitaPost
            ? "Dolce Vita и острова"
            : marketEveningPost
            ? "Вечерний рынок"
            : poolChillPost
            ? "Чилл у бассейна"
            : firstSeaPost
            ? "Первое утро у моря"
            : pattayaNightPost
              ? "Первые сутки в Паттайе"
              : "Маршрут набирает главы"}
        </Title>
        <Paragraph>
          {returnFlightPost
            ? "Тайская часть закончилась рейсом Бангкок -> Москва, но маршрут еще живой: впереди дорога из Москвы до Ростова-на-Дону на Tesla Model 3 Анастасии."
            : ayutthayaPost
            ? "Древняя столица Сиама: руины храмов, красный кирпич, статуи Будды, рынки и большой исторический день между слоями старого города."
            : terminal21SecondPost
            ? "Terminal 21 Pattaya оказался отдельным городом внутри молла: аэропортовая тема, этажи-страны, башня в атриуме, японские декорации, магазины и вечерние детали вокруг."
            : khaoKheowPost
            ? "Открытый зоопарк под Сирачей: гольф-кар, жирафы, слоны, носорог, птицы, обезьяны и большой зеленый день между Паттайей и Бангкоком."
            : seaDayPost
            ? "Вышли к воде в 11 утра и вернулись только к 6 вечера: море, лежаки, бассейн, коктейли и редкий день без маршрута."
            : dolceVitaPost
            ? "Катамаран, островные бухты, снорклинг, ананасы на борту и пенная вечеринка - день, который наконец ощущался как большое морское приключение."
            : marketEveningPost
            ? "Местный ресторан, меню с русской кухней, рынок в огнях и короткое видео с вечерней прогулки по району."
            : poolChillPost
            ? "Сегодня в дневнике простой отпуск: бассейн, пина колада, море, лежаки и ровно столько движения, сколько хочется."
            : firstSeaPost
            ? "Первый выход к воде, завтрак с фруктами и Ганеша, которого заметили уже по дороге от стола к морю."
            : pattayaNightPost
            ? "Долетели, добрались до отеля и уже поймали первый вечер: еда, влажный воздух и Храм Истины в тумане."
            : latestPost
              ? `Сейчас в дневнике главное: ${latestPost.title.toLowerCase()}.`
            : "Ночная зарядка, дорога, московские виды и подготовка к вылету собираются в живой дневник."}
        </Paragraph>
        {returnFlightPost ? (
          <ReturnFlightCard />
        ) : ayutthayaPost ? (
          <AyutthayaCard />
        ) : khaoKheowPost ? (
          <KhaoKheowCard />
        ) : seaDayPost ? (
          <SeaDayCard />
        ) : dolceVitaPost ? (
          <DolceVitaCard />
        ) : marketEveningPost ? (
          <MarketEveningCard />
        ) : poolChillPost ? (
          <PoolChillCard />
        ) : firstSeaPost ? (
          <MorningSeaCard />
        ) : pattayaNightPost ? (
          <CurrentHighlightCard />
        ) : mayaanaPost ? (
          <CurrentStayCard />
        ) : (
          flightPost && <FlightPlanCard />
        )}
      </div>
    </section>
  );
}

function ReturnFlightCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <Plane size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Возвращение</Text>
        <Text className={styles.flightRoute}>{"Бангкок -> Москва -> Ростов-на-Дону"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Вылет</Text>
        <strong>13:20 BKK</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Прилет</Text>
        <strong>19:20 МСК</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дальше</Text>
        <strong>Tesla 3</strong>
      </div>
    </div>
  );
}

function AyutthayaCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Паттайя -> Аюттхая -> храмы"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>27 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Локация</Text>
        <strong>Ayutthaya</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Медиа</Text>
        <strong>90 фото</strong>
      </div>
    </div>
  );
}

function KhaoKheowCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Паттайя -> Khao Kheow Open Zoo"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>25 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Локация</Text>
        <strong>Si Racha</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Медиа</Text>
        <strong>30 кадров</strong>
      </div>
    </div>
  );
}

function SeaDayCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <Waves size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Море -> бассейн -> море"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>24 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>У воды</Text>
        <strong>11:00-18:00</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Режим</Text>
        <strong>без маршрута</strong>
      </div>
    </div>
  );
}

function DolceVitaCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <Waves size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Паттайя -> Ко Пай -> Ко Сак -> вечер"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>23 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Формат</Text>
        <strong>катамаран</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Главное</Text>
        <strong>снорклинг</strong>
      </div>
    </div>
  );
}

function MarketEveningCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Ресторан -> рынок"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>22 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Медиа</Text>
        <strong>фото + видео</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Настроение</Text>
        <strong>вечер</strong>
      </div>
    </div>
  );
}

function PoolChillCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <Waves size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Бассейн -> море"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>21 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Режим</Text>
        <strong>чилл</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Напиток</Text>
        <strong>пина колада</strong>
      </div>
    </div>
  );
}

function MorningSeaCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Свежая глава</Text>
        <Text className={styles.flightRoute}>{"Завтрак -> море"}</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>20 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Настроение</Text>
        <strong>утро у воды</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Деталь</Text>
        <strong>Ганеша</strong>
      </div>
    </div>
  );
}

function CurrentHighlightCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Последняя глава</Text>
        <Text className={styles.flightRoute}>Ночная Паттайя</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>19 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Маршрут</Text>
        <strong>{"отель -> еда"}</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Кадр</Text>
        <strong>Храм Истины</strong>
      </div>
    </div>
  );
}

function CurrentStayCard() {
  return (
    <div className={styles.flightPlan}>
      <span className={styles.flightIcon}>
        <MapPin size={18} />
      </span>
      <div>
        <Text className={styles.flightLabel}>Текущая точка</Text>
        <Text className={styles.flightRoute}>Mayaana Beach Resort Pattaya</Text>
      </div>
      <div className={styles.flightMetric}>
        <Text>Дата</Text>
        <strong>19 авг</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Город</Text>
        <strong>Pattaya</strong>
      </div>
      <div className={styles.flightMetric}>
        <Text>Ориентир</Text>
        <strong>Sanctuary of Truth</strong>
      </div>
    </div>
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

function TripNavigator({
  onOpen,
  posts
}: {
  onOpen: (post: Post, photoIndex?: number) => void;
  posts: Post[];
}) {
  const sortedPosts = sortPostsNewestFirst(posts);
  const dayGroups = groupPostsByDay(sortedPosts);
  const latestPost = sortedPosts[0];
  const latestPhoto = latestPost?.photos.find((photo) => !isVideoMedia(photo));
  const currentDay = dayGroups[0];
  const tripDays = getTripDays(sortedPosts);
  const newestDays = dayGroups.slice(0, 5);

  return (
    <Card className={`${styles.sectionCard} ${styles.navigatorCard}`}>
      <SectionHeader
        title="Что происходит сейчас"
        subtitle="Короткий вход в дневник: где остановились, какой день поездки и куда прыгнуть в ленте."
        action={
          latestPost ? (
            <Tag className={styles.navigatorLatestTag} color={latestPost.moodColor}>
              Последняя глава: {latestPost.title}
            </Tag>
          ) : undefined
        }
      />

      {latestPost && currentDay && (
        <div className={styles.navigatorFocus}>
          <div className={styles.navigatorFocusCopy}>
            <Text className={styles.cardEyebrow}>
              День {tripDays} в пути · {currentDay.title}
            </Text>
            <Title level={3}>{latestPost.title}</Title>
            <Paragraph>{getPostTeaser(latestPost)}</Paragraph>
            <Space size={8} wrap>
              <Button
                icon={<Maximize2 size={16} />}
                onClick={() => onOpen(latestPost)}
                type="primary"
              >
                Смотреть главу
              </Button>
              <Button href="#timeline">К полной ленте</Button>
            </Space>
          </div>
          {latestPhoto && (
            <div className={styles.navigatorFocusMedia}>
              <Image alt={latestPhoto.caption} preview={false} src={latestPhoto.src} />
            </div>
          )}
        </div>
      )}

      <div className={styles.navigatorPanel}>
        <div className={styles.navigatorPanelTitle}>
          <BookOpen size={18} />
          <span>Быстрый переход по дням</span>
        </div>
        <div className={styles.dayRail}>
          {newestDays.map((day) => (
            <a
              className={styles.dayChip}
              href={`#${getDayAnchorId(day.dateKey)}`}
              key={day.dateKey}
            >
              <span className={styles.dayChipNumber}>Д{day.tripDay}</span>
              <div className={styles.dayChipTitle}>
                <strong>{formatDayChipTitle(day.title)}</strong>
                <span>{day.posts.map((post) => post.title).slice(0, 2).join(" · ")}</span>
              </div>
              <div className={styles.dayChipMeta}>
                {day.posts.length}{" "}
                {formatRussianPlural(day.posts.length, ["запись", "записи", "записей"])} ·{" "}
                {day.photos} медиа
              </div>
            </a>
          ))}
        </div>
      </div>
    </Card>
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
  if (posts.length === 0) {
    return 1;
  }

  const dayStarts = posts.map((post) => startOfDay(getPostDate(post)).getTime());
  const earliestDay = Math.min(...dayStarts);
  const latestDay = Math.max(...dayStarts);

  return Math.floor((latestDay - earliestDay) / 86400000) + 1;
}

function getDayAnchorId(dateKey: string) {
  return `day-${dateKey}`;
}

function getPostAnchorId(post: Post) {
  return `post-${post.id}`;
}

function getPostTeaser(post: Post) {
  const [firstSentence] = post.body.match(/^[^.!?]+[.!?]?/) ?? [];

  return firstSentence || post.body;
}

function getMediaBreakdown(posts: Post[]) {
  return posts.reduce(
    (acc, post) => {
      post.photos.forEach((photo) => {
        acc.total += 1;

        if (isVideoMedia(photo)) {
          acc.videos += 1;
        } else {
          acc.photos += 1;
        }
      });

      return acc;
    },
    { total: 0, photos: 0, videos: 0 }
  );
}

function getLocationSummaries(posts: Post[]) {
  const locations = new Map<string, { name: string; posts: number; media: number }>();

  posts.forEach((post) => {
    const name = post.locationName.trim();

    if (!name) {
      return;
    }

    const existing = locations.get(name) ?? { name, posts: 0, media: 0 };
    existing.posts += 1;
    existing.media += post.photos.length;
    locations.set(name, existing);
  });

  return Array.from(locations.values()).sort(
    (a, b) => b.posts - a.posts || b.media - a.media || a.name.localeCompare(b.name, "ru")
  );
}

function getTagSummaries(posts: Post[]) {
  const tags = new Map<string, { name: string; count: number }>();

  posts.forEach((post) => {
    post.tags.forEach((rawTag) => {
      const name = rawTag.trim();

      if (!name) {
        return;
      }

      const existing = tags.get(name) ?? { name, count: 0 };
      existing.count += 1;
      tags.set(name, existing);
    });
  });

  return Array.from(tags.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru")
  );
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

function formatDayChipTitle(dayTitle: string) {
  return dayTitle.replace(/^[^,]+,\s*/, "");
}

function formatPostDate(post: Post) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
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
  onOpen,
  posts,
  onUpdate
}: {
  isAdmin: boolean;
  onOpen: (post: Post, photoIndex?: number) => void;
  posts: Post[];
  onUpdate: (post: Post) => void;
}) {
  const dayGroups = groupPostsByDay(posts);

  return (
    <div className={styles.timelineDays}>
      {dayGroups.map((group) => (
        <section
          className={styles.timelineDay}
          id={getDayAnchorId(group.dateKey)}
          key={group.dateKey}
        >
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
            items={group.posts.map((post) => {
              const previewPhotos = post.photos.slice(0, 4);
              const hiddenPhotoCount = post.photos.length - previewPhotos.length;

              return {
                color: post.moodColor,
                content: (
                  <Card className={styles.entryCard} id={getPostAnchorId(post)}>
                    <div className={styles.entryHeader}>
                      <div className={styles.entryTitleGroup}>
                        <Text type="secondary">{formatPostDate(post)}</Text>
                        <Title level={4}>{post.title}</Title>
                      </div>
                      <Space align="start" className={styles.entryActions}>
                        <Tag color={post.moodColor}>{post.mood}</Tag>
                        <Button
                          aria-label="Открыть запись"
                          icon={<Maximize2 size={15} />}
                          onClick={() => onOpen(post)}
                          size="small"
                        />
                        {isAdmin && <EditPostModal post={post} onUpdate={onUpdate} />}
                      </Space>
                    </div>
                    <Paragraph className={styles.entryBody}>{post.body}</Paragraph>
                    {post.photos.length > 0 && (
                      <div className={styles.entryImages}>
                        {previewPhotos.map((photo, index) => (
                          <button
                            aria-label={`Открыть медиа ${index + 1}`}
                            className={styles.entryMediaItem}
                            key={`${post.id}-${photo.src}-${index}`}
                            onClick={() => onOpen(post, index)}
                            type="button"
                          >
                            <MediaPreview photo={photo} preview={false} />
                          </button>
                        ))}
                        {hiddenPhotoCount > 0 && (
                          <button
                            className={`${styles.entryMediaItem} ${styles.entryMoreMedia}`}
                            onClick={() => onOpen(post, previewPhotos.length)}
                            type="button"
                          >
                            <span>+{hiddenPhotoCount}</span>
                            <strong>Смотреть все</strong>
                          </button>
                        )}
                      </div>
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
              };
            })}
          />
        </section>
      ))}
    </div>
  );
}

function PostDetailsModal({
  onClose,
  onPhotoChange,
  post,
  selectedPhotoIndex
}: {
  onClose: () => void;
  onPhotoChange: (index: number) => void;
  post: Post | null;
  selectedPhotoIndex: number;
}) {
  const safePhotoIndex = post?.photos.length
    ? Math.min(selectedPhotoIndex, post.photos.length - 1)
    : 0;
  const currentPhoto = post?.photos[safePhotoIndex];

  const handlePrevious = () => {
    if (!post?.photos.length) {
      return;
    }

    onPhotoChange((safePhotoIndex - 1 + post.photos.length) % post.photos.length);
  };

  const handleNext = () => {
    if (!post?.photos.length) {
      return;
    }

    onPhotoChange((safePhotoIndex + 1) % post.photos.length);
  };

  return (
    <Modal
      className={styles.postDetailsModal}
      footer={null}
      onCancel={onClose}
      open={Boolean(post)}
      title={post ? "История дня" : undefined}
      width={1080}
    >
      {post && (
        <div className={styles.postDetails}>
          <div className={styles.postDetailsLayout}>
            <section className={styles.postDetailsMediaPanel}>
              <div className={styles.postDetailsMedia}>
                {currentPhoto ? (
                  <MediaPreview photo={currentPhoto} />
                ) : (
                  <div className={styles.postDetailsEmpty}>
                    <Camera size={22} />
                    <Text type="secondary">К этой записи пока нет медиа</Text>
                  </div>
                )}
              </div>
              {post.photos.length > 0 && (
                <Carousel
                  afterChange={onPhotoChange}
                  className={styles.postDetailsCarousel}
                  dots
                  infinite={post.photos.length > 1}
                  initialSlide={safePhotoIndex}
                  key={`${post.id}-${safePhotoIndex}`}
                >
                  {post.photos.map((photo, index) => (
                    <div
                      className={styles.postDetailsSlide}
                      key={`${post.id}-slide-${photo.src}-${index}`}
                    >
                      <MediaPreview photo={photo} preview={false} />
                    </div>
                  ))}
                </Carousel>
              )}
              {post.photos.length > 1 && (
                <Flex
                  align="center"
                  className={styles.postDetailsControls}
                  justify="space-between"
                >
                  <Button icon={<ChevronLeft size={16} />} onClick={handlePrevious}>
                    Назад
                  </Button>
                  <Text type="secondary">
                    {safePhotoIndex + 1} из {post.photos.length}
                  </Text>
                  <Button icon={<ChevronRight size={16} />} onClick={handleNext}>
                    Дальше
                  </Button>
                </Flex>
              )}
            </section>

            <aside className={styles.postDetailsAside}>
              <Text className={styles.cardEyebrow}>{formatPostDate(post)}</Text>
              <Title level={3}>{post.title}</Title>
              <Paragraph>{post.body}</Paragraph>
              <Text className={styles.postDetailsLocation}>
                <MapPin size={14} /> {post.locationName}
              </Text>
              <Space className={styles.postDetailsTags} size={6} wrap>
                <Tag color={post.moodColor}>{post.mood}</Tag>
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </aside>
          </div>

          {post.photos.length > 1 && (
            <div className={styles.postDetailsThumbs}>
              {post.photos.map((photo, index) => (
                <button
                  aria-label={`Открыть медиа ${index + 1}`}
                  className={styles.postDetailsThumb}
                  data-active={index === safePhotoIndex}
                  key={`${post.id}-details-${photo.src}-${index}`}
                  onClick={() => onPhotoChange(index)}
                  type="button"
                >
                  {isVideoMedia(photo) ? (
                    <video muted playsInline preload="metadata" src={photo.src} />
                  ) : (
                    <Image alt={photo.caption} preview={false} src={photo.src} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
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
                      <MediaPreview photo={photo} preview={false} />
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

function PhotoGrid({
  onOpen,
  posts
}: {
  onOpen: (post: Post, photoIndex?: number) => void;
  posts: Post[];
}) {
  const [mediaFilter, setMediaFilter] = useState<PhotoFilter>("all");
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mediaItems = useMemo(
    () =>
      sortPostsNewestFirst(posts).flatMap((post) =>
        post.photos.map((photo, index) => ({
          index,
          isVideo: isVideoMedia(photo),
          photo,
          post
        }))
      ),
    [posts]
  );
  const tagSummaries = useMemo(() => getTagSummaries(posts), [posts]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const photoCount = mediaItems.filter((item) => !item.isVideo).length;
  const videoCount = mediaItems.length - photoCount;
  const activeTagLabel = activeTag === "all" ? "все темы" : activeTag;

  const filteredItems = useMemo(
    () =>
      mediaItems.filter(({ isVideo, photo, post }) => {
        if (mediaFilter === "photos" && isVideo) {
          return false;
        }

        if (mediaFilter === "videos" && !isVideo) {
          return false;
        }

        if (activeTag !== "all" && !post.tags.includes(activeTag)) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [photo.caption, post.title, post.body, post.locationName, ...post.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [activeTag, mediaFilter, mediaItems, normalizedQuery]
  );

  const resetFilters = () => {
    setMediaFilter("all");
    setActiveTag("all");
    setSearchQuery("");
  };

  return (
    <>
      <div className={styles.photoTools}>
        <Input
          allowClear
          className={styles.photoSearch}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Найти море, зоопарк, ВДНХ..."
          prefix={<Search size={16} />}
          value={searchQuery}
        />
        <Segmented
          onChange={(value) => setMediaFilter(value as PhotoFilter)}
          options={[
            { label: `Все ${mediaItems.length}`, value: "all" },
            { label: `Фото ${photoCount}`, value: "photos" },
            { label: `Видео ${videoCount}`, value: "videos" }
          ]}
          value={mediaFilter}
        />
      </div>

      <div className={styles.photoTagStrip}>
        <Tag.CheckableTag checked={activeTag === "all"} onChange={() => setActiveTag("all")}>
          Все темы
        </Tag.CheckableTag>
        {tagSummaries.slice(0, 16).map((tag) => (
          <Tag.CheckableTag
            checked={activeTag === tag.name}
            key={tag.name}
            onChange={() => setActiveTag(tag.name)}
          >
            {tag.name} {tag.count}
          </Tag.CheckableTag>
        ))}
      </div>

      <div className={styles.photoSummary}>
        <Text type="secondary">
          Показано {filteredItems.length} из {mediaItems.length}: {activeTagLabel}
        </Text>
        {(mediaFilter !== "all" || activeTag !== "all" || searchQuery) && (
          <Button size="small" onClick={resetFilters}>
            Сбросить
          </Button>
        )}
      </div>

      {filteredItems.length > 0 ? (
        <Row gutter={[12, 12]}>
          {filteredItems.map(({ index, photo, post }) => (
            <Col xs={12} md={8} key={`${post.id}-${photo.src}-${index}`}>
              <Card className={styles.photoCard} cover={<MediaPreview photo={photo} />}>
                <Text strong>{photo.caption}</Text>
                <Text type="secondary">{post.title}</Text>
                <Button
                  className={styles.photoOpenButton}
                  icon={<Maximize2 size={14} />}
                  onClick={() => onOpen(post, index)}
                  size="small"
                  type="text"
                >
                  Открыть
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className={styles.photoEmpty}>
          <Text type="secondary">Ничего не нашлось, фильтры слишком строгие.</Text>
          <Button onClick={resetFilters}>Показать все</Button>
        </div>
      )}
    </>
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
