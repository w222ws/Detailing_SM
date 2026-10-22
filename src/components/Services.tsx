import { useRef, type ReactNode } from 'react';
import { domAnimation, LazyMotion, m, useInView } from 'motion/react';
import { priceDisclaimer, services, type Service } from '../config/services';

/* ==========================================================================
   #services — прайс-лист: назва, короткий опис, ціна.
   • Ліворуч — мононумерація 01…08 на звичайних рядках, задає ритм,
     читається як каталог. На featured-картці її немає — там уже є власний
     тег, другий покажчик лише б плутав.
   • Featured-рядок розгортається у «вітринну» картку: фірмовий жовтий
     зліва, легка підсвітка, причеплений жетон з ПРИЧИНОЮ вибору (а не
     словом «популярне» — воно саме по собі нічого не пояснює), ціна
     більша.
   • Поки гортаєш список — рядок у фокусі (ближче до центру екрана)
     яскравий, решта притлумлені. Працює в обидва боки: вгору й вниз.
     Лише opacity/transform через IntersectionObserver (useInView) —
     без scroll-слухача й без filter/blur, тому без лагів.
   • Фон — контури шестикутників і зрізаних панелей під різними кутами,
     жовті акценти в кутах. Без фільтрів і blur → без лагів.
   • Один оркестрований вхід: заголовок і рядки проявляються по черзі.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

function formatPrice(service: Service) {
  if (service.individual || service.priceFrom == null) return null;
  return service.currency === 'USD'
    ? `$${service.priceFrom}`
    : `${service.priceFrom.toLocaleString('uk-UA')} ₴`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

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

/** Контур шестикутника — декоративний елемент для фону */
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

/**
 * Фокус-смуга в три щаблі, не два — щоб затемнення читалось як
 *«відходить углиб темряви», а не просто блимало туди-сюди:
 *  • focus  — рядок у вузькій смузі посередині екрана: повна яскравість;
 *  • nearby — ще в межах екрана, але не в фокусі: напівтінь;
 *  • інакше — рядок пішов на пару позицій вище чи ще далеко знизу:
 *    майже чорний, зливається з фоном.
 * Обидва пороги — окремі IntersectionObserver через useInView, без
 * жодного onScroll і без filter — тільки opacity/transform, тому
 * плавно й без лагів навіть на слабкому телефоні.
 */
function useFocusDim(ref: React.RefObject<HTMLElement | null>) {
  const focus = useInView(ref, { margin: '-36% 0px -50% 0px' });
  const nearby = useInView(ref, { margin: '-6% 0px -12% 0px' });
  if (focus) return 'focus' as const;
  if (nearby) return 'nearby' as const;
  return 'far' as const;
}

const DIM_STYLE = {
  focus: { opacity: 1, transform: 'translateY(0) scale(1)' },
  nearby: { opacity: 0.3, transform: 'translateY(0) scale(0.98)' },
  far: { opacity: 0.04, transform: 'translateY(-6px) scale(0.95)' },
} as const;

