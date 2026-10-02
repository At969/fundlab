import { z } from "zod";
import { MAX_PRODUCT_IMAGES, ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/types";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Adresse e-mail invalide." }));

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).max(80),
    email,
    password: z
      .string()
      .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." })
      // bcrypt ignore tout ce qui dépasse 72 octets
      .max(72, { error: "Le mot de passe ne peut pas dépasser 72 caractères." }),
    passwordConfirm: z.string({ error: "Confirmez votre mot de passe." }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    error: "Les deux mots de passe ne correspondent pas.",
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Mot de passe requis." }).max(72),
});

export const idSchema = z.uuid({ error: "Identifiant invalide." });

// Numéro béninois : 10 chiffres commençant par 01, indicatif +229 ou 00229 facultatif.
// Espaces, points et tirets sont tolérés à la saisie ; le numéro est enregistré sous la
// forme +22901XXXXXXXX.
const phone = z
  .string()
  .transform((value) => value.replace(/[\s.-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(?:\+229|00229)?01\d{8}$/, { error: "Numéro invalide : 10 chiffres commençant par 01." })
      .transform((value) => `+229${value.slice(-10)}`),
  );

export const deliverySchema = z.object(
  {
    name: z.string().trim().min(2, { error: "Indiquez le nom du destinataire." }).max(80),
    phone,
    address: z.string().trim().min(5, { error: "Indiquez une adresse de livraison." }).max(200),
    city: z.string().trim().min(2, { error: "Indiquez la ville." }).max(80),
    notes: z.string().trim().max(300, { error: "300 caractères maximum." }).optional(),
  },
  { error: "Les informations de livraison sont requises." },
);

export const createOrderSchema = z.object({
  delivery: deliverySchema,
  items: z
    .array(
      z.object({
        productId: idSchema,
        quantity: z.int().min(1).max(999),
      }),
    )
    .min(1, { error: "Le panier est vide." })
    .max(100),
});

// Paiement mobile money simulé : le numéro est seulement contrôlé, jamais enregistré ni transmis.
export const paymentSchema = z.object({
  method: z.enum(PAYMENT_METHODS, { error: "Choisissez un opérateur." }),
  phone,
});

export const productSchema = z.object({
  name: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).max(120),
  description: z.string().trim().max(500, { error: "500 caractères maximum." }),
  price_cents: z.int({ error: "Prix invalide." }).min(0, { error: "Le prix ne peut pas être négatif." }).max(100_000_000),
  stock: z.int({ error: "Stock invalide." }).min(0, { error: "Le stock ne peut pas être négatif." }).max(1_000_000),
  is_active: z.boolean(),
  // L'appartenance des URL à notre bucket est vérifiée dans la route (assertOwnImages).
  image_urls: z
    .array(z.url({ error: "Image invalide." }))
    .max(MAX_PRODUCT_IMAGES, { error: `${MAX_PRODUCT_IMAGES} images maximum par produit.` }),
});

export const productUpdateSchema = productSchema.partial();

export const orderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export const userRoleSchema = z.object({ role: z.enum(["customer", "admin"]) });
