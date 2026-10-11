import { site } from '../config/site';

/* ==========================================================================
   Дві стрічки, що біжать назустріч одна одній — наче два шари лаку.
   Лінія 1: щільний матовий текст, їде вліво — реальні послуги з site.ts.
   Лінія 2: контурний текст (text-stroke-neon), їде вправо — короткі теги,
   трохи заходить на першу лінію (-mt), звідси відчуття об'єму.
   ========================================================================== */

function Marquee() {
  const lineOne = site.services.map((s) => s.title);
  const lineTwo = site.marqueeWords;

  return (
    <section className="relative z-20 w-full overflow-hidden bg-bg-main bg-grain py-14 font-display lg:py-20">
      {/* Затемнення по краях — текст тоне в темряві, а не обрізається різко */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/5 bg-linear-to-r from-bg-main to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-1/5 bg-linear-to-l from-bg-main to-transparent"
      />

      {/* ===== Лінія 1: вліво, щільний текст, жовтіє при наведенні ===== */}
      <div className="w-full select-none overflow-hidden whitespace-nowrap tracking-tighter">
        <div className="pointer-events-none inline-flex animate-marquee gap-16 pr-16">
          {[0, 1].map((rep) => (
            <div
              key={rep}
              aria-hidden={rep === 1}
              className="flex shrink-0 items-center gap-16"
            >
              {lineOne.map((item, i) => (
                <span
                  key={`${rep}-${i}`}
                  className="text-4xl font-black uppercase text-border-strong transition-colors duration-300 hover:text-accent-yellow sm:text-6xl md:text-7xl lg:text-8xl"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Лінія 2: вправо, контур, трохи напускає на першу лінію ===== */}
      <div className="relative z-10 -mt-3 w-full select-none overflow-hidden whitespace-nowrap tracking-tighter md:-mt-6">
        <div className="pointer-events-none inline-flex animate-marquee-fast gap-16 pr-16">
          {[0, 1].map((rep) => (
            <div
              key={rep}
              aria-hidden={rep === 1}
              className="flex shrink-0 items-center gap-16"
            >
              {lineTwo.map((item, i) => (
                <span
                  key={`${rep}-${i}`}
                  className="text-stroke-neon text-4xl font-black uppercase sm:text-6xl md:text-7xl lg:text-8xl"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marquee;
export { Marquee };