/** Один рядок прайсу. Для featured — повноцінна «вітринна» картка. */
function ServiceRow({ service, index }: { service: Service; index: number }) {
  const price = formatPrice(service);
  const num = pad2(index + 1);
  const focusRef = useRef<HTMLLIElement>(null);
  const focusState = useFocusDim(focusRef);

  if (service.featured) {
    return (
      <li
        ref={focusRef}
        style={DIM_STYLE[focusState]}
        className="transition-[opacity,transform] duration-[550ms] ease-out will-change-[opacity,transform]"
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, delay: index * 0.05, ease: EASE }}
          className="relative"
        >
          {/* Жовтий бар зліва + м'яке світло всередині картки */}
          <div className="clip-cut-sm relative overflow-hidden border border-accent-yellow/35 bg-bg-elevated p-5 pt-8 sm:p-7 sm:pt-9">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px] bg-accent-yellow"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-accent-yellow/8"
            />

            {/*
              Жетон на верхньому краю картки. right-[0.75rem] — рівно
              стільки ж, скільки зрізано в куті самої картки (clip-cut-sm
              ріже кут на 0.75rem), тому правий край жетона впирається
              точно в те місце, де прямий край картки закінчується і
              починається її власний зріз — без накладання одне на одне.
              Власний зріз жетона — лише на лівому нижньому куті, тим
              самим кутом 0.75rem → той самий «почерк», що в картки,
              тільки дзеркально. ХОЧЕШ ЗМІНИТИ ТЕКСТ — він просто тут,
              рядком нижче. */}
            <span
              style={{
                clipPath:
                  'polygon(0.75rem 0, 100% 0, 100% 100%, 0 100%, 0 0.75rem)',
              }}
              className="absolute top-0 right-[0.75rem] bg-accent-yellow px-4 py-2 font-mono text-[0.68rem] font-bold tracking-widest text-bg-main uppercase shadow-[0_4px_14px_-2px_rgb(255_245_0_/_0.4)]"
            >
              Найпопулярніше
            </span>

            <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-2xl text-text-main uppercase sm:text-3xl lg:text-4xl">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
                  {service.summary}
                </p>
              </div>
              <p className="shrink-0 whitespace-nowrap">
                {price ? (
                  <>
                    <span className="mr-1 text-sm text-text-dim">від</span>
                    <span className="font-display text-3xl font-bold text-accent-yellow sm:text-4xl">
                      {price}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-text-muted">Індивідуально</span>
                )}
              </p>
            </div>
          </div>
        </m.div>
      </li>
    );
  }

  return (
    <li
      ref={focusRef}
      style={DIM_STYLE[focusState]}
      className="transition-[opacity,transform] duration-[550ms] ease-out will-change-[opacity,transform]"
    >
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: index * 0.05, ease: EASE }}
        className="group/row"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="flex items-baseline gap-3 font-display text-xl text-text-main uppercase sm:text-2xl lg:text-3xl">
            <span className="font-mono text-xs font-bold text-text-dim transition-colors group-hover/row:text-accent-yellow sm:text-sm">
              {num}
            </span>
            {service.title}
          </h3>
          <p className="shrink-0 whitespace-nowrap">
            {price ? (
              <>
                <span className="mr-1 text-sm text-text-dim">від</span>
                <span className="font-display text-xl font-bold text-accent-yellow sm:text-2xl">
                  {price}
                </span>
              </>
            ) : (
              <span className="text-sm text-text-muted">Індивідуально</span>
            )}
          </p>
        </div>
        <p className="mt-1.5 max-w-md pl-7 text-sm text-text-muted sm:pl-9 sm:text-base">
          {service.summary}
        </p>
      </m.div>
    </li>
  );
}

function Services() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="services"
        className="relative overflow-hidden bg-bg-main py-16 sm:py-20 lg:py-28"
      >
        {/* Фон: контури зрізаних панелей + шестикутники під кутами */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="clip-cut absolute -top-10 -left-20 size-72 rotate-[-9deg] border border-border-subtle/50 sm:size-[26rem]" />
          <div className="clip-cut-sm absolute right-[-4rem] bottom-[-3rem] size-56 rotate-[14deg] border border-accent-yellow/10 sm:size-80" />
          <div className="clip-cut absolute top-1/3 right-[12%] hidden size-48 rotate-[22deg] border border-border-subtle/30 lg:block" />

          <HexOutline className="absolute top-20 right-[6%] size-28 rotate-[12deg] text-accent-yellow/15 sm:size-40" />
          <HexOutline className="absolute top-[55%] left-[4%] hidden size-32 -rotate-[8deg] text-border-subtle/40 lg:block" />
          <HexOutline className="absolute bottom-20 left-[38%] hidden size-24 rotate-[18deg] text-accent-yellow/10 lg:block" />
          <HexOutline className="absolute top-[30%] right-[42%] hidden size-20 -rotate-[14deg] text-border-subtle/50 lg:block" />

          {/* Жовта «пил-смуга» зліва вгорі */}
          <div className="absolute top-24 left-0 h-px w-24 bg-linear-to-r from-accent-yellow/50 to-transparent sm:w-40" />
          <div className="absolute right-0 bottom-32 h-px w-24 bg-linear-to-l from-accent-yellow/40 to-transparent sm:w-40" />
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
            Вісім напрямків робіт — від швидкої мийки до плівкового захисту
            кузова на роки.
          </m.p>

          <ul className="mt-12 flex flex-col gap-9 sm:mt-16 sm:gap-10">
            {services.map((service, index) => (
              <ServiceRow key={service.id} service={service} index={index} />
            ))}
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
