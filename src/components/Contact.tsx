import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  ArrowUpIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  InstagramLogoIcon,
  MapPinIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  type IconProps,
} from '@phosphor-icons/react';
import {
  brand,
  business,
  contacts,
  messengers,
  navigation,
} from '../config/site';
import { locations } from '../config/locations';
import { contactSection, developer } from '../config/contact';
import logoImg from '../assets/logo.avif';

/* ==========================================================================
   #contacts — він же футер сайту: велика кнопка дзвінка, лого + опис,
   розділи, месенджери, студії та графік, права.
   Статичний (без анімацій). Фон bg-bg-elevated збігається з фоном лого.
   Усе з config: site.ts, locations.ts, contact.ts.
   ========================================================================== */

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  TelegramLogo: TelegramLogoIcon,
  InstagramLogo: InstagramLogoIcon,
  WhatsappLogo: WhatsappLogoIcon,
};

const HEADING =
  'font-mono text-[0.65rem] font-bold tracking-widest text-text-dim uppercase sm:text-xs';
const LINK =
  'inline-flex min-h-10 items-center lg:min-h-11 gap-3 text-text-muted transition-colors duration-200 hover:text-accent-yellow';

const year = new Date().getFullYear();

/** Копіювання з запасним варіантом для старих браузерів / http */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Комп'ютер = широкий екран + мишка/трекпад + не телефон і не планшет.
    Усе інше (телефон, планшет, iPad із клавіатурою) — звичайний дзвінок. */
const DESKTOP_MQ = '(min-width: 64rem) and (hover: hover) and (pointer: fine)';

const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const mobileUa =
    /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return !mobileUa && window.matchMedia(DESKTOP_MQ).matches;
};

export default function Contact() {
  const phone = contacts.phone;
  const [copied, setCopied] = useState(false);
  const [desktop, setDesktop] = useState(isDesktop);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setDesktop(isDesktop());
    mq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      window.clearTimeout(timer.current);
    };
  }, []);

  /* Телефон: на смартфоні — дзвінок, на комп'ютері — копіюємо номер */
  const onPhoneClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (!desktop) return;
    e.preventDefault();
    const ok = await copyText(phone.href.replace(/^tel:/, ''));
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section
      id="contacts"
      className="relative overflow-hidden border-t border-border-subtle bg-bg-elevated text-text-main"
    >
      {/* Тонка жовта лінія-акцент зверху */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-yellow/60 to-transparent"
      />

      <div className="container-site pt-8 sm:pt-12">
        {/* Телефон великою кнопкою */}
        <a
          href={phone.href}
          onClick={onPhoneClick}
          aria-label={`${phone.label} ${phone.display}`}
          className="clip-cut group flex items-center justify-between gap-4 bg-accent-yellow px-5 py-5 text-bg-main transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99] sm:px-8 sm:py-7"
        >
          <span className="min-w-0">
            <span
              aria-live="polite"
              className="block font-mono text-[0.65rem] font-bold tracking-widest uppercase opacity-70 sm:text-xs"
            >
              {desktop
                ? copied
                  ? contactSection.copiedLabel
                  : contactSection.copyLabel
                : contactSection.phoneLabel}
            </span>
            <span className="mt-1.5 block font-display text-[clamp(1.55rem,7.6vw,4rem)] leading-none font-black whitespace-nowrap tabular-nums">
              {phone.display}
            </span>
          </span>
          <span
            aria-hidden
            className="clip-cut-sm grid size-12 shrink-0 place-items-center bg-bg-main text-accent-yellow transition-transform duration-300 sm:size-14"
          >
            {desktop ? (
              copied ? (
                <CheckIcon weight="bold" className="size-6" />
              ) : (
                <CopyIcon weight="bold" className="size-6" />
              )
            ) : (
              <ArrowUpIcon weight="bold" className="size-6 rotate-45" />
            )}
          </span>
        </a>

        <div className="mt-7 grid grid-cols-1 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-[5rem_1fr_1.1fr_1.4fr] lg:gap-12">
          {/* Лого (+ «нагору» на телефоні) */}
          <div className="flex items-center justify-between gap-4 sm:col-span-3 lg:col-span-1 lg:block">
            <a
              href="#"
              aria-label={`${brand.name}, нагору`}
              className="block size-20"
            >
              <img
                src={logoImg}
                alt={brand.name}
                width={80}
                height={80}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </a>
            <button
              type="button"
              aria-label={contactSection.upLabel}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="clip-cut-sm grid size-12 shrink-0 place-items-center border border-accent-yellow/50 text-accent-yellow transition-[background-color,color,transform] duration-200 hover:bg-accent-yellow hover:text-bg-main active:scale-90 lg:hidden"
            >
              <ArrowUpIcon aria-hidden weight="bold" className="size-5" />
            </button>
          </div>

          {/* Розділи */}
          <nav aria-label={contactSection.navLabel}>
            <p className={HEADING}>{contactSection.navLabel}</p>
            <ul className="mt-2 grid grid-cols-3 gap-x-3 sm:grid-cols-2 lg:grid-cols-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={LINK}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Месенджери */}
          <div>
            <p className={HEADING}>{contactSection.messengersLabel}</p>
            <ul className="mt-2">
              {messengers.map((c) => {
                const Icon = ICONS[c.icon];
                return (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      target={c.external ? '_blank' : undefined}
                      rel={c.external ? 'noopener noreferrer' : undefined}
                      className={LINK}
                    >
                      <Icon
                        aria-hidden
                        weight="light"
                        className="size-5 text-accent-yellow"
                      />
                      {c.display}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Де і коли */}
          <div className="sm:col-span-1 lg:col-span-1">
            <p className={HEADING}>{contactSection.whereLabel}</p>
            <ul className="mt-3 grid gap-3 text-text-muted">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 transition-colors duration-200 hover:text-accent-yellow"
                  >
                    <MapPinIcon
                      aria-hidden
                      weight="bold"
                      className="mt-0.5 size-5 shrink-0 text-accent-yellow"
                    />
                    <span>
                      {loc.title}
                      <span className="block text-sm text-text-dim transition-colors group-hover:text-accent-yellow/80">
                        {loc.address}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <ClockIcon
                  aria-hidden
                  weight="bold"
                  className="mt-0.5 size-5 shrink-0 text-accent-yellow"
                />
                {business.workHours}
              </li>
            </ul>
          </div>
        </div>

        {/* Права + розробник */}
        <div className="mt-6 flex flex-col gap-1.5 border-t border-border-subtle py-4 font-mono text-[0.65rem] tracking-widest text-text-dim uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {brand.since}–{year} {brand.name}. {contactSection.rights}
          </p>
          <p>
            {contactSection.developerLabel}{' '}
            <a
              href={developer.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-text-muted transition-colors duration-200 hover:text-accent-yellow"
            >
              {developer.name}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
