export type Role = "customer" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
};
