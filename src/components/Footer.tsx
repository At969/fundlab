import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 pt-6 pb-24 sm:py-6 sm:flex-row sm:items-center sm:justify-between text-sm text-stone-500">
        <Logo className="h-6 w-auto self-start" />
        <p>Projet de démonstration : les paiements sont simulés, aucune commande n&apos;est réellement livrée.</p>
      </div>
    </footer>
  );
}
