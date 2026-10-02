"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

const arrowClass =
  "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// Carrousel du bandeau d'accueil : défilement automatique (mis en pause au survol, au focus
// et pour les visiteurs qui réduisent les animations), flèches, puces, clavier et balayage tactile.
export function HeroCarousel({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, index]);

  function onTouchEnd(event: TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) go(index + (delta < 0 ? 1 : -1));
  }

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="À la une"
      className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${slideIndex + 1} sur ${count}`}
            // Les diapositives hors champ sont retirées de la navigation clavier et des lecteurs d'écran.
            inert={slideIndex !== index}
            className="w-full shrink-0"
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between sm:inset-x-12">
          <div className="flex items-center gap-2">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                aria-label={`Afficher la diapositive ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                onClick={() => go(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIndex === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" aria-label="Diapositive précédente" onClick={() => go(index - 1)} className={arrowClass}>
              <Chevron direction="left" />
            </button>
            <button type="button" aria-label="Diapositive suivante" onClick={() => go(index + 1)} className={arrowClass}>
              <Chevron direction="right" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}
