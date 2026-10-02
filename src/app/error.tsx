"use client";

export default function ErrorPage({ retry }: { error: Error; retry: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Une erreur est survenue</h1>
      <p className="mt-2 text-stone-600">Impossible de charger cette page pour le moment.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Réessayer
      </button>
    </div>
  );
}
