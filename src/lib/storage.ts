import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api";
import { db } from "@/lib/supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const PUBLIC_PREFIX = `${process.env.SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, index) => bytes[offset + index] === byte);

// Le type est déduit des premiers octets du fichier : le nom et le type MIME
// annoncés par le navigateur ne sont pas fiables.
function detectImageType(bytes: Uint8Array) {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { extension: "jpg", contentType: "image/jpeg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: "png", contentType: "image/png" };
  }
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { extension: "webp", contentType: "image/webp" };
  }
  return null;
}

export function isProductImageUrl(url: string) {
  return url.startsWith(PUBLIC_PREFIX) && !url.slice(PUBLIC_PREFIX.length).includes("/");
}

// Seule une image envoyée via /api/admin/uploads (donc hébergée dans notre bucket) est acceptée.
export function assertOwnImage(url: string | null | undefined) {
  if (url && !isProductImageUrl(url)) {
    const message = "Image invalide : envoyez-la depuis le formulaire.";
    throw new ApiError(422, "VALIDATION_ERROR", message, { image_url: [message] });
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  if (file.size === 0) throw new ApiError(422, "EMPTY_FILE", "Le fichier est vide.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "FILE_TOO_LARGE", "L'image ne doit pas dépasser 2 Mo.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) {
    throw new ApiError(415, "UNSUPPORTED_IMAGE", "Format non pris en charge : utilisez une image JPEG, PNG ou WebP.");
  }

  // Nom généré côté serveur : le nom d'origine n'est jamais utilisé dans le chemin.
  const path = `${randomUUID()}.${type.extension}`;
  const { error } = await db.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, bytes, { contentType: type.contentType, cacheControl: "31536000" });

  if (error) throw new Error(`Envoi de l'image impossible : ${error.message}`);
  return PUBLIC_PREFIX + path;
}

// Nettoyage « au mieux » : un échec ne doit pas faire échouer l'opération sur le produit.
export async function deleteProductImage(url: string | null | undefined) {
  if (!url || !isProductImageUrl(url)) return;
  const { error } = await db.storage.from(PRODUCT_IMAGES_BUCKET).remove([url.slice(PUBLIC_PREFIX.length)]);
  if (error) console.error(`Suppression de l'image impossible (${url}) : ${error.message}`);
}
