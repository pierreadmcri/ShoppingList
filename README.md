# MaCourseList

Application de gestion de liste de courses avec validation en direct.

## Stack technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Base de données** : Supabase (PostgreSQL gratuit)
- **Icônes** : Lucide React
- **Déploiement** : Vercel

## Fonctionnalités

- Ajouter des articles avec quantité et catégorie
- Cocher les articles au fur et à mesure en magasin
- Valider les achats (déplace dans l'historique)
- Historique des derniers achats
- Top 20 des articles les plus achetés (ajout rapide en un clic)
- Mise à jour en temps réel (multi-appareils via Supabase Realtime)

## Installation

1. Cloner le repo et installer les dépendances :
```bash
npm install
```

2. Créer un projet sur [supabase.com](https://supabase.com) (gratuit)

3. Exécuter le schéma SQL dans l'éditeur SQL de Supabase :
```sql
-- Copier le contenu de supabase-schema.sql
```

4. Copier `.env.local.example` vers `.env.local` et remplir les valeurs :
```bash
cp .env.local.example .env.local
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

## Déploiement sur Vercel

1. Connecter le repo GitHub à Vercel
2. Ajouter les variables d'environnement Supabase dans les settings Vercel
3. Déployer
