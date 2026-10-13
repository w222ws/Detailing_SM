import { domAnimation, LazyMotion, m, type Variants } from 'motion/react';
import {
  CarProfileIcon,
  CheckIcon,
  InstagramLogoIcon,
  PhoneCallIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { contacts } from '../config/site';
import { processPaths } from '../config/steps';

/* ==========================================================================
   Розділ #process — «два шляхи до ціни».
   Відмінність від референсу: не дві однакові картки в ряд, а «розвилка»:
   • друга картка опущена нижче (східці на lg), між ними ромб «або»;
   • за кожною карткою — величезна контурна цифра 01 / 02;
   • усе «оживає» при скролі: чат друкує повідомлення по черзі, кільце
     «15 хв» домальовується, мітки огляду з'являються по одній, кошторис
     в'їжджає, лінія кроків росте зверху вниз;
   • жодних нескінченних JS-анімацій (лише одноразові входження) — без лагів.
   Дані — з config/steps.ts і config/site.ts, нічого не захардкоджено.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/* ---------- Кроки: лінія росте, квадрати спалахують по черзі ---------- */
function Steps({ steps, emphasis }: { steps: string[]; emphasis?: boolean }) {
  return (
    <ol className="relative mt-8">
      <span
        aria-hidden
        className="absolute top-5 bottom-5 left-5 w-px -translate-x-1/2 bg-border-subtle"
      />
      <m.span
        aria-hidden
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
        className={cx(
          'absolute top-5 bottom-5 left-5 w-px origin-top -translate-x-1/2',
          emphasis ? 'bg-accent-yellow/60' : 'bg-border-strong',
        )}
      />
      {steps.map((text, index) => (
        <m.li
          key={text}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.55,
            delay: 0.15 + index * 0.12,
            ease: EASE,
          }}
          className="relative flex items-start gap-4 pb-6 last:pb-0"
        >
          <span
            className={cx(
              'clip-cut-sm relative grid size-10 shrink-0 place-items-center font-display text-sm font-bold',
              emphasis
                ? 'bg-accent-yellow text-bg-main'
                : 'border border-border-strong bg-bg-main text-accent-yellow',
            )}
          >
            {index + 1}
          </span>
          <p className="pt-2 text-sm leading-relaxed text-text-main sm:text-base">
            {text}
          </p>
        </m.li>
      ))}
    </ol>
  );
}

/* ---------- Мокап телефона: чат «друкується» по черзі ---------- */
const chatList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.55, delayChildren: 0.35 } },
};
const bubble: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* Свідомий виняток із clip-cut: телефон і баблі — округлі, бо це впізнавані
   реальні об'єкти (clip-cut-телефон не читається як телефон). */
