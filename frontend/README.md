# ORIS FORMATION Manager - Spécifications & MVP

## Résumé Produit
Application web de gestion administrative pour ORIS FORMATION, spécialisée dans les réseaux électriques.
Permet de gérer le cycle de vie complet : Prospect -> Devis -> Session -> Facture.
Optimisée pour la conformité française (TVA, Mentions légales, Numérotation) et la rapidité d'exécution (Devis en 2 min).

## Fonctionnalités MVP (Implémentées)
1. **Tableau de bord** : Vue synthétique du CA et actions rapides.
2. **Catalogue** : Liste des formations (Habilitation, TST, etc.) avec prix et durées.
3. **Devis** :
   - Création rapide avec autocomplétion depuis le catalogue.
   - Calcul automatique HT/TVA/TTC.
   - Génération PDF (Aperçu avant impression) conforme A4.
4. **Navigation** : Structure complète de l'application.

## Règles Métier (Intégrées)
- **TVA** : Gérée par ligne (20%, 10%, 0% pour exonération).
- **Numérotation** : Format `DEV-YYYY-XXX` (simulé).
- **Mentions légales** : Pied de page PDF avec SIRET, TVA Intracom, et mention organisme de formation.

## Backlog (V1 & V2)
- **V1 (Prochain sprint)** :
  - Module Clients complet (CRUD).
  - Conversion Devis -> Facture en 1 clic.
  - Gestion des statuts (Workflow).
- **V2 (Avancé)** :
  - Export comptable CSV.
  - Signature électronique.
  - Connecteur Chorus Pro.
  - Planning interactif des sessions (Drag & Drop).

## Stack Technique
- React 18 + TypeScript
- Tailwind CSS (Styling)
- Lucide React (Icônes)
- Recharts (Graphiques)
- Impression native navigateur (CSS `@media print`) pour une fiabilité maximale sans dépendances lourdes.
