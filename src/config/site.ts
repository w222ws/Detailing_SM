/* Контакти, бренд, графік і навігація — єдине джерело правди.
   Змінюєш тут — оновлюється по всьому сайту. Тексти розділів — у своїх
   файлах поруч (hero.ts, services.ts, faq.ts, contact.ts тощо). */

/* ---------- Сирі значення: міняти тільки їх ---------- */

/** Номер без пробілів: +380XXXXXXXXX */
const PHONE_E164 = '+380973624845';
/** Як номер виглядає на сайті */
const PHONE_DISPLAY = '+38 (097) 362-48-45';

const TELEGRAM_PHONE = '+380973624845';

/** Посилання на Instagram — як дав клієнт (із службовим параметром) */
const INSTAGRAM_URL =
  'https://www.instagram.com/detailing_s.m?vrfl=MXdlNHZtZXp4eXRyNQ==';
const INSTAGRAM_HANDLE = 'detailing_s.m';

/** Номер для WhatsApp (зазвичай той самий) */
const WHATSAPP_E164 = PHONE_E164;

const SITE_URL = 'https://detailing-sv.com.ua';

/** "+380973624845" → "380973624845" (для wa.me потрібні лише цифри) */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

/* ---------- Контакти ---------- */

export type ContactId = 'phone' | 'telegram' | 'instagram' | 'whatsapp';

export interface Contact {
  id: ContactId;
  /** Підпис для aria-label */
  label: string;
  /** Що бачить користувач */
  display: string;
  href: string;
  /** Відкривати в новій вкладці */
  external: boolean;
  /** Назва іконки з @phosphor-icons/react */
  icon: 'PhoneCall' | 'TelegramLogo' | 'InstagramLogo' | 'WhatsappLogo';
  /** Фірмовий колір месенджера */
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
    display: `${TELEGRAM_PHONE}`,
    href: `https://t.me/${TELEGRAM_PHONE}`,
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

/** Усі контакти в порядку показу */
export const contactList: Contact[] = [
  contacts.phone,
  contacts.telegram,
  contacts.instagram,
  contacts.whatsapp,
];

/** Лише месенджери (хедер, контакти) */
export const messengers: Contact[] = [
  contacts.telegram,
  contacts.instagram,
  contacts.whatsapp,
];

/* ---------- Бренд і бізнес ---------- */

export const brand = {
  name: 'Detailing SM',
  short: 'SM',
  tagline: 'Студія преміум детейлінгу',
  city: 'Дніпро',
  url: SITE_URL,
  /** Рік заснування — для «© 2019–2026» */
  since: 2019,
} as const;

export const business = {
  city: 'Дніпро',
  serviceArea: 'Дніпро та область',
  workHours: 'Щодня, 09:00–19:00',
} as const;

/* ---------- Навігація (якорі розділів) ---------- */

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

export const site = {
  brand,
  business,
  navigation,
  contacts,
  contactList,
  messengers,
} as const;
