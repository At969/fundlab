-- Catégorie des produits, pour filtrer le catalogue. Facultative : un produit sans
-- catégorie n'apparaît que sous « Tous ».
-- À exécuter une fois dans l'éditeur SQL de Supabase sur une base créée avant cette évolution.
-- Sans effet si elle est relancée ; rien n'est supprimé.

alter table products add column if not exists category text;

-- Force PostgREST (l'API de Supabase) à relire le schéma tout de suite.
notify pgrst, 'reload schema';
