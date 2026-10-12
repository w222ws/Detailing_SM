import { marqueeLineOne, marqueeLineTwo } from '../config/marquee';

/* ==========================================================================
   Дві стрічки, що біжать назустріч одна одній — наче два шари лаку.
   Лінія 1: щільний матовий текст, їде вліво. Лінія 2: контурний текст
   (text-stroke-neon), їде вправо, трохи заходить на першу лінію (-mt).
   Обидві лінії — зі свого файлу marquee.ts, без залежності від інших розділів.
   Відступи мобайл-фьорст і зменшені зверху — щоб полоса йшла одразу
   після Hero, а не висіла окремим блоком.
   ========================================================================== */

function Marquee() {
  const lineOne = marqueeLineOne;
  const lineTwo = marqueeLineTwo;

  return (
    <section className="relative z-20 w-full overflow-hidden bg-bg-main bg-grain py-6 font-display sm:py-8 lg:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/6 bg-linear-to-r from-bg-main to-transparent sm:w-1/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-1/6 bg-linear-to-l from-bg-main to-transparent sm:w-1/5"
      />

      <div className="w-full select-none overflow-hidden whitespace-nowrap tracking-tighter">
        <div className="pointer-events-none inline-flex animate-marquee gap-6 pr-6 sm:gap-10 sm:pr-10 lg:gap-16 lg:pr-16">
          {[0, 1].map((rep) => (
            <div
              key={rep}
              aria-hidden={rep === 1}
              className="flex shrink-0 items-center gap-6 sm:gap-10 lg:gap-16"
            >
              {lineOne.map((item, i) => (
                <span
                  key={`${rep}-${i}`}
                  className="text-2xl font-black uppercase text-border-strong transition-colors duration-300 hover:text-accent-yellow sm:text-4xl md:text-6xl lg:text-8xl"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 -mt-1.5 w-full select-none overflow-hidden whitespace-nowrap tracking-tighter sm:-mt-2.5 md:-mt-4 lg:-mt-6">
        <div className="pointer-events-none inline-flex animate-marquee-fast gap-6 pr-6 sm:gap-10 sm:pr-10 lg:gap-16 lg:pr-16">
          {[0, 1].map((rep) => (
            <div
              key={rep}
              aria-hidden={rep === 1}
              className="flex shrink-0 items-center gap-6 sm:gap-10 lg:gap-16"
            >
              {lineTwo.map((item, i) => (
                <span
                  key={`${rep}-${i}`}
                  className="text-stroke-neon text-2xl font-black uppercase sm:text-4xl md:text-6xl lg:text-8xl"
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
