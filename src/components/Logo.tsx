import Image from "next/image";

// Dimensions réelles de public/logo.png ; la taille affichée se règle par `className` (hauteur).
const WIDTH = 378;
const HEIGHT = 114;

export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/logo.png" alt="FUND.lab" width={WIDTH} height={HEIGHT} priority={priority} className={className} />;
}
