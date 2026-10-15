import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  ArrowsHorizontalIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from '@phosphor-icons/react';
import { compare, gallery } from '../config/works';

/* ==========================================================================
   #works — «Наші роботи». Два блоки: повзунок ДО/ПІСЛЯ + галерея-соти.
   • Повзунок — transform-only, без лагів (див. Compare).
   • Галерея — справжні стільники (Honeycomb): фото в шестикутниках, ряди
     вкладаються одне в одне (--n/--w рахує CSS, React лише каже скільки
     плиток у ряду). Порожні «хвостові» комірки — тонкий контур-декор.
     Ніякого скла, градієнтів чи нескінченних анімацій: обідок — простий
     колір (transition лише background-color), на hover — масштаб фото
     й жовтий обідок. Це і було джерелом лагів раніше, тепер прибрано.
   Клік по плитці — лайтбокс на весь екран: свайп на телефоні, ←/→/Esc на
   десктопі, лічильник 03/08.
   Фото беруться з config/works.ts (src/assets/works/).
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

const pad2 = (n: number) => String(n).padStart(2, '0');

/* Декоративний контур шестикутника для фону розділу: тонка лінія, що
   не блимає й не гальмує (SVG, non-scaling-stroke). Клас керує розміром
   і кольором через currentColor. */
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
const BRACKETS = [
  'top-4 left-4 border-t-2 border-l-2',
  'top-4 right-4 border-t-2 border-r-2',
  'bottom-4 left-4 border-b-2 border-l-2',
  'bottom-4 right-4 border-b-2 border-r-2',
];

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
      className="clip-cut relative [--pos:50%] aspect-[4/3] cursor-ew-resize overflow-hidden border border-border-subtle bg-carbon shadow-card select-none [touch-action:pan-y] sm:aspect-[16/10] lg:aspect-[16/9]"
    >
      <img
        src={after}
        alt="Після роботи"
        draggable={false}
        decoding="async"
        fetchPriority="high"
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
          loading="lazy"
          className="cmp-window-img absolute inset-0 size-full object-cover"
        />
      </div>

      {/* Легка віньєтка для читабельності шильдика + «візир» по кутах кадру */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(7_7_10/0.45))]"
      />
      {BRACKETS.map((b) => (
        <span
          key={b}
          aria-hidden
          className={cx(
            'pointer-events-none absolute size-5 border-accent-yellow sm:size-8',
            b,
          )}
        />
      ))}

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

/* -------------------- HONEYCOMB: галерея-соти --------------------
   Справжня стільникова кладка: ряди по --n / --n−1 плиток, вкладені одне
   в одне (geometry в index.css: hex-comb/hex-row/hex-cell). React лише
   рахує, скільки плиток у довгому ряду (телефон 2, планшет 3, десктоп 5)
   і розкладає фото по рядах; «хвіст» останнього ряду — порожня комірка-
   контур (той самий HexOutline, що й фон розділу). Плитка — два clip-hex
   шари (обідок-колір + фото з відступом 3px), на hover/focus обідок стає
   жовтим і фото трохи масштабується — дві дешеві transform/color
   властивості, без скла, градієнтів і нескінченних анімацій. */
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

function Honeycomb({
  photos,
  onOpen,
}: {
  photos: string[];
  onOpen: (i: number) => void;
}) {
  const n = useCols();

  /* Ряди: n, n−1, n, n−1 … Хвіст останнього ряду — порожній контур */
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
              <span key={`e${k}`} aria-hidden className="hex-cell">
                <HexOutline className="absolute inset-[7%] text-border-subtle/45" />
              </span>
            ) : (
              <m.div
                key={photos[photo]}
                className="hex-cell"
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: (k % 5) * 0.05,
                  ease: EASE,
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(photo)}
                  aria-label={`Відкрити фото ${photo + 1}`}
                  className="group clip-hex absolute inset-0 bg-border-subtle outline-none transition-colors duration-300 hover:bg-accent-yellow focus-visible:bg-accent-yellow"
                >
                  <span className="clip-hex absolute inset-[3px] overflow-hidden bg-bg-card">
                    <img
                      src={photos[photo]}
                      alt=""
                      loading={photo < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg-main/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-[16%] text-center font-mono text-xs font-bold tracking-[0.3em] text-accent-yellow opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {pad2(photo + 1)}
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
            className="grid size-full shrink-0 snap-center place-items-center px-3 py-14 sm:px-16"
          >
            {/* Фіксована рамка 4:3 — усі фото показуємо однаково, однакова висота на будь-якому екрані */}
            <div className="clip-cut-sm relative aspect-[4/3] w-full max-w-5xl overflow-hidden bg-bg-elevated">
              <img
                src={src}
                alt={`Робота ${i + 1}`}
                decoding="async"
                loading={Math.abs(i - start) <= 1 ? 'eager' : 'lazy'}
                className="absolute inset-0 size-full object-contain"
              />
            </div>
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

        {/* Фон: контури сот під різними кутами — продовжують паттерн розділу */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <HexOutline className="absolute top-16 -left-10 size-56 rotate-[8deg] text-border-subtle/60 sm:size-72" />
          <HexOutline className="absolute top-10 right-[8%] hidden size-40 -rotate-[12deg] text-accent-yellow/15 lg:block" />
          <HexOutline className="absolute right-[-3rem] bottom-[18%] size-48 rotate-[18deg] text-border-subtle/40 sm:size-72" />
          <HexOutline className="absolute bottom-6 left-[12%] hidden size-36 -rotate-[6deg] text-accent-yellow/10 lg:block" />
          <HexOutline className="absolute top-[48%] left-[-4rem] hidden size-64 rotate-[22deg] text-border-subtle/30 lg:block" />
        </div>

        <div className="container-site relative">
          <m.h2
            {...reveal()}
            className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
          >
            Наші <span className="text-accent-yellow">роботи</span>
          </m.h2>

          {compare && (
            <m.div
              {...reveal(0.15)}
              className="mt-10 lg:mx-auto lg:mt-14 lg:max-w-3xl"
            >
              <Compare before={compare.before} after={compare.after} />
            </m.div>
          )}

          {gallery.length > 0 && (
            <div className={cx(compare ? 'mt-14 lg:mt-20' : 'mt-10 lg:mt-14')}>
              <Honeycomb photos={gallery} onOpen={setOpen} />
            </div>
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
