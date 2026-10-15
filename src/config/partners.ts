/* ==========================================================================
   #partners — дані для розділу «Партнери та сертифікація».

   Картинки лежать у src/assets/partners/ (*.avif):
   • 4 лого партнерів — підпис (alt) береться з назви файлу, тож називай
     файл як бренд, наприклад "ceramic-pro.avif" → "Ceramic Pro";
   • 1 фото сертифікату — назва файлу має містити "cert" або "sert"
     (certificate.avif, cert.avif, sert.avif тощо) — інакше воно
     потрапить у лого.

   Список збирається автоматично, як і в works.ts: додав файл — він
   з'явився на сайті, нічого прописувати не треба.

   Нема жодного файлу — розділ не рендериться.
   ========================================================================== */

export interface Partner {
  name: string;
  logo: string;
}

const files = import.meta.glob<string>(
  '../assets/partners/*.{avif,webp,jpg,jpeg,png}',
  { eager: true, import: 'default' },
);

const entries = Object.entries(files)
  .map(([path, url]) => ({
    name: (path.split('/').pop() ?? '').replace(/\.[^.]+$/, ''),
    url,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

const certEntry = entries.find((e) => /cert|sert/i.test(e.name));

/** Фото сертифікату (для лайтбоксу) — null, якщо файл не додано */
export const certificate: string | null = certEntry?.url ?? null;

/** "ceramic-pro" → "Ceramic Pro" */
const titleCase = (s: string) =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const partners: Partner[] = entries
  .filter((e) => e !== certEntry)
  .map((e) => ({ name: titleCase(e.name), logo: e.url }));
