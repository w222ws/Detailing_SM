export type ComparePair = {
  before: string;
  after: string;
};

export const worksIntro =
  'Один дотик повзунка показує, що було і що стало. Нижче — решта робіт з останніх виконаних послуг.';

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
