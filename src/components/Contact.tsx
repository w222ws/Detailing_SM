import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  ArrowUpIcon,
  ClockIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneCallIcon,
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
   #contacts — він же футер: проста кнопка дзвінка, рядок розділів,
   лого, месенджери, студії та графік, права.
   Статичний (без анімацій). Фон bg-bg-elevated збігається з фоном лого.

   Розділи стоять ОДНИМ РЯДКОМ, а не колонкою: шість пунктів стовпчиком
   розтягували футер і лишали півекрана порожнечі праворуч.
   Месенджери — назвою, а не сирим номером: номер і так величезний
   у кнопці зверху, а «+380973624845» у списку читалось як сміття.
   Усе з config: site.ts, locations.ts, contact.ts.
   ========================================================================== */

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  TelegramLogo: TelegramLogoIcon,
  InstagramLogo: InstagramLogoIcon,
  WhatsappLogo: WhatsappLogoIcon,
};

const MESSENGER_NAME: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

const HEADING =
  'font-mono text-[0.65rem] font-bold tracking-widest text-text-dim uppercase sm:text-xs';
const LINK =
  'inline-flex min-h-11 items-center gap-3 text-text-muted transition-colors duration-200 hover:text-accent-yellow';

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
          className="clip-cut-sm flex flex-col gap-1 bg-accent-yellow px-5 py-4 text-bg-main transition-colors duration-200 hover:bg-accent-hot active:scale-[0.99] sm:hidden"
        >
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] font-bold tracking-widest uppercase opacity-70"
          >
            {desktop
              ? copied
                ? contactSection.copiedLabel
                : contactSection.copyLabel
              : contactSection.phoneLabel}
          </span>
          <span className="font-display text-2xl leading-none font-black whitespace-nowrap tabular-nums">
            {phone.display}
          </span>
        </a>

        {/* Розділи — одним рядком */}
        <nav
          aria-label={contactSection.navLabel}
          className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-1 border-b border-border-subtle pb-5 sm:mt-0 sm:gap-x-9"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm text-text-muted transition-colors duration-200 hover:text-accent-yellow"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-[1fr_1fr_1.3fr] lg:gap-12">
          {/* Лого + «нагору» */}
          <div className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1 lg:justify-start lg:gap-8">
            <a
              href="#"
              aria-label={`${brand.name}, нагору`}
              className="block size-24 shrink-0 lg:size-28"
            >
              <img
                src={logoImg}
                alt={brand.name}
                width={112}
                height={112}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </a>
            <button
              type="button"
              aria-label={contactSection.upLabel}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="clip-cut-sm grid size-12 shrink-0 place-items-center border border-accent-yellow/50 text-accent-yellow transition-[background-color,color,transform] duration-200 hover:bg-accent-yellow hover:text-bg-main active:scale-90"
            >
              <ArrowUpIcon aria-hidden weight="bold" className="size-5" />
            </button>
          </div>

          {/* Месенджери */}
          <div>
            <p className={HEADING}>{contactSection.messengersLabel}</p>
            <ul className="mt-1">
              <li className="hidden sm:block">
                <a
                  href={phone.href}
                  onClick={onPhoneClick}
                  aria-label={`${phone.label} ${phone.display}`}
                  className={LINK}
                >
                  <PhoneCallIcon
                    aria-hidden
                    weight="light"
                    className="size-5 text-accent-yellow"
                  />
                  <span aria-live="polite">
                    {desktop && copied
                      ? contactSection.copiedLabel
                      : phone.display}
                  </span>
                </a>
              </li>
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
                      {MESSENGER_NAME[c.id] ?? c.display}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Студії та графік */}
          <div>
            <p className={HEADING}>{contactSection.whereLabel}</p>
            <ul className="mt-1 text-text-muted">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-3 transition-colors duration-200 hover:text-accent-yellow"
                  >
                    <MapPinIcon
                      aria-hidden
                      weight="bold"
                      className="size-5 shrink-0 text-accent-yellow"
                    />
                    <span>{loc.address}</span>
                  </a>
                </li>
              ))}
              <li className="flex min-h-11 items-center gap-3">
                <ClockIcon
                  aria-hidden
                  weight="bold"
                  className="size-5 shrink-0 text-accent-yellow"
                />
                {business.workHours}
              </li>
            </ul>
          </div>
        </div>

        {/* Права + розробник */}
        <div className="mt-8 flex flex-col gap-1.5 border-t border-border-subtle py-4 font-mono text-[0.65rem] tracking-widest text-text-dim uppercase sm:flex-row sm:items-center sm:justify-between">
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
