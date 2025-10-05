import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Invoice = {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_phone?: string;
  company_name: string;
  company_first_name?: string;
  company_last_name?: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
  company_siren?: string;
  company_ape?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_bic?: string;
  payment_instructions?: string;
  notes?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  item_date?: string;
  details?: string;
  created_at: string;
};
