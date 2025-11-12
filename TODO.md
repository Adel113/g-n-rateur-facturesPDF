# TODO: Améliorer la responsivité mobile du site

## Étapes à compléter

- [x] Améliorer la taille des boutons dans InvoiceForm.tsx (min 44px hauteur)
- [x] Ajuster les inputs et espacements dans InvoiceForm.tsx pour mobile
- [x] Optimiser les cartes dans InvoiceList.tsx pour mobile
- [x] Ajuster les espacements dans App.tsx pour mobile
- [ ] Tester la responsivité sur mobile

## Migration Supabase → Firebase

Checklist rapide:

- [ ] Créer un projet Firebase (console.firebase.google.com) — garder l'ID projet
- [ ] Créer une clé de service (Service accounts) et la placer dans `scripts/serviceAccountKey.json` (NE PAS committer)
- [ ] Ajouter les variables dans `.env` (voir `.env.example` pour les clés `VITE_FIREBASE_*`)
- [x] Ajouter `src/lib/firebase.ts` (initialiseur client) — déjà ajouté
- [x] Ajouter script `scripts/migrate_supabase_to_firestore.js` (squelette) — déjà ajouté
- [ ] Exporter vos tables Supabase en JSON et placer dans `scripts/export/` (ex: invoices.json, items.json)
- [ ] Installer `firebase-admin` (sur la machine où vous exécuterez la migration): `npm install firebase-admin`
- [ ] Exécuter la migration (sur un projet test d'abord): `node ./scripts/migrate_supabase_to_firestore.js`
- [ ] Adapter le code client (remplacer appels Supabase par Firestore / Firebase Auth)

Note: ce projet n'utilisera pas Firebase Storage — la migration/gestion des fichiers est ignorée par demande explicite.

Notes:
- Ne migrez pas directement en production sans tests — utilisez un projet Firebase de staging pour valider.
- Le script est un point de départ: adaptez les transformations (dates, relations) selon vos tables.

