/**
 * ЄДИНЕ ДЖЕРЕЛО ПРАВДИ — Detailing SM.
 * Міняєш значення тут → оновлюється по всьому сайту.
 *
 * Правило: у компонентах немає жодного хардкоду тексту, телефона,
 * адреси чи ціни. Усе береться звідси.
 *
 * Іконки — рядкові назви з @phosphor-icons/react (див. iconMap у компонентах).
 */

/* ==========================================================================
   1. СИРІ ЗНАЧЕННЯ: тільки це міняємо руками
   ========================================================================== */

/** Номер у міжнародному форматі, без пробілів: +380XXXXXXXXX */
const PHONE_E164 = '+380973624845';
/** Як номер виглядає на сайті */
const PHONE_DISPLAY = '+38 (097) 362-48-45';

/** Нік у Telegram без @ */
const TELEGRAM_USERNAME = 'EvtushenkoJenya';
/** Повне посилання на Instagram — саме так, як дав клієнт
 *  (містить службовий параметр vrfl, тому не збираємо з username). */
const INSTAGRAM_URL =
  'https://www.instagram.com/detailing_s.m?vrfl=MXdlNHZtZXp4eXRyNQ==';
/** Нік для підпису в UI, береться з самого посилання вище */
const INSTAGRAM_HANDLE = 'detailing_s.m';
/** Номер для WhatsApp, зазвичай той самий, що й телефон */
const WHATSAPP_E164 = PHONE_E164;

const SITE_URL = 'https://detailing-sv.com.ua';

/* ==========================================================================
   2. ПОХІДНІ ПОСИЛАННЯ: вручну не чіпати
   ========================================================================== */

/** "+380973624845" → "380973624845" (для wa.me потрібні лише цифри) */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

export type ContactId = 'phone' | 'telegram' | 'instagram' | 'whatsapp';

export interface Contact {
  id: ContactId;
  /** Назва для підписів і aria-label */
  label: string;
  /** Що показуємо користувачу */
  display: string;
  /** Куди веде посилання */
  href: string;
  /** Чи відкривати в новій вкладці (для месенджерів — так) */
  external: boolean;
  /** Назва іконки з @phosphor-icons/react */
  icon: 'PhoneCall' | 'TelegramLogo' | 'InstagramLogo' | 'WhatsappLogo';
  /** Для кольорового ховера, якщо захочемо фірмові кольори месенджерів */
  tint: string;
}

export const contacts: Record<ContactId, Contact> = {
  phone: {
    id: 'phone',
    label: 'Зателефонувати',
    display: PHONE_DISPLAY,
    href: `tel:${PHONE_E164}`,
    external: false,
    icon: 'PhoneCall',
    tint: '#ffe600',
  },
  telegram: {
    id: 'telegram',
    label: 'Написати в Telegram',
    display: `@${TELEGRAM_USERNAME}`,
    href: `https://t.me/${TELEGRAM_USERNAME}`,
    external: true,
    icon: 'TelegramLogo',
    tint: '#29a9eb',
  },
  instagram: {
    id: 'instagram',
    label: 'Ми в Instagram',
    display: `@${INSTAGRAM_HANDLE}`,
    href: INSTAGRAM_URL,
    external: true,
    icon: 'InstagramLogo',
    tint: '#e1306c',
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'Написати у WhatsApp',
    display: PHONE_DISPLAY,
    href: `https://wa.me/${digitsOnly(WHATSAPP_E164)}`,
    external: true,
    icon: 'WhatsappLogo',
    tint: '#25d366',
  },
};

/** Порядок, у якому контакти показуються в UI */
export const contactList: Contact[] = [
  contacts.phone,
  contacts.telegram,
  contacts.instagram,
  contacts.whatsapp,
];

/** Тільки месенджери — для рядка іконок у хедері/футері */
export const messengers: Contact[] = [
  contacts.telegram,
  contacts.instagram,
  contacts.whatsapp,
];

/* ==========================================================================
   3. БРЕНД
   ========================================================================== */

