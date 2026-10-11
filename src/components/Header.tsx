import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneCallIcon,
  TelegramLogoIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
  ClockIcon,
  type IconProps,
} from '@phosphor-icons/react';
import { site, type ContactId } from '../config/site';
import logoImg from '../assets/logo.avif';

/** Рядкова назва іконки з site.ts → реальний компонент phosphor-icons. */
const ICONS: Record<
  (typeof site.messengers)[number]['icon'],
  React.ComponentType<IconProps>
> = {
  PhoneCall: PhoneCallIcon,
  TelegramLogo: TelegramLogoIcon,
  InstagramLogo: InstagramLogoIcon,
  WhatsappLogo: WhatsappLogoIcon,
};

/** Коротка назва каналу для тісних плиток у мобільному меню —
 *  там повне «Написати в Telegram» не влізе в три колонки. */
const SHORT_LABEL: Record<ContactId, string> = {
  phone: 'Дзвінок',
  telegram: 'Telegram',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

/** site.messengers (telegram, instagram, whatsapp) + іконка по імені. */
const CHANNELS = site.messengers.map((channel) => ({
  id: channel.id as ContactId,
  label: channel.label,
  short: SHORT_LABEL[channel.id as ContactId],
  url: channel.href,
  Icon: ICONS[channel.icon],
}));

/** Контурна іконка: жовтий обвід, прозора всередині,
 *  заливається кольором тільки на hover/active. */
const RING_ICON =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-accent-yellow/45 text-accent-yellow transition-[background-color,border-color,color,transform] duration-200 hover:bg-accent-yellow hover:text-bg-main hover:border-accent-yellow active:scale-90';

/** Блик по лаку. motion-reduce:hidden — иначе застынет на кнопке. */
const SWEEP =
  'pointer-events-none absolute inset-y-0 left-0 w-[40%] animate-sweep bg-linear-to-r from-transparent via-white/50 to-transparent motion-reduce:hidden';

function Header() {
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

  /* Скролл: наблюдаем сентинел у самого верха — дешевле, чем scroll-листенер. */
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

  /* Пока открыто мобильное меню — страница не скроллится. */
  useEffect(() => {
    if (!isMenuOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [isMenuOpen]);

  /* Escape закрывает всё; клик мимо «веера» каналов — закрывает его */
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

  /* Выросли до десктопа при открытом мобильном — закрываем. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => e.matches && closeAll();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [closeAll]);

  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-6 w-px"
      />

      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 lg:px-6 lg:pt-4">
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 pl-3 pr-2 lg:h-24 lg:pl-5 lg:pr-3">
          {/* Панель: срезанный «кузовной» угол — тот же силуэт, что у кнопок
              и карточек. Проявляется при скролле или открытом меню. */}
          <div
            aria-hidden
            className={`clip-cut absolute inset-0 -z-10 border border-border-subtle bg-bg-card/95 shadow-card transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] lg:bg-bg-card/90 lg:backdrop-blur-md ${
              isScrolled || isMenuOpen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-1 opacity-0'
            }`}
          />

          {/* Лого — круглий бейдж, тому квадратне й велике, не затиснуте
              у вузьку смужку як раніше */}
          <a
            href="/"
            onClick={onLogoClick}
            aria-label={`${site.brand.name}: на головну`}
            className="relative z-50 block size-[4.5rem] shrink-0 lg:size-20"
          >
            <img
              src={logoImg}
              alt={site.brand.name}
              width={80}
              height={80}
              decoding="async"
              className="h-full w-full bg-transparent object-contain"
            />
          </a>

          {/* Навигация: десктоп, з site.navigation */}
          <nav
            aria-label="Основна навігація"
            className="hidden items-center gap-8 lg:flex"
          >
            {site.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-underline py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text-main"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Правый блок */}
          <div className="relative z-50 flex items-center gap-2">
            {/* ===== Мобилка: звонок ===== */}
            <a
              href={site.contacts.phone.href}
              aria-label={`Зателефонувати: ${site.contacts.phone.display}`}
              className="relative grid size-10 place-items-center rounded-control bg-accent-yellow text-bg-main transition-transform duration-150 active:scale-90 lg:hidden"
            >
              <span
                aria-hidden
                className="absolute inset-0 animate-call-ripple rounded-control border-2 border-accent-yellow motion-reduce:hidden"
              />
              <PhoneCallIcon
                aria-hidden
                size={19}
                weight="fill"
                className="relative animate-call-shake motion-reduce:animate-none"
              />
            </a>

            {/* ===== Десктоп: «Записатися» розкриває віяло каналів =====
                Клік — і зліва від кнопки виїжджають контурні іконки
                Telegram / Instagram / WhatsApp. Нічого зайвого видно не було,
                поки не попросили — а попросили, то все під рукою одразу. */}
            <div ref={bookRef} className="hidden items-center lg:flex">
              <div
                className={`grid overflow-hidden transition-[grid-template-columns] duration-300 ease-out ${
                  isBookOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
                }`}
              >
                <div className="flex min-w-0 items-center gap-1.5 overflow-hidden pr-2">
                  {CHANNELS.map(({ id, label, url, Icon }, i) => (
                    <a
                      key={id}
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      title={label}
                      tabIndex={isBookOpen ? 0 : -1}
                      style={{
                        transitionDelay: isBookOpen ? `${i * 55}ms` : '0ms',
                      }}
                      className={`${RING_ICON} shrink-0 transition-[opacity,transform] duration-250 ease-out ${
                        isBookOpen
                          ? 'translate-x-0 opacity-100'
                          : 'translate-x-2 opacity-0'
                      }`}
                    >
                      <Icon aria-hidden size={18} weight="light" />
                    </a>
                  ))}
                </div>
              </div>

              <button
                ref={bookBtnRef}
                type="button"
                onClick={() => setIsBookOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={isBookOpen}
                className="btn-primary relative h-11 overflow-hidden px-6 text-base"
              >
                <span aria-hidden className={SWEEP} />
                <span className="relative">Записатися</span>
              </button>
            </div>

            {/* ===== Бургер ===== */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="relative size-10 rounded-control bg-white/[0.07] text-text-main transition-[background-color,transform] duration-150 active:scale-90 active:bg-white/[0.12] lg:hidden"
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

        {/* ===== Мобильное меню: выпадает из-под панели, не на весь экран ===== */}
        <div
          id="mobile-menu"
          aria-hidden={!isMenuOpen}
          className={`clip-cut mx-auto mt-2 max-w-6xl overflow-hidden border border-border-subtle bg-bg-card/98 shadow-card backdrop-blur-md transition-[grid-template-rows,opacity] duration-350 ease-out lg:hidden ${
            isMenuOpen
              ? 'grid grid-rows-[1fr] opacity-100'
              : 'grid grid-rows-[0fr] opacity-0'
          }`}
          style={{ display: 'grid' }}
        >
          <div className="overflow-hidden">
            <nav aria-label="Мобільна навігація" className="px-5 pt-4">
              {site.navigation.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeAll}
                  style={{
                    transitionDelay: isMenuOpen ? `${50 + i * 35}ms` : '0ms',
                  }}
                  className={`flex items-baseline gap-3 border-b border-border-subtle py-3.5 font-display text-2xl font-black uppercase leading-none text-text-main transition-[opacity,transform] duration-300 active:text-accent-yellow ${
                    isMenuOpen
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-2 opacity-0'
                  }`}
                >
                  <span className="font-mono text-[0.65rem] font-medium tracking-widest text-accent-yellow">
                    0{i + 1}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="px-5 py-4">
              <p className="eyebrow mb-2.5">Записатися</p>
              <div className="grid grid-cols-3 gap-2">
                {CHANNELS.map(({ id, short, url, Icon }) => (
                  <a
                    key={id}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={closeAll}
                    className="flex flex-col items-center gap-2 border border-border-subtle bg-bg-card px-2 py-4 transition-[border-color,transform] duration-200 active:scale-95 active:border-accent-yellow/60"
                  >
                    <Icon
                      aria-hidden
                      size={22}
                      weight="light"
                      className="text-accent-yellow"
                    />
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                      {short}
                    </span>
                  </a>
                ))}
              </div>

              <a
                href={site.contacts.phone.href}
                onClick={closeAll}
                className="btn-primary relative mt-2.5 h-12 w-full overflow-hidden text-base"
              >
                <span aria-hidden className={SWEEP} />
                <PhoneCallIcon
                  aria-hidden
                  size={17}
                  weight="fill"
                  className="relative"
                />
                <span className="relative">{site.contacts.phone.display}</span>
              </a>
            </div>

            <p className="flex items-center gap-2 px-5 pb-4 text-xs text-text-dim">
              <ClockIcon aria-hidden size={13} weight="bold" />
              {site.business.workHours}
            </p>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
export { Header };
