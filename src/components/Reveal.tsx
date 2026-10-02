"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  as?: "div" | "section" | "ul" | "ol";
  /** Fait apparaître les enfants directs en cascade plutôt que le bloc d'un seul tenant. */
  stagger?: boolean;
  className?: string;
  children: ReactNode;
};

// Fait apparaître son contenu la première fois qu'il entre dans la fenêtre (styles dans globals.css).
export function Reveal({ as: Tag = "div", stagger = false, className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // Le type exact de l'élément dépend de `as` ; une ref HTMLElement suffit à l'observer.
      ref={ref as never}
      className={`${stagger ? "reveal-stagger" : "reveal"} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