function ChatMock() {
  const SCREEN = '#f1f3f8';
  const BUBBLE = '#ffffff';
  const INK = '#0b0d13';
  const BORDER = 'rgba(11,13,19,0.08)';
  const SUB = '#6b7085';

  const messengers = [
    {
      Icon: TelegramLogoIcon,
      contact: contacts.telegram,
      pos: '-left-3 top-12',
    },
    {
      Icon: InstagramLogoIcon,
      contact: contacts.instagram,
      pos: '-right-3 top-32',
    },
    {
      Icon: WhatsappLogoIcon,
      contact: contacts.whatsapp,
      pos: '-left-3 bottom-14',
    },
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative mx-auto w-full max-w-[15rem]"
    >
      <div className="relative rounded-[2rem] bg-bg-main p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <div
          className="overflow-hidden rounded-[1.5rem]"
          style={{ backgroundColor: SCREEN }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-3.5 py-3"
            style={{ backgroundColor: BUBBLE, borderColor: BORDER }}
          >
            <span className="grid size-7 place-items-center rounded-lg bg-accent-yellow font-display text-[0.65rem] font-black text-bg-main">
              SM
            </span>
            <p
              className="font-display text-[0.7rem] font-bold tracking-wide uppercase"
              style={{ color: INK }}
            >
              Detailing SM
            </p>
          </div>

          <m.div
            variants={chatList}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-2 p-3"
          >
            {/* Клієнт: фото авто */}
            <m.div
              variants={bubble}
              className="self-end rounded-2xl rounded-br-md bg-accent-yellow p-2.5"
            >
              <div className="grid w-32 grid-cols-3 gap-1.5">
                <span
                  className="aspect-square rounded-md"
                  style={{
                    background:
                      'linear-gradient(135deg,#4a4e5e 0%,#1a1c24 60%,#07070a 100%)',
                  }}
                />
                <span
                  className="aspect-square rounded-md"
                  style={{
                    background:
                      'linear-gradient(135deg,#6b7085 0%,#2a2d3a 55%,#0a0b0f 100%)',
                  }}
                />
                <span className="relative grid aspect-square place-items-center rounded-md bg-bg-main">
                  <span className="ml-0.5 size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-accent-yellow" />
                  <span className="absolute right-1 bottom-0.5 font-mono text-[0.5rem] font-semibold text-text-main">
                    0:12
                  </span>
                </span>
              </div>
            </m.div>

            {/* Ми: кільце «15 хв» домальовується */}
            <m.div
              variants={bubble}
              className="flex max-w-[85%] items-center gap-2.5 self-start rounded-2xl rounded-bl-md border px-3 py-2.5 text-[0.75rem] leading-snug"
              style={{
                backgroundColor: BUBBLE,
                borderColor: BORDER,
                color: INK,
              }}
            >
              <svg viewBox="0 0 36 36" className="size-9 shrink-0" aria-hidden>
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#e5e7ee"
                  strokeWidth="4"
                />
                <m.circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#fff500"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 0.75 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
                />
                <text
                  x="18"
                  y="22"
                  textAnchor="middle"
                  className="font-display text-[10px] font-bold"
                  style={{ fill: INK }}
                >
                  15
                </text>
              </svg>
              <span className="leading-tight">
                <b className="block font-display" style={{ color: INK }}>
                  15 хвилин
                </b>
                <span style={{ color: SUB }}>орієнтовний кошторис</span>
              </span>
            </m.div>

            <m.div
              variants={bubble}
              className="max-w-[85%] self-start rounded-2xl rounded-bl-md border px-3 py-2 text-[0.75rem] leading-snug"
              style={{
                backgroundColor: BUBBLE,
                borderColor: BORDER,
                color: SUB,
              }}
            >
              Відповімо на всі питання
            </m.div>
          </m.div>
        </div>
      </div>

      {/* Месенджери «вискакують» навколо телефона */}
      {messengers.map(({ Icon, contact, pos }, i) => (
        <m.span
          key={contact.id}
          aria-hidden
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 18,
            delay: 0.6 + i * 0.18,
          }}
          className={cx(
            'absolute grid size-9 place-items-center rounded-xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10',
            pos,
          )}
          style={{ backgroundColor: contact.tint }}
        >
          <Icon weight="fill" className="size-5 text-white" />
        </m.span>
      ))}
    </m.div>
  );
}

/* ---------- Мокап огляду: мітки з'являються по одній, кошторис в'їжджає ---------- */
function CarInspectionMock() {
  const markers = [
    { top: '34%', left: '18%', label: 'Лак' },
    { top: '46%', left: '46%', label: 'Салон' },
    { top: '58%', left: '72%', label: 'Диски' },
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="bg-blueprint clip-cut relative mx-auto aspect-[4/3] w-full max-w-[22rem] overflow-hidden border border-dashed border-border-subtle shadow-card"
    >
      <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <CarProfileIcon
          aria-hidden
          weight="duotone"
          className="h-auto w-full max-w-[16rem] text-text-main"
        />
      </div>

      {markers.map((marker, i) => (
        <m.div
          key={marker.label}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 16,
            delay: 0.5 + i * 0.35,
          }}
          className="pointer-events-none absolute flex items-center gap-2"
          style={{ top: marker.top, left: marker.left }}
        >
          <span className="relative grid size-2.5 shrink-0 place-items-center">
            <span
              aria-hidden
              className="absolute inset-[-5px] border border-dashed border-accent-yellow/70"
            />
            <span className="relative block size-2.5 bg-accent-yellow" />
          </span>
          <span className="font-mono text-[0.65rem] font-bold tracking-widest text-accent-yellow uppercase">
            {marker.label}
          </span>
        </m.div>
      ))}

      <m.div
        initial={{ opacity: 0, y: 30, rotate: 12 }}
        whileInView={{ opacity: 1, y: 0, rotate: 4 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1.7, ease: EASE }}
        className="clip-cut absolute right-4 bottom-4 w-[9.5rem] border border-border-strong bg-bg-main px-3.5 py-3 shadow-card"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[0.55rem] font-semibold tracking-widest text-text-dim uppercase">
            Кошторис
          </p>
          <span className="clip-cut-sm grid size-4 place-items-center bg-accent-yellow">
            <CheckIcon
              aria-hidden
              weight="bold"
              className="size-2.5 text-bg-main"
            />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <span className="font-mono text-[0.65rem] text-text-muted">
            до оплати
          </span>
          <span className="font-display text-base font-bold text-accent-yellow">
            $450
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="font-mono text-[0.65rem] text-text-muted">
            термін
          </span>
          <span className="font-mono text-[0.65rem] text-text-main">2 дні</span>
        </div>
      </m.div>
    </m.div>
  );
}

