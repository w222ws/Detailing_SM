/**
 * Единый источник правды. Всё меняем только здесь.
 * Положить в: src/config/site.ts
 */

const digits = (v: string) => v.replace(/\D/g, '');

const PHONE = '+380 (00) 000-00-00'; // TODO: реальный номер

export const site = {
  name: 'Detailing SV',
  url: 'https://detailing-sv.com.ua', // TODO: реальный домен

  phone: PHONE,
  phoneHref: `tel:+${digits(PHONE)}`,

  address: 'вул. Петра Бикова, 16, Дніпро',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Дніпро,+вул.+Петра+Бикова,+16',

  hours: 'Пн–Сб: 09:00–19:00',

  instagram: {
    label: 'Instagram',
    handle: '@detailing_sv',
    url: 'https://instagram.com/detailing_sv',
  }, // TODO
  telegram: {
    label: 'Telegram',
    handle: '@detailing_sv',
    url: 'https://t.me/detailing_sv',
  }, // TODO
  whatsapp: {
    label: 'WhatsApp',
    handle: PHONE,
    url: `https://wa.me/${digits(PHONE)}`,
  },
} as const;

/** Для .map() в футере / контактах */
export const socials = [site.instagram, site.telegram, site.whatsapp] as const;
