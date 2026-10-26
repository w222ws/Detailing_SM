import { useEffect, useRef, type CSSProperties } from 'react';
import { marqueeLineOne, marqueeLineTwo } from '../config/marquee';

/* ==========================================================================
   Дві стрічки, що біжать назустріч одна одній — наче два шари лаку.
   Лінія 1: щільний матовий текст, їде вліво. Лінія 2: контурний текст
   (text-stroke-neon), їде вправо, трохи заходить на першу лінію (-mt).
   Обидві лінії — зі свого файлу marquee.ts, без залежності від інших розділів.
   Швидкість — через .marquee-track / .marquee-track-reverse (index.css),
   коротша на мобілці й довша на десктопі, щоб ВІДЧУВАЛАСЬ однаково
   швидкою на будь-якому екрані (на телефоні текст дрібніший, тому той
   самий час = менший шлях — компенсуємо тривалістю, а не лишаємо
   фіксованою). Кожне слово додатково хаотично тремтить своїм ритмом
   (детермінований «псевдовипадковий» seed від індексу — тремтіння не
   синхронне, але однакове при кожному рендері, без гідрейшн-мерехтіння).
   Лінії трохи скошені в різні боки (skew-y) — не рівна банальна стрічка,
   а ніби два шари лаку під кутом один до одного.
   Відступи мобайл-фьорст і зменшені зверху — щоб полоса йшла одразу
   після Hero, а не висіла окремим блоком.

   РЕАКЦІЯ НА СКРОЛ (useScrollDrive нижче): чим швидше крутиш сторінку,
   тим швидше їдуть лінії (до ×5), а напрямок іде за прокруткою — вниз
   як завжди, вгору — обидві лінії розвертаються. На швидкості слова
   нахиляються в бік руху (skewX), потім плавно заспокоюються.
   Працює через playbackRate тих самих CSS-анімацій (рух лишається на
   композиторі) і лише поки стрічку видно на екрані. Якщо в системі
   вимкнені анімації — нічого не розганяємо (див. index.css).
   ========================================================================== */

/** Детермінований псевдовипадковий чин 0..1 за індексом — без Math.random() */
function seededRandom(i: number) {
  const x = Math.sin(i * 999.73) * 43758.5453;
  return x - Math.floor(x);
}

/** Інлайн-стиль для хаотичного тремтіння: своя тривалість і затримка на слово */
function jitterStyle(i: number): CSSProperties {
  const duration = 1.8 + seededRandom(i) * 1.8; // 1.8–3.6s
  const delay = -seededRandom(i + 101) * duration; // стартує вже «в русі»
  return {
    animation: `var(--animate-marquee-word)`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    display: 'inline-block',
    willChange: 'transform',
  };
}

/** Розгін і розворот стрічки від швидкості скролу.
    Повертає ref для секції й refs для двох ліній (для нахилу). */
function useScrollDrive() {
  const section = useRef<HTMLElement>(null);
  const lineOne = useRef<HTMLDivElement>(null);
  const lineTwo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;

    const tracks = () =>
      el
        .getAnimations({ subtree: true })
        .filter(
          (a): a is CSSAnimation =>
            a instanceof CSSAnimation &&
            (a.animationName === 'marquee' ||
              a.animationName === 'marqueeReverse'),
        );

    let anims = tracks();
    let boost = 0; // 0…4 — скільки додаємо до базової швидкості
    let dir = 1; // 1 — вниз (як завжди), -1 — вгору (розворот)
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let visible = false;

    const apply = () => {
      const rate = dir * (1 + boost);
      for (const a of anims) a.playbackRate = rate;
      const skew = `skewX(${(-dir * Math.min(boost, 4) * 2.5).toFixed(2)}deg)`;
      if (lineOne.current) lineOne.current.style.transform = skew;
      if (lineTwo.current) lineTwo.current.style.transform = skew;
    };

    const tick = () => {
      boost *= 0.93; // плавне гальмування
      if (boost < 0.01) boost = 0;
      apply();
      raf = boost > 0 ? requestAnimationFrame(tick) : 0;
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(16, now - lastT);
      lastY = window.scrollY;
      lastT = now;
      if (!visible || dy === 0) return;
      dir = dy > 0 ? 1 : -1;
      boost = Math.min(4, Math.max(boost, (Math.abs(dy) / dt) * 2.2));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) anims = tracks();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { section, lineOne, lineTwo };
}

function Marquee() {
  const lineOne = marqueeLineOne;
  const lineTwo = marqueeLineTwo;
  const drive = useScrollDrive();

  return (
    <section
      ref={drive.section}
      className="relative z-20 w-full overflow-hidden bg-bg-main bg-grain py-6 font-display sm:py-8 lg:py-12"
    >
      {/* Затемнення по краях — текст тоне в темряві, а не обрізається різко */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/6 bg-linear-to-r from-bg-main to-transparent sm:w-1/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-1/6 bg-linear-to-l from-bg-main to-transparent sm:w-1/5"
      />

      {/* ===== Лінія 1: вліво, щільний текст, жовтіє при наведенні ===== */}
      <div className="-skew-y-1 w-full select-none overflow-hidden whitespace-nowrap tracking-tighter lg:-skew-y-2">
        {/* обгортка для нахилу на швидкості — сам трек зайнятий своєю анімацією */}
        <div ref={drive.lineOne} className="will-change-transform">
          <div className="pointer-events-none marquee-track inline-flex gap-6 pr-6 sm:gap-10 sm:pr-10 lg:gap-16 lg:pr-16">
            {[0, 1].map((rep) => (
              <div
                key={rep}
                aria-hidden={rep === 1}
                className="flex shrink-0 items-center gap-6 sm:gap-10 lg:gap-16"
              >
                {lineOne.map((item, i) => (
                  <span
                    key={`${rep}-${i}`}
                    style={jitterStyle(i)}
                    className="text-2xl font-black uppercase text-border-strong transition-colors duration-300 hover:text-accent-yellow sm:text-4xl md:text-6xl lg:text-8xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Лінія 2: вправо, контур, трохи напускає на першу лінію ===== */}
      <div className="relative z-10 -mt-1.5 w-full skew-y-1 select-none overflow-hidden whitespace-nowrap tracking-tighter sm:-mt-2.5 md:-mt-4 lg:-mt-6 lg:skew-y-2">
        <div ref={drive.lineTwo} className="will-change-transform">
          <div className="pointer-events-none marquee-track-reverse inline-flex gap-6 pr-6 sm:gap-10 sm:pr-10 lg:gap-16 lg:pr-16">
            {[0, 1].map((rep) => (
              <div
                key={rep}
                aria-hidden={rep === 1}
                className="flex shrink-0 items-center gap-6 sm:gap-10 lg:gap-16"
              >
                {lineTwo.map((item, i) => (
                  <span
                    key={`${rep}-${i}`}
                    style={jitterStyle(i + 50)}
                    className="text-stroke-neon text-2xl font-black uppercase sm:text-4xl md:text-6xl lg:text-8xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Marquee;
export { Marquee };
