import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { ArrowUpRightIcon, QuotesIcon, StarIcon } from '@phosphor-icons/react';
import { reviews, type Review } from '../config/reviews';
import { REVIEW_PATH, reviewPage } from '../config/review';
import { locations } from '../config/locations';

/* ==========================================================================
   #reviews — стопка відгуків, яку гортаєш пальцем.
   • Картка — clip-cut + border + bg-bg-elevated. Великий знак лапок у
     кутку (декор), аватар-квадрат трохи «перекошений» на власний кут
     (id → tilt) — стопка виглядає як купка реальних фотокарток, а не
     однакові плитки. Рейтинг — класичні 5 зірок (заповнені/контурні).
   • Над заголовком — чесний агрегат: середня оцінка + ті самі 5 зірок
     + кількість відгуків з Google. Те, чого бракувало: людина бачить
     підсумок одразу, а не вираховує його сама по картках.
   • Жодних підказок «перетягни картку», жодного лічильника й кнопок
     гортання під стопкою — сама стопка (глибина видно по картках ззаду),
     свайп, тап і стрілки клавіатури вже покривають керування, зайва
     панель під нею тільки дублювала те саме.
   • CTA «Залишити відгук» — без стрілки, що крутиться; замість неї
     жовта смужка зліва виростає при наведенні (той самий прийом, що в
     картці послуги), і мітка «Google» — куди саме веде посилання.
   Фон — соти (bg-honeycomb, як у Works/FAQ) + зрізані панелі
   (clip-cut/clip-cut-sm) поверх — та сама мова, що й по всьому сайту.
   Механіка стопки (fly/back/onDown/onMove/onUp) — як була: позиція під
   час перетягування пишеться прямо в DOM, без React-стану, тому не
   лагає. Вертикальний свайп не перехоплюється — сторінка скролиться як
   завжди.
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

/* Чесний агрегат, порахований з тих самих даних, а не вигаданий */
const avgRating =
  reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.length);

/* Стабільний «нахил» від id — аватари лежать не рівно, як фотокартки */
const tilt = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9;
  return (h - 4) * 1.1;
};

/* Як лежать картки у стопці: верхня рівно, нижні — віялом */
const REST = [
  'translate3d(0,0,0) rotate(0deg)',
  'translate3d(0,14px,0) rotate(-3deg) scale(0.955)',
  'translate3d(0,28px,0) rotate(2.5deg) scale(0.91)',
];
const REST_HIDDEN = 'translate3d(0,28px,0) scale(0.91)';

/* П'ять зірок, завжди п'ять — заповнені жовтим рівно по оцінці,
   решта контуром. Той самий компонент і в картці, і в агрегаті
   над заголовком, щоб обидва місця говорили однією мовою. */
function StarRow({
  rating,
  size = 'size-3.5',
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
            i < rating ? 'text-accent-yellow' : 'text-border-subtle/50',
          )}
        />
      ))}
    </span>
  );
}

/* -------------------- Картка відгуку -------------------- */
function Card({ review }: { review: Review }) {
  const initial = review.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <figure className="clip-cut relative flex h-full flex-col overflow-hidden border border-border-subtle bg-bg-elevated p-5 shadow-card sm:p-7">
      {/* Декоративний великий знак лапок у кутку */}
      <QuotesIcon
        aria-hidden
        weight="fill"
        className="pointer-events-none absolute -top-4 -right-4 size-28 text-accent-yellow/10 sm:-top-6 sm:-right-6 sm:size-36"
      />

      <figcaption className="relative flex items-center gap-3.5">
        <span
          aria-hidden
          style={{ transform: `rotate(${tilt(review.id)}deg)` }}
          className="clip-cut-sm grid size-12 shrink-0 place-items-center bg-accent-yellow font-display text-lg font-black text-bg-main"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-bold text-text-main uppercase sm:text-lg">
            {review.name}
          </span>
          <span
            className="mt-1 block"
            aria-label={`Оцінка ${review.rating} з 5`}
          >
            <StarRow rating={review.rating} />
          </span>
        </div>
      </figcaption>

      <span
        aria-hidden
        className="relative mt-5 block h-px w-full bg-linear-to-r from-accent-yellow/40 via-border-subtle to-transparent"
      />

      <blockquote className="relative mt-5 line-clamp-6 flex-1 text-sm leading-relaxed text-text-main select-none sm:text-base">
        {review.text}
      </blockquote>
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
        {/* Фон: соти (та сама текстура, що й у Works/FAQ) + зрізані панелі зверху */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="bg-honeycomb absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-bg-main via-bg-main/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-bg-main via-bg-main/40 to-transparent" />

          <div className="clip-cut absolute -top-12 -right-16 size-64 rotate-[9deg] border border-border-subtle/40 sm:size-96" />
          <div className="clip-cut-sm absolute -bottom-10 -left-10 size-52 -rotate-[12deg] border border-accent-yellow/10 sm:size-72" />
          <div className="clip-cut-sm absolute top-1/3 left-[6%] hidden size-36 rotate-[16deg] border border-border-subtle/25 lg:block" />
          <div className="clip-cut absolute right-[10%] bottom-[10%] hidden size-28 -rotate-[20deg] border border-border-subtle/30 lg:block" />

          {/* Тонкі жовті «пил-смуги» */}
          <div className="absolute top-16 left-0 h-px w-24 bg-linear-to-r from-accent-yellow/50 to-transparent sm:w-40" />
          <div className="absolute right-0 bottom-32 h-px w-24 bg-linear-to-l from-accent-yellow/40 to-transparent sm:w-40" />
        </div>

        <div className="container-site relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* ========== Ліва колонка: заголовок + CTA ========== */}
          <div>
            <m.h2
              {...reveal()}
              className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
            >
              Відгуки <span className="text-accent-yellow">клієнтів</span>
            </m.h2>

            {/* Агрегат — те, чого бракувало: підсумок одразу, а не
                вираховуй сам по картках. Порахований, не вигаданий. */}
            <m.div {...reveal(0.06)} className="mt-4 flex items-center gap-3">
              <span className="font-display text-3xl font-black text-accent-yellow sm:text-4xl">
                {avgRating.toFixed(1)}
              </span>
              <StarRow rating={Math.round(avgRating)} size="size-4" />
              <span className="font-mono text-xs text-text-dim uppercase tracking-wide">
                {reviews.length} відгуків · Google
              </span>
            </m.div>

            <m.p
              {...reveal(0.12)}
              className="mt-3 max-w-sm text-sm text-text-muted sm:text-base"
            >
              Були в нас? Поділіться своїм відгуком — нижче.
            </m.p>

            <m.div {...reveal(0.15)} className="relative z-10 mt-8 lg:mt-10">
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
                    className="clip-cut group relative flex items-center gap-4 overflow-hidden border border-border-subtle bg-bg-elevated p-4 shadow-card transition-colors duration-200 hover:border-accent-yellow/50 active:scale-[0.99] sm:p-5"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent-yellow transition-transform duration-300 ease-out group-hover:scale-y-100"
                    />
                    <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-text-main uppercase sm:text-base">
                      {loc.address}
                    </span>
                    <span className="shrink-0 font-mono text-[0.6rem] font-bold tracking-widest text-text-dim uppercase transition-colors duration-200 group-hover:text-accent-yellow">
                      Google
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
          </div>

          {/* ========== Права колонка: стопка карток ========== */}
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
              className="relative mx-auto h-[26rem] w-full max-w-md cursor-grab select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-yellow active:cursor-grabbing sm:h-[28rem] lg:h-[30rem]"
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
