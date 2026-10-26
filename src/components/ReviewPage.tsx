import { useEffect, useMemo, useRef } from 'react';
import { domAnimation, LazyMotion, m, MotionConfig } from 'motion/react';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import logoImg from '../assets/logo.avif';
import { brand, business } from '../config/site';
import { locations } from '../config/locations';
import { reviewPage } from '../config/review';

/* ==========================================================================
   /review — посадка з QR-коду. ПІД ТЕЛЕФОН: код сканують тільки з нього.

   СТРУКТУРА: шапка → Карбон → його репліка (вона ж заголовок) → мітка
   «Залиш відгук» → дві кнопки боксів. Усе.

   Окремого заголовка й ліда немає навмисно. Раніше тут стояли три
   текстові блоки підряд — eyebrow, заголовок, лід, — і за ними
   губилось те єдине, чого від людини хочуть. Тепер говорить кіт, а
   прямо просить мітка над кнопками.

   ЖИВИЙ МАСКОТ. Карбон моргає сам, із випадковою паузою 4–8 с, і
   щоразу МІНЯЄ ВИРАЗ РОТА — рот перемикається поки очі заплющені,
   тож підміна непомітна, а кіт здається думаючим. Так само реагує
   на тап. Це не нескінченна CSS-анімація, а рідкі одноразові
   запуски через Web Animations API: одна фігура, раз на кілька
   секунд, нічого не коштує.

   Жетон на ошийнику — «SM». Повне ім'я (Карбон СМ-ович) у підписі
   під реплікою: на жетоні шириною ~16 px на екрані більше за дві
   літери просто не прочитається.

   Лого в шапці йде з mix-blend-screen — у файлу своя чорна підкладка,
   і без цього він висить на фоні помітною плашкою.

   Рух лише там, де щось означає: кіт вистрибує знизу з перельотом,
   хвіст вильне після приземлення, блиск спалахує останнім.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Зіниця rx=5 у вузькому прищуреному оці — більше за ці межі вилазить */
const PUPIL_X = 3.5;
const PUPIL_Y = 2.5;

/* Вирази рота. Перемикаються на кожному моргу — поки очі заплющені,
   тому підміна непомітна. Усі починаються і закінчуються в тих самих
   точках, інакше рот «стрибав» би по мордочці. */
const MOUTHS = [
  // спокійна усмішка — базова
  'M134 155 C146 168 154 162 158 149 C162 162 170 168 182 155',
  // широка, задоволена: дуги вдвічі глибші й ширші
  'M126 151 C142 176 154 167 158 149 C162 167 174 176 190 151',
  // стримана: коротка й майже пряма
  'M142 158 C150 165 155 162 158 155 C161 162 166 165 174 158',
  // хитра: правий кут помітно вище лівого
  'M134 157 C146 170 154 163 158 149 C162 160 172 157 186 147',
] as const;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});

/** «м. Дніпро, вул. Петра Бикова, 16» → місто дрібним, вулиця великим.
    Природна ієрархія самої адреси — на відміну від вигаданої нумерації
    «01 / 02», яка натякає на послідовність там, де її немає. */
const splitAddress = (address: string) => {
  const i = address.indexOf(',');
  if (i === -1) return { city: null, street: address };
  return {
    city: address.slice(0, i).trim(),
    street: address.slice(i + 1).trim(),
  };
};

type CatRefs = {
  eyes: React.RefObject<SVGGElement | null>;
  pupils: React.RefObject<SVGGElement | null>;
  mouth: React.RefObject<SVGPathElement | null>;
};

/* --------------------------------------------------------------------------
   Карбон.
   -------------------------------------------------------------------------- */
