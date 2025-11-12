/**
 * Script de migration (squelette)
 *
 * Usage:
 * 1) Exportez vos données Supabase (table invoices, items, etc.) en JSON.
 *    Placez les fichiers sous `scripts/export/` (ex: invoices.json, items.json).
 * 2) Générez une clé de service Firebase (Project Settings > Service accounts)
 *    et placez-la en `scripts/serviceAccountKey.json` (NE PAS committer).
 * 3) Installez les dépendances: `npm install firebase-admin` puis lancez:
 *    node ./scripts/migrate_supabase_to_firestore.js
 *
 * Attention: ce script utilise l'Admin SDK et écrit directement dans Firestore.
 * Testez d'abord sur un projet Firebase de développement.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json introuvable dans scripts/. Placez la clé de service et réessayez.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateCollection(fileName, collectionName, transformFn) {
  const filePath = path.join(__dirname, 'export', fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Fichier d'export non trouvé: ${filePath} — saut de ${collectionName}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const docs = JSON.parse(raw);

  console.log(`Migration de ${docs.length} documents vers ${collectionName}...`);
  for (const doc of docs) {
    // Utilisez legacy id si vous voulez conserver l'ID d'origine
    const id = doc.id ? String(doc.id) : undefined;
    const payload = transformFn ? transformFn(doc) : doc;
    if (id) {
      await db.collection(collectionName).doc(id).set(payload);
    } else {
      await db.collection(collectionName).add(payload);
    }
  }
  console.log(`Terminé: ${collectionName}`);
}

(async function run() {
  try {
    // Exemple: migrer invoices
    await migrateCollection('invoices.json', 'invoices', (d) => ({
      ...d,
      // convert date strings to Firestore Timestamp if needed
      createdAt: d.created_at ? new Date(d.created_at) : new Date(),
      updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
      legacyId: d.id,
    }));

    // Exemple: migrer items
    await migrateCollection('items.json', 'invoice_items', (d) => ({
      ...d,
      legacyId: d.id,
    }));

    console.log('Migration terminée. Vérifiez Firestore pour valider.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur de migration:', err);
    process.exit(2);
  }
})();
