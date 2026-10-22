/* ==========================================================================
   #works — дані для розділу «Наші роботи».

   Фото лежать у src/assets/works/ (*.avif):
   • before.avif + after.avif — пара ДО / ПІСЛЯ для повзунка
     (підійде будь-яка назва, що містить «before» / «after»);
   • усі інші файли (01.avif … 08.avif) — галерея-соти, за порядком імен.

   Список збирається автоматично: додав файл у папку — він з'явився в
   галереї, нічого прописувати не треба. Vite сам ставить хеші в імена
   й кешує їх, імпортувати окремо кожне фото не потрібно.

   Нема before/after — compare = null, і розділ покаже лише галерею.
   Нема нічого — розділ не рендериться.
   ========================================================================== */

export type ComparePair = {
  before: string;
  after: string;
};

/** Підзаголовок розділу — підказує, що повзунок тягнеться рукою */
export const worksIntro =
  'Один дотик повзунка показує, що було і що стало. Нижче — решта робіт з останніх виїздів.';

/* { '../assets/works/01.avif': '/assets/01-abc123.avif', … } */
const files = import.meta.glob<string>(
  '../assets/works/*.{avif,webp,jpg,jpeg,png}',
  {
    eager: true,
    import: 'default',
  },
);

const entries = Object.entries(files)
  .map(([path, url]) => ({
    name: (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase(),
    url,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

const before = entries.find((e) => e.name.includes('before'));
const after = entries.find((e) => e.name.includes('after'));

export const compare: ComparePair | null =
  before && after ? { before: before.url, after: after.url } : null;

export const gallery: string[] = entries
  .filter((e) => e !== before && e !== after)
  .map((e) => e.url);