function Carbon({ eyes, pupils, mouth }: CatRefs) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 340"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Хвіст — окремо від тіла, бо вильне після приземлення */}
      <m.g
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -8, 5, -2, 0] }}
        transition={{
          duration: 1.1,
          delay: 1,
          times: [0, 0.3, 0.58, 0.82, 1],
          ease: 'easeOut',
        }}
        style={{ transformOrigin: '238px 292px' }}
      >
        <path
          d="M234.373 251.55C273.142 241.462 303.749 282.822 274.163 312.078C238.454 347.385 130.31 345.368 83.3791 327.209C70.1161 321.157 77.6965 298.963 93 299.972C147.072 319.139 221.11 321.157 251.717 299.972C268.041 288.875 258.859 273.743 244.576 276.77C223.151 283.831 214.989 258.611 234.373 251.55Z"
          fill="#2c2f3a"
        />
      </m.g>

      {/* Тіло */}
      <path
        d="M113 149C90 181 81 222 78 277C78 311 101 328 157 328C216 328 241 312 241 280C241 230 224 179 203 149H113Z"
        fill="#1c1e26"
      />
      {/* Світла грудка */}
      <path
        d="M114 167H201C193 189 178 201 171 222L157 243L144 222C137 201 122 190 114 167Z"
        fill="#2c2f3a"
      />

      {/* Голова з вухами */}
      <path
        d="M51.6057 16L111.836 50.9479C131.912 42.9598 152.993 42.9598 171.062 47.9523L193.146 38.9657L190.135 50.9479L212.219 47.9523L262.411 16.9985L260.403 38.9657L250.365 44.9568L258.396 50.9479L255.384 88.8913C273.453 117.848 270.442 145.806 246.35 166.775L259.4 168.772L237.315 177.759C215.231 194.733 120.87 195.732 91.7591 178.757L66.6632 172.766L77.7054 164.778C54.6172 150.799 43.575 123.839 51.6057 96.8794V16Z"
        fill="#1c1e26"
      />
      {/* Внутрішні вуха */}
      <path d="M65 34L103 66L71 81L65 34Z" fill="#2c2f3a" />
      <path d="M248 33L243 80L218 64L248 33Z" fill="#2c2f3a" />
      {/* Світлі грані над очима — саме вони дають прищур */}
      <path d="M75 78C103 78 126 87 144 96L82 91L75 78Z" fill="#2c2f3a" />
      <path
        d="M171 91C194 76.0659 219 71.799 240 74.9991L234 82.4662C213 79.266 193 83.5329 171 91Z"
        fill="#2c2f3a"
      />

      {/* ОЧІ. Зовнішня група — морг (scaleY), внутрішня — ведення зіниць */}
      <g
        ref={eyes}
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
      >
        <path
          d="M79 97C100 97 127 102.044 142 113.14C136 129.281 123 136.342 106 133.316C89 130.289 82 117.175 79 97Z"
          fill="#fff500"
        />
        <path
          d="M174 115.857C194 109.923 217 108.934 237 103C231 126.736 219 133.658 205 131.68C189 129.702 180 126.736 174 115.857Z"
          fill="#fff500"
        />
        <g
          ref={pupils}
          style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        >
          <ellipse cx="115" cy="116.5" rx="5" ry="14.5" fill="#07070a" />
          <ellipse cx="201" cy="118.5" rx="5" ry="11.5" fill="#07070a" />
          <circle cx="107.5" cy="107.5" r="2.5" fill="#ffffff" />
          <circle cx="193.5" cy="112.5" r="2.5" fill="#ffffff" />
        </g>
      </g>

      {/* Ніс і рот. Рот міняється під час моргу — звідси ref */}
      <path d="M149 137H166L157.5 147L149 137Z" fill="#07070a" />
      <path
        ref={mouth}
        d={MOUTHS[0]}
        stroke="#07070a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Вуса */}
      <path
        d="M56 132L88 139M59 149L89 144"
        stroke="#2c2f3a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M228 139L261 132M228 144L258 149"
        stroke="#2c2f3a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Ошийник і жетон «SM» */}
      <path
        d="M107 181C141 191.393 175 191.393 209 181L204 192.692C173.333 202.436 142.667 202.436 112 192.692L107 181Z"
        fill="#07070a"
      />
      <circle cx="158" cy="206" r="15" fill="#fff500" />
      <text
        x="158"
        y="211"
        textAnchor="middle"
        fill="#07070a"
        fontSize="13"
        fontWeight="800"
        letterSpacing="0.5"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        SM
      </text>
    </svg>
  );
}

