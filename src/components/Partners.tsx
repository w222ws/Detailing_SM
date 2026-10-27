import { useEffect, useRef, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { MagnifyingGlassPlusIcon, XIcon } from '@phosphor-icons/react';
import { certificate, certificateInfo, partners } from '../config/partners';

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

function gridFor(n: number) {
  if (n % 6 === 0) return { cols: 'grid-cols-2 sm:grid-cols-3', note: false };
  if ((n + 1) % 6 === 0)
    return { cols: 'grid-cols-2 sm:grid-cols-3', note: true };
  if (n % 2 === 0) return { cols: 'grid-cols-2', note: false };
  return { cols: 'grid-cols-2', note: true };
}
const GRID = gridFor(partners.length);
const NOTE = 'Повний пакет сертифікатів покажемо в студії';

function PartnerLogo({ src, name }: { src: string; name: string }) {
  const [ratio, setRatio] = useState<number | null>(null);
  return (
    <img
      src={src}
      alt={name}
      title={name}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
        if (w && h) setRatio(w / h);
      }}
      style={
        ratio ? { width: `${(Math.sqrt(ratio) * 4).toFixed(2)}em` } : undefined
      }
      className={cx(
        'h-auto max-h-[70%] max-w-[80%] object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100',
        !ratio && 'invisible',
      )}
    />
  );
}

function CertificateLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label={certificateInfo.title}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-bg-main/96 p-0 text-text-main backdrop:bg-transparent"
    >
      <div className="grid size-full place-items-center p-4 sm:p-10">
        <img
          src={src}
          alt={certificateInfo.title}
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="clip-cut-sm absolute top-3 right-3 grid size-12 place-items-center bg-accent-yellow text-bg-main shadow-card transition-transform active:scale-90"
      >
        <XIcon aria-hidden weight="bold" className="size-5" />
      </button>
    </dialog>
  );
}

export function Partners() {
  const [certOpen, setCertOpen] = useState(false);

  if (!certificate && partners.length === 0) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="partners"
        className="relative overflow-hidden bg-bg-main py-16 sm:py-20 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="clip-cut absolute -top-16 -right-24 size-72 rotate-[11deg] border border-border-subtle/50 sm:size-[26rem]" />
          <div className="clip-cut-sm absolute -bottom-16 -left-20 size-56 -rotate-[13deg] border border-accent-yellow/15 sm:size-80" />
          <div className="absolute top-20 right-0 h-px w-28 bg-linear-to-l from-accent-yellow/45 to-transparent sm:w-44" />
        </div>

        <div className="container-site relative">
          <div
            className={cx(
              'grid gap-10',
              !!certificate &&
                partners.length > 0 &&
                'lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_18.5rem] xl:gap-20',
            )}
          >
            {/* Ліворуч: заголовок + стіна лого */}
            <div className="min-w-0">
              <m.h2
                {...reveal()}
                className="font-display text-3xl text-text-main uppercase sm:text-4xl lg:text-5xl"
              >
                Партнери та{' '}
                <span className="text-accent-yellow">сертифікація</span>
              </m.h2>
              <m.p
                {...reveal(0.08)}
                className="mt-4 max-w-lg text-sm text-text-muted sm:text-base"
              >
                Працюємо на матеріалах брендів, з якими маємо офіційне
                партнерство — без підробок і «аналогів».
                {!GRID.note && ` ${NOTE}.`}
              </m.p>

              {partners.length > 0 && (
                <m.ul
                  {...reveal(0.14)}
                  aria-label="Партнери"
                  className={cx(
                    'clip-cut mt-8 grid gap-px overflow-hidden border border-border-subtle bg-border-subtle sm:mt-10',
                    GRID.cols,
                  )}
                >
                  {partners.map((p) => (
                    <li
                      key={p.name}
                      className="group grid h-24 place-items-center bg-bg-elevated px-4 text-[13px] transition-colors duration-300 hover:bg-bg-card sm:h-28 sm:text-[17px] lg:h-36 lg:text-[22px]"
                    >
                      <PartnerLogo src={p.logo} name={p.name} />
                    </li>
                  ))}
                  {GRID.note && (
                    <li className="flex h-24 items-center bg-bg-elevated px-4 sm:h-28 sm:px-6 lg:h-36">
                      <p className="border-l-2 border-accent-yellow/70 pl-3 text-xs leading-snug text-text-dim sm:text-sm">
                        {NOTE}
                      </p>
                    </li>
                  )}
                </m.ul>
              )}
            </div>

            {certificate && (
              <m.button
                {...reveal(0.2)}
                type="button"
                onClick={() => setCertOpen(true)}
                aria-label={`${certificateInfo.title} — відкрити на весь екран`}
                className="clip-cut group flex w-full items-center gap-4 self-start border border-border-subtle bg-bg-elevated p-3 text-left outline-none transition-colors duration-300 hover:border-accent-yellow/50 focus-visible:border-accent-yellow lg:block lg:cursor-zoom-in"
              >
                <span className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden bg-bg-card sm:w-24 lg:w-full">
                  <img
                    src={certificate}
                    alt={certificateInfo.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:mt-3 lg:px-1">
                  <span className="min-w-0">
                    <span className="block font-display text-base font-bold text-text-main uppercase sm:text-lg">
                      {certificateInfo.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-dim sm:text-sm">
                      {certificateInfo.note}
                    </span>
                  </span>
                  <MagnifyingGlassPlusIcon
                    aria-hidden
                    weight="bold"
                    className="size-5 shrink-0 text-text-dim transition-colors duration-300 group-hover:text-accent-yellow"
                  />
                </span>
              </m.button>
            )}
          </div>
        </div>

        {certOpen && certificate && (
          <CertificateLightbox
            src={certificate}
            onClose={() => setCertOpen(false)}
          />
        )}
      </section>
    </LazyMotion>
  );
}

export default Partners;
