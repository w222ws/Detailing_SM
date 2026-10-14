import { domAnimation, LazyMotion, m } from 'motion/react';
import { site } from '../config/site';
import { hero } from '../config/hero';
import heroPhoto from '../assets/hero-bg.avif';

/* Головний екран. Тексти — у config/hero.ts. */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function HeroPhoto() {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.1 }}
      className="relative"
    >
      {/* Гойдання — чистий CSS, transform на композиторі */}
      <div className="animate-(--animate-hero-sway) will-change-transform motion-reduce:animate-none">
        <div className="shine clip-cut relative aspect-[4/5] w-full overflow-hidden border border-border-subtle bg-carbon">
          <img
            src={heroPhoto}
            alt="Авто після детейлінгу у студії Detailing SM"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 border border-accent-yellow/20"
          />
        </div>
      </div>
    </m.div>
  );
}

function Hero() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="hero"
        className="relative flex w-full items-center overflow-hidden pt-24 pb-16 min-h-[88vh] lg:min-h-[92vh] lg:pt-32 lg:pb-24"
      >
        {/* Фон: точки, соти, затемнення, перехід у чорне внизу */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="bg-grain absolute inset-0" />
          <div className="bg-honeycomb absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_50%,rgb(7_7_10/0.85),transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-bg-main via-bg-main/70 to-transparent" />
        </div>

        <div className="container-site relative z-10 w-full">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* Текст: на мобілі порядок задають contents + order */}
            <div className="contents text-center lg:col-span-7 lg:block">
              <h1 className="order-1 font-display text-[3.1rem] leading-[0.95] text-text-main uppercase sm:text-7xl md:text-8xl lg:text-[6rem]">
                {hero.headline.map((line, li) => (
                  <span key={li} className="block overflow-hidden pb-[0.08em]">
                    <m.span
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.9,
                        delay: 0.05 + li * 0.14,
                        ease: EASE_OUT_EXPO,
                      }}
                      className={`block ${line.accent ? 'text-accent-yellow' : ''}`}
                    >
                      {line.text}
                    </m.span>
                  </span>
                ))}
              </h1>

              <div className="order-3 mt-6 flex flex-col items-center gap-6 lg:mt-8">
                <m.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.45,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="mx-auto max-w-md text-base text-text-muted sm:text-lg"
                >
                  {hero.description}
                </m.p>
                <m.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.6,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                >
                  <a href={hero.primaryCta.href} className="btn-primary shine">
                    {hero.primaryCta.label}
                  </a>
                  <a href={hero.secondaryCta.href} className="btn-ghost">
                    {hero.secondaryCta.label}
                  </a>
                </m.div>
              </div>
            </div>

            {/* Фото — на мобілі між заголовком і абзацом */}
            <div className="relative order-2 mx-auto w-full max-w-[19rem] lg:col-span-5 lg:mx-0 lg:ml-auto lg:max-w-sm">
              <span
                aria-hidden
                className="section-index pointer-events-none absolute -top-8 right-4 z-0 select-none"
              >
                {site.brand.short}
              </span>
              <div className="relative z-10">
                <HeroPhoto />
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default Hero;
export { Hero };
