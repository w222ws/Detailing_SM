import { useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
} from 'motion/react';
import {
  ArrowUpRightIcon,
  InstagramLogoIcon,
  PhoneCallIcon,
  StarIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import logoImg from '../assets/logo.avif';
import { brand, contacts } from '../config/site';
import { locations } from '../config/locations';
import { reviewPage } from '../config/review';

/* ==========================================================================
   /review — сторінка-посадка з QR-коду.

   Структура сторінки нагадує справжній сайт: тонка «шапка» зверху з
   швидкими контактами й лого, нижче — головна дія. Так людина одразу
   бачить, куди вона потрапила, і що завжди може зв'язатися напряму.

   Шапка:   [TG] [IG] [WA] [☎]      Detailing SM · ●онлайн   [лого]
   Контент: Заголовок → підказка → 5 великих зірок (інтерактив)
            → після вибору: кнопки студій + «Змінити оцінку»
            → «На головну»

   Фон живий, але легкий: градієнт-дихання по центру (10 с цикл),
   карбон-база, панелі clip-cut, дві LED-смуги навкіс і одноразовий
   промінь-фара при вході. Без постійних важких анімацій на фонових
   шарах → не грузить телефон.

   Мікро-деталі: пульс-підказка на першій зірці, тактильний відгук
   (vibrate), конфеті при 5 зірках, зелений пульс «онлайн» у шапці,
   кнопки студій піднімаються на hover (whileHover).

   Дані: config/site, config/locations, config/review. Лого — avif з assets.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const RATING_LABEL: Record<number, string> = {
  5: 'П’ять з п’яти — дякуємо!',
  4: 'Дякуємо за оцінку',
  3: 'Дякуємо за відгук',
  2: 'Нам важлива ваша думка',
  1: 'Нам важлива ваша думка',
};

const vibrate = (ms: number) => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* ignore */
    }
  }
};

