-- Plusieurs images par produit : ajoute image_urls (liste ordonnée, la première est l'image
-- principale) et y reprend l'image unique de l'ancienne colonne image_url.
-- À exécuter une fois dans l'éditeur SQL de Supabase sur une base créée avant cette évolution.
-- Sans effet si elle est relancée. L'ancienne colonne est conservée pour que la version
-- précédente de l'application continue de fonctionner ; 003 la supprime après le déploiement.

alter table products add column if not exists image_urls text[] not null default '{}';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'image_url'
  ) then
    update products set image_urls = array[image_url]
    where image_url is not null and image_urls = '{}';
  end if;
end $$;

-- Force PostgREST (l'API de Supabase) à relire le schéma tout de suite.
notify pgrst, 'reload schema';
