import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { StarIcon } from '@phosphor-icons/react';
import { reviews, type Review } from '../config/reviews';
import { locations } from '../config/locations';

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

const REST = [
  'translate3d(0,0,0) rotate(0deg)',
  'translate3d(0,14px,0) rotate(-3deg) scale(0.955)',
  'translate3d(0,28px,0) rotate(2.5deg) scale(0.91)',
];
const REST_HIDDEN = 'translate3d(0,28px,0) scale(0.91)';

const LONGEST = reviews.reduce<Review | undefined>(
  (a, r) => (!a || r.text.length > a.text.length ? r : a),
  undefined,
);

const street = (address: string) => {
  const parts = address.split(', ');
  return parts.length > 1 && /^м\.\s/.test(parts[0])
    ? parts.slice(1).join(', ')
    : address;
};

function StarRow({
  rating,
  size = 'size-4',
}: {
  rating: number;
  size?: string;
}) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          weight={i < rating ? 'fill' : 'regular'}
          className={cx(
            size,
            i < rating ? 'text-accent-yellow' : 'text-border-strong',
          )}
        />
      ))}
    </span>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <figure className="clip-cut flex h-full flex-col border border-border-subtle bg-bg-card p-6 shadow-card sm:p-8">
      <span aria-label={`Оцінка ${review.rating} з 5`}>
        <StarRow rating={review.rating} />
      </span>
      <blockquote className="mt-5 flex-1 text-base leading-relaxed text-text-main select-none sm:text-lg">
        {review.text}
      </blockquote>
      <figcaption className="mt-7 border-t border-border-subtle pt-4 font-display text-base font-bold tracking-wide text-text-main uppercase sm:text-lg">
        {review.name}
      </figcaption>
    </figure>
  );
}

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
    if (!s.active) fly(-1);
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="bg-honeycomb absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-bg-main to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-bg-main to-transparent" />
        </div>

        <div className="container-site relative grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 xl:gap-x-24">
          <div className="lg:col-start-1 lg:row-start-1">
            <m.h2
              {...reveal()}
              className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
            >
              Відгуки <span className="text-accent-yellow">клієнтів</span>
            </m.h2>
            <m.p
              {...reveal(0.06)}
              className="mt-4 max-w-sm text-sm text-text-muted sm:text-base"
            >
              Що пишуть власники авто, яким ми робили роботу — на нашій сторінці
              в Google.
            </m.p>
          </div>

          <m.div
            {...reveal(0.1)}
            className="relative self-center lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 hidden bg-[radial-gradient(ellipse_72%_60%_at_50%_50%,rgb(7_7_10/0.95),rgb(7_7_10/0.6)_55%,transparent_80%)] lg:block"
            />
            <div
              ref={stack}
              role="group"
              aria-roledescription="стопка відгуків"
              aria-label="Відгуки клієнтів. Натисніть або свайпніть картку, щоб побачити наступний"
              tabIndex={0}
              onKeyDown={onKey}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              className="relative mx-auto w-full max-w-xl cursor-grab select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-yellow active:cursor-grabbing"
            >
              {LONGEST && (
                <div aria-hidden className="invisible pb-8">
                  <Card review={LONGEST} />
                </div>
              )}

              {order.map((cardIndex, pos) => (
                <div
                  key={cardIndex}
                  data-pos={pos}
                  aria-hidden={pos !== 0}
                  className={cx(
                    'absolute inset-x-0 top-0 bottom-8 transition-transform duration-300 ease-out will-change-transform [touch-action:pan-y]',
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

          <m.div
            {...reveal(0.16)}
            className="lg:col-start-1 lg:row-start-2 lg:self-end"
          >
            <p className="font-display text-2xl font-black text-text-main uppercase sm:text-3xl">
              Були в нас?
            </p>
            <p className="mt-2 text-sm text-text-muted sm:text-base">
              Залиште відгук у Google — оберіть свою студію.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {locations.map((loc, i) => (
                <a
                  key={loc.id}
                  href={loc.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(
                    'clip-cut-sm inline-flex h-12 items-center justify-center px-6 font-display text-base font-bold whitespace-nowrap uppercase transition-colors duration-200',
                    i === 0
                      ? 'bg-accent-yellow text-bg-main hover:bg-accent-hot'
                      : 'border border-border-strong text-text-main hover:border-accent-yellow hover:text-accent-yellow',
                  )}
                >
                  {street(loc.address)}
                </a>
              ))}
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default Reviews;
