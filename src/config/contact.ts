/**
 * РОЗДІЛ #contacts (він же футер сайту) — тексти.
 * Номер, месенджери, розділи й графік беруться з site.ts,
 * адреси студій і посилання на карту — з locations.ts.
 */

export const contactSection = {
  phoneLabel: 'Зателефонувати',
  /** На комп'ютері кнопка не дзвонить, а копіює номер */
  copyLabel: 'Скопіювати номер',
  copiedLabel: 'Номер скопійовано',
  navLabel: 'Розділи',
  messengersLabel: 'Месенджери',
  whereLabel: 'Де і коли',
  upLabel: 'Нагору',
  /** Права внизу: «© {since}–{рік} {brand.name}. {rights}» */
  rights: 'Усі права захищені.',
  developerLabel: 'Розробка сайту:',
} as const;

/** Розробник сайту (лише текст, без іконки). Встав свій нік і посилання. */
export const developer = {
  name: 'Tarasov Kyrylo',
  href: 'https://t.me/off044',
} as const;
