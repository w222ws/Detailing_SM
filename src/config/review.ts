/**
 * СТОРІНКА ВІДГУКІВ — /review (сюди веде QR-код).
 * Тексти сторінки й шлях. Посилання на форми відгуків (по одному на
 * кожну студію) беруться з config/locations.ts → reviewUrl.
 */

export const REVIEW_PATH = '/review';

export const reviewPage = {
  title: 'Дякуємо, що обрали',
  subtitle:
    'Ваша оцінка допомагає іншим водіям знайти майстрів, яким можна довірити авто.',
  chooseLabel: 'Оберіть студію, де були',
  contactsLabel: 'Або напишіть нам напряму',
  backLabel: 'На головну',
  /** Мала ланка в розділі #reviews на головній — веде на /review */
  pageLinkLabel: 'Сторінка для відгуків',
} as const;
