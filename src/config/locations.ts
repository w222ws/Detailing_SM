/**
 * ЛОКАЦІЇ — адреси студій Detailing SM.
 * Джерело правди для кнопок «залишити відгук» (розділ #reviews),
 * а далі — для #contacts і футера.
 *
 * TODO: підставити реальні адреси та посилання.
 * • mapUrl — картка студії в Google Maps.
 * • reviewUrl — пряме посилання на форму відгуку цієї студії:
 *   https://search.google.com/local/writereview?placeid=<PLACE_ID>
 */

export interface Location {
  id: string;
  /** Повна адреса студії — показується як є, одним рядком */
  address: string;
  mapUrl: string;
  reviewUrl: string;
}

export const locations: Location[] = [
  {
    id: 'studio-1',
    address: 'м. Дніпро, вул. Петра Бикова, 16',
    mapUrl: 'https://share.google/zA935sGCswqAomINV',
    reviewUrl: 'https://g.page/r/CV2yqUAJQ90YEAE/review',
  },
  {
    id: 'studio-2',
    address: 'м. Дніпро, вул. Мольєра, 1',
    mapUrl: 'https://share.google/wsravT6X8Zxh237ik',
    reviewUrl: 'https://g.page/r/CUBq-ThwkJYDEAE/review',
  },
];
