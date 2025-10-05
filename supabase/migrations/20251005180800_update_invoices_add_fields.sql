/*
  # Mise à jour du schéma de facturation

  1. Modifications
    - Ajout de champs pour informations complètes de l'émetteur (prénom, nom, téléphone)
    - Ajout de champs pour téléphone client
    - Ajout de champ pour détails supplémentaires par ligne
    - Ajout de champs pour informations de paiement (IBAN, BIC, banque)
    - Ajout de champ pour instructions de paiement
    - Ajout de champs SIREN, APE pour entreprise
*/

-- Ajout des nouveaux champs à la table invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_first_name'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_last_name'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_phone'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_siren'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_siren text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_ape'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_ape text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'client_phone'
  ) THEN
    ALTER TABLE invoices ADD COLUMN client_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE invoices ADD COLUMN bank_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'bank_iban'
  ) THEN
    ALTER TABLE invoices ADD COLUMN bank_iban text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'bank_bic'
  ) THEN
    ALTER TABLE invoices ADD COLUMN bank_bic text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_instructions'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_instructions text;
  END IF;
END $$;

-- Ajout du champ details pour les items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_items' AND column_name = 'details'
  ) THEN
    ALTER TABLE invoice_items ADD COLUMN details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_items' AND column_name = 'item_date'
  ) THEN
    ALTER TABLE invoice_items ADD COLUMN item_date date;
  END IF;
END $$;