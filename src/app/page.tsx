import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { ProductThumb } from "@/components/ProductThumb";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { redirectAdminToDashboard } from "@/lib/guards";
import { listActiveProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

const FEATURED_COUNT = 3;

const primaryButton =
  "rounded-md bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg active:translate-y-0";

// Diapositive du bandeau ; la marge basse laisse la place aux commandes du carrousel.
const slideClass =
  "grid h-full items-center gap-8 px-5 pt-10 pb-20 *:min-w-0 sm:gap-10 sm:px-12 sm:pt-12 md:grid-cols-[1.2fr_1fr] md:pt-16 md:pb-24";

const heroButton =
  "rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:-translate-y-0.5 hover:bg-accent-50 hover:shadow-lg active:translate-y-0";

const heroLink = "text-sm font-semibold text-white underline-offset-4 hover:underline";

// Délai d'une animation d'entrée (lu par les classes animate-* de globals.css).
const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

// Mise en avant : les produits en stock d'abord, et parmi eux ceux qui ont une photo.
function pickFeatured(products: Product[]) {
  const score = (product: Product) => (product.stock > 0 ? 2 : 0) + (product.image_urls.length > 0 ? 1 : 0);
  return [...products].sort((a, b) => score(b) - score(a)).slice(0, FEATURED_COUNT);
}

const ADVANTAGES = [
  {
    title: "Stock affiché en direct",
    text: "Chaque fiche indique la quantité réellement disponible : pas de mauvaise surprise à la commande.",
    icon: "M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    title: "Total calculé en temps réel",
    text: "Ajoutez, retirez, changez les quantités : le montant de votre panier se met à jour à chaque geste.",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  },
  {
    title: "Commandes suivies",
    text: "Retrouvez l'historique de vos commandes et leur statut, de la validation à la livraison.",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4",
  },
  {
    title: "Compte protégé",
    text: "Votre mot de passe est chiffré et vos commandes ne sont visibles que par vous.",
    icon: "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z",
  },
];

const STEPS = [
  { title: "Choisissez", text: "Parcourez le catalogue et ajoutez vos produits au panier." },
  { title: "Validez", text: "Vérifiez votre panier, confirmez la commande et réglez en ligne." },
  { title: "Suivez", text: "Consultez à tout moment l'avancement de votre commande." },
];

export default async function HomePage() {
  await redirectAdminToDashboard();
  const [user, products] = await Promise.all([getCurrentUser(), listActiveProducts()]);
  const featured = pickFeatured(products);

  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <HeroCarousel>
        <div className={slideClass}>
          <div>
            <p className="animate-fade-up text-sm font-medium uppercase tracking-widest text-accent-300">
              Votre boutique en ligne
            </p>
            <h1
              style={delay(0.1)}
              className="animate-fade-up mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Vos produits du quotidien, commandés en quelques clics.
            </h1>
            <p style={delay(0.2)} className="animate-fade-up mt-5 max-w-md text-lg text-brand-100/90">
              Remplissez votre panier, validez votre commande et suivez-la jusqu&apos;à la livraison.
            </p>
            <div style={delay(0.3)} className="animate-fade-up mt-8 flex flex-wrap items-center gap-4">
              <Link href="/products" className={heroButton}>
                Voir les produits
              </Link>
              {!user && (
                <Link href="/register" className={heroLink}>
                  Créer un compte →
                </Link>
              )}
            </div>
          </div>

          {featured.length > 0 && (
            <ul className="flex flex-col gap-3">
              {featured.map((product, index) => (
                <li
                  key={product.id}
                  // Décalage en escalier (grand écran seulement) et entrée l'une après l'autre, décoratifs.
                  style={{ "--shift": `${index * 1.25}rem`, ...delay(0.3 + index * 0.15) } as CSSProperties}
                  className="animate-hero-card flex items-center gap-3 sm:ml-(--shift) sm:gap-4 rounded-xl bg-white p-3 text-stone-900 shadow-lg shadow-brand-950/30"
                >
                  <ProductThumb src={product.image_urls[0] ?? null} name={product.name} size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-sm text-stone-500">{product.stock > 0 ? "En stock" : "Rupture de stock"}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums sm:text-base">{formatPrice(product.price_cents)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {featured.map((product) => (
          <div key={product.id} className={slideClass}>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent-300">À la une</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                <Link href={`/products/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </h2>
              {product.description && (
                <p className="mt-4 line-clamp-2 max-w-md text-lg text-brand-100/90">{product.description}</p>
              )}
              <p className="mt-5 text-2xl font-semibold tabular-nums">{formatPrice(product.price_cents)}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <AddToCartButton product={product} className={`${heroButton} disabled:opacity-60`} />
                <Link href="/products" className={heroLink}>
                  Tout le catalogue →
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl bg-brand-800 shadow-xl shadow-brand-950/40">
              {product.image_urls[0] ? (
                <Image
                  src={product.image_urls[0]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 384px, 100vw"
                  className="object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-full items-center justify-center text-8xl font-semibold text-accent-300/40"
                >
                  {product.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        ))}
      </HeroCarousel>

      <section aria-labelledby="featured-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-title" className="text-2xl font-semibold tracking-tight">
              À la une
            </h2>
            <p className="mt-1 text-stone-600">Une sélection de notre catalogue, prête à être ajoutée au panier.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-accent-700 hover:underline">
            Tout le catalogue ({products.length}) →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
        ) : (
          <Reveal as="ul" stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Reveal>
        )}
      </section>

      <section aria-labelledby="advantages-title">
        <h2 id="advantages-title" className="text-2xl font-semibold tracking-tight">
          Pourquoi commander ici
        </h2>
        <Reveal as="ul" stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((advantage) => (
            <li
              key={advantage.title}
              className="rounded-xl border border-stone-200 bg-white p-5 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={advantage.icon} />
                </svg>
              </span>
              <h3 className="mt-4 font-semibold">{advantage.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{advantage.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-2xl font-semibold tracking-tight">
          Comment ça marche
        </h2>
        <Reveal as="ol" stagger className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-accent-500 pt-4">
              <p className="text-sm font-semibold text-accent-700 tabular-nums">Étape {index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-stone-600">{step.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <Reveal as="section" className="rounded-3xl bg-accent-50 px-5 py-10 text-center sm:px-12 sm:py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">Prêt à remplir votre panier ?</h2>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          {user
            ? "Votre panier vous attend : retrouvez tout le catalogue en un clic."
            : "Créez votre compte en une minute pour commander et suivre vos achats."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href={user ? "/products" : "/register"} className={primaryButton}>
            {user ? "Voir les produits" : "Créer un compte"}
          </Link>
          {!user && (
            <Link href="/products" className="text-sm font-semibold text-accent-800 hover:underline">
              Parcourir sans compte
            </Link>
          )}
        </div>
      </Reveal>
    </div>
  );
}
