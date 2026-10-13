/**
 * ЛОКАЦІЇ — адреси студій Detailing SM.
 * Джерело правди для кнопок «залишити відгук» (розділ #reviews),
 * а далі — для #contacts і футера.
 *
 * TODO: підставити реальні назви, адреси та посилання.
 * • mapUrl — картка студії в Google Maps.
 * • reviewUrl — пряме посилання на форму відгуку цієї студії:
 *   https://search.google.com/local/writereview?placeid=<PLACE_ID>
 */

export interface Location {
  id: string;
  /** Коротка назва студії — великим шрифтом на кнопці */
  title: string;
  /** Повна адреса — дрібним mono під назвою */
  address: string;
  mapUrl: string;
  reviewUrl: string;
}

export const locations: Location[] = [
  {
    id: 'studio-1',
    title: 'Перша студія',
    address: 'вул. Назва, 00',
    mapUrl: '#',
    reviewUrl: '#',
  },
  {
    id: 'studio-2',
    title: 'Друга студія',
    address: 'вул. Назва, 00',
    mapUrl: '#',
    reviewUrl: '#',
  },
];
