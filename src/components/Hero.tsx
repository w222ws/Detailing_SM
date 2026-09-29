import React, { useState } from 'react';
import { ArrowDown, MapPin } from 'lucide-react';
import heroLive from '../assets/hero-bg.avif';

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D-наклон карточки за курсором (работает только на десктопе)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 14;
    const y = ((e.clientY - top) / height - 0.5) * -14;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-10 pt-32 sm:pt-40 pb-16 min-h-[90vh] flex items-center overflow-visible bg-grain">
      {/* BACKGROUND ИНДЕКС: Массивный матовый бэкграунд */}
      <div className="absolute right-0 bottom-6 font-display text-[26vw] uppercase font-black text-[#121318] leading-none select-none pointer-events-none z-0 tracking-tighter opacity-60">
        SM
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* ЛЕВАЯ ЧАСТЬ: Текст, адрес и кнопки */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
          {/* Премиальный Гео-Маркер */}
          <a
            href="https://google.com" // Сюда вставишь реальную ссылку на гугл-карты студии
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#121318]/90 border border-[#222430] hover:border-[#ffee00]/30 px-4 py-2 rounded-full mx-auto lg:mx-0 w-fit mb-6 shadow-xl transition-all duration-300 group/geo"
          >
            <MapPin
              size={13}
              className="text-[#ffee00] animate-[pulse_1.5s_infinite]"
            />
            <span className="font-display text-[10px] tracking-[0.15em] text-[#f3f4f6] group-hover/geo:text-[#ffee00] uppercase font-black transition-colors">
              Дніпро // вул. [Вулиця, 00]
            </span>
          </a>

          {/* Заголовок */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] uppercase font-black tracking-tight text-[#f3f4f6] leading-[0.9] mb-6">
            ЕСТЕТИКА <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffee00] via-white to-[#ffee00] bg-size-200 animate-gradient">
              ВАШОГО
            </span>{' '}
            <br />
            АВТОМОБІЛЯ
          </h1>

          {/* Исправленный, адаптивный параграф-манифест без нейрослопа */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-[#8b8f9e] max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10 border-l-0 lg:border-l-2 border-[#ffee00]/40 pl-0 lg:pl-4 text-center lg:text-left">
            Німецькі технології, сертифіковані захисні покриття та{' '}
            <span className="text-[#f3f4f6] font-semibold drop-shadow-[0_0_15px_rgba(243,244,246,0.1)]">
              безкомпромісний ручний підхід
            </span>
            . Консервуємо бездоганний глянець лаку. Захищаємо кузов там, де інші
            безсилі.
          </p>

          {/* Кнопки с жесткими стандартными классами */}
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center bg-[#ffee00] hover:bg-[#ccbe00] active:bg-[#b3a600] text-[#0a0a0c] font-display font-black text-xs uppercase tracking-widest py-[18px] px-10 rounded-full transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,238,0,0.35)] scale-100 active:scale-98"
            >
              Забронювати час
            </a>

            <a
              href="#portfolio" // Исправлен якорь на портфолио
              className="group text-[#f3f4f6] hover:text-[#ffee00] text-xs uppercase font-black tracking-widest transition-colors py-3 flex items-center gap-2"
            >
              Наші роботи
              <ArrowDown
                size={16}
                className="transform group-hover:translate-y-0.5 transition-transform duration-300 text-[#ffee00] animate-[bounce_2s_infinite]"
              />
            </a>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: 3D-Экран с автономным покачиванием */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end relative mt-4 lg:mt-0">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
              transition: mousePos.x === 0 ? 'all 0.5s ease-out' : 'none',
            }}
            className="w-full max-w-[365px] h-[54vh] sm:h-[58vh] lg:h-[66vh] rounded-[2.5rem] overflow-hidden border border-[#222430] bg-[#121318] relative shadow-[0_40px_100px_rgba(0,0,0,0.9)] group cursor-crosshair animate-smooth-drift lg:animate-none"
          >
            {/* Глубокий премиальный градиент вниз */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10 pointer-events-none" />

            <img
              src={heroLive}
              alt="SM Detailing Live"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />

            {/* Внутренний аккуратный неоновый контур */}
            <div className="absolute inset-0 border border-[#ffee00]/10 rounded-[2.5rem] z-20 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
