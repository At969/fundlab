# FUNDLABSHOP

Mini-application de gestion de commandes pour un petit commerce, réalisée pour le test technique FUND.lab Challenge.

- **Application en ligne** : https://fundlabshop.vercel.app
- **Dépôt** : https://github.com/At969/fundlab

## Fonctionnalités

**Boutique (visiteur et client)**

- Page d'accueil : carrousel (présentation de la boutique, puis produits à la une), sélection de produits, avantages et étapes de commande.
- Catalogue chargé depuis la base, avec photo, prix et stock.
- Recherche instantanée dans le catalogue, insensible aux accents et à la casse, reprise dans l'URL (`/products?q=…`).
- Fiche détaillée par produit, avec galerie de photos.
- Panier : ajout, changement de quantité, suppression, total recalculé à chaque modification. Il est conservé dans le navigateur et limité au stock disponible.
- Panier flottant en bas d'écran et icône dans l'en-tête, avec le nombre d'articles et le montant.
- Inscription (avec confirmation du mot de passe), connexion et déconnexion.
- Validation de commande avec les informations de livraison (destinataire, téléphone, adresse, ville, instructions).
- Paiement par mobile money simulé (MTN Mobile Money, Moov Money) : aucun compte n'est débité, le numéro n'est pas enregistré.
- Historique des commandes, avec leur statut, l'adresse de livraison et le moyen de paiement.

**Administration (compte administrateur)**

- Tableau de bord : chiffre d'affaires encaissé, commandes à traiter, clients inscrits, stock faible.
- Produits : création, modification, jusqu'à six images par produit, masquage, suppression.
- Commandes : liste complète avec le client et l'adresse de livraison, changement de statut.
- Utilisateurs : liste et changement de rôle.

Les deux espaces sont étanches : un administrateur gère la plateforme et n'a ni panier ni commandes ; un client n'a pas accès à l'administration.

**Interface**

- Adaptée aux téléphones : menu déroulant, deux produits par ligne, tableaux de l'administration affichés en cartes.
- Animations d'entrée, d'apparition au défilement et de survol, désactivées pour les visiteurs qui ont choisi de réduire les animations.
- Couleurs reprises du logo FUND.lab (bleu marine et cyan).

**Adaptation au Bénin**

- Prix en francs CFA (XOF).
- Numéros de téléphone à 10 chiffres commençant par 01, indicatif +229 facultatif.
- Dates affichées à l'heure du Bénin (GMT+1).

## Stack

| Besoin | Choix |
|---|---|
| Framework | Next.js 16 (App Router) et TypeScript : front-end et API dans un seul projet, déployé sur Vercel |
| Base de données | Postgres hébergé par Supabase, interrogé uniquement depuis le serveur |
| Images | Supabase Storage (bucket public `product-images`) |
| Authentification | Faite maison : `bcryptjs` pour les mots de passe, JWT signé (`jose`) dans un cookie `httpOnly` |
| Validation | Zod, sur toutes les entrées des routes API |
| État du panier | Zustand, persisté dans le `localStorage` |
| Styles | Tailwind CSS ; animations en CSS, sans bibliothèque dédiée |

## Architecture

```
src/
├── app/
│   ├── (auth)/            pages de connexion et d'inscription
│   ├── admin/             espace d'administration
│   ├── api/               routes API (auth, products, orders, admin/*)
│   ├── cart/ checkout/ orders/   parcours client
│   ├── products/          catalogue, recherche et fiche produit
│   └── page.tsx           page d'accueil
├── components/            composants d'interface (admin/ pour l'administration)
├── lib/                   logique serveur : accès aux données, session, validation
├── store/cart.ts          store Zustand du panier
└── proxy.ts               redirection des visiteurs non connectés (ex-middleware)
public/                    logo
supabase/                  schéma SQL, jeu de données et scripts de mise à niveau (migrations/)
scripts/                   création d'un administrateur, création du bucket d'images
```

Les pages sont rendues côté serveur et lisent la base directement via `src/lib`. Les composants interactifs (panier, formulaires, administration) passent par les routes API.

### API

