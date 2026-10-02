// Crée le bucket public des images de produits dans Supabase Storage (à lancer une seule fois).
//
// Usage : npm run setup-storage
// Lit SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.

import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env.local.");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Lecture publique (les images s'affichent dans la boutique) ; l'écriture reste réservée
// à la clé service_role, donc à nos routes /api/admin.
const options = {
  public: true,
  fileSizeLimit: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};

const { data: existing } = await db.storage.getBucket(BUCKET);
const { error } = existing
  ? await db.storage.updateBucket(BUCKET, options)
  : await db.storage.createBucket(BUCKET, options);

if (error) {
  console.error(`Configuration du bucket impossible : ${error.message}`);
  process.exit(1);
}

console.log(`Bucket « ${BUCKET} » ${existing ? "mis à jour" : "créé"}.`);