export function ReviewPage() {
  const eyes = useRef<SVGGElement>(null);
  const pupils = useRef<SVGGElement>(null);
  const mouth = useRef<SVGPathElement>(null);
  const mouthIndex = useRef(0);

  const phrase = useMemo(
    () =>
      reviewPage.phrases[Math.floor(Math.random() * reviewPage.phrases.length)],
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

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    /* Морг + зміна виразу. Рот підміняється на середині моргу, коли
       очі заплющені, — підміни не видно, а кіт ніби передумав. */
    const blink = () => {
      eyes.current?.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: 'scaleY(0.08)' },
          { transform: 'scaleY(1)' },
        ],
        { duration: 240, easing: 'ease-in-out' },
      );
      window.setTimeout(() => {
        mouthIndex.current = (mouthIndex.current + 1) % MOUTHS.length;
        mouth.current?.setAttribute('d', MOUTHS[mouthIndex.current]);
      }, 110);
    };

    /* Сам по собі — з випадковою паузою, щоб не читався як метроном.
       Один таймер і одна фігура: дешевше за будь-який нескінченний
       CSS-цикл, який крутився б і тоді, коли на нього не дивляться. */
    let timer = window.setTimeout(function tick() {
      blink();
      timer = window.setTimeout(tick, 4000 + Math.random() * 4000);
    }, 3200);

    // Тап будь-де: зіниці ведуться туди + той самий морг із виразом
    const onTap = (e: PointerEvent) => {
      const nx = clamp((e.clientX / window.innerWidth - 0.5) * 2.4);
      const ny = clamp((e.clientY / window.innerHeight - 0.5) * 2.4);
      if (pupils.current) {
        pupils.current.style.transform = `translate(${nx * PUPIL_X}px, ${ny * PUPIL_Y}px)`;
      }
      blink();
    };
    window.addEventListener('pointerdown', onTap, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', onTap);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <main className="relative flex min-h-dvh flex-col overflow-hidden bg-bg-main bg-grain">
          <div
            aria-hidden
            className="bg-honeycomb pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg-main via-bg-main/70 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-main via-bg-main/70 to-transparent"
          />

          <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-6 pb-10">
            {/* ===== ШАПКА =====
                Та сама панель, що в Header на головній: clip-cut, той
                самий бордер, bg-bg-card і shadow-card. Сторінка коротка,
                тож не fixed — просто стоїть зверху. */}
            <m.header
              {...reveal(0)}
              className="relative flex h-[4.5rem] items-center justify-between gap-3 pr-4 pl-3"
            >
              <div
                aria-hidden
                className="clip-cut absolute inset-0 -z-10 border border-border-subtle bg-bg-card/95 shadow-card"
              />
              {/* Лого — круглий бейдж, тому квадратне й велике. У вузькій
                  смужці h-9 w-auto воно просто губилось. Файл уже
                  прозорий, жодних блендів не треба. */}
              <a
                href="/"
                aria-label={`${brand.name}: на головну`}
                className="relative block size-14 shrink-0"
              >
                <img
                  src={logoImg}
                  alt={brand.name}
                  width={56}
                  height={56}
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full bg-transparent object-contain"
                />
              </a>
              <a
                href="/"
                className="group relative inline-flex shrink-0 items-center gap-2 font-mono text-[0.6rem] font-bold tracking-widest text-text-dim uppercase transition-colors hover:text-accent-yellow"
              >
                <ArrowLeftIcon
                  aria-hidden
                  weight="bold"
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
                {reviewPage.backLabel}
              </a>
            </m.header>

            {/* Контент центрується у вільному просторі — інакше на
                високих екранах під кнопками лишається діра */}
            <div className="flex flex-1 flex-col justify-center py-6">
              {/* ===== КАРБОН ===== */}
              <div className="relative mx-auto w-[64%] max-w-[15rem]">
                {/* Блиск — спалахує останнім, уже після приземлення.
                    Чотири промені: символ чистої поверхні, тобто рівно
                    те, що студія робить з авто. */}
                <m.svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  initial={{ opacity: 0, scale: 0.2, rotate: -40 }}
                  animate={{ opacity: 1, scale: [0.2, 1.2, 1], rotate: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.2,
                    times: [0, 0.6, 1],
                    ease: EASE,
                  }}
                  className="absolute -top-2 -right-2 z-10 size-8 text-accent-yellow"
                >
                  <path
                    d="M12 0 L13.7 10.3 L24 12 L13.7 13.7 L12 24 L10.3 13.7 L0 12 L10.3 10.3 Z"
                    fill="currentColor"
                  />
                </m.svg>

                {/* Вистрибує знизу з перельотом — так застрибують на стіл */}
                <m.div
                  initial={{ opacity: 0, y: 56, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: [56, -8, 0],
                    scale: [0.9, 1.03, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.35,
                    times: [0, 0.62, 1],
                    ease: [0.3, 0.9, 0.4, 1],
                  }}
                >
                  <Carbon eyes={eyes} pupils={pupils} mouth={mouth} />
                </m.div>
              </div>

              {/* ===== РЕПЛІКА — вона ж заголовок ===== */}
              <h1 className="mt-6 text-center font-display text-[1.9rem] leading-[1] uppercase sm:text-4xl">
                <m.span {...reveal(0.85)} className="block text-text-main">
                  {phrase[0]}
                </m.span>
                <m.span {...reveal(0.93)} className="block text-accent-yellow">
                  {phrase[1]}
                </m.span>
              </h1>

              <m.p
                {...reveal(1.02)}
                className="mt-3 text-center font-mono text-[0.55rem] font-bold tracking-[0.18em] text-text-dim uppercase"
              >
                {reviewPage.catTag}
              </m.p>

              {/* ===== ДІЯ ===== */}
              <m.p
                {...reveal(1.12)}
                className="mt-9 font-mono text-[0.62rem] font-bold tracking-[0.2em] text-accent-yellow uppercase"
              >
                {reviewPage.chooseLabel}
              </m.p>

              <div className="mt-3 flex flex-col gap-2.5">
                {locations.map((loc, i) => {
                  const { city, street } = splitAddress(loc.address);
                  return (
                    <m.a
                      key={loc.id}
                      href={loc.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: 1.2 + i * 0.08,
                        ease: EASE,
                      }}
                      whileTap={{ scale: 0.985 }}
                      className="clip-cut group flex items-center justify-between gap-3 border border-border-subtle bg-bg-elevated py-3.5 pr-3 pl-5 shadow-card transition-colors hover:border-accent-yellow"
                    >
                      <span className="min-w-0">
                        {city && (
                          <span className="block font-mono text-[0.55rem] font-bold tracking-widest text-text-dim uppercase">
                            {city}
                          </span>
                        )}
                        <span className="mt-0.5 block text-[0.95rem] leading-snug text-text-main">
                          {street}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="clip-cut-sm grid size-11 shrink-0 place-items-center bg-accent-yellow text-bg-main transition-transform duration-300 group-hover:rotate-45"
                      >
                        <ArrowUpRightIcon weight="bold" className="size-5" />
                      </span>
                    </m.a>
                  );
                })}
              </div>
            </div>

            {/* ===== МІНІ-ПІДВАЛ =====
                Один рядок: копірайт і місто. Рік кінця береться з
                системного годинника, початок — із brand.since, тож
                нікому не треба згадувати про нього щосічня. */}
            <m.footer {...reveal(1.45)}>
              <div
                aria-hidden
                className="h-px bg-linear-to-r from-transparent via-border-subtle to-transparent"
              />
              <p className="mt-4 text-center font-mono text-[0.55rem] tracking-[0.15em] text-text-dim uppercase">
                © {brand.since}—{new Date().getFullYear()} {brand.name} ·{' '}
                {business.city}
              </p>
            </m.footer>
          </div>
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}

export default ReviewPage;