export const brand = {
  name: 'Detailing SM',
  /** Коротко, великими — в хедері та футері */
  short: 'SM',
  tagline: 'Студія преміум детейлінгу',
  /** Рядок під H1 у хіро */
  promise: 'Повертаємо авто стан «з салону» — і тримаємо його роками',
  city: 'Дніпро',
  url: SITE_URL,
  /** Рік заснування — для футера «© 2019–2026» */
  since: 2019,
} as const;

/* ==========================================================================
   4. ЛОКАЦІЇ (дві студії)
   ========================================================================== */

export interface Location {
  id: string;
  /** Як називаємо точку в UI: «Центр», «Лівий берег» тощо */
  title: string;
  street: string;
  city: string;
  /** Підказка: орієнтир, в'їзд, паркінг */
  note?: string;
  /** Посилання на Google Maps */
  mapUrl: string;
  /** Для вбудованої карти / маркера */
  coords: { lat: number; lng: number };
  hours: string;
  phone: Contact;
}

export const locations: Location[] = [
  {
    id: 'bykova',
    title: 'Студія №1',
    street: 'вул. Петра Бикова, 16',
    city: 'Дніпро',
    note: 'Заїзд з двору, є паркінг для клієнтів',
    mapUrl: 'https://maps.google.com/?q=Дніпро, вул. Петра Бикова, 16',
    coords: { lat: 48.4647, lng: 35.0462 },
    hours: 'Щодня, 09:00–19:00',
    phone: contacts.phone,
  },
  {
    // TODO: клієнт сам підставить точне посилання на карту (mapUrl)
    id: 'second',
    title: 'Студія №2',
    street: 'вул. Мольєра, 1',
    city: 'Дніпро',
    note: '',
    mapUrl: 'https://maps.google.com/?q=Дніпро, вул. Мольєра, 1',
    coords: { lat: 48.4647, lng: 35.0462 },
    hours: 'Щодня, 09:00–19:00',
    phone: contacts.phone,
  },
];

export const business = {
  city: 'Дніпро',
  serviceArea: 'Дніпро та область',
  /** Студія без вихідних — працюємо щодня */
  workHours: 'Щодня, 09:00–19:00',
} as const;

/* ==========================================================================
   5. НАВІГАЦІЯ (якорі на секції)
   ========================================================================== */

export interface NavItem {
  label: string;
  href: `#${string}`;
}

export const navigation: NavItem[] = [
  { label: 'Послуги', href: '#services' },
  { label: 'Роботи', href: '#works' },
  { label: 'Процес', href: '#process' },
  { label: 'Відгуки', href: '#reviews' },
  { label: 'Питання', href: '#faq' },
  { label: 'Контакти', href: '#contacts' },
];

/* ==========================================================================
   6. ЛІЧИЛЬНИКИ (смуга під хіро)
   TODO: підставити реальні цифри — краще скромні, але чесні
   ========================================================================== */

export interface Stat {
  value: number;
  /** Що дописати після цифри: '+', '%', ' років' */
  suffix?: string;
  label: string;
  icon: string;
}

export const stats: Stat[] = [
  { value: 7, suffix: ' років', label: 'у детейлінгу', icon: 'Timer' },
  { value: 1200, suffix: '+', label: 'авто пройшло бокс', icon: 'Car' },
  { value: 2, label: 'студії в Дніпрі', icon: 'MapPin' },
  { value: 5, suffix: ' років', label: 'гарантія на кераміку', icon: 'Medal' },
];

/* ==========================================================================
   7. ПОСЛУГИ І ЦІНИ
   TODO: ціни — підставити реальні. Формат «від …» лишаємо:
   точну суму називаємо після огляду.
   ========================================================================== */

export interface Service {
  id: string;
  title: string;
  /** Один рядок під заголовком */
  summary: string;
  /** 3–4 пункти, що входить */
  includes: string[];
  priceFrom: string;
  duration: string;
  icon: string;
  /** Виділити карточку як рекомендовану */
  featured?: boolean;
}

