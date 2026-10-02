// Crée un compte administrateur, ou promeut un compte existant (son nom et son mot de passe sont alors remplacés).
//
// Usage : npm run create-admin -- <email> <nom> <mot de passe>
// Les arguments manquants sont demandés dans le terminal.
// Lit SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.

import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env.local.");
  process.exit(1);
}

const args = process.argv.slice(2);
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (label, value) => (value ?? (await rl.question(`${label} : `))).trim();

const email = (await ask("Adresse e-mail", args[0])).toLowerCase();
const name = await ask("Nom", args[1]);
const password = await ask("Mot de passe (8 caractères minimum)", args[2]);
rl.close();

const errors = [];
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Adresse e-mail invalide.");
if (name.length < 2) errors.push("Le nom doit contenir au moins 2 caractères.");
if (password.length < 8 || password.length > 72) errors.push("Le mot de passe doit contenir entre 8 et 72 caractères.");
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await db
  .from("users")
  .upsert(
    { email, name, password_hash: await bcrypt.hash(password, 12), role: "admin" },
    { onConflict: "email" },
  )
  .select("id, email, name, role")
  .single();

if (error) {
  console.error(`Création impossible : ${error.message}`);
  process.exit(1);
}

console.log(`Compte administrateur prêt : ${data.email} (${data.name})`);
