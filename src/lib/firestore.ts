import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Invoice {
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
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  item_date?: string;
  details?: string;
  created_at: string;
}

// Invoices collection operations
export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'invoices'), {
    ...invoiceData,
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const q = query(collection(db, 'invoices'), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Invoice));
};

export const getInvoice = async (id: string): Promise<Invoice | null> => {
  const docRef = doc(db, 'invoices', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Invoice;
  }
  return null;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<void> => {
  const docRef = doc(db, 'invoices', id);
  await updateDoc(docRef, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
};

// Invoice Items collection operations
export const createInvoiceItem = async (itemData: Omit<InvoiceItem, 'id' | 'created_at'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'invoice_items'), {
    ...itemData,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
};

export const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  const q = query(collection(db, 'invoice_items'), where('invoice_id', '==', invoiceId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as InvoiceItem));
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const docRef = doc(db, 'invoices', id);
  await deleteDoc(docRef);
};

export const deleteInvoiceItems = async (invoiceId: string): Promise<void> => {
  const q = query(collection(db, 'invoice_items'), where('invoice_id', '==', invoiceId));
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};