export const services: Service[] = [
  {
    id: 'ceramic',
    title: 'Керамічне покриття',
    summary: 'Глибина кольору, гідрофоб і захист лаку на роки',
    includes: [
      'Багатоетапна підготовка кузова',
      'Полірування під нанесення',
      'Кераміка 9H, 2–4 шари',
      'Гарантія та карта догляду',
    ],
    priceFrom: 'від 12 000 ₴',
    duration: '2–4 дні',
    icon: 'ShieldCheck',
    featured: true,
  },
  {
    id: 'ppf',
    title: 'Антигравійна плівка PPF',
    summary: 'Фізичний захист від сколів, піску та реагентів',
    includes: [
      'Зони удару або повний кузов',
      'Викрійки під вашу модель',
      'Загин кромок, без «хвостів»',
      'Самовідновлення мікроподряпин',
    ],
    priceFrom: 'від 18 000 ₴',
    duration: '1–5 днів',
    icon: 'Shield',
  },
  {
    id: 'polish',
    title: 'Полірування кузова',
    summary: 'Прибираємо павутинку, голограми й матовість лаку',
    includes: [
      'Замір товщини ЛФП',
      'Абразивне або захисне полірування',
      'Контроль під світлом',
      'Фінішний захист',
    ],
    priceFrom: 'від 6 000 ₴',
    duration: '1–2 дні',
    icon: 'Sparkle',
  },
  {
    id: 'interior',
    title: 'Хімчистка салону',
    summary: 'Повернення салону до стану «новий», без запахів',
    includes: [
      'Демонтаж елементів за потреби',
      'Шкіра, тканина, алькантара',
      'Озонування і дезінфекція',
      'Кондиціонер для шкіри',
    ],
    priceFrom: 'від 4 500 ₴',
    duration: '1 день',
    icon: 'Armchair',
  },
  {
    id: 'glass',
    title: 'Захист скла «антидощ»',
    summary: 'Вода зривається потоком — видимість у зливу інша',
    includes: [
      'Очищення скла від плівки',
      'Полірування від подряпин двірників',
      'Гідрофобне покриття',
      'Обробка фар',
    ],
    priceFrom: 'від 1 500 ₴',
    duration: '2–4 години',
    icon: 'Drop',
  },
  {
    id: 'presale',
    title: 'Передпродажна підготовка',
    summary: 'Комплекс, який додає авто ціни на огляді',
    includes: [
      'Повний зовнішній комплекс',
      'Хімчистка салону',
      'Моторний відсік',
      'Фотосесія для оголошення',
    ],
    priceFrom: 'від 7 000 ₴',
    duration: '1–2 дні',
    icon: 'Tag',
  },
];

/* ==========================================================================
   8. ПРОЦЕС: як працюємо
   ========================================================================== */

export interface Step {
  index: string;
  title: string;
  text: string;
  icon: string;
}

export const steps: Step[] = [
  {
    index: '01',
    title: 'Огляд і діагностика',
    text: 'Дивимось лак під лампою, міряємо товщину, показуємо дефекти вам особисто. Безкоштовно.',
    icon: 'MagnifyingGlass',
  },
  {
    index: '02',
    title: 'План робіт і ціна',
    text: 'Узгоджуємо комплекс, матеріали й терміни. Фінальна сума фіксується до старту.',
    icon: 'ClipboardText',
  },
  {
    index: '03',
    title: 'Робота в боксі',
    text: 'Беремо обмежену кількість авто одночасно. Скидаємо фото етапів у Telegram.',
    icon: 'Wrench',
  },
  {
    index: '04',
    title: 'Видача і догляд',
    text: 'Приймання при світлі, карта догляду, гарантія. Далі — безкоштовний контрольний огляд.',
    icon: 'Key',
  },
];

/* ==========================================================================
   9. FAQ (дублюється в JSON-LD у index.html — тримати синхронно)
   ========================================================================== */

