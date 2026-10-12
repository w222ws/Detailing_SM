import type { ReactNode } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { priceDisclaimer, services, type Service } from '../config/services';

/* ==========================================================================
   Розділ #services. Перемикачі класу авто прибрані — вони нічого не
   вирішували для користувача, тільки займали екран. Замість них — чистий
   типографічний прайс-лист (як меню, не як плитка карток): назва, короткий
   опис, ціна. Жодних рамок і пунктирних ліній між рядками — розділяє сам
   ритм відступів. На фоні — ледь помітні контури зрізаних кузовних панелей
   (та сама форма, що й clip-cut по всьому сайту), для текстури, не напоказ.
   Один орекстрований вхід: заголовок і рядки проявляються по черзі.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

function formatPrice(service: Service) {
  if (service.individual || service.priceFrom == null) return null;
  return service.currency === 'USD'
    ? `$${service.priceFrom}`
    : `${service.priceFrom.toLocaleString('uk-UA')} ₴`;
}

/** Слово виїжджає з-під маски знизу — один раз при вході секції в екран */
function Word({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
      <m.span
        className={className ? `inline-block ${className}` : 'inline-block'}
        initial={{ y: '105%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, delay: 0.04 + index * 0.08, ease: EASE }}
      >
        {children}
      </m.span>
    </span>
  );
}

function Services() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="services"
        className="relative overflow-hidden bg-bg-main py-16 sm:py-20 lg:py-28"
      >
        {/* Фон: ледь видимі контури зрізаних панелей кузова — та сама форма clip-cut */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="clip-cut absolute -top-10 -left-20 size-72 rotate-[-9deg] border border-border-subtle/50 sm:size-[26rem]" />
          <div className="clip-cut-sm absolute right-[-4rem] bottom-[-3rem] size-56 rotate-[14deg] border border-accent-yellow/10 sm:size-80" />
          <div className="clip-cut absolute top-1/3 right-[12%] hidden size-48 rotate-[22deg] border border-border-subtle/30 lg:block" />
        </div>

        <div className="container-site relative">
          <h2 className="max-w-xl font-display text-[2.6rem] leading-[1.02] uppercase sm:text-5xl lg:text-6xl">
            <Word index={0} className="text-text-main">
              Послуги
            </Word>{' '}
            <Word index={1} className="text-text-main">
              та
            </Word>{' '}
            <Word index={2} className="text-accent-yellow">
              вартість
            </Word>
          </h2>
          <m.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="mt-4 max-w-md text-sm text-text-muted sm:text-base"
          >
            Вісім напрямків робіт — від швидкої мийки до керамічного захисту на
            роки.
          </m.p>

          <ul className="mt-12 flex flex-col gap-9 sm:mt-16 sm:gap-10">
            {services.map((service, index) => {
              const price = formatPrice(service);
              return (
                <m.li
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.05,
                    ease: EASE,
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-xl text-text-main uppercase sm:text-2xl lg:text-3xl">
                      {service.title}
                      {service.featured && (
                        <span className="ml-3 inline-flex items-center gap-1.5 align-middle font-mono text-[0.65rem] font-normal tracking-wider text-accent-yellow uppercase">
                          <span
                            aria-hidden
                            className="inline-block size-1.5 rotate-45 bg-accent-yellow"
                          />
                          популярне
                        </span>
                      )}
                    </h3>
                    <p className="shrink-0 whitespace-nowrap">
                      {price ? (
                        <>
                          <span className="mr-1 text-sm text-text-dim">
                            від
                          </span>
                          <span className="font-display text-xl font-bold text-accent-yellow sm:text-2xl">
                            {price}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-text-muted">
                          Індивідуально
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1.5 max-w-md text-sm text-text-muted sm:text-base">
                    {service.summary}
                  </p>
                </m.li>
              );
            })}
          </ul>

          <p className="mt-10 max-w-xl text-sm text-text-dim sm:mt-12">
            {priceDisclaimer}
          </p>
        </div>
      </section>
    </LazyMotion>
  );
}

export default Services;
export { Services };
