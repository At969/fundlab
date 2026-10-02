-- Catégories gérées par l'administrateur : table dédiée, référencée par les produits.
-- Remplace le libellé libre products.category (006).
-- À exécuter une fois dans l'éditeur SQL de Supabase sur une base créée avant cette évolution.
-- Sans effet si elle est relancée. L'ancienne colonne est conservée pour que la version
-- précédente de l'application continue de fonctionner ; 008 la supprime après le déploiement.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Deux catégories ne peuvent pas porter le même nom, à la casse près.
create unique index if not exists categories_name_key on categories (lower(name));

alter table categories enable row level security;

-- Un produit dont la catégorie est supprimée devient simplement « sans catégorie ».
alter table products
  add column if not exists category_id uuid references categories (id) on delete set null;

create index if not exists products_category_id_idx on products (category_id);

-- Reprise des libellés existants.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'category'
  ) then
    insert into categories (name)
    select distinct on (lower(trim(category))) trim(category)
    from products
    where category is not null and trim(category) <> ''
    on conflict do nothing;

    update products p
    set category_id = c.id
    from categories c
    where p.category_id is null and lower(trim(p.category)) = lower(c.name);
  end if;
end $$;

-- Force PostgREST (l'API de Supabase) à relire le schéma tout de suite.
notify pgrst, 'reload schema';