export function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [celebrate, setCelebrate] = useState(0);

  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 70 + ((i * 37) % 50);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 10,
          rot: ((i * 73) % 360) - 180,
          delay: (i % 4) * 0.03,
        };
      }),
    [],
  );

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Залишити відгук — ${brand.name}`;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  const rated = rating > 0;
  const display = rated ? rating : hover;

  const onPick = (n: number) => {
    setRating(n);
    vibrate(15);
    if (n === 5) setCelebrate((c) => c + 1);
  };

  const onReset = () => {
    setRating(0);
    setHover(0);
    setCelebrate(0);
  };

  const topChannels = [
    { c: contacts.telegram, Icon: TelegramLogoIcon },
    { c: contacts.instagram, Icon: InstagramLogoIcon },
    { c: contacts.whatsapp, Icon: WhatsappLogoIcon },
    { c: contacts.phone, Icon: PhoneCallIcon },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <main className="relative flex min-h-dvh flex-col overflow-hidden bg-bg-main">
          {/* === БАГАТОШАРОВИЙ ФОН === */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg-elevated/40 via-transparent to-bg-main"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 select-none"
          >
            <div className="clip-cut absolute -top-12 -left-20 size-72 rotate-[-9deg] border border-border-subtle/50 sm:size-[26rem]" />
            <div className="clip-cut-sm absolute -right-16 -bottom-12 size-56 rotate-[14deg] border border-accent-yellow/10 sm:size-80" />
            <div className="clip-cut absolute top-[22%] right-[14%] size-32 rotate-[22deg] border border-border-subtle/30 sm:size-48" />
            <div className="clip-cut-sm absolute bottom-[26%] left-[8%] size-28 rotate-[-16deg] border border-border-subtle/30 sm:size-40" />
          </div>
          {/* «Дихаючий» градієнт по центру — 10с цикл, дуже легкий */}
          <m.div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              background:
                'radial-gradient(closest-side, rgb(255 245 0 / 0.06), transparent)',
            }}
            animate={{ opacity: [0.55, 1, 0.55], scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          />
          {/* Дві LED-смуги навкіс */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-[1px] w-[70%] origin-top-right rotate-[-10deg] bg-linear-to-l from-transparent via-accent-yellow/30 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-[70%] origin-bottom-left rotate-[-10deg] bg-linear-to-r from-transparent via-accent-yellow/20 to-transparent"
          />
          {/* Промінь-фара на вході: один прохід */}
          <m.div
            aria-hidden
            initial={{ x: '-180%' }}
            animate={{ x: '540%' }}
            transition={{ duration: 1.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-[18deg] bg-linear-to-r from-transparent via-accent-yellow/[0.12] to-transparent"
          />

          {/* === ТОП-СМУГА — у стилі основного Header (bg-bg-card, clip-cut) === */}
          <m.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative z-10 px-3 pt-3 sm:px-6 sm:pt-4"
          >
            <div className="clip-cut relative mx-auto flex max-w-xl items-center justify-between gap-3 border border-border-subtle bg-bg-elevated px-3 py-2.5 shadow-card sm:px-4 sm:py-3">
              {/* Лого — ліворуч */}
              <a
                href="/"
                aria-label={`${brand.name}: на головну`}
                className="block size-14 shrink-0 sm:size-16"
              >
                <img
                  src={logoImg}
                  alt={brand.name}
                  width={64}
                  height={64}
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full object-contain"
                />
              </a>

              {/* Швидкі контакти — праворуч */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {topChannels.map(({ c, Icon }) => (
                  <a
                    key={c.id}
                    href={c.href}
                    target={c.id === 'phone' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={c.label}
                    className="clip-cut-sm grid size-9 place-items-center border border-border-subtle text-text-main transition-colors hover:border-accent-yellow hover:text-accent-yellow sm:size-10"
                  >
                    <Icon
                      aria-hidden
                      weight="fill"
                      className="size-4 sm:size-5"
                    />
                  </a>
                ))}
              </div>
            </div>
          </m.header>

          {/* === КОНТЕНТ === */}
          <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex w-full max-w-md flex-col items-center">
              {/* Заголовок */}
              <m.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                className="font-display text-3xl leading-[0.95] text-text-main uppercase sm:text-4xl lg:text-5xl"
              >
                Як пройшов{' '}
                <span className="text-accent-yellow">ваш візит?</span>
              </m.h1>

              {/* Підказка — міняється під стан */}
              <AnimatePresence mode="wait">
                <m.p
                  key={rated ? `r-${rating}` : hover ? `h-${hover}` : 'hint'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mt-3 text-sm text-text-muted sm:text-base"
                >
                  {rated
                    ? RATING_LABEL[rating]
                    : hover
                      ? `Ваша оцінка: ${hover}/5`
                      : 'Оцініть від 1 до 5'}
                </m.p>
              </AnimatePresence>

              {/* --------- ЗІРКИ + КОНФЕТІ --------- */}
              <div className="relative mt-6">
                <AnimatePresence>
                  {celebrate > 0 && (
                    <div
                      key={celebrate}
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-1/2 size-0"
                    >
                      {confetti.map((p, i) => (
                        <m.span
                          key={i}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{
                            x: p.x,
                            y: p.y,
                            opacity: 0,
                            scale: 0.5,
                            rotate: p.rot,
                          }}
                          transition={{
                            duration: 1.1,
                            delay: p.delay,
                            ease: 'easeOut',
                          }}
                          className="absolute size-2 bg-accent-yellow"
                          style={{ top: -4, left: -4 }}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                <div
                  className="flex gap-1.5 sm:gap-2"
                  role="radiogroup"
                  aria-label="Оцінка від 1 до 5"
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isFilled = display >= n;
                    return (
                      <m.button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n}`}
                        onClick={() => onPick(n)}
                        onMouseEnter={() => !rated && setHover(n)}
                        initial={{ opacity: 0, scale: 0.4, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.6 + n * 0.08,
                          ease: EASE,
                        }}
                        whileTap={{ scale: 0.85 }}
                        className={cx(
                          'relative grid size-14 cursor-pointer place-items-center transition-transform duration-200 sm:size-16',
                          !rated && 'hover:scale-110',
                        )}
                      >
                        {/* Хвиля-кільце навколо обраної зірки */}
                        {rating === n && (
                          <m.span
                            aria-hidden
                            initial={{ scale: 0.5, opacity: 0.9 }}
                            animate={{ scale: 2.4, opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="absolute size-10 rounded-full border-2 border-accent-yellow sm:size-12"
                          />
                        )}
                        {/* Пульс-підказка на першій зірці, доки нема оцінки */}
                        {!rated && n === 1 && (
                          <m.span
                            aria-hidden
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.6, 0, 0.6],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.8,
                              ease: 'easeOut',
                              delay: 1.5,
                            }}
                            className="absolute size-10 rounded-full border border-accent-yellow sm:size-12"
                          />
                        )}
                        <m.span
                          animate={{
                            scale: isFilled && rated ? [0.9, 1.2, 1] : 1,
                          }}
                          transition={{
                            duration: 0.4,
                            delay: isFilled && rated ? (n - 1) * 0.05 : 0,
                            ease: EASE,
                          }}
                          className={cx(
                            'inline-flex transition-colors duration-200',
                            isFilled ? 'text-accent-yellow' : 'text-text-dim',
                          )}
                        >
                          <StarIcon
                            weight={isFilled ? 'fill' : 'duotone'}
                            className="size-10 sm:size-12"
                          />
                        </m.span>
                      </m.button>
                    );
                  })}
                </div>
              </div>

              {/* --------- КНОПКИ СТУДІЙ --------- */}
              <AnimatePresence>
                {rated && (
                  <m.div
                    key="cta"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="mt-8 w-full"
                  >
                    <p className="font-mono text-[0.6rem] font-bold tracking-widest text-text-dim uppercase sm:text-[0.65rem]">
                      {reviewPage.chooseLabel}
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      {locations.map((loc, i) => (
                        <m.a
                          key={loc.id}
                          href={loc.reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.12 + i * 0.1,
                            ease: EASE,
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="glass clip-cut shine group flex items-center justify-between gap-4 p-4 text-left shadow-card sm:p-5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-display text-base font-bold text-text-main uppercase sm:text-lg">
                              {loc.title}
                            </span>
                            <span className="mt-1 block truncate font-mono text-[0.65rem] tracking-wider text-text-muted uppercase">
                              {loc.address}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className="clip-cut-sm grid size-11 shrink-0 place-items-center bg-accent-yellow text-bg-main transition-transform duration-300 group-hover:rotate-45"
                          >
                            <ArrowUpRightIcon
                              weight="bold"
                              className="size-5"
                            />
                          </span>
                        </m.a>
                      ))}
                    </div>

                    <m.button
                      type="button"
                      onClick={onReset}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.55 }}
                      className="mt-4 font-mono text-[0.6rem] font-bold tracking-widest text-text-dim uppercase underline-offset-4 transition-colors hover:text-accent-yellow hover:underline"
                    >
                      Змінити оцінку
                    </m.button>
                  </m.div>
                )}
              </AnimatePresence>

              {/* --------- БЕК-ЛІНК --------- */}
              <m.a
                href="/"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="mt-10 font-mono text-[0.6rem] font-bold tracking-widest text-text-dim uppercase underline-offset-4 transition-colors hover:text-accent-yellow hover:underline"
              >
                {reviewPage.backLabel}
              </m.a>
            </div>
          </section>
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}

export default ReviewPage;
