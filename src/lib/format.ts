const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" });

// Les montants sont stockés dans la plus petite unité de la devise.
// Le franc CFA (XOF) n'a pas de sous-unité : la valeur stockée est le montant en francs.
export function formatPrice(amount: number) {
  return priceFormatter.format(amount);
}
