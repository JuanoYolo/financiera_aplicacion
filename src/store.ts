import { create } from 'zustand'
import { db, ensureSeed } from './db'
import type { Account, Transaction, Category } from './types'

type State = {
  ready: boolean
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]
  loadAll: () => Promise<void>
  addAccount: (a: Omit<Account, 'id' | 'createdAt' | 'balance'>) => Promise<Account>
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>
}

const useAppStore = create<State>((set, get) => ({
  ready: false,
  accounts: [],
  transactions: [],
  categories: [],

  loadAll: async () => {
    await ensureSeed()
    const [accounts, transactions, categories] = await Promise.all([
      db.accounts.toArray(),
      db.transactions.orderBy('date').reverse().toArray(),
      db.categories.toArray()
    ])
    set({ accounts, transactions, categories, ready: true })
  },

  addAccount: async (a) => {
    const acc: Account = {
      id: crypto.randomUUID(),
      name: a.name,
      type: a.type,
      provider: a.provider,
      isExempt4x1000: a.isExempt4x1000 ?? false,
      balance: 0,
      createdAt: new Date().toISOString()
    }
    await db.accounts.add(acc)
    set({ accounts: [...get().accounts, acc] })
    return acc
  },

  addTransaction: async (t) => {
    const tx: Transaction = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...t }
    await db.transactions.add(tx)
    set({ transactions: [tx, ...get().transactions] })
    return tx
  }
}))

export default useAppStore
