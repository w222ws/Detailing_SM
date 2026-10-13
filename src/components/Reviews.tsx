import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  StarIcon,
} from '@phosphor-icons/react';
import { reviews, type Review } from '../config/reviews';
import { REVIEW_PATH, reviewPage } from '../config/review';
import { locations } from '../config/locations';

/* ==========================================================================
   #reviews — стопка відгуків, яку гортаєш пальцем.
   Усі картки в одному стилі: скло (.glass) + clip-cut. Нічого зайвого —
   аватар із літерою, ім'я, зірки, текст, модель авто. Під заголовком —
   дві кнопки «залишити відгук» (по одній на адресу, дані з
   config/locations.ts) і мала ланка на сторінку /review.
   Механіка: тягнеш верхню картку вбік — вона відлітає й лягає вниз стопки.
   Позиція під час перетягування пишеться прямо в DOM, без React-стану,
   тому не лагає. Вертикальний свайп не перехоплюється — сторінка
   скролиться як завжди.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/* Як лежать картки у стопці: верхня рівно, нижні — віялом */
const REST = [
  'translate3d(0,0,0) rotate(0deg)',
  'translate3d(0,14px,0) rotate(-3deg) scale(0.955)',
  'translate3d(0,28px,0) rotate(2.5deg) scale(0.91)',
];
const REST_HIDDEN = 'translate3d(0,28px,0) scale(0.91)';

/* -------------------- Картка відгуку -------------------- */
function Card({ review }: { review: Review }) {
  const initial = review.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <figure className="glass clip-cut flex h-full flex-col p-5 shadow-card sm:p-7">
      <figcaption className="flex items-center gap-3.5">
        <span
          aria-hidden
          className="clip-cut-sm grid size-12 shrink-0 place-items-center bg-accent-yellow font-display text-lg font-black text-bg-main"
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-bold text-text-main uppercase sm:text-lg">
            {review.name}
          </span>
          <span
            className="mt-1 flex gap-0.5 text-accent-yellow"
            aria-label={`${review.rating} з 5`}
          >
            {Array.from({ length: review.rating }, (_, i) => (
              <StarIcon
                key={i}
                aria-hidden
                weight="fill"
                className="size-3.5"
              />
            ))}
          </span>
        </span>
      </figcaption>

      <blockquote className="mt-5 line-clamp-6 flex-1 text-sm leading-relaxed text-text-main select-none sm:text-base">
        {review.text}
      </blockquote>

      <p className="mt-5 border-t border-border-subtle pt-4 font-mono text-[0.65rem] font-bold tracking-widest text-text-dim uppercase">
        {review.car}
      </p>
    </figure>
  );
}

