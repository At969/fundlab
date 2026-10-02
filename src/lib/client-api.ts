export type ClientApiError = { message: string; fields?: Record<string, string[] | undefined> };

type Result<T> = { data: T; error: null } | { data: null; error: ClientApiError };

// Appel des routes /api depuis le navigateur : renvoie toujours un résultat,
// jamais d'exception, pour que les composants n'aient qu'un seul chemin d'erreur.
// Un corps FormData (envoi de fichier) part tel quel ; tout autre corps est sérialisé en JSON.
export async function api<T>(url: string, method = "GET", body?: unknown): Promise<Result<T>> {
  try {
    const isForm = body instanceof FormData;
    const response = await fetch(url, {
      method,
      headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);
    if (response.ok) return { data: json as T, error: null };
    return {
      data: null,
      error: { message: json?.error?.message ?? "Une erreur est survenue.", fields: json?.error?.fields },
    };
  } catch {
    return { data: null, error: { message: "Impossible de joindre le serveur. Vérifiez votre connexion." } };
  }
}
