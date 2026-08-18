import type { Idea, Place, Post, TripStats } from "./types";

export const initialPosts: Post[] = [
  {
    id: "ab43a8d4-5df8-4f6d-a611-d7894f25f211",
    seedKey: "moscow-bangkok-flight",
    title: "Вылетаем в Бангкок: девять часов до Таиланда",
    body:
      "Сегодня в 22:25 стартует главный перелет маршрута: Москва -> Бангкок. Впереди около девяти часов в небе, а дальше начнется уже настоящая тайская глава — новые места, жара, еда, море и все заметки, которые будем докидывать по дороге.",
    mood: "ожидание взлета",
    moodColor: "cyan",
    locationName: "Москва, аэропорт",
    visitedAt: "18 августа, 22:25",
    visitedAtIso: "2026-08-18T22:25:00+03:00",
    tags: ["вылет", "бангкок", "тайланд", "самолет"],
    photos: []
  },
  {
    id: "8f9f3e0a-1d95-4e3d-a25d-6b8061f0fa25",
    seedKey: "preflight-charging-work",
    title: "Готовимся к вылету: зарядка, работа и чемоданное настроение",
    body:
      "Перед вылетом поймали рабочую паузу прямо на зарядке: машина набирает проценты, ноутбук открыт, маршрут уже почти собран. В голове уже аэропорт и Таиланд, но пока спокойно доделываем дела и собираемся в следующий большой рывок.",
    mood: "на низком старте",
    moodColor: "green",
    locationName: "Москва, Технопарк",
    visitedAt: "18 августа, 13:10",
    visitedAtIso: "2026-08-18T13:10:00+03:00",
    tags: ["вылет", "зарядка", "работа", "москва"],
    photos: [
      {
        src: "/images/day-1/charging-before-flight.jpeg",
        caption: "Рабочая пауза на зарядке перед вылетом"
      }
    ]
  },
  {
    id: "7820addf-7529-4d5b-9c89-bc34b1d8746f",
    seedKey: "technopark-yes-apart",
    title: "Технопарк, Yes Apart: первая пауза в Москве",
    body:
      "После дороги добрались до Технопарка и заселились в Yes Apart. Номер 18.13 стал первой нормальной паузой маршрута: можно выдохнуть, привести себя в порядок и спокойно собраться перед следующим этапом отпуска.",
    mood: "выдох",
    moodColor: "cyan",
    locationName: "Технопарк, отель Yes Apart",
    visitedAt: "17 августа, 16:50",
    visitedAtIso: "2026-08-17T16:50:00+03:00",
    tags: ["технопарк", "yes apart", "отель", "пауза"],
    photos: [
      {
        src: "/images/day-1/room-1813.jpg",
        caption: "Номер 18.13"
      },
      {
        src: "/images/day-1/elevator-selfie.jpg",
        caption: "Лифт-селфи"
      }
    ]
  },
  {
    id: "2637cb5a-46f5-4388-8ce9-c7fe24f51d1f",
    seedKey: "moscow-arrival",
    title: "Москва как пересадочная точка",
    body:
      "К Москве приехали 17 августа около 14:40: после ночной дороги город встретил парковками, стеклянными фасадами, видом на Остров Мечты и ощущением, что большая часть маршрута уже позади. Это еще не финальная точка отпуска, но уже отдельная глава перед вылетом.",
    mood: "собранность",
    moodColor: "blue",
    locationName: "Москва",
    visitedAt: "17 августа, 14:40",
    visitedAtIso: "2026-08-17T14:40:00+03:00",
    tags: ["москва", "город", "пересадка"],
    photos: [
      {
        src: "/images/day-1/parking-moscow.jpg",
        caption: "Городская остановка"
      },
      {
        src: "/images/day-1/dream-island.jpg",
        caption: "Остров Мечты"
      },
      {
        src: "/images/day-1/moscow-view.jpg",
        caption: "Вид из окна"
      }
    ]
  },
  {
    id: "0d567c13-53dd-4854-aec1-f5d459190591",
    seedKey: "rostov-green-drive",
    title: "Ростов -> Москва: старт отпуска с ночной зарядки",
    body:
      "Отпуск начался не с моря, а с зарядки авто в Ростове-на-Дону. 16 августа в 23:47 стоим на Green Drive, добираем проценты перед дорогой и постепенно переключаемся в режим отпуска: впереди ночная трасса до Москвы и первый большой кусок пути к Таиланду.",
    mood: "предвкушение",
    moodColor: "green",
    locationName: "Ростов-на-Дону",
    visitedAt: "16 августа, 23:47",
    visitedAtIso: "2026-08-16T23:47:00+03:00",
    tags: ["зарядка", "tesla", "ростов", "первый этап"],
    photos: [
      {
        src: "/images/day-1/green-drive.jpg",
        caption: "Green Drive перед выездом"
      },
      {
        src: "/images/day-1/road-to-moscow.jpg",
        caption: "Трасса на Москву"
      },
      {
        src: "/images/day-1/tvoy-vegas.jpg",
        caption: "Пасмурный кусок дороги"
      }
    ]
  }
];

export const initialPlaces: Place[] = [
  {
    id: "ca34850c-9c36-4d93-9f4d-9276c14756fc",
    name: "Green Drive",
    category: "зарядка",
    rating: 4.5,
    notes: "Зарядка авто 16 августа в 23:47 перед ночной дорогой в Москву."
  },
  {
    id: "ae277e4b-5b35-43b1-aec1-0b8867e28b20",
    name: "Москва",
    category: "пересадка",
    rating: 4,
    notes: "Приехали 17 августа около 14:40 перед следующим этапом отпуска."
  },
  {
    id: "1e8c887e-81d5-4a4d-837c-068d9eb77253",
    name: "Yes Apart, Технопарк",
    category: "отель",
    rating: 4,
    notes: "Первая спокойная пауза после дороги, номер 18.13."
  }
];

export const initialIdeas: Idea[] = [
  {
    id: "9dd5caca-e554-4b9b-a91b-2e4d0463d558",
    title: "Разобрать фото первого дня",
    status: "done",
    notes: "8 кадров добавлены"
  },
  {
    id: "23491839-af1e-42c8-b299-96632e502619",
    title: "Дополнить заметку про дорогу",
    status: "todo",
    notes: "Добавить детали маршрута"
  },
  {
    id: "86c27311-96a1-48ed-9f5b-169172d1bc115",
    title: "Подготовить шаблон первого дня в Таиланде",
    status: "todo",
    notes: "Места, еда, эмоции"
  }
];

export const tripStats: TripStats = {
  posts: initialPosts.length,
  photos: initialPosts.reduce((sum, post) => sum + post.photos.length, 0),
  places: initialPlaces.length,
  days: new Set(initialPosts.map((post) => post.visitedAtIso?.slice(0, 10) ?? post.visitedAt)).size,
  ideasProgress: 33,
  currentMood: "Дорога началась, отпуск включился"
};
