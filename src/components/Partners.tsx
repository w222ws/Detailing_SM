import { useEffect, useRef, useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { XIcon } from '@phosphor-icons/react';
import { certificate, partners } from '../config/partners';

/* ==========================================================================
   #partners — «Партнери та сертифікація». Місток довіри між «Процесом»
   (як ми працюємо) і «Відгуками» (що кажуть клієнти): перш ніж вірити
   на слово, можна глянути, з чим ми працюємо.
   • Зліва — фото сертифікату: та сама геометрія, що й у повзунка
     ДО/ПІСЛЯ в Works (aspect-[4/3] → sm:[16/10] → lg:[16/9], ті самі
     кутові «візирі»), щоб два технічні «документи» сайту виглядали
     однією мовою. Жодного тексту поверх фото — саме фото й курсор
     cursor-zoom-in кажуть, що на нього можна натиснути.
   • Справа — лого партнерів їдуть стрічкою, тим самим прийомом руху,
     що й фірмова Marquee-смуга під Hero (той самий translateX(-50%) із
     дублюванням вмісту для безшовного циклу), але зроблено інакше:
     рядок рівний, без нахилу й без жирного тексту-стіни, темп спокійний
     — це список сертифікацій, а не рекламна вивіска. Стрічка ставиться
     на паузу, щойно курсор заходить у неї (Marquee ніколи не зупиняється
     — тут навпаки, бо лого хочеться роздивитись).
     Було: скляна glassmorphism-панель, потім ряд великих карток із
     заклепками, потім лакована панель із відбиттям, потім наліпки під
     кутом з hover-фізикою — усі типовий дефолт, завеликі на вузькому
     екрані або надто «ефектні». Прибрано.
   • Підпис над лого — просто дрібний сірий текст «Партнери», без
     рамки, іконки й моно-шрифту: не кожному блоку потрібен власний
     «бейдж».
   • Лого — готові AVIF з прозорим фоном (оброблені заздалегідь:
     вихідні файли мали суцільну підложку, фон прибрано, усі кольори
     приведено до одного білого силуету; AVIF важить у 2–4 рази менше
     за той самий PNG).
   • Фон — соти прибрано (вони вже в Works і FAQ, тут було б втретє те
     саме). Замість них — контури зрізаних панелей + шестикутників, як
     «мова фону» в Послугах, але своя композиція: ліва купка форм тягнеться
     до сертифікату, права — до наліпок партнерів. На відміну від Послуг,
     де ці контури просто лежать на місці, тут вони самі «збираються в
     кадр» — кожна форма одного разу залітає зі свого кута й трохи завеликого
     масштабу та кута, і впадає на своє місце, ніби деталі конструктора
     складаються в гараж. Тільки opacity/scale/rotate через whileInView,
     без скрол-листенерів і без filter — дешево.
   Дані — з config/partners.ts, нічого не захардкоджено; розділ ховається,
   якщо картинок ще не додали.
   ========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ');

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/* Подвоєний список лого — один «блок» стрічки. Сама стрічка рендерить
   цей блок двічі й їде на translateX(-50%), тому склейка непомітна
   незалежно від того, скільки лого в конфізі (мало — блок просто
   довший за рахунок дублю, а не рідший за рахунок пауз). */
const LOGO_LOOP = [...partners, ...partners];

/* Кутові «візирі» рамки — та сама деталь, що й у повзунка ДО/ПІСЛЯ
   в Works, щоб обидва «документи» сайту читались одним інструментом. */
const VIEWFINDER_CORNERS = [
  'top-4 left-4 border-t-2 border-l-2',
  'top-4 right-4 border-t-2 border-r-2',
  'bottom-4 left-4 border-b-2 border-l-2',
  'bottom-4 right-4 border-b-2 border-r-2',
];

/* Контур шестикutника для фону — та сама бренд-мова, що й по сайту */
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

/* Фото сертифікату на весь екран — нативний <dialog>, Esc/клік-повз закриває */
function CertificateLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label="Сертифікат"
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-bg-main/96 p-0 text-text-main backdrop:bg-transparent"
    >
      <div className="grid size-full place-items-center p-4 sm:p-10">
        <img
          src={src}
          alt="Сертифікат"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="clip-cut-sm absolute top-3 right-3 grid size-12 place-items-center bg-accent-yellow text-bg-main shadow-card transition-transform active:scale-90"
      >
        <XIcon aria-hidden weight="bold" className="size-5" />
      </button>
    </dialog>
  );
}

