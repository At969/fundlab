import { z } from "zod";

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
