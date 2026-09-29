'use client';

import { useRef, type ChangeEvent, type RefObject } from 'react';
import {
  ArrowDown,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
}

const COPY = {
  eyebrow: 'DETAILING SM · ВИБРАНІ РОБОТИ',
  title: 'РЕЗУЛЬТАТИ, ЩО',
  titleAccent: 'ГУЧНІШІ ЗА СЛОВА',
  description:
    'Кожен автомобіль отримує увагу до деталей, точність виконання та захист, який працює на результат.',
  featuredLabel: 'ФЛАГМАНСЬКИЙ РЕЗУЛЬТАТ · 01',
  featuredBadge: 'Полірування + кераміка',
  featuredTitle: 'Porsche 911 GT3',
  featuredDescription:
    'Відновлювальне полірування кузова, видалення глибоких рисок та нанесення 2 шарів захисної кераміки.',
  compareHint: 'Перетягніть роздільник, щоб порівняти',
  galleryLabel: 'ІНШІ ПРОЄКТИ',
  galleryTitle: 'ВИБРАНІ РОБОТИ',
  previousProject: 'Попередня робота',
  nextProject: 'Наступна робота',
  swipeHint: 'Проведіть, щоб переглянути всі роботи',
};

const featuredProject = {
  before: '/portfolio/1.avif',
  after: '/portfolio/2.avif',
};

const projects: Project[] = [
  {
    id: '3',
    title: 'BMW M5 CS',
    subtitle: 'Повна оклейка кузова в матовий поліуретан',
    badge: 'Захисна плівка',
    image: '/portfolio/3.avif',
  },
  {
    id: '4',
    title: 'Mercedes-AMG G63',
    subtitle: 'Глибока хімчистка салону та кераміка шкіри',
    badge: 'Детейлінг салону',
    image: '/portfolio/4.avif',
  },
  {
    id: '5',
    title: 'Audi RS6 Avant',
    subtitle: 'Усунення подряпин та 2 шари кераміки',
    badge: 'Полірування',
    image: '/portfolio/5.avif',
  },
  {
    id: '6',
    title: 'Porsche Taycan Cross',
    subtitle: 'Антигравійний захист лобового скла та кузова',
    badge: 'Захист скла',
    image: '/portfolio/6.avif',
  },
  {
    id: '7',
    title: 'Range Rover SM',
    subtitle: 'Відновлення текстури шкіри та реставрація керма',
    badge: 'Реставрація',
    image: '/portfolio/7.avif',
  },
  {
    id: '8',
    title: 'McLaren 720S',
    subtitle: 'Детейлінг підкапотного простору та супортів',
    badge: 'Спецпослуги',
    image: '/portfolio/8.avif',
  },
];

const styles = `
  .portfolio-root {
    isolation: isolate;
    font-family: "Plus Jakarta Sans", sans-serif;
  }

  .portfolio-display {
    font-family: "Unbounded", sans-serif;
  }

  .portfolio-grid {
    background-image:
      linear-gradient(
        rgba(255, 255, 255, 0.025) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.025) 1px,
        transparent 1px
      );
    background-size: 64px 64px;
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 12%,
      black 88%,
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent,
      black 12%,
      black 88%,
      transparent
    );
  }

  .portfolio-compare {
    --pos: 50%;
  }

  .portfolio-before {
    clip-path: polygon(
      0 0,
      var(--pos) 0,
      var(--pos) 100%,
      0 100%
    );
  }

  .portfolio-divider {
    left: var(--pos);
  }

  .portfolio-project-image {
    transition:
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.3s ease;
  }

  .portfolio-scroll {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scroll-padding-inline: 1rem;
  }

  .portfolio-scroll::-webkit-scrollbar {
    display: none;
  }

  @media (hover: hover) {
    .portfolio-project-card:hover .portfolio-project-image {
      transform: scale(1.04);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .portfolio-project-image {
      transition: none !important;
    }

    .portfolio-scroll {
      scroll-behavior: auto !important;
    }
  }
`;

