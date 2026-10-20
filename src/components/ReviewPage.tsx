import { useEffect, useMemo, useRef } from 'react';
import { domAnimation, LazyMotion, m, MotionConfig } from 'motion/react';
import {
  InstagramLogoIcon,
  PhoneCallIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import logoImg from '../assets/logo.avif';
import { brand, contacts } from '../config/site';
import { locations } from '../config/locations';
import { reviewPage } from '../config/review';

/* ==========================================================================
   /review — посадка з QR-коду. ПРОЄКТУЄТЬСЯ ПІД ТЕЛЕФОН: код сканують
   тільки з нього, десктоп — побічний випадок.

   ВХІД. Екран спершу темний. Зліва вбігають ДВА ЖОВТИХ ВОГНИКИ —
   це очі кота, бо в темряві від тварини видно тільки їх. Вони летять
   через екран, підстрибуючи, примружені на бігу; зупиняються по
   центру, розплющуються — і аж тоді з темряви навколо них проступає
   тіло.

   Пробіжка і «очі в темряві» — не два різні сценарії, між якими треба
   обирати: це одне й те саме. Тому біжать саме очі, а не силует.

   ТАЙМЛАЙН:
     0.30  вогники з'являються за лівим краєм екрана
     0.30  біг: x через увесь екран, підстрибування, примружені очі
     1.05  зупинка з OVERSHOOT — проскакують центр і вертаються.
           Жива істота не гальмує як ліфт.
     1.26  очі розплющуються на повну
     1.20  тіло проступає з темряви навколо них
     1.40  хвіст ДОГОНЯЄ і доводиться пружинкою — при різкій зупинці
           він завжди відстає
     1.60  фраза з'являється ПЕРЕКОШЕНОЮ — кіт її зачепив на бігу
     1.70  КНОПКИ — раніше за кінець сцени: хто поспішає, не чекає
     2.15  тягне лапу вниз до тексту
     2.45  фраза вирівнюється — поправив
     2.77  морг

   ОБ'ЄМ. Не один градієнт на весь силует, а прийоми предметного рендеру:
   • radial-градієнти окремо на голові, тілі, вухах — сфера, не пляма;
   • bounce light — на самому контурі тон знову світлішає, бо край ловить
     відбите світло. Без цього сфера читається плоским кругом;
   • ambient occlusion — затемнення в місці, де голова сідає на тіло;
   • очі як сфери: райдужка з градієнтом, тінь від повіки, відблик.

   ІНТЕРАКТИВ. Слідкування за мишею на телефоні мертве, тому його немає.
   Замість нього — тап будь-де: кіт повертає голову туди, веде зіницями
   і моргає. Нахил голови й зіниці пишуться напряму в style, морг іде
   через Web Animations API на вкладеній групі, щоб не змагатися з
   Framer Motion за той самий transform.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Межі ведення зіниці. Зіниця ry=13 в оці ry=18, тож по вертикалі
   запас лише 5 — PUPIL_Y більший за це вилазить за край райдужки. */
const PUPIL_X = 4;
const PUPIL_Y = 2.5;
const HEAD_TILT = 5;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

type Refs = {
  head: React.RefObject<SVGGElement | null>;
  blink: React.RefObject<SVGGElement | null>;
  pupils: React.RefObject<SVGGElement | null>;
};

/* --------------------------------------------------------------------------
   Карбон.
   -------------------------------------------------------------------------- */
function Carbon({ head, blink, pupils }: Refs) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 300"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMax meet"
      /* overflow visible — очі вибігають далеко за межі viewBox зліва.
         Обрізає вже <main> по краю екрана, що нам і треба. */
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Голова як сфера. Останній стоп СВІТЛІШИЙ за передостанній —
            це bounce light: край ловить відбите світло й не буває
            найтемнішою точкою. Без нього куля виглядає плоским кругом. */}
        <radialGradient id="c-head" cx="0.36" cy="0.28" r="0.8">
          <stop offset="0%" stopColor="#32343f" />
          <stop offset="42%" stopColor="#1c1d26" />
          <stop offset="76%" stopColor="#0c0d12" />
          <stop offset="100%" stopColor="#16171f" />
        </radialGradient>
        <radialGradient id="c-body" cx="0.33" cy="0.14" r="0.95">
          <stop offset="0%" stopColor="#282a35" />
          <stop offset="40%" stopColor="#17181f" />
          <stop offset="85%" stopColor="#0a0a0e" />
          <stop offset="100%" stopColor="#111219" />
        </radialGradient>
        <linearGradient id="c-ear" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2c2e3a" />
          <stop offset="100%" stopColor="#0f1017" />
        </linearGradient>
        {/* Райдужка: світліша знизу-зліва, темніша по краю — куля, не диск */}
        <radialGradient id="c-iris" cx="0.42" cy="0.66" r="0.72">
          <stop offset="0%" stopColor="#fffd8e" />
          <stop offset="50%" stopColor="#fff500" />
          <stop offset="100%" stopColor="#bfa000" />
        </radialGradient>
        {/* Ambient occlusion — м'яке затемнення на стику форм */}
        <radialGradient id="c-ao" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* Rim light: яскраво зліва, де лампа, згасає праворуч */}
        <linearGradient
          id="c-rim"
          gradientUnits="userSpaceOnUse"
          x1="95"
          y1="45"
          x2="212"
          y2="178"
        >
          <stop offset="0%" stopColor="#fff500" stopOpacity="0.5" />
          <stop offset="32%" stopColor="#fff500" stopOpacity="0.1" />
          <stop offset="58%" stopColor="#fff500" stopOpacity="0" />
        </linearGradient>
        {/* Низ розчиняється — кіт виростає з темряви, не лежить наклейкою */}
        <linearGradient id="c-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="60%" stopColor="#fff" stopOpacity="1" />
          <stop offset="82%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="c-mask">
          <rect width="320" height="300" fill="url(#c-fade)" />
        </mask>
        <clipPath id="c-eye-l">
          <ellipse cx="137" cy="107" rx="14" ry="18" />
        </clipPath>
        <clipPath id="c-eye-r">
          <ellipse cx="183" cy="107" rx="14" ry="18" />
        </clipPath>
      </defs>

      {/* ХВІСТ — окремо від тіла, бо ДОГОНЯЄ. При різкій зупинці хвіст
          завжди відстає і доводиться по інерції; без цього тварина
          виглядає як вимкнена іграшка. */}
      <m.g
        mask="url(#c-mask)"
        initial={{ opacity: 0, rotate: -16 }}
        animate={{ opacity: 1, rotate: [-16, 7, -3, 0] }}
        transition={{
          duration: 0.9,
          delay: 1.4,
          times: [0, 0.45, 0.75, 1],
          ease: 'easeOut',
        }}
        style={{ transformOrigin: '228px 250px' }}
      >
        <path
          d="M 218 252 Q 274 244 269 196 Q 264 156 234 167"
          fill="none"
          stroke="url(#c-body)"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </m.g>

      {/* ТІЛО — проступає з темряви навколо очей, які вже зупинились */}
      <m.g
        mask="url(#c-mask)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
      >
        <path
          fill="url(#c-body)"
          stroke="url(#c-rim)"
          strokeWidth="2"
          d="M 160 140 Q 212 150 222 215 Q 230 284 160 290 Q 90 284 98 215 Q 108 150 160 140 Z"
        />
        {/* Права лапа */}
        <ellipse cx="186" cy="277" rx="21" ry="13" fill="#191a22" />
        {/* AO між лапою і тілом */}
        <ellipse cx="186" cy="266" rx="26" ry="11" fill="url(#c-ao)" />

        {/* ЛІВА ЛАПА, поза «опущена» — гасне на час жесту.
            Обертанням таку лапу не підняти: вектор плече→стопа дивиться
            вниз, розвернути його треба на ~160°, а це вже не жест.
            Тому перемикаємо позу, як у класичній 2D-анімації. */}
        <m.g
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0, 0, 1] }}
          transition={{
            duration: 1.3,
            delay: 2.1,
            times: [0, 0.12, 0.2, 0.62, 0.72],
            ease: 'linear',
          }}
        >
          <ellipse cx="134" cy="277" rx="21" ry="13" fill="#191a22" />
          <ellipse cx="134" cy="266" rx="26" ry="11" fill="url(#c-ao)" />
        </m.g>
      </m.g>

      {/* ЛІВА ЛАПА, поза «витягнута вперед-вниз» — тягнеться до тексту,
          який на телефоні лежить ПІД котом. Тому жест іде вниз, а не
          вгору: так він коротший і читабельніший. */}
      <m.g
        mask="url(#c-mask)"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: [0, 0, 1, 1, 0], rotate: [-8, -8, 0, 0, -5] }}
        transition={{
          duration: 1.3,
          delay: 2.1,
          times: [0, 0.14, 0.26, 0.6, 0.7],
          ease: 'easeOut',
        }}
        style={{ transformOrigin: '126px 222px' }}
      >
        <path
          d="M 126 222 Q 112 258 98 288"
          fill="none"
          stroke="url(#c-body)"
          strokeWidth="21"
          strokeLinecap="round"
        />
        {/* Подушечка — інакше лапа читається обрубком без кисті */}
        <ellipse
          cx="96"
          cy="291"
          rx="15"
          ry="11"
          fill="#22242e"
          transform="rotate(18 96 291)"
        />
      </m.g>

      {/* ГОЛОВА. g (ref) — нахил від тапу; усередині череп і очі мають
          РОЗДІЛЬНІ анімації появи, бо очі мусять бути видимі ще в
          темряві, коли черепа нема. Якби вони лежали під одним opacity,
          увесь вхідний хук зник би. */}
      <g
        ref={head}
        style={{
          transformOrigin: '160px 152px',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Череп проступає. Тільки opacity, без scale: при масштабуванні
            черепа очі з'їхали б відносно нього на кілька пікселів. */}
        <m.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
        >
          {/* Вуха — перед головою, вона перекриває їхню основу */}
          <path
            fill="url(#c-ear)"
            stroke="url(#c-rim)"
            strokeWidth="2"
            strokeLinejoin="round"
            d="M 114 96 L 104 28 L 153 76 Z"
          />
          <path
            fill="url(#c-ear)"
            stroke="url(#c-rim)"
            strokeWidth="2"
            strokeLinejoin="round"
            d="M 206 96 L 216 28 L 167 76 Z"
          />
          <ellipse
            cx="160"
            cy="112"
            rx="53"
            ry="47"
            fill="url(#c-head)"
            stroke="url(#c-rim)"
            strokeWidth="2"
          />
          {/* AO під підборіддям — голова сідає на тіло, а не висить */}
          <ellipse cx="160" cy="156" rx="46" ry="16" fill="url(#c-ao)" />
          <path
            d="M 151 141 L 169 141 L 160 150 Z"
            fill="none"
            stroke="#fff500"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </m.g>

        {/* ОЧІ — видимі з 0.25с, ще в повній темряві. m.g — розплющення;
            вкладена g (ref) — морг від тапу через Web Animations API,
            окремий шар, щоб два джерела не змагалися за один transform. */}
        {/* Рівень 1 — БІГ. x веде вогники через увесь екран, y дає
              підстрибування (згасає до зупинки), фінальні ключі
              -3 → 0 після 10 — це overshoot: проскочили центр і
              вернулись. */}
        <m.g
          initial={{ opacity: 0, x: -250, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 1, 1, 1, 1],
            x: [-250, -170, -95, -35, 10, -3, 0],
            y: [0, -17, -3, -14, -2, -5, 0],
          }}
          transition={{
            duration: 1.0,
            delay: 0.3,
            times: [0, 0.14, 0.32, 0.52, 0.72, 0.87, 1],
            ease: 'easeOut',
          }}
        >
          {/* Рівень 2 — ПРИМРУЖЕННЯ й МОРГ. Окремо від бігу, бо Framer
                не вміє дати одному елементу дві незалежні послідовності
                на той самий transform. */}
          <m.g
            initial={{ scaleY: 0.5 }}
            animate={{ scaleY: [0.5, 0.5, 1, 1, 0.06, 1] }}
            transition={{
              duration: 2.9,
              delay: 0.3,
              times: [0, 0.26, 0.33, 0.8, 0.85, 0.92],
              ease: 'easeOut',
            }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          >
            {/* Рівень 3 — морг від тапу через WAAPI */}
            <g
              ref={blink}
              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
            >
              <g clipPath="url(#c-eye-l)">
                <ellipse
                  cx="137"
                  cy="107"
                  rx="14"
                  ry="18"
                  fill="url(#c-iris)"
                />
                {/* Тінь від верхньої повіки */}
                <ellipse
                  cx="137"
                  cy="88"
                  rx="17"
                  ry="11"
                  fill="#000"
                  opacity="0.32"
                />
              </g>
              <g clipPath="url(#c-eye-r)">
                <ellipse
                  cx="183"
                  cy="107"
                  rx="14"
                  ry="18"
                  fill="url(#c-iris)"
                />
                <ellipse
                  cx="183"
                  cy="88"
                  rx="17"
                  ry="11"
                  fill="#000"
                  opacity="0.32"
                />
              </g>

              {/* Зіниці — ведуться за тапом */}
              <g
                ref={pupils}
                style={{
                  transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <ellipse cx="137" cy="107" rx="3.2" ry="13" fill="#08080c" />
                <ellipse cx="183" cy="107" rx="3.2" ry="13" fill="#08080c" />
                {/* Відблики — ставлять очі «за скло» й оживлюють погляд */}
                <circle cx="131" cy="99" r="3.4" fill="#fff" opacity="0.8" />
                <circle cx="177" cy="99" r="3.4" fill="#fff" opacity="0.8" />
              </g>
            </g>
          </m.g>
        </m.g>
      </g>
    </svg>
  );
}

export function ReviewPage() {
  const head = useRef<SVGGElement>(null);
  const blink = useRef<SVGGElement>(null);
  const pupils = useRef<SVGGElement>(null);

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

  // Тап будь-де: кіт повертає голову туди, веде зіницями і моргає.
  // Саме тап, не рух миші — на телефоні миші немає, а pointerdown
  // приходить і від пальця, і від кліку.
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const onTap = (e: PointerEvent) => {
      const nx = clamp((e.clientX / window.innerWidth - 0.5) * 2.4);
      const ny = clamp((e.clientY / window.innerHeight - 0.5) * 2.4);
      if (pupils.current) {
        pupils.current.style.transform = `translate(${nx * PUPIL_X}px, ${ny * PUPIL_Y}px)`;
      }
      if (head.current) {
        head.current.style.transform = `rotate(${nx * HEAD_TILT}deg)`;
      }
      // Морг через WAAPI: Framer тримає scaleY на батьківській групі,
      // тому власну анімацію вішаємо на вкладену — вони не б'ються.
      blink.current?.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: 'scaleY(0.06)' },
          { transform: 'scaleY(1)' },
        ],
        { duration: 240, easing: 'ease-in-out' },
      );
    };
    window.addEventListener('pointerdown', onTap, { passive: true });
    return () => window.removeEventListener('pointerdown', onTap);
  }, []);

  const topChannels = [
    { c: contacts.telegram, Icon: TelegramLogoIcon },
    { c: contacts.instagram, Icon: InstagramLogoIcon },
    { c: contacts.whatsapp, Icon: WhatsappLogoIcon },
    { c: contacts.phone, Icon: PhoneCallIcon },
  ];

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
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-bg-main via-bg-main/60 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-bg-main via-bg-main/70 to-transparent"
          />
          {/* Лампа боксу — те саме джерело, що ліпить об'єм коту */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
            style={{
              background:
                'radial-gradient(ellipse 55% 75% at 34% 2%, rgb(255 245 0 / 0.07), transparent 70%)',
            }}
          />

          <m.header
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative z-10 px-3 pt-3 sm:px-6 sm:pt-4"
          >
            <div className="clip-cut relative mx-auto flex max-w-xl items-center justify-between gap-3 border border-border-subtle bg-bg-elevated px-3 py-2 shadow-card sm:px-4 sm:py-3">
              <a
                href="/"
                aria-label={`${brand.name}: на головну`}
                className="block size-12 shrink-0 sm:size-16"
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

          {/* === СЦЕНА ===
              Кіт ЗВЕРХУ: на телефоні погляд іде зверху вниз, і першим
              має вдарити він, а не текст. */}
          <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pt-2 pb-6">
            <div className="w-[82%] max-w-[19rem] sm:w-[58%]">
              <Carbon head={head} blink={blink} pupils={pupils} />
            </div>

            {/* Фраза з'являється вже ПЕРЕКОШЕНОЮ — кіт її зачепив, поки
                ти не дивився. Він же й поправляє. */}
            <m.p
              initial={{ opacity: 0, y: 10, rotate: -3 }}
              animate={{
                opacity: [0, 1, 1, 1],
                y: [10, 6, 6, 0],
                rotate: [-3, -3, -3, 0],
              }}
              transition={{
                duration: 1.3,
                delay: 1.6,
                times: [0, 0.22, 0.62, 0.76],
                ease: 'easeOut',
              }}
              className="mt-3 max-w-[20rem] text-center font-display text-2xl leading-[1.08] text-text-main sm:max-w-md sm:text-3xl"
            >
              — {phrase}
            </m.p>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.75 }}
              className="mt-2.5 font-mono text-[0.58rem] font-bold tracking-widest text-text-dim uppercase sm:text-[0.65rem]"
            >
              {reviewPage.catTag}
            </m.p>

            {/* Кнопки — на 1.3с, раніше за кінець сцени */}
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.7, ease: EASE }}
              className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:gap-3"
            >
              {locations.map((loc, i) => (
                <m.a
                  key={loc.id}
                  href={loc.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 1.8 + i * 0.08,
                    ease: EASE,
                  }}
                  whileTap={{ scale: 0.985 }}
                  className="clip-cut group relative block overflow-hidden border border-border-subtle bg-bg-elevated py-3.5 pr-4 pl-6 shadow-card transition-colors hover:border-accent-yellow sm:py-5 sm:pl-7"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px] bg-accent-yellow transition-all duration-300 group-hover:w-[6px]"
                  />
                  <span className="block font-mono text-[0.58rem] font-bold tracking-widest text-accent-yellow uppercase sm:text-[0.6rem]">
                    Залишити відгук
                  </span>
                  <span className="mt-1 block text-sm text-text-main sm:text-base">
                    {loc.address}
                  </span>
                </m.a>
              ))}
            </m.div>

            <m.a
              href="/"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.95 }}
              className="mt-6 font-mono text-[0.58rem] font-bold tracking-widest text-text-dim uppercase underline-offset-4 transition-colors hover:text-accent-yellow hover:underline"
            >
              {reviewPage.backLabel}
            </m.a>
          </section>
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}

export default ReviewPage;
