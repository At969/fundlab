-- Informations de livraison et moyen de paiement (mobile money) sur les commandes.
-- À exécuter une fois dans l'éditeur SQL de Supabase sur une base créée avant cette évolution.
-- Sans effet si elle est relancée. Rien n'est supprimé : la version précédente de l'application
-- continue de fonctionner (elle appelle create_order avec deux arguments, conservée ici ;
-- 005 la supprime après le déploiement).

alter table orders
  add column if not exists delivery_name text,
  add column if not exists delivery_phone text,
  add column if not exists delivery_address text,
  add column if not exists delivery_city text,
  add column if not exists delivery_notes text,
  add column if not exists payment_method text;

-- Même fonction qu'avant, avec les informations de livraison en plus.
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

-- Force PostgREST (l'API de Supabase) à relire le schéma tout de suite.
notify pgrst, 'reload schema';
