import { useId, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  InstagramLogoIcon,
  PlusIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { faq } from '../config/faq';
import { messengers } from '../config/site';

/* ==========================================================================
   #faq — звичайний акордеон: рядок питання на всю ширину, плюс праворуч,
   відповідь розкривається під ним. Нічого зайвого.

   Один клік = рівно одна анімація висоти: відповідь лежить у DOM одразу,
   всередину анімації ніщо не підмінюється (через це й лагало раніше).
   Висота — accordion-panel/accordion-open (grid-template-rows, чистий CSS,
   без JS-вимірів).

   Відкритий рядок — жовте питання, хрестик і трохи світліше тло, без
   смуги зліва.

   Фон — великий об'ємний «?» праворуч, що повільно похитується (.faq-qmark
   в index.css: глибина шарами тіні, рух лише transform на власному шарі),
   і абстрактні фігури зліва. Не соти: соти — це 4 градієнти на всю
   секцію, які браузер перемальовує кожен кадр, поки акордеон міняє висоту.

   Дані — з config/faq.ts і config/site.ts.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

const MESSENGER_ICONS: Record<string, ComponentType<IconProps>> = {
  TelegramLogo: TelegramLogoIcon,
  InstagramLogo: InstagramLogoIcon,
  WhatsappLogo: WhatsappLogoIcon,
};

const MESSENGER_LABEL: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

function FaqRow({
  question,
  answer,
  open,
  first,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  first: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <li
      className={cx(
        'relative transition-colors duration-300',
        !first && 'border-t border-border-subtle',
        open && 'bg-bg-card/50',
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group/q flex w-full items-center justify-between gap-5 px-5 py-5 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-yellow sm:gap-8 sm:px-7 sm:py-6"
      >
        <span
          className={cx(
            'text-base leading-snug font-semibold transition-colors duration-200 sm:text-lg',
            open
              ? 'text-accent-yellow'
              : 'text-text-main group-hover/q:text-accent-yellow',
          )}
        >
          {question}
        </span>
        <PlusIcon
          aria-hidden
          weight="bold"
          className={cx(
            'size-5 shrink-0 transition-transform duration-300',
            open
              ? 'rotate-45 text-accent-yellow'
              : 'text-text-dim group-hover/q:text-text-muted',
          )}
        />
      </button>

      <div
        id={panelId}
        className={cx('accordion-panel', open && 'accordion-open')}
      >
        <div>
          <p className="max-w-2xl px-5 pb-5 text-sm leading-relaxed text-text-muted sm:px-7 sm:pb-6 sm:text-base">
            {answer}
          </p>
        </div>
      </div>
    </li>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faq.length) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="faq"
        className="relative overflow-hidden bg-bg-main py-20 sm:py-24 lg:py-32"
      >
        {/* ФОН — об'ємний знак питання праворуч (стиль .faq-qmark в
            index.css), жовте світло на нього, і абстрактні фігури зліва —
            повернуті clip-cut панелі та жовта смуга. Без сот. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <div className="absolute -top-24 -left-32 h-[26rem] w-[26rem] bg-[radial-gradient(circle,rgb(255_245_0_/_0.08),transparent_70%)] sm:h-[38rem] sm:w-[38rem]" />
          <div className="absolute top-0 -right-20 h-[24rem] w-[24rem] bg-[radial-gradient(circle,rgb(255_245_0_/_0.09),transparent_68%)] lg:top-[12%] lg:right-[-4%] lg:h-[40rem] lg:w-[40rem]" />

          <div className="clip-cut absolute -top-20 -left-28 size-80 rotate-[-9deg] border border-border-subtle/65 sm:size-[30rem]" />
          <div className="clip-cut-sm absolute top-[62%] -left-[3%] hidden size-44 rotate-[-11deg] border border-border-subtle/45 lg:block" />
          <div className="clip-cut-sm absolute top-[78%] left-[7%] hidden size-24 rotate-[16deg] border border-accent-yellow/25 lg:block" />
          <div className="absolute top-28 left-0 h-px w-28 bg-linear-to-r from-accent-yellow/55 to-transparent sm:w-44" />

          <span className="faq-qmark absolute top-6 -right-1 text-[10rem] opacity-80 sm:top-10 sm:right-[4%] sm:text-[15rem] lg:top-[18%] lg:right-[5%] lg:text-[24rem] lg:opacity-100 xl:right-[8%] xl:text-[28rem]">
            ?
          </span>
        </div>

        {/* Плавний перехід у сусідні розділи */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg-main to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-main to-transparent"
        />

        <div className="container-site relative max-w-4xl">
          <m.h2
            {...reveal()}
            className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
          >
            Часті <span className="text-accent-yellow">питання</span>
          </m.h2>

          <m.ul
            {...reveal(0.1)}
            className="clip-cut mt-8 overflow-hidden border border-border-subtle bg-bg-elevated sm:mt-10"
          >
            {faq.map((item, index) => (
              <FaqRow
                key={index}
                question={item.q}
                answer={item.a}
                first={index === 0}
                open={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
              />
            ))}
          </m.ul>

          {/* Не знайшли питання — пишіть напряму */}
          <m.div
            {...reveal(0.16)}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 sm:mt-10"
          >
            <p className="text-sm text-text-muted sm:text-base">
              Не знайшли своє питання? Напишіть напряму:
            </p>
            <div className="flex flex-wrap gap-3">
              {messengers.map((c, i) => {
                const Icon = MESSENGER_ICONS[c.icon];
                return (
                  <a
                    key={c.id}
                    href={c.href}
                    target={c.external ? '_blank' : undefined}
                    rel={c.external ? 'noopener noreferrer' : undefined}
                    className={cx(
                      'clip-cut-sm inline-flex h-11 items-center gap-2 px-4 font-ui text-[0.8rem] transition-colors duration-200',
                      i === 0
                        ? 'bg-accent-yellow text-bg-main hover:bg-accent-hot'
                        : 'border border-border-strong text-text-main hover:border-accent-yellow hover:text-accent-yellow',
                    )}
                  >
                    <Icon
                      aria-hidden
                      weight={i === 0 ? 'fill' : 'light'}
                      className="size-5"
                    />
                    {MESSENGER_LABEL[c.id] ?? c.id}
                  </a>
                );
              })}
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default FAQ;
