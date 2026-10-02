-- Schéma de la base (Postgres / Supabase).
-- À exécuter une fois dans l'éditeur SQL de Supabase, puis seed.sql.
--
-- Montants : les colonnes *_cents contiennent le montant dans la plus petite unité de la devise.
-- La boutique est en francs CFA (XOF), qui n'a pas de sous-unité : 1500 = 1 500 F CFA.

create extension if not exists pgcrypto;

create type user_role as enum ('customer', 'admin');
create type order_status as enum ('pending', 'paid', 'preparing', 'delivered', 'cancelled');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  -- Facultative : sert à filtrer le catalogue.
  category text,
  price_cents integer not null check (price_cents >= 0),
  -- Liste ordonnée d'URL ; la première est l'image principale.
  image_urls text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  status order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  -- Opérateur de mobile money choisi au paiement (simulé).
  payment_method text,
  delivery_name text,
  delivery_phone text,
  delivery_address text,
  delivery_city text,
  delivery_notes text
);

create index orders_user_id_idx on orders (user_id, created_at desc);

-- Le nom et le prix sont copiés au moment de la commande :
-- l'historique reste exact même si le produit change ensuite.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on order_items (order_id);

-- L'application n'accède à la base que depuis le serveur avec la clé service_role.
-- RLS activé sans aucune policy : la clé publique (anon) ne peut rien lire ni écrire.
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Création atomique d'une commande : les prix viennent de la base (jamais du client),
-- le stock est vérifié et décrémenté dans la même transaction.
-- p_items : [{"product_id": "<uuid>", "quantity": 2}, ...]
-- p_delivery : {"name": "...", "phone": "...", "address": "...", "city": "...", "notes": "..."}
create or replace function create_order(p_user_id uuid, p_items jsonb, p_delivery jsonb)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_total integer := 0;
  v_item record;
  v_product products%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  insert into orders (
    user_id, total_cents,
    delivery_name, delivery_phone, delivery_address, delivery_city, delivery_notes
  )
  values (
    p_user_id, 0,
    p_delivery ->> 'name', p_delivery ->> 'phone', p_delivery ->> 'address',
    p_delivery ->> 'city', nullif(p_delivery ->> 'notes', '')
  )
  returning id into v_order_id;

  -- Quantités regroupées par produit, verrouillage dans un ordre stable (évite les deadlocks).
  for v_item in
    select (i ->> 'product_id')::uuid as product_id, sum((i ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as i
    group by 1
    order by 1
  loop
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select * into v_product from products where id = v_item.product_id and is_active for update;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND:%', v_item.product_id;
    end if;
    if v_product.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK:%', v_product.name;
    end if;

    update products set stock = stock - v_item.quantity where id = v_product.id;

    insert into order_items (order_id, product_id, product_name, unit_price_cents, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price_cents, v_item.quantity);

    v_total := v_total + v_product.price_cents * v_item.quantity;
  end loop;

  update orders set total_cents = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

revoke execute on function create_order(uuid, jsonb, jsonb) from public, anon, authenticated;
