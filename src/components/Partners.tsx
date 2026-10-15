import { useEffect, useRef, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  MagnifyingGlassPlusIcon,
  SealCheckIcon,
  XIcon,
} from '@phosphor-icons/react';
import { certificate, partners } from '../config/partners';

/* ==========================================================================
   #partners — «Партнери та сертифікація». Місток довіри між «Процесом»
   (як ми працюємо) і «Відгуками» (що кажуть клієнти): перш ніж вірити
   на слово, можна глянути, з чим ми працюємо.
   • Зліва — фото сертифікату на всю висоту, клік відкриває його на весь
     екран (документ треба читати, тому значення має великий розмір).
   • Справа — ОДНА панель-«директорія партнерів» (та сама вага й геометрія,
     що й у сертифіката — clip-cut, border, header-бар, як у вікна чату в
     FAQ), а 4 лого всередині розділені тонкими лініями (divide), а не
     розкидані окремими квадратами з порожнечею — реальні лого є готовими
     прямокутними лейблами, тому grayscale/квадрат тільки псували вигляд.
     Панель — «скло»: напівпрозорий фон + backdrop-blur, крізь неї видно
     соти заднього фону. Це СТАТИЧНИЙ ефект на одній-єдиній панелі (не
     анімація й не десяток скляних комірок, як було в старій галереї
     Works) — тож дешево й без лагів, backdrop-blur рахується один раз.
   Фон — bg-honeycomb, як у Works/FAQ.
   Дані — з config/partners.ts, нічого не захардкоджено; розділ ховається,
   якщо картинок ще не додали.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/* Контур шестикutника для фону — та сама бренд-мова, що й по сайту */
function HexOutline({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 115.47"
      preserveAspectRatio="none"
      className={cx('pointer-events-none', className)}
    >
      <polygon
        points="50,1 99,29.5 99,86 50,114.5 1,86 1,29.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* Фото сертифікату на весь екран — нативний <dialog>, Esc/клік-повз закриває */
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
      aria-label="Сертифікат"
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-bg-main/96 p-0 text-text-main backdrop:bg-transparent"
    >
      <div className="grid size-full place-items-center p-4 sm:p-10">
        <img
          src={src}
          alt="Сертифікат"
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
        {/* Соти — та сама текстура, що й у Works/FAQ, з м'яким переходом по краях */}
        <div
          aria-hidden
          className="bg-honeycomb pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-bg-main via-bg-main/50 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-bg-main via-bg-main/50 to-transparent"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <HexOutline className="absolute top-8 right-[10%] size-32 rotate-[14deg] text-border-subtle/40 sm:size-48" />
          <HexOutline className="absolute bottom-10 left-[6%] hidden size-28 -rotate-[10deg] text-accent-yellow/10 lg:block" />
        </div>

        <div className="container-site relative">
          <m.h2
            {...reveal()}
            className="font-display text-3xl text-text-main uppercase sm:text-4xl lg:text-5xl"
          >
            Партнери та <span className="text-accent-yellow">сертифікація</span>
          </m.h2>
          <m.p
            {...reveal(0.1)}
            className="mt-4 max-w-lg text-sm text-text-muted sm:text-base"
          >
            Працюємо тільки з перевіреними брендами, а якість підтверджуємо
            документально — повний пакет сертифікатів показуємо в студії за
            запитом.
          </m.p>

          <div
            className={cx(
              'mt-10 grid gap-5 lg:mt-14 lg:gap-8',
              !!certificate &&
                partners.length > 0 &&
                'lg:grid-cols-[1.05fr_1fr]',
            )}
          >
            {certificate && (
              <m.button
                {...reveal(0.15)}
                type="button"
                onClick={() => setCertOpen(true)}
                aria-label="Відкрити сертифікат на весь екран"
                className="clip-cut group relative block aspect-[3/4] w-full overflow-hidden border border-border-subtle bg-bg-elevated text-left outline-none transition-colors duration-300 hover:border-accent-yellow/50 focus-visible:border-accent-yellow sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[22rem]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-accent-yellow/60 via-accent-yellow/15 to-transparent"
                />
                <img
                  src={certificate}
                  alt="Сертифікат"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-accent-yellow uppercase drop-shadow-[0_1px_6px_rgb(7_7_10/0.9)] sm:bottom-5 sm:left-6">
                  <SealCheckIcon aria-hidden weight="fill" className="size-4" />
                  Сертифікат
                </span>
                <span className="pointer-events-none absolute top-4 right-4 text-text-main drop-shadow-[0_1px_6px_rgb(7_7_10/0.9)] transition-colors duration-300 group-hover:text-accent-yellow sm:top-5 sm:right-5">
                  <MagnifyingGlassPlusIcon
                    aria-hidden
                    weight="bold"
                    className="size-5"
                  />
                </span>
              </m.button>
            )}

            {partners.length > 0 && (
              <m.div
                {...reveal(certificate ? 0.2 : 0.15)}
                className="clip-cut relative isolate flex flex-col overflow-hidden border border-white/15 bg-linear-to-br from-white/[0.09] via-bg-elevated/55 to-bg-elevated/75 shadow-card backdrop-blur-xl lg:h-full"
              >
                {/* Світлова пляма у кутку — ніби світло ловиться гранню скла.
                    Статична, один раз намальована — не лагає. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-12 -left-12 -z-10 size-48 rounded-full bg-white/15 blur-3xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-accent-yellow/80 via-accent-yellow/25 to-transparent"
                />
                {/* Шапка панелі — та сама мова, що й у вікна чату в FAQ */}
                <div className="flex items-center gap-2.5 border-b border-white/15 bg-white/[0.04] px-5 py-4 sm:px-7">
                  <SealCheckIcon
                    aria-hidden
                    weight="fill"
                    className="size-4 text-accent-yellow"
                  />
                  <span className="font-mono text-xs font-bold tracking-widest text-text-dim uppercase">
                    Офіційні партнери
                  </span>
                </div>
                {/* Лого — одна директорія, розділена лініями, а не розкидані квадрати:
                    реальні лого вже самі є прямокутними лейблами зі своїм фоном,
                    тож ніякого grayscale чи примусового квадрата — тільки рівна сітка. */}
                <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-white/15">
                  {partners.map((p) => (
                    <div
                      key={p.logo}
                      className="group relative flex min-h-[6.5rem] items-center justify-center p-6 transition-colors duration-300 hover:bg-white/[0.07] sm:min-h-[7.5rem] sm:p-8"
                    >
                      <img
                        src={p.logo}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-8 w-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 sm:h-9"
                      />
                    </div>
                  ))}
                </div>
              </m.div>
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
