import { useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import heroImg from '../assets/hero-bg.avif';

/* ==========================================================================
   Фото за матовим склом: наче віддих на холодному вікні боксу.
   Проводиш пальцем/курсором — скло протирається смугою, під ним чітке фото.
   Матовість — це сама ж фотографія, тільки розмита й освітлена:
   справжнє скло, а не намальований бруд.
   ========================================================================== */

type Point = { x: number; y: number };
type Phase = 'frosted' | 'fading' | 'done';

function GlassPhoto() {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imgReady, setImgReady] = useState(false);
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'done'
      : 'frosted',
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !frame || !img || !ctx || !imgReady) return;

    const GX = 22;
    const GY = 26;

    let w = 0;
    let h = 0;
    let radius = 30;
    let cells = new Uint8Array(0);
    let clearedCount = 0;
    let finished = false;
    let hasTouched = false;
    let down = false;
    let last: Point | null = null;
    let demoStarted = false;
    let demoTimer = 0;
    let demoFrame = 0;
    let idleTimer = 0;
    let doneTimer = 0;

    const paintFrost = () => {
      w = Math.round(frame.clientWidth);
      h = Math.round(frame.clientHeight);
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      radius = Math.max(30, w * 0.11);

      // те саме фото, тільки розмите й підсвітлене — справжня матовість скла.
      // Кадруємо як object-cover, інакше фото тупо розтягується під рамку.
      const iw = img.naturalWidth || w;
      const ih = img.naturalHeight || h;
      const boxRatio = w / h;
      const imgRatio = iw / ih;
      let sx = 0;
      let sy = 0;
      let sw = iw;
      let sh = ih;
      if (imgRatio > boxRatio) {
        sw = ih * boxRatio;
        sx = (iw - sw) / 2;
      } else {
        sh = iw / boxRatio;
        sy = (ih - sh) / 2;
      }

      ctx.filter = 'blur(16px) saturate(0.85) brightness(1.22)';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      ctx.filter = 'none';

      // легка біла поволока зверху
      ctx.fillStyle = 'rgba(244,245,248,0.22)';
      ctx.fillRect(0, 0, w, h);

      cells = new Uint8Array(GX * GY);
      clearedCount = 0;
      demoStarted = false;
    };

    const markCells = (x: number, y: number) => {
      const reach = radius * 0.8;
      const i0 = Math.max(0, Math.floor(((x - reach) / w) * GX));
      const i1 = Math.min(GX - 1, Math.floor(((x + reach) / w) * GX));
      const j0 = Math.max(0, Math.floor(((y - reach) / h) * GY));
      const j1 = Math.min(GY - 1, Math.floor(((y + reach) / h) * GY));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const idx = j * GX + i;
          if (cells[idx] === 1) continue;
          const cx = ((i + 0.5) / GX) * w;
          const cy = ((j + 0.5) / GY) * h;
          if ((cx - x) ** 2 + (cy - y) ** 2 <= reach * reach) {
            cells[idx] = 1;
            clearedCount++;
          }
        }
      }
    };

    const wipeAt = (x: number, y: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.9)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      markCells(x, y);
    };

    const stroke = (a: Point, b: Point) => {
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const step = Math.max(4, radius * 0.35);
      const n = Math.max(1, Math.ceil(dist / step));
      for (let k = 1; k <= n; k++) {
        wipeAt(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n);
      }
    };

    const stopDemo = () => {
      window.clearTimeout(demoTimer);
      cancelAnimationFrame(demoFrame);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      stopDemo();
      window.clearTimeout(idleTimer);
      if (hasTouched && 'vibrate' in navigator) navigator.vibrate(18);
      setPhase('fading');
      doneTimer = window.setTimeout(() => setPhase('done'), 650);
    };

    const armIdle = (ms: number) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(finish, ms);
    };

    const checkProgress = () => {
      if (clearedCount / (GX * GY) >= 0.55) finish();
    };

    const interact = (p: Point) => {
      stopDemo();
      if (!hasTouched) {
        hasTouched = true;
        setTouched(true);
      }
      if (last) stroke(last, p);
      else wipeAt(p.x, p.y);
      last = p;
      checkProgress();
      armIdle(3200);
    };

    const toPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      down = true;
      last = null;
      interact(toPoint(e));
    };
    const onMove = (e: PointerEvent) => {
      if (!down && e.pointerType !== 'mouse') return;
      interact(toPoint(e));
    };
    const onUp = () => {
      down = false;
      last = null;
    };

    /* Один тихий мазок по центру — підказка, що скло можна протерти */
    const runDemo = () => {
      const start = performance.now();
      const duration = 900;
      let prev: Point | null = null;

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        const p: Point = {
          x: w * (0.16 + 0.68 * e),
          y: h * 0.5 + Math.sin(e * Math.PI * 2) * h * 0.05,
        };
        if (prev) stroke(prev, p);
        else wipeAt(p.x, p.y);
        prev = p;

        if (t < 1) demoFrame = requestAnimationFrame(tick);
        else {
          checkProgress();
          armIdle(5500);
        }
      };
      demoFrame = requestAnimationFrame(tick);
    };

    const tryStartDemo = () => {
      if (finished || demoStarted) return;
      demoStarted = true;
      demoTimer = window.setTimeout(runDemo, 600);
    };

    const observer = new ResizeObserver(() => {
      if (finished) return;
      const width = Math.round(frame.clientWidth);
      if (width === 0 || Math.abs(width - w) <= 2) return;
      paintFrost();
      tryStartDemo();
    });
    observer.observe(frame);

    paintFrost();
    tryStartDemo();

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);

    return () => {
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      stopDemo();
      window.clearTimeout(idleTimer);
      window.clearTimeout(doneTimer);
    };
  }, [imgReady]);

  return (
    <div
      ref={frameRef}
      className="clip-cut relative aspect-[4/5] w-full overflow-hidden border border-border-subtle bg-carbon shadow-card"
    >
      <img
        ref={imgRef}
        src={heroImg}
        alt={site.brand.name}
        width={1000}
        height={1250}
        decoding="async"
        fetchPriority="high"
        onLoad={() => setImgReady(true)}
        className="h-full w-full object-cover object-center"
      />

      {phase !== 'done' && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`absolute inset-0 size-full touch-pan-y transition-opacity duration-700 ${
            phase === 'fading' ? 'pointer-events-none opacity-0' : ''
          }`}
        />
      )}

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-opacity duration-500 ${
          touched || phase !== 'frosted' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="tag-mono bg-bg-main/85">Протри скло</span>
      </div>

      {/* Коли скло протерли — не просто чисте фото, а сенс: що саме людина
          щойно побачила. Коротко, по суті, без вигаданих цифр. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-4 bottom-4 transition-[opacity,transform] duration-700 ${
          phase === 'done'
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <p className="font-display text-lg font-black uppercase leading-none text-text-main">
          Догляд за авто у {site.business.city}
        </p>
      </div>

      <div
        aria-hidden
        className="clip-cut pointer-events-none absolute inset-0 border border-accent-yellow/10"
      />
    </div>
  );
}

/* ==========================================================================
   Hero
   ========================================================================== */

function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-24 pb-16 lg:pt-36 lg:pb-24"
    >
      <div className="container-site relative z-10">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Мобілка: contents розчиняє цю обгортку, і заголовок/текст
              встають по order навколо фото. Десктоп: звичайна ліва колонка. */}
          <div className="contents lg:col-span-7 lg:block">
            <div className="order-1 text-center lg:text-left">
              <h1 className="text-[3.1rem] text-text-main sm:text-7xl md:text-8xl lg:text-[6rem]">
                ПРЕМІУМ ДЕТЕЙЛІНГ
                <br />
                <span className="text-accent-yellow">У ДНІПРІ.</span>
              </h1>
            </div>

            <div className="order-3 text-center lg:mt-6 lg:text-left">
              <p className="mx-auto max-w-xl border-l-0 pl-0 text-base text-text-muted lg:mx-0 lg:border-l-2 lg:border-accent-yellow/40 lg:pl-4 lg:text-lg">
                {site.brand.promise}. Керамічне покриття, антигравійна плівка
                PPF та ручне полірування —{' '}
                {site.business.workHours.toLowerCase()}.
              </p>

              {/* Дві кнопки: одна кричуща — веде на бронювання,
                  друга пасивна — на портфоліо. Обидві по якорях, не tel:/зовні. */}
              <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="#contacts"
                  className="btn-primary shine w-full sm:w-auto"
                >
                  Забронювати час
                </a>
                <a href="#works" className="btn-ghost w-full sm:w-auto">
                  Наші роботи
                </a>
              </div>
            </div>
          </div>

          {/* Фото: компактна карточка, не на весь екран.
              На мобілці між заголовком і текстом, на десктопі — справа. */}
          <div className="relative order-2 mx-auto w-full max-w-[19rem] lg:col-span-5 lg:mx-0 lg:ml-auto lg:max-w-sm">
            <p
              aria-hidden
              className="section-index pointer-events-none absolute -top-8 right-4 z-0 select-none lg:-top-10"
            >
              {site.brand.short}
            </p>
            <div className="relative z-10">
              <GlassPhoto />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
export { Hero };