| Route | Méthodes | Accès |
|---|---|---|
| `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | POST, POST, POST, GET | public |
| `/api/products`, `/api/products/[id]` | GET | public |
| `/api/orders` | GET, POST | client |
| `/api/orders/[id]` | GET | client (ses commandes uniquement) |
| `/api/orders/[id]/pay` | POST | client |
| `/api/admin/products`, `/api/admin/products/[id]` | GET, POST, PATCH, DELETE | administrateur |
| `/api/admin/uploads` | POST | administrateur |
| `/api/admin/orders`, `/api/admin/orders/[id]` | GET, PATCH | administrateur |
| `/api/admin/users`, `/api/admin/users/[id]` | GET, PATCH | administrateur |

Toutes les erreurs ont le même format :

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "delivery.phone": ["…"] } } }
```

`fields` n'est présent que pour les erreurs de validation ; chaque clé est le chemin du champ en cause.

## Sécurité

- **Mots de passe** hachés avec bcrypt ; la connexion renvoie le même message et prend le même temps que l'e-mail existe ou non.
- **Session** : JWT dans un cookie `httpOnly`, `Secure`, `SameSite=lax`. Le cookie identifie l'utilisateur ; son rôle est relu en base à chaque requête, donc un changement de rôle s'applique immédiatement.
- **Autorisations** vérifiées dans chaque route API et chaque page, pas seulement dans `proxy.ts`. Le rôle ne peut pas être choisi à l'inscription.
- **Commandes** : le navigateur n'envoie que des identifiants et des quantités. La fonction SQL `create_order` lit les prix en base, vérifie le stock et le décrémente dans une seule transaction.
- **Cloisonnement** : un client ne peut lire ou payer que ses propres commandes (celle d'un autre renvoie 404).
- **Paiement** : le numéro mobile money est seulement validé ; seul l'opérateur choisi est enregistré sur la commande. Une commande ne peut être payée qu'une fois.
- **Images** : type vérifié sur le contenu du fichier (JPEG, PNG, WebP), 2 Mo maximum, nom généré par le serveur. Un produit n'accepte que des images du bucket du projet, supprimées du stockage quand elles ne servent plus.
- **Base** : RLS activé sans règle sur toutes les tables ; seule la clé `service_role`, présente uniquement côté serveur, y accède.

## Installation locale

Prérequis : Node.js 20.9 ou plus récent, et un projet [Supabase](https://supabase.com).

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Dans l'éditeur SQL de Supabase, exécuter `supabase/schema.sql`, puis `supabase/seed.sql` (douze produits de démonstration). Le dossier `supabase/migrations/` ne sert qu'à mettre à niveau une base créée avec une version antérieure du schéma.

3. Copier `.env.example` en `.env.local` et renseigner les trois variables :

   | Variable | Rôle |
   |---|---|
   | `SUPABASE_URL` | URL du projet Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (ne jamais l'exposer côté navigateur) |
   | `JWT_SECRET` | secret de signature des sessions, 32 caractères minimum |

4. Créer le bucket des images, puis un compte administrateur :

   ```bash
   npm run setup-storage
   npm run create-admin
   ```

5. Lancer l'application sur http://localhost:3000 :

   ```bash
   npm run dev
   ```

## Déploiement

Le dépôt est relié à Vercel : chaque push sur `main` déclenche un déploiement. Les trois variables d'environnement ci-dessus doivent être définies dans le projet Vercel.

## Limites connues

- Le paiement mobile money est une simulation : aucun opérateur n'est appelé.
- Annuler une commande ne remet pas les articles en stock.
- L'administrateur peut passer une commande d'un statut à n'importe quel autre, sans ordre imposé.
- La recherche filtre dans le navigateur les produits déjà chargés : adaptée à un petit catalogue, elle demanderait une recherche côté serveur et une pagination au-delà.
- Les numéros de téléphone sont validés au seul format béninois.
- Pas de tests automatisés ; les routes ont été vérifiées manuellement, et l'affichage mobile dans un navigateur d'ordinateur, pas sur un téléphone réel.
- Les montants sont stockés en francs CFA entiers dans des colonnes nommées `*_cents` (plus petite unité de la devise).
