import { useEffect, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  ClockIcon,
  InstagramLogoIcon,
  PlusIcon,
  TelegramLogoIcon,
  UserIcon,
  WhatsappLogoIcon,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { faq } from '../config/faq';
import { brand, business, messengers } from '../config/site';

/* ==========================================================================
   #faq — справжня переписка клієнта зі студією: питання-бульбашка
   справа (з великим аватаром-сотою клієнта), відповідь зліва (з великим
   аватаром-сотою SM) — з'являється по кліку на питання. Аватари — clip-hex,
   великі, тому «соти» одразу впізнаються, а не губляться дрібним декором.
   Ліворуч від чату — заголовок і прямі кнопки месенджерів.
   Підсвітка вікна — bg-headlight (жовта «фара» з кута, той самий прийом,
   що й по сайту). Висота відповіді — accordion-panel/accordion-open
   (grid-template-rows, чистий CSS, без JS-вимірів, без лагів).
   Перед відповіддю — коротке «друкує…» (3 крапки на opacity-пульсації,
   без box-shadow), потім текст — один setTimeout на відкриття, нічого
   безперервного, тому без лагів.
   Дані — з config/faq.ts і config/site.ts, нічого не захардкоджено.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;
const TYPE_DELAY = 550;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/* Контур шестикутника для фону — тримає бренд-мову з інших секцій */
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

/* Великий аватар-сота — client (контур) або студія (залита жовта) */
function HexAvatar({
  studio,
  className,
}: {
  studio?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        'clip-hex grid shrink-0 place-items-center',
        studio
          ? 'bg-accent-yellow font-display text-[0.65rem] font-black text-bg-main sm:text-xs'
          : 'border border-border-strong bg-bg-card text-text-muted',
        className,
      )}
    >
      {studio ? (
        brand.short
      ) : (
        <UserIcon weight="fill" className="size-5 sm:size-6" />
      )}
    </span>
  );
}

/* «Друкує…» — 3 крапки на opacity-пульсації (Tailwind animate-pulse,
   без box-shadow), зі зсувом фази — дешево й без лагів */
function TypingDots() {
  return (
    <span className="clip-cut-sm inline-flex items-center gap-1.5 border border-border-subtle bg-bg-elevated px-4 py-3.5 sm:px-5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse rounded-full bg-text-dim"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function FaqItem({
  question,
  answer,
  open,
  revealed,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  revealed: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 sm:gap-3.5">
      {/* ПИТАННЯ: клієнт, справа, велика сота-аватар */}
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="group/q flex items-end justify-end gap-2.5 sm:gap-3"
      >
        <span
          className={cx(
            'clip-cut-sm max-w-[80%] px-4 py-3 text-left font-display text-base leading-snug font-bold uppercase transition-colors duration-300 sm:px-5 sm:py-3.5 sm:text-lg',
            open
              ? 'bg-accent-yellow text-bg-main'
              : 'bg-bg-card text-text-main group-hover/q:bg-bg-card-hover',
          )}
        >
          {question}
        </span>
        <HexAvatar className="size-11 sm:size-14" />
      </button>

      {/* ВІДПОВІДЬ: студія, зліва — спершу «друкує…», потім текст */}
      <div className={cx('accordion-panel', open && 'accordion-open')}>
        <div>
          <div className="flex items-end gap-2.5 pb-1 sm:gap-3">
            <HexAvatar studio className="size-11 sm:size-14" />
            {revealed ? (
              <p className="clip-cut-sm max-w-[80%] border border-border-subtle bg-bg-elevated px-4 py-3 text-sm leading-relaxed text-text-muted sm:px-5 sm:py-3.5 sm:text-base">
                {answer}
              </p>
            ) : (
              <TypingDots />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const t = setTimeout(() => setRevealedIndex(openIndex), TYPE_DELAY);
    return () => clearTimeout(t);
  }, [openIndex]);

  if (!faq.length) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="faq"
        className="relative overflow-hidden bg-bg-main py-20 sm:py-24 lg:py-32"
      >
        {/* Соти в окремому шарі */}
        <div
          aria-hidden
          className="bg-honeycomb pointer-events-none absolute inset-0"
        />
        {/* Плавний перехід у сусідні розділи */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg-main to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-main to-transparent"
        />

        {/* Фонові фігури — хекс-контури, бренд-мова з інших розділів */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <HexOutline className="absolute top-10 left-[6%] size-24 rotate-[14deg] text-border-subtle/50 sm:size-36" />
          <HexOutline className="absolute bottom-16 right-[8%] hidden size-28 -rotate-[10deg] text-border-subtle/40 lg:block" />
        </div>

        <div className="container-site relative">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 xl:gap-20">
            {/* Ліворуч: заголовок + прямі кнопки месенджерів */}
            <m.div {...reveal()} className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl">
                Часті <span className="text-accent-yellow">питання</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm text-text-muted sm:text-base">
                Не знайшли своє питання? Напишіть напряму — відповімо у зручному
                месенджері.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {messengers.map((c, i) => {
                  const Icon = MESSENGER_ICONS[c.icon];
                  return (
                    <a
                      key={c.id}
                      href={c.href}
                      target={c.external ? '_blank' : undefined}
                      rel={c.external ? 'noopener noreferrer' : undefined}
                      className={cx(
                        'clip-cut-sm inline-flex h-11 items-center gap-2 px-4 font-display text-sm font-bold uppercase transition-colors duration-200',
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

            {/* Праворуч: вікно переписки */}
            <m.div
              {...reveal(0.1)}
              className="clip-cut relative overflow-hidden border border-border-subtle bg-bg-elevated"
            >
              <div
                aria-hidden
                className="bg-headlight pointer-events-none absolute inset-0"
              />
              <HexOutline
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-16 size-72 text-accent-yellow/[0.06]"
              />

              <div className="relative">
                {/* Шапка «вікна» — бейдж студії + графік роботи */}
                <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4 sm:px-7">
                  <HexAvatar studio className="size-10 sm:size-11" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-text-main uppercase sm:text-base">
                      {brand.name}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-text-dim">
                      <ClockIcon
                        aria-hidden
                        weight="bold"
                        className="size-3.5 text-accent-yellow"
                      />
                      {business.workHours}
                    </p>
                  </div>
                </div>

                <ul className="relative flex flex-col gap-5 p-4 sm:gap-6 sm:p-7">
                  {faq.map((item, index) => (
                    <FaqItem
                      key={index}
                      question={item.q}
                      answer={item.a}
                      open={openIndex === index}
                      revealed={revealedIndex === index}
                      onToggle={() =>
                        setOpenIndex((current) =>
                          current === index ? null : index,
                        )
                      }
                    />
                  ))}
                </ul>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default FAQ;