/* -------------------- Секція -------------------- */
export function Reviews() {
  const [order, setOrder] = useState(() => reviews.map((_, i) => i));
  const stack = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    dx: number;
    t: number;
    active: boolean;
  } | null>(null);
  const busy = useRef(false);

  if (!reviews.length) return null;

  const topCard = () =>
    stack.current?.querySelector<HTMLElement>('[data-pos="0"]') ?? null;

  const fly = (dir: 1 | -1) => {
    const card = topCard();
    if (!card || busy.current) return;
    busy.current = true;
    card.style.transition = 'transform 0.3s ease-in';
    card.style.transform = `translate3d(${dir * window.innerWidth}px,0,0) rotate(${dir * 26}deg)`;
    window.setTimeout(() => {
      card.style.transition = 'none';
      setOrder((o) => [...o.slice(1), o[0]]);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          card.style.transition = '';
          busy.current = false;
        }),
      );
    }, 290);
  };

  const back = () => {
    const card = topCard();
    if (!card) return;
    card.style.transition = '';
    card.style.transform = REST[0];
  };

  const onDown = (e: PointerEvent) => {
    if (busy.current) return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      t: Date.now(),
      active: false,
    };
  };

  const onMove = (e: PointerEvent) => {
    const s = drag.current;
    const card = topCard();
    if (!s || !card) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.active) {
      /* Поки рух радше вертикальний — не перехоплюємо, хай скролиться сторінка */
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
      s.active = true;
      stack.current?.setPointerCapture(e.pointerId);
      card.style.transition = 'none';
    }
    s.dx = dx;
    card.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 16}deg)`;
  };

  const onUp = () => {
    const s = drag.current;
    drag.current = null;
    if (!s) return;
    const speed = Math.abs(s.dx) / Math.max(1, Date.now() - s.t);
    if (!s.active) fly(-1); /* тап по картці = наступна */
    else if (Math.abs(s.dx) > 70 || speed > 0.5) fly(s.dx > 0 ? 1 : -1);
    else back();
  };

  const onCancel = () => {
    drag.current = null;
    back();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') fly(1);
    else if (e.key === 'ArrowLeft') fly(-1);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="reviews"
        className="relative overflow-hidden bg-bg-main py-20 sm:py-24 lg:py-32"
      >
        {/* Фон — як у розділі «Послуги»: ледь видимі контури зрізаних панелей
            кузова (та сама форма clip-cut), жодних текстур */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="clip-cut absolute -top-12 -right-24 size-72 rotate-[10deg] border border-border-subtle/50 sm:size-[26rem]" />
          <div className="clip-cut-sm absolute -bottom-12 -left-16 size-56 rotate-[-14deg] border border-accent-yellow/10 sm:size-80" />
          <div className="clip-cut absolute top-1/2 left-[8%] hidden size-44 rotate-[20deg] border border-border-subtle/30 lg:block" />
          <div className="clip-cut-sm absolute right-[6%] bottom-[18%] hidden size-32 rotate-[-18deg] border border-border-subtle/30 lg:block" />
        </div>

        <div className="container-site relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Ліва колонка: заголовок + кнопки відгуку */}
          <div>
            <m.h2
              {...reveal()}
              className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
            >
              Що кажуть <span className="text-accent-yellow">клієнти</span>
            </m.h2>

            <m.div {...reveal(0.1)} className="mt-8 lg:mt-10">
              <p className="font-mono text-[0.65rem] font-bold tracking-widest text-text-dim uppercase sm:text-xs">
                Залишити відгук
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {locations.map((loc) => (
                  <a
                    key={loc.id}
                    href={loc.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass clip-cut group flex items-center justify-between gap-4 p-4 shadow-card transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99] sm:p-5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-display text-sm font-bold text-text-main uppercase sm:text-base">
                        {loc.title}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[0.65rem] tracking-wider text-text-muted uppercase">
                        {loc.address}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="clip-cut-sm grid size-10 shrink-0 place-items-center bg-accent-yellow text-bg-main transition-transform duration-300 group-hover:rotate-45"
                    >
                      <ArrowUpRightIcon weight="bold" className="size-5" />
                    </span>
                  </a>
                ))}
              </div>

              {/* Мала ланка на окрему сторінку відгуків (/review, куди веде QR) */}
              <a
                href={REVIEW_PATH}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-bold tracking-widest text-text-dim uppercase transition-colors hover:text-accent-yellow"
              >
                {reviewPage.pageLinkLabel}
                <ArrowUpRightIcon
                  aria-hidden
                  weight="bold"
                  className="size-3.5"
                />
              </a>
            </m.div>

            {/* Гортання для десктопа */}
            <m.div
              {...reveal(0.15)}
              className="mt-8 hidden items-center gap-2 lg:flex"
            >
              <button
                type="button"
                onClick={() => fly(-1)}
                aria-label="Попередній відгук"
                className="clip-cut-sm grid size-11 place-items-center border border-border-strong text-text-main transition-colors hover:border-accent-yellow hover:text-accent-yellow"
              >
                <CaretLeftIcon aria-hidden weight="bold" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => fly(1)}
                aria-label="Наступний відгук"
                className="clip-cut-sm grid size-11 place-items-center border border-border-strong text-text-main transition-colors hover:border-accent-yellow hover:text-accent-yellow"
              >
                <CaretRightIcon aria-hidden weight="bold" className="size-5" />
              </button>
            </m.div>
          </div>

          {/* Права колонка: стопка */}
          <m.div {...reveal(0.1)}>
            <div
              ref={stack}
              role="group"
              aria-roledescription="стопка відгуків"
              aria-label="Відгуки клієнтів. Свайпніть картку вліво або вправо"
              tabIndex={0}
              onKeyDown={onKey}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              className="relative mx-auto h-[24rem] w-full max-w-md cursor-grab select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-yellow active:cursor-grabbing sm:h-[26rem] lg:h-[28rem]"
            >
              {order.map((cardIndex, pos) => (
                <div
                  key={cardIndex}
                  data-pos={pos}
                  className={cx(
                    'absolute inset-x-0 top-0 bottom-8 transition-transform duration-300 ease-out [touch-action:pan-y] will-change-transform',
                    pos > 2 && 'pointer-events-none opacity-0',
                  )}
                  style={{
                    transform: REST[pos] ?? REST_HIDDEN,
                    zIndex: reviews.length - pos,
                  }}
                >
                  <Card review={reviews[cardIndex]} />
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default Reviews;
