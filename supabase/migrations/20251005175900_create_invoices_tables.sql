/*
  # Création du système de facturation

  1. Nouvelles Tables
    - `invoices`
      - `id` (uuid, clé primaire) - Identifiant unique de la facture
      - `invoice_number` (text) - Numéro de facture
      - `issue_date` (date) - Date d'émission
      - `due_date` (date) - Date d'échéance
      - `status` (text) - Statut (draft, sent, paid)
      - `client_name` (text) - Nom du client
      - `client_email` (text) - Email du client
      - `client_address` (text) - Adresse du client
      - `company_name` (text) - Nom de l'entreprise émettrice
      - `company_address` (text) - Adresse de l'entreprise
      - `company_email` (text) - Email de l'entreprise
      - `notes` (text) - Notes additionnelles
      - `subtotal` (decimal) - Sous-total
      - `tax_rate` (decimal) - Taux de taxe (%)
      - `tax_amount` (decimal) - Montant de la taxe
      - `total` (decimal) - Total TTC
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de modification
      
    - `invoice_items`
      - `id` (uuid, clé primaire) - Identifiant unique
      - `invoice_id` (uuid, foreign key) - Référence à la facture
      - `description` (text) - Description de l'article
      - `quantity` (decimal) - Quantité
      - `unit_price` (decimal) - Prix unitaire
      - `amount` (decimal) - Montant total de la ligne
      - `created_at` (timestamptz) - Date de création

  2. Sécurité
    - Activation de RLS sur les deux tables
    - Politiques publiques pour permettre la création et la lecture (application sans authentification)
*/

-- Création de la table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  client_name text NOT NULL,
  client_email text,
  client_address text,
  company_name text NOT NULL,
  company_address text,
  company_email text,
  notes text,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_rate decimal(5,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des lignes de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Activation de RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'accès public (application de démonstration)
CREATE POLICY "Allow public read access to invoices"
  ON invoices FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to invoices"
  ON invoices FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to invoices"
  ON invoices FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to invoice_items"
  ON invoice_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to invoice_items"
  ON invoice_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to invoice_items"
  ON invoice_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to invoice_items"
  ON invoice_items FOR DELETE
  USING (true);