/* ---------- Спільна «шапка» картки: контурна цифра на фоні ---------- */
function PathHeader({
  index,
  label,
  title,
  accent,
}: {
  index: string;
  label: string;
  title: string;
  accent?: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className="section-index pointer-events-none absolute -top-3 right-4 select-none"
      >
        {index}
      </span>
      <span
        className={cx(
          'relative font-mono text-xs font-semibold tracking-widest uppercase',
          accent ? 'text-accent-yellow' : 'text-text-dim',
        )}
      >
        {label}
      </span>
      <h3 className="relative mt-4 max-w-[85%] font-display text-xl text-text-main uppercase sm:text-2xl">
        {title}
      </h3>
    </>
  );
}

function Process() {
  const [online, studio] = processPaths;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="process"
        className="relative overflow-hidden bg-bg-main bg-grain py-20 sm:py-24 lg:py-32"
      >
        <div className="container-site">
          <m.h2
            {...reveal()}
            className="max-w-3xl font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
          >
            Дізнатись ціну можна двома{' '}
            <span className="text-accent-yellow">зручними способами</span>
          </m.h2>

          <div className="relative mt-14 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-8">
            {/* ===== Спосіб 1: онлайн ===== */}
            <m.article
              {...reveal()}
              className="glass clip-cut relative flex min-w-0 flex-col overflow-hidden p-6 shadow-card sm:p-10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-accent-yellow/40 via-white/10 to-transparent"
              />
              <PathHeader
                index="01"
                label="Спосіб 1"
                title={online.title}
                accent
              />

              <div className="mt-10 px-3 sm:mt-12">
                <ChatMock />
              </div>

              <Steps steps={online.steps} emphasis />

              <div className="mt-8 grid grid-cols-3 gap-3 lg:mt-auto lg:pt-10">
                <CtaLink
                  href={contacts.telegram.href}
                  label={contacts.telegram.label}
                  Icon={TelegramLogoIcon}
                  primary
                />
                <CtaLink
                  href={contacts.instagram.href}
                  label={contacts.instagram.label}
                  Icon={InstagramLogoIcon}
                />
                <CtaLink
                  href={contacts.whatsapp.href}
                  label={contacts.whatsapp.label}
                  Icon={WhatsappLogoIcon}
                />
              </div>
            </m.article>

            {/* «або» ромбом */}
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 rotate-45 place-items-center border-4 border-bg-main bg-accent-yellow shadow-card max-lg:hidden"
            >
              <span className="-rotate-45 font-display text-sm font-black text-bg-main uppercase">
                або
              </span>
            </span>
            <div
              aria-hidden
              className="-my-3 grid place-items-center lg:hidden"
            >
              <span className="grid size-12 rotate-45 place-items-center border-4 border-bg-main bg-accent-yellow shadow-card">
                <span className="-rotate-45 font-display text-sm font-black text-bg-main uppercase">
                  або
                </span>
              </span>
            </div>

            {/* ===== Спосіб 2: студія (опущена — «східці») ===== */}
            <m.article
              {...reveal(0.1)}
              className="glass clip-cut relative flex min-w-0 flex-col overflow-hidden p-6 shadow-card sm:p-10 lg:mt-16"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-white/15 via-white/5 to-transparent"
              />
              <PathHeader index="02" label="Спосіб 2" title={studio.title} />

              <div className="mt-10 sm:mt-12">
                <CarInspectionMock />
              </div>

              <Steps steps={studio.steps} />

              <div className="mt-8 flex flex-col gap-5 lg:mt-auto lg:pt-10">
                {studio.note && (
                  <p className="clip-cut-sm bg-accent-yellow/10 p-4 text-sm leading-relaxed text-text-main">
                    {studio.note}
                  </p>
                )}
                <a href={contacts.phone.href} className="btn-ghost w-fit">
                  <PhoneCallIcon aria-hidden weight="bold" className="size-5" />
                  {contacts.phone.display}
                </a>
              </div>
            </m.article>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

/* CTA-посилання: primary — жовта, інші — ghost */
function CtaLink({
  href,
  label,
  Icon,
  primary,
}: {
  href: string;
  label: string;
  Icon: ComponentType<IconProps>;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cx(
        'clip-cut-sm inline-flex h-12 items-center justify-center gap-2 px-4 font-display text-sm font-semibold uppercase transition-colors duration-200',
        primary
          ? 'bg-accent-yellow text-bg-main hover:bg-accent-hot'
          : 'border border-border-strong text-text-main hover:border-accent-yellow hover:text-accent-yellow',
      )}
    >
      <Icon aria-hidden weight="fill" className="size-5" />
    </a>
  );
}

export default Process;
export { Process };
