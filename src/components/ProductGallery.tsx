"use client";

import Image from "next/image";
import { useState } from "react";

// Galerie de la fiche produit : une grande image et, s'il y en a plusieurs, des vignettes pour en changer.
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div
        aria-hidden
        className="flex aspect-square items-center justify-center rounded-2xl bg-accent-50 text-9xl font-semibold text-accent-700/40"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <Image
          // La clé relance le fondu à chaque changement d'image.
          key={images[selected]}
          src={images[selected]}
          alt={images.length > 1 ? `${name}, image ${selected + 1} sur ${images.length}` : name}
          fill
          priority
          sizes="(min-width: 768px) 480px, 100vw"
          className="animate-fade-in object-contain"
        />
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                aria-label={`Afficher l'image ${index + 1}`}
                aria-current={index === selected}
                onClick={() => setSelected(index)}
                className={`relative block h-16 w-16 overflow-hidden rounded-lg border-2 bg-white transition ${
                  index === selected ? "border-accent-500" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-contain p-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
