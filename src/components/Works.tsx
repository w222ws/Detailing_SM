import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react';
import { domAnimation, LazyMotion, m, type Variants } from 'motion/react';
import {
  ArrowsHorizontalIcon,
  ArrowsOutSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from '@phosphor-icons/react';
import { compare, gallery } from '../config/works';

/* ==========================================================================
   #works — «Наші роботи». Два блоки: повзунок ДО/ПІСЛЯ + галерея-соти.
   • Повзунок — transform-only, без лагів (див. Compare).
   • Галерея — фото в шестикутниках, що вкладаються як справжні соти,
     з порожніми контурами навколо (див. Honeycomb). Клік — лайтбокс на
     весь екран: свайп на телефоні, ←/→/Esc на десктопі, лічильник 03/08.
   Фото беруться з config/works.ts (файли лежать у public/works/).
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

const titleList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const titleWord: Variants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/* -------------------- COMPARE: «ДО / ПІСЛЯ» --------------------
   Швидкий повзунок: жодного React-стану, жодного clip-path / left / width.
   Позиція (--pos) пишеться в DOM раз на кадр (rAF), а рухаються лише два
   шари через transform — це робить відеокарта, фото не перемальовується.
   • шар «ДО» — контейнер overflow-hidden, зсунутий на (pos − 100%),
     а фото всередині зсунуте в протилежний бік → фото стоїть на місці,
     відкривається лише «вікно»;
   • лінія з шильдиком — зсув на pos.
   Керування: палець/миша по всій картці (клік — стрибок лінії), Pointer
   Events + pointer capture; вертикальний свайп лишається скролом сторінки.
   З клавіатури: ← → (±5), Home / End. */
function Compare({ before, after }: { before: string; after: string }) {
  const box = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const pos = useRef(50);
  const frame = useRef(0);
  const rect = useRef<DOMRect | null>(null);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const paint = () => {
    frame.current = 0;
    box.current?.style.setProperty('--pos', `${pos.current}%`);
    thumb.current?.setAttribute(
      'aria-valuenow',
      String(Math.round(pos.current)),
    );
  };

  const setPos = (v: number) => {
    pos.current = Math.min(100, Math.max(0, v));
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = rect.current;
    if (r && r.width) setPos(((e.clientX - r.left) / r.width) * 100);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    rect.current = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
  };

  const onKey = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft') setPos(pos.current - step);
    else if (e.key === 'ArrowRight') setPos(pos.current + step);
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={box}
      onPointerDown={onDown}
      onPointerMove={onMove}
      className="clip-cut relative [--pos:50%] aspect-[4/3] cursor-ew-resize overflow-hidden bg-carbon shadow-card select-none [touch-action:pan-y] sm:aspect-[16/10] lg:aspect-[21/10]"
    >
      <img
        src={after}
        alt="Після роботи"
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      {/* Шар «ДО»: вікно їде вправо-вліво, фото всередині їде навпаки */}
      <div
        aria-hidden
        className="cmp-window pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={before}
          alt=""
          draggable={false}
          decoding="async"
          className="cmp-window-img absolute inset-0 size-full object-cover"
        />
      </div>

      {/* Лінія + шильдик */}
      <div className="cmp-line pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-accent-yellow">
          <span
            ref={thumb}
            role="slider"
            tabIndex={0}
            aria-label="Порівняння до і після"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            onKeyDown={onKey}
            className="clip-cut-sm pointer-events-auto absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center bg-accent-yellow text-bg-main outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-14"
          >
            <ArrowsHorizontalIcon
              aria-hidden
              weight="bold"
              className="size-5"
            />
          </span>
          <span
            aria-hidden
            className="absolute top-0 left-1/2 h-3 w-2 -translate-x-1/2 bg-accent-yellow"
          />
          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 h-3 w-2 -translate-x-1/2 bg-accent-yellow"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- HONEYCOMB: фото в шестикутниках --------------------
   Галерея — справжні соти: ряди чергуються (n, n−1 плиток) і вкладаються
   одна в одну. Фото в жовтих рамках на тлі наших сот (bg-honeycomb);
   відсутня комірка в хвості останнього ряду — тільки контур.
   Уся геометрія — у index.css (clip-hex, hex-comb, hex-row, hex-cell):
   розмір плитки рахується з ширини блоку через container query, React
   лише каже, скільки плиток у ряду (--n). Фото беруться з works.ts.
   Лише clip-path + transform + колір: без фільтрів і blur → без лагів. */

/* Скільки плиток у «довгому» ряду: телефон 2, планшет 3, десктоп 5 */
function useCols() {
  const read = () =>
    window.matchMedia('(min-width: 64rem)').matches
      ? 5
      : window.matchMedia('(min-width: 40rem)').matches
        ? 3
        : 2;
  const [n, setN] = useState(read);
  useEffect(() => {
    const queries = ['(min-width: 64rem)', '(min-width: 40rem)'].map((q) =>
      window.matchMedia(q),
    );
    const update = () => setN(read());
    queries.forEach((q) => q.addEventListener('change', update));
    return () =>
      queries.forEach((q) => q.removeEventListener('change', update));
  }, []);
  return n;
}

/* Порожня комірка в хвості останнього ряду — тільки контур (фон-соти
   просвічують), щоб ряд виглядав добудованим */
function Ghost({ dot }: { dot?: boolean }) {
  return (
    <div aria-hidden className="hex-cell">
      <svg
        viewBox="0 0 100 115.47"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-border-strong"
      >
        <polygon
          points="50,1 99,29.5 99,86 50,114.5 1,86 1,29.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {dot && (
        <span className="clip-hex absolute top-1/2 left-1/2 aspect-[0.866] w-[18%] -translate-x-1/2 -translate-y-1/2 bg-accent-yellow/70" />
      )}
    </div>
  );
}

