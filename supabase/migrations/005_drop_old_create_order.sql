-- Supprime l'ancienne version de create_order (sans informations de livraison), remplacée en 004.
-- À exécuter une fois la version de l'application qui envoie les informations de livraison déployée.

drop function if exists create_order(uuid, jsonb);

notify pgrst, 'reload schema';
