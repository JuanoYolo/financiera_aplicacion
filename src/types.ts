export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'other'

export interface Account {
  id: string
  name: string
  type: AccountType
  provider?: string
  balance: number
  isExempt4x1000?: boolean
  createdAt: string
}

export type TxKind = 'income' | 'expense' | 'transfer' | 'fee'

export interface Transaction {
  id: string
  accountId: string
  kind: TxKind
  amount: number
  date: string
  categoryId?: string
  note?: string
  linkId?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  emoji?: string
  createdAt: string
}