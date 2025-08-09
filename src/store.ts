// src/store.ts
import { create } from 'zustand'
import { db, ensureSeed } from './db'
import type { Account, Transaction, Category } from './types'
import { gmfFee } from './lib/gmf'

type State = {
  ready: boolean
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]

  loadAll: () => Promise<void>

  // ahora permitimos pasar balance (saldo inicial)
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Promise<Account>
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>

  createTransfer: (p: {
    fromAccountId: string
    toAccountId: string
    amount: number
    dateISO: string
    note?: string
  }) => Promise<{ fee: number, linkId: string }>

  // NUEVO: saldo actual derivado
  getAccountBalance: (accountId: string) => number
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
      createdAt: new Date().toISOString(),
      balance: a.balance ?? 0, // saldo inicial
      ...a
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
  },

  createTransfer: async ({ fromAccountId, toAccountId, amount, dateISO, note }) => {
    if (fromAccountId === toAccountId) throw new Error('Las cuentas deben ser distintas')

    const { accounts } = get()
    const fromAcc = accounts.find(a => a.id === fromAccountId)
    const toAcc   = accounts.find(a => a.id === toAccountId)
    if (!fromAcc || !toAcc) throw new Error('Cuenta no encontrada')

    const linkId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const fee = gmfFee(amount, fromAcc.isExempt4x1000)

    const outTx: Transaction = {
      id: crypto.randomUUID(),
      accountId: fromAccountId,
      kind: 'transfer',
      amount: -Math.abs(amount),
      date: dateISO,
      note,
      linkId,
      createdAt
    }

    const inTx: Transaction = {
      id: crypto.randomUUID(),
      accountId: toAccountId,
      kind: 'transfer',
      amount: Math.abs(amount),
      date: dateISO,
      note,
      linkId,
      createdAt
    }

    const feeTx: Transaction | null = fee > 0 ? {
      id: crypto.randomUUID(),
      accountId: fromAccountId,
      kind: 'fee',
      amount: -fee,
      date: dateISO,
      categoryId: 'cat-fees',
      note: 'GMF 4×1000',
      linkId,
      createdAt
    } : null

    await db.transaction('rw', db.transactions, async () => {
      const list = feeTx ? [outTx, inTx, feeTx] : [outTx, inTx]
      await db.transactions.bulkAdd(list)
    })

    set({ transactions: feeTx ? [outTx, inTx, feeTx, ...get().transactions] : [outTx, inTx, ...get().transactions] })
    return { fee, linkId }
  },

  getAccountBalance: (accountId) => {
    const acc = get().accounts.find(a => a.id === accountId)
    if (!acc) return 0
    const inicial = acc.balance ?? 0
    const movs = get().transactions.filter(t => t.accountId === accountId)
    const delta = movs.reduce((s, t) => s + t.amount, 0)
    return inicial + delta
  }
}))

export default useAppStore
