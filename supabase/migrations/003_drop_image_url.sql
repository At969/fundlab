-- Supprime l'ancienne colonne image_url, remplacée par image_urls (voir 002).
-- À exécuter une fois la version de l'application qui utilise image_urls déployée.

alter table products drop column if exists image_url;

notify pgrst, 'reload schema';
