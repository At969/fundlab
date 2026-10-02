const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" });

// Fuseau fixé pour que le rendu serveur (UTC sur Vercel) et le navigateur affichent la même heure.
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Africa/Porto-Novo",
});

// Les montants sont stockés dans la plus petite unité de la devise.
// Le franc CFA (XOF) n'a pas de sous-unité : la valeur stockée est le montant en francs.
export function formatPrice(amount: number) {
  return priceFormatter.format(amount);
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
