-- Supprime l'ancien libellé products.category, remplacé par products.category_id (voir 007).
-- À exécuter une fois la version de l'application qui utilise la table categories déployée.

alter table products drop column if exists category;

notify pgrst, 'reload schema';
