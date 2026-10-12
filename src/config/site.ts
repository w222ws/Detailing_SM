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
   4. БІЗНЕС
   ========================================================================== */

export const business = {
  city: 'Дніпро',
  serviceArea: 'Дніпро та область',
  /** Студія без вихідних — працюємо щодня */
  workHours: 'Щодня, 09:00–19:00',
} as const;

/* ==========================================================================
   5. НАВІГАЦІЯ (якорі на секції сторінки)
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
   6. ЗАГАЛЬНИЙ ОБ'ЄКТ — тільки база
   ========================================================================== */

export const site = {
  brand,
  business,
  navigation,
  contacts,
  contactList,
  messengers,
} as const;
