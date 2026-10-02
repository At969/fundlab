import Image from "next/image";

// Vignette carrée d'un produit ; sans image, on affiche son initiale.
export function ProductThumb({ src, name, size }: { src: string | null; name: string; size: number }) {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <span
        aria-hidden
        style={{ ...style, fontSize: size / 2.5 }}
        className="flex shrink-0 items-center justify-center rounded-md bg-accent-50 font-semibold text-accent-700/50"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  // Les aperçus locaux (blob:) ne passent pas par l'optimiseur d'images.
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized={src.startsWith("blob:")}
      style={style}
      className="shrink-0 rounded-md object-cover"
    />
  );
}
