// src/types/financial.ts

/**
 * Categorías disponibles para transacciones de gasto.
 */
export type Category = 'Comida' | 'Transporte' | 'Ocio' | 'Otros';

/**
 * Tipos de cuenta disponibles.
 */
export type AccountType = 'savings' | 'checking' | 'credit';

/**
 * Interfaz que describe una cuenta financiera.
 */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  cutoffDay?: number;
  paymentDay?: number;
  exemptFrom4x1000: boolean;
  createdAt: Date;
}

/**
 * Tipos de transacción disponibles.
 */
export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Interfaz que describe una transacción financiera.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  destinationAccountId?: string;
  category?: Category;
  description: string;
  date: Date;
  exemptFrom4x1000: boolean;
  tax4x1000?: number;
  createdAt: Date;
}

