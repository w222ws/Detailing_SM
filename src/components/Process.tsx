import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  CarProfileIcon,
  CheckIcon,
  InstagramLogoIcon,
  PhoneCallIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  type IconProps,
} from '@phosphor-icons/react';
import { contacts } from '../config/site';
import { processPaths } from '../config/steps';

/* ==========================================================================
   Розділ #process. Структура з референсу садівників, але візуали й
   матеріали — наші:
   • Картки — утиліта .glass (backdrop-blur + напівпрозорий темний фон)
     поверх текстурної секції, звідси ефект «полу-скла».
   • Мокап у способі 2 — не саморобний SVG авто, а «інспекційний
     видошукач»: рамка з жовтими куточками (як на камері) над фото
     студії (поки нема файлу — текстурна підложка), з трьома мітками
     огляду (лак, салон, диски). Фото саме з'явиться, щойно підкладеш
     /process/inspection.jpg.
   • Мінімум деталей — одна жовта акцентна точка пульсує («live»),
     решта — статика, щоб не перебирати.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: EASE },
});

/* Нумерований список кроків — вертикальна лінія + квадратні бейджі */
function Steps({ steps, emphasis }: { steps: string[]; emphasis?: boolean }) {
  return (
    <ol className="relative mt-8">
      <span
        aria-hidden
        className={cx(
          'absolute top-5 bottom-5 left-5 w-px -translate-x-1/2',
          emphasis ? 'bg-accent-yellow/30' : 'bg-border-subtle',
        )}
      />
      {steps.map((text, index) => (
        <m.li
          key={text}
          {...reveal(index * 0.08)}
          className="relative flex items-start gap-4 pb-6 last:pb-0"
        >
          <span
            className={cx(
              'clip-cut-sm relative grid size-10 shrink-0 place-items-center font-display text-sm font-bold',
              emphasis
                ? 'bg-accent-yellow text-bg-main'
                : 'bg-bg-main text-accent-yellow',
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

/* Мокап телефона. Тут один свідомий виняток із «кузовної» геометрії
   усього сайту: смартфон і чат-бабли мають природні округлі кути, бо
   уявний об'єкт — реальний телефон, а чат-бабли — впізнавані елементи
   месенджерів. Робити їх clip-cut-кутастими = не читати як телефон.
   Решта сайту залишається clip-cut, це локальна виняткова мова для
   конкретного скеоморфного мокапу. Світлий екран у темній картці —
   приём із референсу, дає ефект «увімкненого преміум-смартфона». */
function ChatMock() {
  const SCREEN = '#f1f3f8';
  const BUBBLE = '#ffffff';
  const INK = '#0b0d13';
  const BORDER = 'rgba(11,13,19,0.08)';
  const SUB = '#6b7085';

  return (
    <div className="relative mx-auto w-full max-w-[15rem]">
      {/* Корпус телефона */}
      <div className="relative rounded-[2rem] bg-bg-main p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        {/* Екран */}
        <div
          className="overflow-hidden rounded-[1.5rem]"
          style={{ backgroundColor: SCREEN }}
        >
          {/* Шапка діалогу */}
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

          <div className="flex flex-col gap-2 p-3">
            {/* Клієнт: фото авто — жовтий баббл справа з «ніжкою» */}
            <div className="self-end rounded-2xl rounded-br-md bg-accent-yellow p-2.5">
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
            </div>

            {/* Ми: білий баббл + жовте кільце прогресу «15 хв» */}
            <div
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
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#fff500"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="88"
                  strokeDashoffset="22"
                  transform="rotate(-90 18 18)"
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
            </div>

            <div
              className="max-w-[85%] self-start rounded-2xl rounded-bl-md border px-3 py-2 text-[0.75rem] leading-snug"
              style={{
                backgroundColor: BUBBLE,
                borderColor: BORDER,
                color: SUB,
              }}
            >
              Відповімо на всі питання
            </div>
          </div>
        </div>
      </div>

      {/* Месенджери навколо телефона — як app-іконки, скруглені квадрати */}
      {(
        [
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
        ] as const
      ).map(({ Icon, contact, pos }) => (
        <span
          key={contact.id}
          aria-hidden
          className={cx(
            'absolute grid size-9 place-items-center rounded-xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10',
            pos,
          )}
          style={{ backgroundColor: contact.tint }}
        >
          <Icon weight="fill" className="size-5 text-white" />
        </span>
      ))}
    </div>
  );
}

/* Мокап діагностики: силует авто (CarProfileIcon від Phosphor) на
   кресленій сітці, три мітки огляду + міні-повідомлення й нахилена
   картка-кошторис — та сама композиція, що й у плані ділянки з
   референсу (центральний «об'єкт» + міні-картки навколо). */
function CarInspectionMock() {
  const markers = [
    { top: '34%', left: '18%', label: 'Лак' },
    { top: '46%', left: '46%', label: 'Салон' },
    { top: '58%', left: '72%', label: 'Диски' },
  ];
  return (
    <div className="bg-blueprint clip-cut relative mx-auto aspect-[4/3] w-full max-w-[22rem] overflow-hidden border border-dashed border-border-subtle shadow-card">
      {/* Силует авто — Phosphor CarProfileIcon, не саморобний SVG */}
      <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <CarProfileIcon
          aria-hidden
          weight="duotone"
          className="h-auto w-full max-w-[16rem] text-text-main"
        />
      </div>

      {/* Три мітки огляду */}
      {markers.map((m) => (
        <div
          key={m.label}
          className="pointer-events-none absolute flex items-center gap-2"
          style={{ top: m.top, left: m.left }}
        >
          <span className="relative grid size-2.5 shrink-0 place-items-center">
            <span
              aria-hidden
              className="absolute inset-[-5px] border border-dashed border-accent-yellow/70"
            />
            <span className="relative block size-2.5 bg-accent-yellow shadow-[0_0_8px_rgb(255_245_0/0.6)]" />
          </span>
          <span className="font-mono text-[0.65rem] font-bold tracking-widest text-accent-yellow uppercase">
            {m.label}
          </span>
        </div>
      ))}

      {/* Нахилена картка-кошторис — як наклонена оцінка в референсі
          (єдиний акцент знизу-справа, не два блоки, що б'ються за увагу) */}
      <div className="clip-cut absolute right-4 bottom-4 w-[9.5rem] rotate-[4deg] border border-border-strong bg-bg-main px-3.5 py-3 shadow-card">
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
      </div>
    </div>
  );
}

function Process() {
  const [online, studio] = processPaths;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="process"
        className="bg-bg-main bg-grain py-20 sm:py-24 lg:py-32"
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
            {/* ===== Спосіб 1: онлайн-оцінка ===== */}
            <m.article
              {...reveal()}
              className="glass clip-cut relative flex min-w-0 flex-col overflow-hidden p-6 shadow-card sm:p-10"
            >
              {/* Легкий відблиск згори-зліва — ефект скла */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-white/15 via-white/5 to-transparent"
              />
              <span className="font-mono text-xs font-semibold tracking-widest text-accent-yellow uppercase">
                Спосіб 1
              </span>
              <h3 className="mt-4 font-display text-xl text-text-main uppercase sm:text-2xl">
                {online.title}
              </h3>

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

            {/* ===== Спосіб 2: огляд у студії ===== */}
            <m.article
              {...reveal()}
              className="glass clip-cut relative flex min-w-0 flex-col overflow-hidden p-6 shadow-card sm:p-10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-white/15 via-white/5 to-transparent"
              />
              <span className="font-mono text-xs font-semibold tracking-widest text-text-dim uppercase">
                Спосіб 2
              </span>
              <h3 className="mt-4 font-display text-xl text-text-main uppercase sm:text-2xl">
                {studio.title}
              </h3>

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

/* CTA-посилання: primary — жовта, інші — border-ghost */
function CtaLink({
  href,
  label,
  Icon,
  primary,
}: {
  href: string;
  label: string;
  Icon: (props: IconProps) => React.ReactElement;
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
