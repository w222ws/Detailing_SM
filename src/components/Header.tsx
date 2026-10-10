import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneCallIcon,
  CaretDownIcon,
  TelegramLogoIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import { site } from '../config/site';
import logoImg from '../assets/logo.avif';

const NAV_LINKS = [
  { name: 'Послуги', href: '#services' },
  { name: 'Портфоліо', href: '#portfolio' },
  { name: 'Процес', href: '#process' },
  { name: 'FAQ', href: '#faq' },
] as const;

/** Ссылки берём из site.ts, здесь только иконки. */
const CHANNELS = [
  { ...site.telegram, Icon: TelegramLogoIcon },
  { ...site.instagram, Icon: InstagramLogoIcon },
  { ...site.whatsapp, Icon: WhatsappLogoIcon },
] as const;

/** Монохромный чип в фирменных цветах: жёлтая иконка на тонированном фоне,
 *  при hover/active плашка заливается жёлтым, а иконка темнеет. */
const CHIP =
  'flex shrink-0 items-center justify-center bg-accent-yellow-soft text-accent-yellow transition-colors duration-150 group-hover:bg-accent-yellow group-hover:text-bg-main group-active:bg-accent-yellow group-active:text-bg-main';

/** Блик по лаку. motion-reduce:hidden — иначе при отключённой анимации он застынет на кнопке */
const SWEEP =
  'pointer-events-none absolute inset-y-0 left-0 w-[40%] animate-sweep bg-linear-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const bookBtnRef = useRef<HTMLButtonElement>(null);

  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setIsBookOpen(false);
  }, []);

  /* Скролл без scroll-листенера: React дёргается только при пересечении порога */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Пока открыто мобильное меню, страница не скроллится.
     Блокируем <html>, а не body: так надёжно и на iOS Safari. */
  useEffect(() => {
    if (!isMenuOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [isMenuOpen]);

  /* Escape + клик вне выпадашки */
  useEffect(() => {
    if (!isMenuOpen && !isBookOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isBookOpen) bookBtnRef.current?.focus();
      closeAll();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        isBookOpen &&
        bookRef.current &&
        !bookRef.current.contains(e.target as Node)
      ) {
        setIsBookOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen, isBookOpen, closeAll]);

  /* Выросли до десктопа при открытом мобильном меню: закрываем */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => e.matches && closeAll();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [closeAll]);

  /* Клик по лого: плавно наверх без «#» в адресной строке */
  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Маркер верха страницы: пока он виден, хедер «прозрачный» */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-6 w-px"
      />

      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
        <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between pl-5 pr-2 md:h-[4.25rem] md:pl-7 md:pr-3">
          {/* Капсула: анимируется только opacity/transform → без перерасчёта раскладки.
              Blur только на десктопе, на телефонах он тяжёлый для GPU. */}
          <div
            aria-hidden
            className={`absolute inset-0 -z-10 rounded-full border border-border-subtle bg-bg-card/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] md:bg-bg-card/85 md:backdrop-blur-md ${
              isScrolled || isMenuOpen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-1 opacity-0'
            }`}
          />

          {/* Лого */}
          <a
            href="/"
            onClick={onLogoClick}
            aria-label={`${site.name}: на головну`}
            className="relative z-50 block h-9 w-[132px] shrink-0 md:h-10 md:w-[148px]"
          >
            <img
              src={logoImg}
              alt={site.name}
              width={148}
              height={40}
              decoding="async"
              className="h-full w-full object-contain object-left"
            />
          </a>

          {/* Десктоп-навигация */}
          <nav
            aria-label="Основна навігація"
            className="hidden items-center gap-9 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text-main"
              >
                {link.name}
                <span className="absolute inset-x-0 bottom-0.5 h-px origin-left scale-x-0 bg-accent-yellow transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Правый блок */}
          <div className="relative z-50 flex items-center gap-2">
            {/* ===== Мобилки: звонок =====
                Каждые ~5 сек от кнопки расходятся два тонких кольца-контура,
                а трубка «звонит». Остальное время кнопка спокойна. */}
            <a
              href={site.phoneHref}
              aria-label={`Зателефонувати: ${site.phone}`}
              className="relative grid size-10 place-items-center rounded-full bg-accent-yellow text-bg-main transition-transform duration-150 active:scale-90 md:hidden"
            >
              <span
                aria-hidden
                className="absolute inset-0 animate-call-ripple rounded-full border-2 border-accent-yellow motion-reduce:hidden"
              />
              <span
                aria-hidden
                style={{ animationDelay: '0.3s' }}
                className="absolute inset-0 animate-call-ripple rounded-full border-2 border-accent-yellow motion-reduce:hidden"
              />
              <PhoneCallIcon
                aria-hidden
                size={20}
                weight="fill"
                className="relative animate-call-shake motion-reduce:animate-none"
              />
            </a>

            {/* ===== Десктоп: «Записатися» + выпадашка ===== */}
            <div ref={bookRef} className="relative hidden md:block">
              <button
                ref={bookBtnRef}
                type="button"
                onClick={() => setIsBookOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isBookOpen}
                aria-controls="book-menu"
                className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-accent-yellow px-6 font-display text-[1.05rem] font-extrabold uppercase tracking-[0.08em] text-bg-main transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_32px_-6px_rgba(255,230,0,0.6)] active:scale-[0.97]"
              >
                <span aria-hidden className={SWEEP} />
                <span className="relative">Записатися</span>
                <CaretDownIcon
                  aria-hidden
                  size={14}
                  weight="bold"
                  className={`relative transition-transform duration-300 ease-out ${isBookOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                id="book-menu"
                role="menu"
                aria-label="Оберіть спосіб запису"
                className={`absolute right-0 top-[calc(100%+0.75rem)] w-[19.5rem] origin-top-right transform-gpu rounded-3xl bg-[#0b0b0f] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_-10px_rgba(0,0,0,0.9)] transition-[opacity,transform,visibility] duration-200 ease-out ${
                  isBookOpen
                    ? 'visible translate-y-0 scale-100 opacity-100'
                    : 'invisible -translate-y-1.5 scale-[0.97] opacity-0'
                }`}
              >
                <div className="flex items-center justify-between px-3 pb-2.5 pt-2">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-text-dim">
                    Швидкий запис
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.7rem] text-text-muted">
                    <span className="size-1.5 rounded-full bg-accent-yellow" />
                    на звʼязку
                  </span>
                </div>

                {CHANNELS.map(({ label, handle, url, Icon }) => (
                  <a
                    key={label}
                    role="menuitem"
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => setIsBookOpen(false)}
                    className="group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors duration-150 hover:bg-white/[0.05] focus-visible:bg-white/[0.05]"
                  >
                    <span className={`${CHIP} size-11 rounded-xl`}>
                      <Icon aria-hidden size={22} weight="fill" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight text-text-main">
                        {label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-text-muted">
                        {handle}
                      </span>
                    </span>
                    <ArrowUpRightIcon
                      aria-hidden
                      size={16}
                      weight="bold"
                      className="shrink-0 text-text-dim transition-[color,transform] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-main"
                    />
                  </a>
                ))}

                <div className="mt-1.5 rounded-2xl bg-white/[0.035] p-1.5">
                  <a
                    role="menuitem"
                    href={site.phoneHref}
                    onClick={() => setIsBookOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-main transition-colors duration-150 hover:bg-white/[0.05] focus-visible:bg-white/[0.05]"
                  >
                    <PhoneCallIcon
                      aria-hidden
                      size={17}
                      weight="fill"
                      className="text-accent-yellow"
                    />
                    {site.phone}
                  </a>
                  <p className="flex items-center gap-2 px-3 pb-1.5 pt-0.5 text-xs text-text-muted">
                    <ClockIcon
                      aria-hidden
                      size={14}
                      weight="bold"
                      className="text-text-dim"
                    />
                    {site.hours}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== Бургер: две линии, без рамки ===== */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="relative size-10 rounded-full bg-white/[0.07] text-text-main transition-[background-color,transform] duration-150 active:scale-90 active:bg-white/[0.12] md:hidden"
            >
              <span
                className={`absolute left-1/2 top-1/2 -ml-2.5 -mt-px h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  isMenuOpen
                    ? 'translate-y-0 rotate-45'
                    : '-translate-y-[3.5px]'
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 -ml-2.5 -mt-px h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  isMenuOpen
                    ? 'translate-x-0 translate-y-0 -rotate-45 scale-x-100'
                    : 'translate-x-[3px] translate-y-[3.5px] scale-x-[0.6]'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Мобильное меню: чистый чёрный, без рамок и blur ===== */}
      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        className={`fixed inset-0 z-30 flex flex-col overflow-y-auto overscroll-contain bg-[#050507] px-5 pt-24 transition-[opacity,visibility] duration-300 ease-out md:hidden ${
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <nav
          aria-label="Мобільна навігація"
          className="mx-auto flex w-full max-w-lg flex-col"
        >
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.name}
              href={link.href}
              onClick={closeAll}
              style={{
                transitionDelay: isMenuOpen ? `${60 + i * 40}ms` : '0ms',
              }}
              className={`flex items-baseline gap-4 py-3 font-display text-[2.9rem] font-black uppercase leading-none text-text-main transition-[opacity,transform,color] duration-400 active:text-accent-yellow ${
                isMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-3 opacity-0'
              }`}
            >
              <span className="w-6 font-mono text-[0.7rem] font-medium tracking-widest text-accent-yellow">
                0{i + 1}
              </span>
              {link.name}
            </a>
          ))}
        </nav>

        <div
          style={{ transitionDelay: isMenuOpen ? '260ms' : '0ms' }}
          className={`mx-auto mt-auto w-full max-w-lg pt-8 transition-[opacity,transform] duration-400 ${
            isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <p className="mb-3 px-1 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-text-dim">
            Записатися через
          </p>

          <div className="flex flex-col gap-2">
            {CHANNELS.map(({ label, handle, url, Icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={closeAll}
                className="group flex items-center gap-3.5 rounded-2xl bg-white/[0.045] p-2.5 transition-colors duration-150 active:bg-white/[0.09]"
              >
                <span className={`${CHIP} size-11 rounded-xl`}>
                  <Icon aria-hidden size={22} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.95rem] font-semibold leading-tight text-text-main">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-text-muted">
                    {handle}
                  </span>
                </span>
                <ArrowUpRightIcon
                  aria-hidden
                  size={18}
                  weight="bold"
                  className="mr-1.5 shrink-0 text-text-dim"
                />
              </a>
            ))}
          </div>

          <a
            href={site.phoneHref}
            className="relative mt-2.5 flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-accent-yellow font-display text-xl font-extrabold uppercase tracking-[0.08em] text-bg-main transition-transform duration-150 active:scale-[0.98]"
          >
            <span aria-hidden className={SWEEP} />
            <PhoneCallIcon
              aria-hidden
              size={20}
              weight="fill"
              className="relative"
            />
            <span className="relative">{site.phone}</span>
          </a>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-text-dim">
            <ClockIcon aria-hidden size={14} weight="bold" />
            {site.hours}
          </p>
        </div>
      </div>
    </>
  );
}