export function Partners() {
  const [certOpen, setCertOpen] = useState(false);

  if (!certificate && partners.length === 0) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="partners"
        className="relative overflow-hidden bg-bg-main py-16 sm:py-20 lg:py-28"
      >
        {/* Фон: зрізані панелі й шестикутники «злітають» на місце один раз —
            ліва група тягнеться до сертифікату, права до наліпок партнерів */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: 37 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 11 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
            className="clip-cut absolute top-[-3.5rem] right-[-5rem] size-64 border border-border-subtle/40 sm:size-96"
          />
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: -41 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -13 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
            className="clip-cut-sm absolute bottom-[-2.5rem] left-[-3rem] size-52 border border-accent-yellow/10 sm:size-72"
          />
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: 32 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 8 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="clip-cut-sm absolute top-1/2 left-[8%] hidden size-36 border border-border-subtle/25 lg:block"
          />

          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: -43 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -9 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.18, ease: EASE }}
            className="absolute top-12 left-[4%] size-24 text-border-subtle/35 sm:size-36"
          >
            <HexOutline className="size-full" />
          </m.div>
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: 46 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 16 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.26, ease: EASE }}
            className="absolute right-[14%] bottom-16 hidden size-28 text-accent-yellow/12 lg:block"
          >
            <HexOutline className="size-full" />
          </m.div>
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: -48 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -20 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
            className="absolute top-[38%] right-[6%] hidden size-20 text-border-subtle/45 lg:block"
          >
            <HexOutline className="size-full" />
          </m.div>
          <m.div
            initial={{ opacity: 0, scale: 1.4, rotate: 50 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 24 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.36, ease: EASE }}
            className="absolute bottom-[12%] left-[34%] hidden size-16 text-accent-yellow/10 lg:block"
          >
            <HexOutline className="size-full" />
          </m.div>

          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            style={{ transformOrigin: 'right' }}
            className="absolute top-16 right-0 h-px w-28 bg-linear-to-l from-accent-yellow/45 to-transparent sm:w-44"
          />
          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            style={{ transformOrigin: 'left' }}
            className="absolute bottom-24 left-0 h-px w-28 bg-linear-to-r from-accent-yellow/35 to-transparent sm:w-44"
          />
        </div>

        <div className="container-site relative">
          <m.h2
            {...reveal()}
            className="font-display text-3xl text-text-main uppercase sm:text-4xl lg:text-5xl"
          >
            Партнери та <span className="text-accent-yellow">сертифікація</span>
          </m.h2>
          <m.p
            {...reveal(0.1)}
            className="mt-4 max-w-lg text-sm text-text-muted sm:text-base"
          >
            Працюємо тільки з перевіреними брендами, а якість підтверджуємо
            документально — повний пакет сертифікатів показуємо в студії за
            запитом.
          </m.p>

          <div
            className={cx(
              'mt-10 grid gap-5 lg:mt-14 lg:gap-8',
              !!certificate &&
                partners.length > 0 &&
                'lg:grid-cols-[1.05fr_1fr]',
            )}
          >
            {certificate && (
              <m.button
                {...reveal(0.15)}
                type="button"
                onClick={() => setCertOpen(true)}
                aria-label="Відкрити сертифікат на весь екран"
                className="clip-cut group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden border border-border-subtle bg-bg-elevated text-left outline-none transition-colors duration-300 hover:border-accent-yellow/50 focus-visible:border-accent-yellow sm:aspect-[16/10] lg:aspect-[16/9]"
              >
                <img
                  src={certificate}
                  alt="Сертифікат"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(7_7_10/0.35))]"
                />
                {VIEWFINDER_CORNERS.map((c) => (
                  <span
                    key={c}
                    aria-hidden
                    className={cx(
                      'pointer-events-none absolute size-5 border-accent-yellow/0 transition-colors duration-300 group-hover:border-accent-yellow sm:size-7',
                      c,
                    )}
                  />
                ))}
              </m.button>
            )}

            {partners.length > 0 && (
              <div className="flex min-w-0 flex-col lg:h-full lg:justify-center">
                <m.p
                  {...reveal(certificate ? 0.2 : 0.15)}
                  className="text-xs text-text-dim"
                >
                  Партнери
                </m.p>

                {/* Стрічка лого, той самий рух, що в Marquee під Hero
                    (translateX(-50%), вміст подвоєний для безшовного циклу)
                    — тільки рівна, без нахилу, і зупиняється під курсором. */}
                <m.div
                  {...reveal(certificate ? 0.3 : 0.25)}
                  className="partners-marquee relative mt-5 w-full overflow-hidden"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-bg-main to-transparent sm:w-14"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-bg-main to-transparent sm:w-14"
                  />
                  <div className="partners-marquee-track inline-flex items-center whitespace-nowrap">
                    {[0, 1].map((rep) => (
                      <div
                        key={rep}
                        aria-hidden={rep === 1}
                        className="flex shrink-0 items-center"
                      >
                        {LOGO_LOOP.map((p, i) => (
                          <div
                            key={`${rep}-${i}`}
                            className="flex shrink-0 items-center"
                          >
                            <img
                              src={p.logo}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="h-7 w-auto max-w-[6rem] object-contain opacity-75 drop-shadow-[0_3px_8px_rgb(0_0_0_/_0.5)] transition-opacity duration-300 hover:opacity-100 sm:h-8 sm:max-w-[7rem]"
                            />
                            <span
                              aria-hidden
                              className="mx-7 h-5 w-px shrink-0 bg-border-subtle/30 sm:mx-9 sm:h-6"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </m.div>
              </div>
            )}
          </div>
        </div>

        {certOpen && certificate && (
          <CertificateLightbox
            src={certificate}
            onClose={() => setCertOpen(false)}
          />
        )}
      </section>
    </LazyMotion>
  );
}

export default Partners;