interface ComparisonProps {
  containerRef: RefObject<HTMLDivElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function BeforeAfterComparison({ containerRef, onChange }: ComparisonProps) {
  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={`${COPY.featuredTitle}: порівняння до та після`}
      className="portfolio-compare relative aspect-[4/3] w-full overflow-hidden bg-[#121318] select-none [-webkit-tap-highlight-color:transparent] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[560px]"
    >
      <img
        src={featuredProject.after}
        alt={`${COPY.featuredTitle} після полірування та нанесення кераміки`}
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />

      <div className="portfolio-before absolute inset-0 overflow-hidden">
        <img
          src={featuredProject.before}
          alt={`${COPY.featuredTitle} до полірування`}
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/65 via-transparent to-[#0a0a0c]/10"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 border border-white/[0.06]"
        aria-hidden="true"
      />

      <span className="pointer-events-none absolute left-4 top-4 z-[1] rounded-full border border-white/15 bg-[#101114]/85 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md sm:left-6 sm:top-6 sm:text-[10px]">
        ДО
      </span>

      <span className="pointer-events-none absolute right-4 top-4 z-[1] rounded-full bg-[#ffee00] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#0a0a0c] sm:right-6 sm:top-6 sm:text-[10px]">
        ПІСЛЯ
      </span>

      <div
        className="portfolio-divider pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-[#ffee00] shadow-[0_0_22px_rgba(255,238,0,0.65)]"
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-[#101114] bg-[#ffee00] text-[#101114] shadow-[0_0_30px_rgba(255,238,0,0.3)] sm:h-14 sm:w-14">
          <ArrowLeftRight
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        defaultValue="50"
        aria-label={COPY.compareHint}
        onChange={onChange}
        className="absolute inset-0 z-20 m-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0 outline-none"
      />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[1] flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/75 sm:bottom-6 sm:left-6 sm:text-[10px]">
        <MoveHorizontal className="h-4 w-4 text-[#ffee00]" aria-hidden="true" />
        {COPY.compareHint}
      </div>
    </div>
  );
}

function ProjectCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const firstCard = container.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 24;

    const amount = firstCard
      ? firstCard.offsetWidth + gap
      : container.clientWidth * 0.8;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="mt-16 sm:mt-20 lg:mt-24">
      <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#ffee00] sm:text-[10px]">
            <span className="h-px w-5 bg-[#ffee00]/60" aria-hidden="true" />
            {COPY.galleryLabel}
          </p>

          <h3 className="portfolio-display text-lg font-black uppercase leading-tight tracking-[-0.04em] text-[#f3f4f6] sm:text-2xl lg:text-3xl">
            {COPY.galleryTitle}
          </h3>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label={COPY.previousProject}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#222430] bg-[#121318] text-[#f3f4f6] transition-colors duration-300 hover:border-[#ffee00]/60 hover:text-[#ffee00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffee00] active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label={COPY.nextProject}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#222430] bg-[#121318] text-[#f3f4f6] transition-colors duration-300 hover:border-[#ffee00]/60 hover:text-[#ffee00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffee00] active:scale-95"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-roledescription="карусель"
        aria-label={COPY.galleryTitle}
        className="portfolio-scroll no-scrollbar -mx-4 flex snap-x snap-proximity touch-pan-x gap-4 overflow-x-auto scroll-smooth px-4 pb-4 outline-none sm:mx-0 sm:gap-5 sm:px-0 sm:snap-mandatory sm:focus-visible:ring-2 sm:focus-visible:ring-inset sm:focus-visible:ring-[#ffee00]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="portfolio-project-card group relative w-[86vw] max-w-[390px] shrink-0 snap-center overflow-hidden rounded-[1.5rem] border border-[#222430] bg-[#121318] outline-none [-webkit-tap-highlight-color:transparent] sm:w-[340px] sm:rounded-[1.75rem] sm:snap-start"
          >
            <div className="relative aspect-[1.3] overflow-hidden bg-[#18191d]">
              <img
                src={project.image}
                alt={`${project.title} — ${project.badge}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="portfolio-project-image h-full w-full object-cover"
              />

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/55 via-transparent to-transparent"
                aria-hidden="true"
              />

              <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#101114]/85 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#ffee00] backdrop-blur-md">
                {project.badge}
              </span>

              <span className="portfolio-display absolute bottom-4 right-4 text-[10px] font-bold text-white/65">
                {String(index + 2).padStart(2, '0')}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <h4 className="portfolio-display text-sm font-black uppercase leading-snug tracking-[-0.025em] text-[#f3f4f6] sm:text-base">
                {project.title}
              </h4>

              <p className="mt-3 text-xs leading-[1.8] text-[#8b8f9e] sm:text-sm">
                {project.subtitle}
              </p>

              <div
                className="mt-5 h-px w-full bg-[#222430]"
                aria-hidden="true"
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#686d7c]">
                  Detailing SV
                </span>

                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#ffee00]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#686d7c] sm:hidden">
        <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
        {COPY.swipeHint}
      </p>
    </div>
  );
}

export default function Portfolio() {
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleComparisonChange = (event: ChangeEvent<HTMLInputElement>) => {
    comparisonRef.current?.style.setProperty(
      '--pos',
      `${event.currentTarget.value}%`,
    );
  };

  return (
    <section
      id="portfolio"
      className="portfolio-root relative isolate overflow-hidden bg-[#0a0a0c] px-4 py-24 text-white sm:px-8 sm:py-32 lg:py-36"
    >
      <style>{styles}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,238,0,0.045),transparent_45%)]"
      />

      <div
        aria-hidden="true"
        className="portfolio-grid pointer-events-none absolute inset-0 opacity-70"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-16 select-none font-display text-[25vw] font-black leading-none tracking-[-0.1em] text-[#121318] opacity-70"
      >
        SM
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mx-auto mb-12 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <p className="mb-6 inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.22em] text-[#ffee00] sm:text-[10px]">
            <span className="h-px w-7 bg-[#ffee00]/60" aria-hidden="true" />
            {COPY.eyebrow}
            <span className="h-px w-7 bg-[#ffee00]/60" aria-hidden="true" />
          </p>

          <h2 className="portfolio-display text-[clamp(1.7rem,5.5vw,4.2rem)] font-black uppercase leading-[0.98] tracking-[-0.055em] text-[#f3f4f6]">
            {COPY.title}
            <span className="mt-3 block bg-gradient-to-r from-[#ffee00] via-white to-[#ffee00] bg-clip-text pb-1 text-transparent">
              {COPY.titleAccent}
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-[1.9] text-[#8b8f9e] sm:text-base">
            {COPY.description}
          </p>
        </header>

        <div className="grid overflow-hidden rounded-[2rem] border border-[#222430] bg-[#121318] shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:rounded-[2.5rem] lg:grid-cols-[0.82fr_1.35fr]">
          <div className="order-2 flex flex-col justify-center p-6 sm:p-10 lg:order-1 lg:p-12 xl:p-14">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ffee00] sm:text-[10px]">
              {COPY.featuredLabel}
            </p>

            <span className="mt-6 inline-flex w-fit rounded-full border border-[#ffee00]/20 bg-[#ffee00]/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#ffee00] sm:text-[10px]">
              {COPY.featuredBadge}
            </span>

            <h3 className="portfolio-display mt-5 text-2xl font-black uppercase leading-[1.08] tracking-[-0.045em] text-[#f3f4f6] sm:text-3xl xl:text-4xl">
              {COPY.featuredTitle}
            </h3>

            <p className="mt-5 max-w-md text-sm leading-[1.9] text-[#8b8f9e] sm:text-base">
              {COPY.featuredDescription}
            </p>

            <div className="mt-8 border-t border-[#222430] pt-6 sm:mt-10">
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 h-8 w-1 shrink-0 rounded-full bg-[#ffee00]"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#f3f4f6]">
                    Порівняйте результат
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-[#686d7c]">
                    {COPY.compareHint}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <BeforeAfterComparison
              containerRef={comparisonRef}
              onChange={handleComparisonChange}
            />
          </div>
        </div>

        <ProjectCarousel />

        <div className="mt-14 flex justify-center sm:mt-16">
          <a
            href="#contact"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#ffee00] px-7 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#0a0a0c] transition-all duration-300 hover:bg-[#d9ca00] hover:shadow-[0_0_30px_rgba(255,238,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffee00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c] active:scale-[0.98]"
          >
            Обговорити ваш автомобіль{' '}
            <ArrowDown
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
// зміна розділу портфоліо