function Honeycomb({
  photos,
  onOpen,
}: {
  photos: string[];
  onOpen: (i: number) => void;
}) {
  const n = useCols();

  /* Ряди: n, n−1, n, n−1 … Хвіст останнього ряду добиваємо контурами */
  const rows: Array<{ odd: boolean; cells: Array<number | null> }> = [];
  for (let idx = 0, r = 0; idx < photos.length; r++) {
    const odd = r % 2 === 1;
    const cells: Array<number | null> = [];
    for (let k = 0; k < (odd ? n - 1 : n); k++)
      cells.push(idx < photos.length ? idx++ : null);
    rows.push({ odd, cells });
  }

  return (
    <div style={{ '--n': n } as CSSProperties} className="hex-comb">
      {rows.map((row, r) => (
        <div key={r} className={cx('hex-row', row.odd && 'hex-row-odd')}>
          {row.cells.map((photo, k) =>
            photo === null ? (
              <Ghost key={`g${k}`} dot={(r + k) % 2 === 0} />
            ) : (
              <m.div
                key={photos[photo]}
                className="hex-cell"
                initial={{ opacity: 0, scale: 0.86 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.6,
                  delay: (k % 5) * 0.06,
                  ease: EASE,
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(photo)}
                  aria-label={`Відкрити фото ${photo + 1}`}
                  className="clip-hex group absolute inset-0 bg-accent-yellow/75 outline-none transition-colors duration-300 hover:bg-accent-yellow focus-visible:bg-accent-yellow"
                >
                  <span className="clip-hex absolute inset-[3px] overflow-hidden bg-carbon">
                    <img
                      src={photos[photo]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center bg-bg-main/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <span className="clip-hex grid size-10 place-items-center bg-accent-yellow text-bg-main">
                        <ArrowsOutSimpleIcon weight="bold" className="size-4" />
                      </span>
                    </span>
                  </span>
                </button>
              </m.div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------- LIGHTBOX: нативний <dialog> + клавіатура + свайп -------------------- */
function Lightbox({ start, onClose }: { start: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const d = dialog.current;
    const s = strip.current;
    if (!d || !s) return;
    d.showModal();
    s.scrollLeft = start * s.clientWidth;
    document.documentElement.style.overflow = 'hidden';

    /* Клавіатура: ←/→ — гортаємо, Esc уже обробляє <dialog> */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const strp = strip.current;
        if (!strp) return;
        e.preventDefault();
        strp.scrollBy({
          left: (e.key === 'ArrowRight' ? 1 : -1) * strp.clientWidth,
          behavior: 'smooth',
        });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [start]);

  const onScroll = () => {
    const s = strip.current;
    if (!s || !counter.current) return;
    const i = Math.round(s.scrollLeft / s.clientWidth);
    counter.current.textContent = pad2(i + 1);
  };

  const go = (dir: 1 | -1) => {
    const s = strip.current;
    if (s) s.scrollBy({ left: dir * s.clientWidth, behavior: 'smooth' });
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label="Фото робіт"
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-bg-main p-0 text-text-main backdrop:bg-transparent"
    >
      <div
        ref={strip}
        onScroll={onScroll}
        className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {gallery.map((src, i) => (
          <div
            key={src}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="grid size-full shrink-0 snap-center place-items-center px-3 py-16 sm:px-16"
          >
            <img
              src={src}
              alt={`Робота ${i + 1}`}
              decoding="async"
              className="clip-cut-sm max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute top-5 left-5 flex items-baseline gap-1.5 font-mono text-sm font-bold tracking-widest uppercase">
        <span ref={counter} className="tabular-nums text-accent-yellow">
          {pad2(start + 1)}
        </span>
        <span className="text-text-dim">/ {pad2(gallery.length)}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="clip-cut-sm absolute top-3 right-3 grid size-12 place-items-center bg-accent-yellow text-bg-main shadow-card transition-transform active:scale-90"
      >
        <XIcon aria-hidden weight="bold" className="size-5" />
      </button>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Попереднє фото"
        className="clip-cut-sm absolute top-1/2 left-4 hidden size-12 -translate-y-1/2 place-items-center border border-border-strong bg-bg-main/60 text-text-main transition-colors hover:border-accent-yellow hover:text-accent-yellow md:grid"
      >
        <CaretLeftIcon aria-hidden weight="bold" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Наступне фото"
        className="clip-cut-sm absolute top-1/2 right-4 hidden size-12 -translate-y-1/2 place-items-center border border-border-strong bg-bg-main/60 text-text-main transition-colors hover:border-accent-yellow hover:text-accent-yellow md:grid"
      >
        <CaretRightIcon aria-hidden weight="bold" className="size-5" />
      </button>
    </dialog>
  );
}

/* -------------------- SECTION -------------------- */
export function Works() {
  const [open, setOpen] = useState<number | null>(null);

  if (!compare && gallery.length === 0) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="works"
        className="relative overflow-hidden bg-bg-main py-20 sm:py-24 lg:py-32"
      >
        {/* Фон — наші соти (bg-honeycomb) з м'яким переходом у сусідні розділи */}
        <div
          aria-hidden
          className="bg-honeycomb pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-bg-main via-bg-main/60 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-bg-main via-bg-main/60 to-transparent"
        />

        <div className="container-site relative">
          <m.h2
            variants={titleList}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
          >
            {['Наші', 'роботи'].map((word, i) => (
              <span
                key={word}
                className="mr-[0.25em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0"
              >
                <m.span
                  variants={titleWord}
                  className={cx(
                    'inline-block',
                    i === 1 && 'text-accent-yellow',
                  )}
                >
                  {word}
                </m.span>
              </span>
            ))}
          </m.h2>
          {compare && (
            <m.div {...reveal(0.15)} className="mt-10 lg:mt-14">
              <Compare before={compare.before} after={compare.after} />
            </m.div>
          )}

          {gallery.length > 0 && (
            <m.div
              {...reveal(0.1)}
              className={compare ? 'mt-12 lg:mt-16' : 'mt-10 lg:mt-14'}
            >
              <Honeycomb photos={gallery} onOpen={setOpen} />
            </m.div>
          )}
        </div>

        {open !== null && (
          <Lightbox start={open} onClose={() => setOpen(null)} />
        )}
      </section>
    </LazyMotion>
  );
}

export default Works;
