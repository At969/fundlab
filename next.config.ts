import type { NextConfig } from "next";

// Seules les images du bucket public « product-images » de notre projet Supabase sont autorisées.
const supabaseUrl = process.env.SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [new URL("/storage/v1/object/public/product-images/**", supabaseUrl)]
      : [],
  },
};

export default nextConfig;
