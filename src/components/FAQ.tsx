import { useId, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { PlusIcon } from '@phosphor-icons/react';
import { faq } from '../config/faq';

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

const pad2 = (n: number) => n.toString().padStart(2, '0');

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

function FaqRow({
  index,
  question,
  answer,
  open,
  onToggle,
}: {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const num = pad2(index + 1);

  return (
    <li data-open={open ? '' : undefined} className="group/row">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-baseline justify-between gap-x-4 gap-y-1 py-5 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-yellow sm:gap-x-6 sm:py-6"
      >
        <h3 className="flex items-baseline gap-3 font-display text-xl text-text-main uppercase sm:text-2xl lg:text-3xl">
          <span
            className={cx(
              'font-mono text-xs font-bold tabular-nums transition-colors sm:text-sm',
              open
                ? 'text-accent-yellow'
                : 'text-text-dim group-hover/row:text-accent-yellow',
            )}
          >
            {num}
          </span>
          <span
            className={cx(
              'transition-colors duration-200',
              open
                ? 'text-accent-yellow'
                : 'text-text-main group-hover/row:text-accent-yellow',
            )}
          >
            {question}
          </span>
        </h3>

        <span
          aria-hidden
          className={cx(
            'shrink-0 self-center text-accent-yellow transition-transform duration-300',
            open && 'rotate-45',
          )}
        >
          <PlusIcon weight="bold" className="size-6 sm:size-7" />
        </span>
      </button>

      <div
        id={panelId}
        className={cx('accordion-panel', open && 'accordion-open')}
      >
        <div>
          <div className="faq-answer pb-6 pl-10 sm:pl-12 sm:pb-7">
            <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
              {answer}
            </p>
          </div>
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
        className="relative overflow-hidden bg-bg-main py-16 sm:py-20 lg:py-28"
      >
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

          <div className="absolute top-24 left-0 h-px w-24 bg-linear-to-r from-accent-yellow/50 to-transparent sm:w-40" />
          <div className="absolute right-0 bottom-32 h-px w-24 bg-linear-to-l from-accent-yellow/40 to-transparent sm:w-40" />
        </div>

        <div className="container-site relative">
          <m.h2
            {...reveal()}
            className="max-w-xl font-display text-[2.6rem] leading-[1.02] uppercase sm:text-5xl lg:text-6xl"
          >
            <span className="text-text-main">Часті</span>{' '}
            <span className="text-accent-yellow">питання</span>
          </m.h2>
          <m.p
            {...reveal(0.08)}
            className="mt-4 max-w-md text-sm text-text-muted sm:text-base"
          >
            Коротко про найчастіше. Не знайшли свого — напишіть у будь-який
            месенджер нижче, у «Контактах».
          </m.p>

          <m.ul
            {...reveal(0.14)}
            className="mt-10 flex flex-col divide-y divide-border-subtle border-y border-border-subtle sm:mt-14"
          >
            {faq.map((item, index) => (
              <FaqRow
                key={index}
                index={index}
                question={item.q}
                answer={item.a}
                open={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
              />
            ))}
          </m.ul>
        </div>
      </section>
    </LazyMotion>
  );
}

export default FAQ;
