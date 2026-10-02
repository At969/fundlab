import { z } from "zod";
import { MAX_PRODUCT_IMAGES, ORDER_STATUSES } from "@/lib/types";

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

export const createOrderSchema = z.object({
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

// Paiement simulé : seul le format est contrôlé, rien n'est conservé ni transmis.
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{16}$/, { error: "Le numéro de carte doit contenir 16 chiffres." })),
  expiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { error: "Format attendu : MM/AA." }),
  cvc: z.string().trim().regex(/^\d{3}$/, { error: "Le code doit contenir 3 chiffres." }),
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
