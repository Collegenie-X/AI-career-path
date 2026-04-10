'use client';

import { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import homeContent from '@/data/home-content.json';

const features = homeContent.features as typeof homeContent.features;

export function FeaturesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 2800);
    return () => clearInterval(timer);
  }, [emblaApi, isPaused]);

  const totalSlides = features.items.length;

  return (
    <section
      className="relative py-28 md:py-40 overflow-hidden px-6 md:px-10 lg:px-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(108,92,231,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6C5CE7, transparent)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #60a5fa, transparent)' }}
      />

      <div className="web-container relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {features.header.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {features.header.title}
          </h2>
          <p className="text-white/45 text-base max-w-sm mx-auto">
            {features.header.subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {features.items.map((f) => (
                <div
                  key={f.title}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2"
                >
                  <div
                    className="group relative rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] cursor-default overflow-hidden h-full"
                    style={{
                      background: `${f.color}08`,
                      borderColor: `${f.color}25`,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 30px ${f.color}15, 0 0 30px ${f.color}20`,
                      }}
                    />

                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider"
                        style={{ background: `${f.color}20`, color: f.color }}
                      >
                        {f.tag}
                      </span>
                      <div
                        className="w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"
                        style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }}
                      />
                    </div>

                    <div
                      className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-300 flex justify-center"
                      style={{
                        filter: `drop-shadow(0 0 8px ${(f as { glow?: string }).glow ?? f.color + '80'})`,
                      }}
                    >
                      {f.emoji}
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 leading-tight text-center">
                      {f.title}
                    </h3>
                    <p className="text-xs text-white/45 leading-snug text-center">{f.desc}</p>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full flex items-center justify-center border border-white/15 bg-black/60 text-white/60 hover:text-white hover:border-white/30 transition-all z-10 backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full flex items-center justify-center border border-white/15 bg-black/60 text-white/60 hover:text-white hover:border-white/30 transition-all z-10 backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {features.items.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/15'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="flex justify-center mt-3">
          <span className="text-xs text-white/25 tabular-nums">
            {selectedIndex + 1} / {totalSlides}
          </span>
        </div>
      </div>
    </section>
  );
}
