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

export const certificate: string | null = certEntry?.url ?? null;

export const certificateInfo = {
  title: 'Сертифікати майстра',
  note: 'Акредитація Gtechniq та Ultimate Car Care',
} as const;

const titleCase = (s: string) =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const partners: Partner[] = entries
  .filter((e) => e !== certEntry)
  .map((e) => ({ name: titleCase(e.name), logo: e.url }));
