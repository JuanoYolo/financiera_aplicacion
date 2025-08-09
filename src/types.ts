// src/types.ts
export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'other'

export type TransactionKind =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'fee'
  | 'card_charge'    // compra TDC (aumenta deuda, +)
  | 'card_payment'   // pago TDC (disminuye deuda, -)

export type TxStatus = 'pending' | 'posted' | 'reversed'

export interface Account {
  id: string
  name: string
  type: AccountType
  provider?: string
  isExempt4x1000?: boolean
  balance: number            // Para TDC: DEUDA inicial
  createdAt: string

  // Solo aplica cuando type === 'credit_card'
  creditLimit?: number       // cupo total
  cutoffDay?: number         // día de corte (1-28)
  dueDay?: number            // día de pago (1-28)
  aprAnnual?: number         // tasa efectiva anual (opcional)
}

export interface Transaction {
  id: string
  accountId: string
  kind: TransactionKind
  amount: number             // Para TDC: card_charge +; card_payment -
  date: string               // YYYY-MM-DD
  categoryId?: string
  note?: string
  linkId?: string
  createdAt: string

  // Para TDC (opcional en cualquier tx)
  status?: TxStatus          // pending/posted/reversed (solo usamos en card_charge)
  merchant?: string
  authCode?: string
  isSubscription?: boolean
}

export interface Category {
  id: string
  name: string
  emoji?: string
}