export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: 'Скільки часу займає нанесення керамічного покриття?',
    a: 'Залежить від стану лаку. Комплекс із підготовкою, поліруванням і нанесенням кераміки зазвичай займає від 2 до 4 днів — авто лишається в студії.',
  },
  {
    q: 'Чим антигравійна плівка PPF краща за кераміку?',
    a: 'PPF фізично захищає лак від сколів і піску, кераміка дає гідрофобність, глибину кольору та спрощує миття. Часто їх комбінують: плівка на зони ударів, кераміка поверх усього кузова.',
  },
  {
    q: 'Чи потрібен попередній запис?',
    a: 'Так. Ми беремо обмежену кількість авто одночасно, тому дату узгоджуємо заздалегідь за телефоном або в Telegram чи WhatsApp.',
  },
  {
    q: 'Як доглядати за авто після детейлінгу?',
    a: 'Безконтактне миття з pH-нейтральною хімією, без «метеликів» і жорстких щіток. Детальні рекомендації видаємо разом з авто.',
  },
  {
    q: 'Скільки коштує детейлінг?',
    a: 'Ціна залежить від класу авто, стану покриття та обраного комплексу. Орієнтовні суми вказані в розділі «Послуги», точну називаємо після огляду — безкоштовно.',
  },
];

/* ==========================================================================
   10. МАРКІ-СТРІЧКА (біжучий рядок під хіро)
   ========================================================================== */

export const marqueeWords: string[] = [
  'Кераміка 9H',
  'PPF',
  'Полірування',
  'Хімчистка',
  'Антидощ',
  'Детейлінг-мийка',
  'Гарантія',
  'Дніпро',
];

/* ==========================================================================
   11. ГАЛЕРЕЯ / ДО-ПІСЛЯ
   TODO: покласти файли в /public/works і підставити шляхи
   ========================================================================== */

export interface WorkItem {
  id: string;
  title: string;
  /** Що робили */
  service: string;
  car: string;
  before: string;
  after: string;
}

export const works: WorkItem[] = [
  {
    id: 'w1',
    title: 'Чорний лак без павутинки',
    service: 'Полірування + кераміка',
    car: 'BMW 5 G30',
    before: '/works/w1-before.webp',
    after: '/works/w1-after.webp',
  },
  {
    id: 'w2',
    title: 'Салон після 180 тис. км',
    service: 'Хімчистка + озон',
    car: 'Audi Q7',
    before: '/works/w2-before.webp',
    after: '/works/w2-after.webp',
  },
  {
    id: 'w3',
    title: 'Передок під плівкою',
    service: 'PPF, зони удару',
    car: 'Toyota Land Cruiser',
    before: '/works/w3-before.webp',
    after: '/works/w3-after.webp',
  },
];

/* ==========================================================================
   12. ВІДГУКИ
   TODO: замінити на реальні (краще з іменем і авто)
   ========================================================================== */

export interface Review {
  id: string;
  name: string;
  car: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  source?: 'Google' | 'Instagram';
}

export const reviews: Review[] = [
  {
    id: 'r1',
    name: "Ім'я клієнта",
    car: 'Марка, модель',
    text: 'Текст відгуку.',
    rating: 5,
    source: 'Google',
  },
];

/* ==========================================================================
   13. ФУТЕР
   ========================================================================== */

export const footer = {
  about:
    'Студія преміум детейлінгу в Дніпрі. Працюємо з лаком, плівкою та салоном — без поспіху й без «на око».',
  columns: [
    { title: 'Послуги', items: services.map((s) => s.title) },
    { title: 'Навігація', items: navigation.map((n) => n.label) },
  ],
  legal: `© ${brand.since}–${new Date().getFullYear()} ${brand.name}. Усі права захищені.`,
  privacyHref: '#privacy',
} as const;

/* ==========================================================================
   14. ЗАГАЛЬНИЙ ОБ'ЄКТ
   Деякі компоненти зручніше писати як `import { site } from '@/config/site'`
   і далі `site.brand.name`, `site.contacts.phone.href`,
   `site.business.workHours`, `site.messengers` — замість купи окремих
   іменованих імпортів. Іменовані експорти вище лишаються робочими,
   це просто їхній агрегат (ті самі об'єкти, без дублювання).
   ========================================================================== */
export const site = {
  brand,
  business,
  navigation,
  contacts,
  contactList,
  messengers,
  locations,
  stats,
  services,
  steps,
  faq,
  marqueeWords,
  works,
  reviews,
  footer,
} as const;
