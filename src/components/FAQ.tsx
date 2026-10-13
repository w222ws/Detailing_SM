import { domAnimation, LazyMotion, m } from 'motion/react';
import { UserIcon } from '@phosphor-icons/react';
import { faq } from '../config/faq';

/* ==========================================================================
   #faq — переписка клієнта зі студією Detailing SM.
   • Питання користувача — справа, з круглою «загальною» іконкою юзера.
   • Відповідь студії — зліва, з квадратним жовтим аватаром SM.
   Два різні силуети аватарів (круглий / clip-cut) + сторона бабла +
   колір одразу читаються: де «я», де «вони». Жодних інших підписів не
   треба — одразу зрозуміло без інструкцій.
   Фон — наші соти (bg-honeycomb) з плавним переходом у сусідні розділи.
   Усі питання одразу видно, листаються разом зі сторінкою — зручно
   на телефоні, без вкладених скролів.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const show = (delay = 0) => ({
  initial: { opacity: 0, y: 14, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: EASE },
});

export function FAQ() {
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

        <div className="container-site relative">
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-4xl text-text-main uppercase sm:text-5xl lg:text-6xl"
          >
            Часті <span className="text-accent-yellow">питання</span>
          </m.h2>

          <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-6 lg:mt-14 lg:gap-7">
            {faq.map((item, i) => (
              <li key={i} className="flex flex-col gap-2.5 sm:gap-3">
                {/* ПИТАННЯ: справа, кругла іконка юзера після бабла */}
                <m.div
                  {...show()}
                  className="flex items-end justify-end gap-2 sm:gap-2.5"
                >
                  <p className="max-w-[82%] rounded-2xl rounded-br-md bg-accent-yellow px-4 py-3 font-display text-base leading-snug font-bold text-bg-main sm:px-5 sm:py-3.5 sm:text-lg">
                    {item.q}
                  </p>
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-border-strong bg-bg-elevated text-text-muted sm:size-9"
                  >
                    <UserIcon weight="fill" className="size-4 sm:size-5" />
                  </span>
                </m.div>

                {/* ВІДПОВІДЬ: зліва, квадратний жовтий аватар SM */}
                <m.div
                  {...show(0.08)}
                  className="flex items-end gap-2 sm:gap-2.5"
                >
                  <span
                    aria-hidden
                    className="clip-cut-sm grid size-8 shrink-0 place-items-center bg-accent-yellow font-display text-[0.6rem] font-black text-bg-main sm:size-9 sm:text-[0.65rem]"
                  >
                    SM
                  </span>
                  <p className="max-w-[82%] rounded-2xl rounded-bl-md border border-border-subtle bg-bg-elevated px-4 py-3 text-sm leading-relaxed text-text-main shadow-card sm:px-5 sm:py-3.5 sm:text-base">
                    {item.a}
                  </p>
                </m.div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </LazyMotion>
  );
}

export default FAQ;
