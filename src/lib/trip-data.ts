import type { Idea, Photo, Place, Post, TripStats } from "./types";

const ayutthayaPhotos: Photo[] = [
  ...Array.from({ length: 90 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");

    return {
      src: `/images/day-9/ayutthaya-${number}.jpeg`,
      caption:
        index < 14
          ? "Аюттхая: древние храмы, красный кирпич и детали старой столицы"
          : index < 36
            ? "Исторический парк между храмами, Буддами и зелеными переходами"
            : index < 58
              ? "Переезды, рынки и живые детали вокруг Аюттхаи"
              : index < 78
                ? "Вечерние кадры, прогулка и возвращение после большого дня"
                : "Финальные детали поездки в древнюю столицу Сиама"
    };
  })
];

export const initialPosts: Post[] = [
  {
    id: "2f9b0d5d-7e8d-4f15-95b4-cda41c2a0c71",
    seedKey: "ayutthaya-historic-city",
    title: "Аюттхая: древняя столица Сиама",
    body:
      "Сегодня сделали большую историческую вылазку в Аюттхаю - город, который в 1350 году стал второй столицей Сиама после Сукхотая. Несколько веков это был один из главных торговых и политических центров региона, пока в 1767 году город не разрушила бирманская армия. Сейчас исторический парк Аюттхаи входит в список Всемирного наследия UNESCO: руины храмов, ступы, красный кирпич, статуи Будды и ощущение, что идешь не просто по достопримечательностям, а по слоям старой столицы. Маршрут получился насыщенный: храмы, переезды между локациями, рынки, много деталей в камне и золоте, а еще живые кадры города, который до сих пор дышит историей.",
    mood: "исторический день",
    moodColor: "gold",
    locationName: "Historic City of Ayutthaya, Phra Nakhon Si Ayutthaya",
    visitedAt: "27 августа",
    visitedAtIso: "2026-08-27T18:30:00+07:00",
    tags: ["аюттхая", "unesco", "сиам", "храмы", "история", "тайланд", "древняя столица"],
    photos: ayutthayaPhotos
  },
  {
    id: "0662d537-84b6-4cf6-afa0-0ebdb90470c8",
    seedKey: "khao-kheow-open-zoo",
    title: "Кхао Кхео: зоопарк в джунглях",
    body:
      "Сегодня выбрались в Khao Kheow Open Zoo - открытый зоопарк в Bang Phra, район Si Racha, Chon Buri, примерно между Паттайей и Бангкоком. Взяли формат прогулки по большой зеленой территории: ехали на гольф-каре, кормили жирафа, зависали у слонов, смотрели кенгуру, птиц, черепах, гиббонов, обезьян, дикобразов, крокодила, носорога, фламинго и зебр. День получился жаркий и очень живой: не просто посмотреть на животных, а ехать через зелень, останавливаться у вольеров, ловить смешные моменты и возвращаться с ощущением маленького сафари.",
    mood: "сафари-день",
    moodColor: "green",
    locationName: "Khao Kheow Open Zoo, Bang Phra, Si Racha, Chon Buri",
    visitedAt: "25 августа",
    visitedAtIso: "2026-08-25T15:30:00+07:00",
    tags: ["паттайя", "кхао кхео", "зоопарк", "сирача", "жирафы", "слоны", "гиббоны", "гольф-кар"],
    photos: [
      {
        src: "/images/day-8/khao-kheow-koala.jpeg",
        caption: "Коала в зелени"
      },
      {
        src: "/images/day-8/khao-kheow-kangaroos-shade.jpeg",
        caption: "Кенгуру прячутся в тени"
      },
      {
        src: "/images/day-8/khao-kheow-kangaroo-feeding.jpeg",
        caption: "Обед у кенгуру"
      },
      {
        src: "/images/day-8/khao-kheow-crowned-pigeons.jpeg",
        caption: "Корончатые голуби как отдельная фотосессия"
      },
      {
        src: "/images/day-8/khao-kheow-kangaroo-rest.jpeg",
        caption: "Кенгуру на дневной паузе"
      },
      {
        src: "/images/day-8/khao-kheow-porcupines.jpeg",
        caption: "Дикобразы за обедом"
      },
      {
        src: "/images/day-8/khao-kheow-alligator.jpeg",
        caption: "Крокодил под ветками"
      },
      {
        src: "/images/day-8/khao-kheow-tortoises.jpeg",
        caption: "Черепахи поймали свой неспешный момент"
      },
      {
        src: "/images/day-8/khao-kheow-capuchin.jpeg",
        caption: "Обезьяна в своем режиме"
      },
      {
        src: "/images/day-8/khao-kheow-gibbon-tree.jpeg",
        caption: "Гиббон завис в зелени"
      },
      {
        src: "/images/day-8/khao-kheow-gibbon-silhouette.jpeg",
        caption: "Силуэт гиббона на ветке"
      },
      {
        src: "/images/day-8/khao-kheow-gibbon-branch.jpeg",
        caption: "Гиббон устроился в тени"
      },
      {
        src: "/images/day-8/khao-kheow-monkey-portrait-girl.jpeg",
        caption: "Портрет с местным наблюдателем"
      },
      {
        src: "/images/day-8/khao-kheow-monkey-portrait-boy.jpeg",
        caption: "Еще один портрет с обезьяной на стене"
      },
      {
        src: "/images/day-8/khao-kheow-macaque-wall.jpeg",
        caption: "Макака устроилась как хозяин маршрута"
      },
      {
        src: "/images/day-8/khao-kheow-monkey-cart.jpeg",
        caption: "Обезьяна захватила гольф-кар"
      },
      {
        src: "/images/day-8/khao-kheow-macaque-close.jpeg",
        caption: "Макака крупным планом"
      },
      {
        src: "/images/day-8/khao-kheow-elephant-green.jpeg",
        caption: "Слон в зелени"
      },
      {
        src: "/images/day-8/khao-kheow-couple-elephant-selfie.jpeg",
        caption: "Селфи на фоне слонов"
      },
      {
        src: "/images/day-8/khao-kheow-couple-elephant-wide.jpeg",
        caption: "Еще один кадр у слоновьей зоны"
      },
      {
        src: "/images/day-8/khao-kheow-elephant-feeding.jpeg",
        caption: "Кормление слона"
      },
      {
        src: "/images/day-8/khao-kheow-zoo-cart-selfie.jpeg",
        caption: "Едем по зоопарку на открытом транспорте"
      },
      {
        src: "/images/day-8/khao-kheow-giraffe-feeding.jpeg",
        caption: "Кормление жирафа - главный контакт дня"
      },
      {
        src: "/images/day-8/khao-kheow-green-path-portrait.jpeg",
        caption: "Зеленая часть маршрута"
      },
      {
        src: "/images/day-8/khao-kheow-rhino.jpeg",
        caption: "Носорог в тени"
      },
      {
        src: "/images/day-8/khao-kheow-flamingos.jpeg",
        caption: "Фламинго у воды"
      },
      {
        src: "/images/day-8/khao-kheow-zebras.jpeg",
        caption: "Зебры отдыхают на солнце"
      },
      {
        src: "/images/day-8/khao-kheow-meerkat.jpeg",
        caption: "Сурикат в песке"
      },
      {
        src: "/images/day-8/khao-kheow-couple-sunny-selfie.jpeg",
        caption: "Селфи после большого круга"
      },
      {
        src: "/images/day-8/khao-kheow-giraffes.jpeg",
        caption: "Жирафы под деревьями"
      },
      {
        src: "/images/day-8/khao-kheow-madagascar-statue.jpeg",
        caption: "Финальный кадр с мадагаскарской компанией"
      },
      {
        src: "/videos/day-8/khao-kheow-zoo-cart.mov",
        caption: "Видео: едем по Кхао Кхео",
        type: "video"
      },
      {
        src: "/videos/day-8/khao-kheow-elephant-video.mov",
        caption: "Видео: слоны в открытой зоне",
        type: "video"
      },
      {
        src: "/videos/day-8/khao-kheow-giraffe-video.mov",
        caption: "Видео: кормление жирафа",
        type: "video"
      },
      {
        src: "/videos/day-8/khao-kheow-tortoise-video.mov",
        caption: "Видео: черепахи в своем темпе",
        type: "video"
      },
      {
        src: "/videos/day-8/khao-kheow-gibbon-video.mov",
        caption: "Видео: гиббон в зелени",
        type: "video"
      },
      {
        src: "/videos/day-8/khao-kheow-zoo-extra-video.mov",
        caption: "Видео: еще один момент из Кхао Кхео",
        type: "video"
      }
    ]
  },
  {
    id: "bd0c0fc6-73d1-4c0a-b812-5df1f0f717fc",
    seedKey: "full-day-by-the-sea",
    title: "День у моря с 11 до 18",
    body:
      "Сегодня наконец сделали самый простой и правильный отпускной план: вышли к морю в 11 утра и вернулись только к 6 вечера. Без маршрута и обязательных точек - лежаки, жаркое солнце, коктейли, бассейн рядом, море перед глазами и длинная пауза, где время почти не двигается. В какой-то момент день стал похож на одну большую открытку: цветок в волосах, фламинго в бассейне, холодный Leo, сон на лежаке и полное ощущение, что мы никуда не торопимся.",
    mood: "морская лень",
    moodColor: "cyan",
    locationName: "Пляж и бассейн рядом с Mayaana Beach Resort",
    visitedAt: "24 августа",
    visitedAtIso: "2026-08-24T18:00:00+07:00",
    tags: ["паттайя", "море", "пляж", "бассейн", "коктейли", "чилл"],
    photos: [
      {
        src: "/images/day-7/sea-day-flower-hair.jpeg",
        caption: "Цветок в волосах и спокойное море"
      },
      {
        src: "/images/day-7/sea-day-flamingo-pool.jpeg",
        caption: "Фламинго, бассейн и медитативный режим"
      },
      {
        src: "/images/day-7/sea-day-cocktails-pool.jpeg",
        caption: "Коктейли у бассейна после моря"
      },
      {
        src: "/images/day-7/sea-day-leo-nap.jpeg",
        caption: "Leo и короткая перезагрузка на лежаке"
      },
      {
        src: "/images/day-7/sea-day-lounger-rest.jpeg",
        caption: "Лежак у моря и полный режим отдыха"
      }
    ]
  },
  {
    id: "b53b9ce0-e423-4665-9c5c-8362580b5e44",
    seedKey: "dolce-vita-catamaran-islands",
    title: "Dolce Vita: катамаран, острова и снорклинг",
    body:
      "Сегодня был самый морской день поездки: катались на катамаране Dolce Vita по островам Паттайи, снорклили, купались в прозрачной воде, участвовали в пенной вечеринке и пили прямо из ананасов. Точный порядок маршрута по памяти расплылся, поэтому восстановили его по описаниям русской программы Dolce Vita: старт с пирса Бали Хай, остров Ко Пай, затем Зеленый остров Ко Сак, остановки на пляже и у рифов для снорклинга, финальный проход к вечерней Паттайе и Храму Истины перед возвращением. В кадрах это ощущается ровно так: пирс и огни Pattaya City, спасжилеты, белый песок, маски, мокрые полотенца, ананасы на борту и лица людей, которые отлично провели день.",
    mood: "морской драйв",
    moodColor: "cyan",
    locationName: "Dolce Vita catamaran, острова Паттайи",
    visitedAt: "23 августа",
    visitedAtIso: "2026-08-23T19:56:00+07:00",
    tags: ["паттайя", "dolce vita", "катамаран", "острова", "снорклинг", "пенная вечеринка"],
    photos: [
      {
        src: "/images/day-6/transfer-ride-selfie.jpeg",
        caption: "Едем к морскому дню"
      },
      {
        src: "/images/day-6/pattaya-city-arrival.jpeg",
        caption: "Pattaya City у пирса перед прогулкой"
      },
      {
        src: "/images/day-6/boat-life-jackets.jpeg",
        caption: "На борту и уже в жилетах"
      },
      {
        src: "/images/day-6/catamaran-ride-selfie.jpeg",
        caption: "Катамаранный режим включен"
      },
      {
        src: "/images/day-6/pineapple-on-catamaran.jpeg",
        caption: "Ананас прямо на борту"
      },
      {
        src: "/images/day-6/island-beach-selfie.jpeg",
        caption: "Первая островная остановка"
      },
      {
        src: "/images/day-6/island-white-sand-cove.jpeg",
        caption: "Белый песок и тихая бухта"
      },
      {
        src: "/images/day-6/island-cove-water.jpeg",
        caption: "Вода у острова"
      },
      {
        src: "/images/day-6/snorkeling-mask-selfie.jpeg",
        caption: "Маски, вода и снорклинг"
      },
      {
        src: "/images/day-6/snorkeling-underwater-selfie.jpeg",
        caption: "Под водой вместе"
      },
      {
        src: "/images/day-6/snorkeling-underwater-kiss.jpeg",
        caption: "Подводный кадр"
      },
      {
        src: "/images/day-6/snorkeling-water-kiss.jpeg",
        caption: "После снорклинга"
      },
      {
        src: "/images/day-6/pirate-boat-at-sea.jpeg",
        caption: "Корабль по соседству в море"
      },
      {
        src: "/images/day-6/beach-meditation.jpeg",
        caption: "Пляжная медитация"
      },
      {
        src: "/images/day-6/beach-beer-relax.jpeg",
        caption: "Островной Chang и полное спокойствие"
      },
      {
        src: "/images/day-6/beach-salute-portrait.jpeg",
        caption: "Портрет у воды"
      },
      {
        src: "/images/day-6/rocky-sea-view.jpeg",
        caption: "Скалы, море и пауза"
      },
      {
        src: "/images/day-6/pattaya-city-night-sign.jpeg",
        caption: "Pattaya City уже вечером"
      },
      {
        src: "/images/day-6/dolce-vita-pier-couple.jpeg",
        caption: "Финиш у пирса после насыщенного дня"
      },
      {
        src: "/images/day-6/pattaya-bay-cruise-boat.jpeg",
        caption: "Вечерняя бухта Паттайи"
      }
    ]
  },
  {
    id: "9e09ea09-83c5-4eb5-a480-440723b8c5ae",
    seedKey: "local-restaurant-market-evening",
    title: "Местный ресторан, рынок и вечерняя Паттайя",
    body:
      "Сегодня выбрались в местный ресторан и на рынок. Получился очень странный, но классный тайский микс: узбекская и русская кухня посреди Паттайи, меню с борщом, мантами и пирожками, гирлянды, вечерний рынок между высотками и потом спокойный ужин у Blue Siam. Такие бытовые вылазки хорошо заземляют поездку: вроде ничего грандиозного, но именно из них потом и собирается настоящий отпуск.",
    mood: "вечерний рынок",
    moodColor: "magenta",
    locationName: "North Pattaya, рынок и рестораны рядом с отелем",
    visitedAt: "22 августа",
    visitedAtIso: "2026-08-22T19:43:00+07:00",
    tags: ["паттайя", "рынок", "ресторан", "еда", "вечер"],
    photos: [
      {
        src: "/images/day-5/chaykhana-restaurant-sign.jpeg",
        caption: "Chaykhana N1 и неожиданный русский след в Паттайе"
      },
      {
        src: "/images/day-5/market-restaurant-portrait.jpeg",
        caption: "Вечер за зеленым столом"
      },
      {
        src: "/images/day-5/russian-menu-pattaya.jpeg",
        caption: "Меню с борщом, мантами и пирожками"
      },
      {
        src: "/images/day-5/evening-market-lights.jpeg",
        caption: "Рынок загорается огнями между высотками"
      },
      {
        src: "/images/day-5/blue-siam-dinner.jpeg",
        caption: "Ужин у Blue Siam"
      },
      {
        src: "/videos/day-5/pattaya-market-walk.mov",
        caption: "Видео с вечерней прогулки по рынку",
        type: "video"
      }
    ]
  },
  {
    id: "fa4ef914-11ee-4065-88fe-239a583cc46b",
    seedKey: "pool-sea-pina-colada-chill",
    title: "Чилл у бассейна, пина колада и море",
    body:
      "Сегодня без подвигов и маршрутов: просто нормальный отпускной день. Устроились у бассейна, взяли пина коладу, поймали солнце, потом выбрались к морю и зависли на лежаках с видом на воду. Даже местный геккон отметился в дневнике, как маленький знак, что мы уже в тайском режиме: меньше спешки, больше воздуха, воды и простого кайфа.",
    mood: "чилл",
    moodColor: "gold",
    locationName: "Mayaana Beach Resort Pattaya и пляж рядом",
    visitedAt: "21 августа",
    visitedAtIso: "2026-08-21T15:17:00+07:00",
    tags: ["паттайя", "бассейн", "море", "пина колада", "чилл"],
    photos: [
      {
        src: "/images/day-4/pool-chill-peace.jpeg",
        caption: "Бассейн, вода и полный режим отдыха"
      },
      {
        src: "/images/day-4/pina-colada-pool.jpeg",
        caption: "Пина колада у бассейна"
      },
      {
        src: "/images/day-4/sunny-gecko.jpeg",
        caption: "Местный геккон на солнечной стене"
      },
      {
        src: "/images/day-4/leo-beer-sea-view.jpeg",
        caption: "Холодный Leo с видом на море"
      },
      {
        src: "/images/day-4/beach-loungers-sea.jpeg",
        caption: "Лежаки, песок и спокойное море"
      },
      {
        src: "/images/day-4/pool-lounger-view.jpeg",
        caption: "Ленивая пауза у бассейна"
      },
      {
        src: "/images/day-4/beach-leo-chill-cropped.jpeg",
        caption: "Пляжный чилл без лишнего в кадре"
      }
    ]
  },
  {
    id: "b3f58dd2-7efe-48f4-b2aa-4b2c1c77f940",
    seedKey: "first-sea-breakfast-ganesha",
    title: "Первый поход к морю, завтрак и Ганеша",
    body:
      "Утро началось с первого нормального выхода к морю. Паттайя встретила не открыткой с лазурной водой, а живым ветром, волнами, мокрыми камнями и серым небом — зато сразу стало понятно: мы правда у моря. После прогулки налупились фруктов на завтраке, по пути заметили бананы прямо в зелени и статую Ганеши у отеля. Получилась спокойная первая тайская утренняя глава: море, фрукты, немного ветра и ощущение, что организм наконец догоняет отпуск.",
    mood: "утро у моря",
    moodColor: "cyan",
    locationName: "North Pattaya, рядом с Mayaana Beach Resort",
    visitedAt: "20 августа, 11:20",
    visitedAtIso: "2026-08-20T11:20:00+07:00",
    tags: ["паттайя", "море", "завтрак", "фрукты", "ганеша"],
    photos: [
      {
        src: "/images/day-3/first-sea-island-view.jpeg",
        caption: "Первый вид на море и острова"
      },
      {
        src: "/images/day-3/first-sea-pattaya-skyline.jpeg",
        caption: "Паттайя за волнами"
      },
      {
        src: "/images/day-3/first-sea-couple-waves.jpeg",
        caption: "Первый выход к воде"
      },
      {
        src: "/images/day-3/first-sea-couple-selfie.jpeg",
        caption: "Утро на берегу"
      },
      {
        src: "/images/day-3/first-sea-shore-portrait.jpeg",
        caption: "Волны прямо у ног"
      },
      {
        src: "/images/day-3/first-sea-shore-standing.jpeg",
        caption: "Берег рядом с отелем"
      },
      {
        src: "/images/day-3/breakfast-bananas.jpeg",
        caption: "Бананы в зелени по пути с завтрака"
      },
      {
        src: "/images/day-3/breakfast-sea-garden-view.jpeg",
        caption: "Зелень, море и пасмурное утро"
      },
      {
        src: "/images/day-3/breakfast-ganesha-statue.jpeg",
        caption: "Статуя Ганеши, которую заметили на завтраке"
      }
    ]
  },
  {
    id: "f8f72ed1-1c48-4c88-a6dc-2a8d5722847a",
    seedKey: "pattaya-night-food-foggy-sanctuary",
    title: "Ночная вылазка за едой и Храм Истины в тумане",
    body:
      "После перелета и дороги организм попросил простого: выйти ночью за едой и хоть немного почувствовать район вокруг отеля. В итоге получилась первая бытовая Паттайя: вывески на русском и тайском, заказ на кассе, картошка, холодные напитки и уличный алтарь по дороге. А потом с балкона проявился Храм Истины в тумане — почти призрак за деревьями, очень тихий и странно красивый финал первого тайского дня.",
    mood: "ночная Паттайя",
    moodColor: "purple",
    locationName: "North Pattaya, рядом с Mayaana Beach Resort",
    visitedAt: "19 августа, 22:43",
    visitedAtIso: "2026-08-19T22:43:00+07:00",
    tags: ["паттайя", "еда", "ночь", "храм истины"],
    photos: [
      {
        src: "/images/day-2/pattaya-night-food-teremok.jpeg",
        caption: "Ночная улица и кафе напротив"
      },
      {
        src: "/images/day-2/pattaya-night-food-order.jpeg",
        caption: "Первый поздний заказ после дороги"
      },
      {
        src: "/images/day-2/pattaya-night-mcdonalds.jpeg",
        caption: "Простая еда, которая спасает после перелета"
      },
      {
        src: "/images/day-2/pattaya-night-shrine.jpeg",
        caption: "Уличный алтарь по дороге обратно"
      },
      {
        src: "/images/day-2/sanctuary-of-truth-fog-night.jpeg",
        caption: "Храм Истины в тумане с балкона"
      }
    ]
  },
  {
    id: "47bed2e5-23ce-468d-b8db-55ce247b1585",
    seedKey: "mayaana-beach-resort-arrival",
    title: "Мы в Таиланде: Mayaana Beach Resort Pattaya",
    body:
      "Долетели, доехали до Паттайи и наконец выдохнули уже в отеле Mayaana Beach Resort Pattaya. За окном море и Sanctuary of Truth, в лобби холодные фиолетовые напитки, на балконе ноутбук, вода и ощущение: отпуск реально начался. После дороги все немного ватные, но это уже приятная усталость в правильном месте.",
    mood: "мы на месте",
    moodColor: "green",
    locationName: "Mayaana Beach Resort Pattaya, North Pattaya",
    visitedAt: "19 августа, 12:30",
    visitedAtIso: "2026-08-19T12:30:00+07:00",
    tags: ["тайланд", "паттайя", "отель", "mayaana"],
    photos: [
      {
        src: "/images/day-2/mayaana-welcome-drinks.jpeg",
        caption: "Welcome drinks после дороги"
      },
      {
        src: "/images/day-2/mayaana-balcony-work.jpeg",
        caption: "Балкон, ноутбук и первый тайский воздух"
      },
      {
        src: "/images/day-2/mayaana-balcony-view.jpeg",
        caption: "Вид с балкона на Sanctuary of Truth"
      },
      {
        src: "/images/day-2/sanctuary-of-truth-view.jpeg",
        caption: "Sanctuary of Truth из района отеля"
      },
      {
        src: "/images/day-2/mayaana-sea-view.jpeg",
        caption: "Море и пасмурная Паттайя из окна"
      }
    ]
  },
  {
    id: "d93e2c90-235c-4ff9-b4b8-0f9b84c8e008",
    seedKey: "bangkok-to-pattaya-road",
    title: "Первый взгляд на Таиланд из окна машины",
    body:
      "После посадки поехали из Бангкока в сторону Паттайи. За окном сразу другой ритм: тайские надписи, эстакады, влажное небо, зелень вдоль дороги и первые золотые крыши храмов. Сон еще где-то в самолете, но мозг уже цепляется за каждую вывеску: мы действительно в Таиланде.",
    mood: "переключение",
    moodColor: "cyan",
    locationName: "Бангкок -> Паттайя",
    visitedAt: "19 августа, 10:40",
    visitedAtIso: "2026-08-19T10:40:00+07:00",
    tags: ["тайланд", "дорога", "паттайя", "такси"],
    photos: [
      {
        src: "/images/day-2/taxi-thai-numbers.jpeg",
        caption: "Первые расчеты и тайские цифры в дороге"
      },
      {
        src: "/images/day-2/pattaya-road-temple.jpeg",
        caption: "Золотые крыши по пути"
      },
      {
        src: "/images/day-2/pattaya-road-sign.jpeg",
        caption: "Тайские знаки и полосатые бордюры"
      },
      {
        src: "/images/day-2/pattaya-road-overpass.jpeg",
        caption: "Дорога в сторону Паттайи"
      }
    ]
  },
  {
    id: "0d8790c9-2d8b-4292-93dd-82ab10dbc161",
    seedKey: "moscow-bangkok-flight-story",
    title: "Ночь в небе и утренний заход на Бангкок",
    body:
      "Перелет Москва -> Бангкок получился отдельной главой: ночной Шереметьево, огни города под крылом, потом облака, светлое небо и поля Таиланда перед посадкой. Девять часов пролетели странным сном между часовыми поясами, а внизу уже была новая страна.",
    mood: "между часовыми поясами",
    moodColor: "blue",
    locationName: "Москва -> Бангкок",
    visitedAt: "19 августа, 09:10",
    visitedAtIso: "2026-08-19T09:10:00+07:00",
    tags: ["самолет", "бангкок", "перелет", "тайланд"],
    photos: [
      {
        src: "/images/day-2/sheremetyevo-plane-window.jpeg",
        caption: "У крыла в Шереметьево"
      },
      {
        src: "/images/day-2/night-flight-city-lights.jpeg",
        caption: "Ночной город под крылом"
      },
      {
        src: "/images/day-2/flight-above-clouds.jpeg",
        caption: "Утро над облаками"
      },
      {
        src: "/images/day-2/thailand-approach-fields.jpeg",
        caption: "Поля Таиланда перед посадкой"
      },
      {
        src: "/images/day-2/thailand-approach-clouds.jpeg",
        caption: "Снижение сквозь облака"
      }
    ]
  },
  {
    id: "1c84db3a-ed35-4ca1-b235-650b44e58c44",
    seedKey: "vdnh-before-flight",
    title: "ВДНХ перед вылетом: последняя московская прогулка",
    body:
      "Перед прогулкой выбрались из московского отеля с рюкзаками и чемоданами, а потом успели пройтись по ВДНХ. Пасмурное небо, арки, павильоны, фонтан, золотые детали и спокойная московская пауза перед ночным перелетом. Хороший способ закрыть московскую часть маршрута: без суеты, но уже с билетом в Таиланд в голове.",
    mood: "перед большим рывком",
    moodColor: "cyan",
    locationName: "Москва, ВДНХ",
    visitedAt: "18 августа, 17:20",
    visitedAtIso: "2026-08-18T17:20:00+03:00",
    tags: ["москва", "вднх", "прогулка", "перед вылетом"],
    photos: [
      {
        src: "/images/day-2/moscow-before-vdnh-selfie.jpeg",
        caption: "Собираемся на прогулку по Москве"
      },
      {
        src: "/images/day-2/moscow-before-vdnh-luggage.jpeg",
        caption: "Перед ВДНХ и аэропортом"
      },
      {
        src: "/images/day-2/vdnh-main-gate-portrait.jpeg",
        caption: "Главный вход ВДНХ"
      },
      {
        src: "/images/day-2/vdnh-main-gate-wide.jpeg",
        caption: "Арка и павильон на оси"
      },
      {
        src: "/images/day-2/vdnh-pavilion-detail.jpeg",
        caption: "Золотой шпиль павильона"
      },
      {
        src: "/images/day-2/vdnh-fountain-back.jpeg",
        caption: "Фонтан и последние кадры Москвы"
      },
      {
        src: "/images/day-2/vdnh-fountain-portrait.jpeg",
        caption: "Пасмурный портрет у фонтана"
      },
      {
        src: "/images/day-2/vdnh-pavilion-roof.jpeg",
        caption: "Детали павильона"
      },
      {
        src: "/images/day-2/vdnh-pavilion-statue.jpeg",
        caption: "Скульптура на крыше"
      },
      {
        src: "/images/day-2/vdnh-space-pavilion-plane.jpeg",
        caption: "Самолет у павильона Космос"
      },
      {
        src: "/images/day-2/vdnh-rooftop-statue.jpeg",
        caption: "Еще одна московская деталь перед аэропортом"
      }
    ]
  },
  {
    id: "ab43a8d4-5df8-4f6d-a611-d7894f25f211",
    seedKey: "moscow-bangkok-flight",
    title: "Шереметьево: посадка на рейс в Бангкок",
    body:
      "После ВДНХ добрались до Шереметьево, прошли все предполетные круги и наконец оказались у гейта. Терминал C, быстрый перекус, пара пластиковых стаканов за отпуск и вид на самолеты за стеклом — тот самый момент, когда поездка перестает быть планом и становится посадочным талоном.",
    mood: "готовы к взлету",
    moodColor: "green",
    locationName: "Москва, Шереметьево Terminal C",
    visitedAt: "18 августа, 22:25",
    visitedAtIso: "2026-08-18T22:25:00+03:00",
    tags: ["шереметьево", "посадка", "бангкок", "самолет"],
    photos: [
      {
        src: "/images/day-2/sheremetyevo-terminal-c.jpeg",
        caption: "Шереметьево, Terminal C"
      },
      {
        src: "/images/day-2/sheremetyevo-before-flight-beer.jpeg",
        caption: "Последняя пауза перед посадкой"
      },
      {
        src: "/images/day-2/sheremetyevo-gate-night.jpeg",
        caption: "Ночной гейт и самолеты за стеклом"
      }
    ]
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
    id: "7aa1d2c5-0e56-4f5b-a7f0-0bd543c20157",
    name: "Historic City of Ayutthaya",
    category: "исторический парк",
    rating: 5,
    notes:
      "Древняя столица Сиама и объект Всемирного наследия UNESCO: храмы, ступы, красный кирпич и большой день среди истории."
  },
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

function getInitialTripDays(posts: Post[]) {
  if (posts.length === 0) {
    return 1;
  }

  const dayStarts = posts.map((post) => {
    const date = new Date(post.visitedAtIso ?? "");
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

    return new Date(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate()).getTime();
  });
  const earliestDay = Math.min(...dayStarts);
  const latestDay = Math.max(...dayStarts);

  return Math.floor((latestDay - earliestDay) / 86400000) + 1;
}

export const tripStats: TripStats = {
  posts: initialPosts.length,
  photos: initialPosts.reduce((sum, post) => sum + post.photos.length, 0),
  places: initialPlaces.length,
  days: getInitialTripDays(initialPosts),
  ideasProgress: 33,
  currentMood: "Аюттхая, храмы и древняя столица Сиама"
};
