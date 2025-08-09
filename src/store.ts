import { create } from 'zustand'
import { db, ensureSeed } from './db'
import type { Account, Transaction, Category, TxStatus } from './types'
import { gmfFee } from './lib/gmf'
import dayjs from './lib/dayjs'
import { lastStatementRange } from './lib/card'

type State = {
  ready: boolean
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]

  loadAll: () => Promise<void>

  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Promise<Account>
  updateAccount: (id: string, patch: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>
  reconcileAccountBalance: (id: string, targetCurrentBalance: number) => Promise<void>

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>
  createTransfer: (p: {
    fromAccountId: string
    toAccountId: string
    amount: number
    dateISO: string
    note?: string
  }) => Promise<{ fee: number, linkId: string }>

  // TDC
  addCreditCard: (p: {
    name: string; provider?: string; creditLimit: number; cutoffDay: number; dueDay: number; aprAnnual?: number
  }) => Promise<Account>

  addCardCharge: (p: {
    cardAccountId: string; amount: number; dateISO: string; merchant?: string; note?: string;
    isSubscription?: boolean; status?: TxStatus; allowOverLimit?: boolean
  }) => Promise<Transaction>

  setCardChargeStatus: (chargeId: string, status: TxStatus) => Promise<void>

  payCard: (p: {
    cardAccountId: string; amount: number; dateISO: string; note?: string;
    fromAccountId?: string; cash?: boolean
  }) => Promise<void>

  getAccountBalance: (accountId: string) => number
  statementToAvoidInterest: (cardAccountId: string) => number
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
      balance: a.balance ?? 0,
      ...a
    }
    await db.accounts.add(acc)
    set({ accounts: [...get().accounts, acc] })
    return acc
  },

  updateAccount: async (id, patch) => {
    await db.accounts.update(id, patch)
    set({ accounts: get().accounts.map(a => a.id === id ? { ...a, ...patch } : a) })
  },

  reconcileAccountBalance: async (id, targetCurrentBalance) => {
    const acc = get().accounts.find(a => a.id === id)
    if (!acc) return
    const deltaMovs = get().transactions
      .filter(t => t.accountId === id)
      .filter(t => !t.status || t.status === 'posted') // ignorar pending/reversed
      .reduce((s, t) => s + t.amount, 0)
    const newInitial = targetCurrentBalance - deltaMovs
    await db.accounts.update(id, { balance: newInitial })
    set({ accounts: get().accounts.map(a => a.id === id ? { ...a, balance: newInitial } : a) })
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

  // --------- TDC ----------
  addCreditCard: async ({ name, provider, creditLimit, cutoffDay, dueDay, aprAnnual }) => {
    const acc = await get().addAccount({
      name, provider, type: 'credit_card',
      balance: 0, creditLimit, cutoffDay, dueDay, aprAnnual
    })
    return acc
  },

  addCardCharge: async ({ cardAccountId, amount, dateISO, merchant, note, isSubscription, status = 'pending', allowOverLimit }) => {
    const acc = get().accounts.find(a => a.id === cardAccountId)
    if (!acc) throw new Error('Tarjeta no encontrada')
    const limit = acc.creditLimit ?? 0

    // deuda confirmada
    const confirmedDebt = get().getAccountBalance(cardAccountId)
    // pendientes (solo charges pendientes)
    const pending = get().transactions
      .filter(t => t.accountId === cardAccountId && t.kind === 'card_charge' && t.status === 'pending')
      .reduce((s, t) => s + t.amount, 0)

    const available = Math.max(limit - (confirmedDebt + pending), 0)
    if (limit > 0 && amount > available && !allowOverLimit) {
      const err: any = new Error('La compra excede el cupo disponible')
      err.code = 'OVER_LIMIT'
      err.limit = limit
      err.available = available
      err.debt = confirmedDebt
      throw err
    }

    const tx = await get().addTransaction({
      accountId: cardAccountId,
      kind: 'card_charge',
      amount: Math.abs(amount),
      date: dateISO,
      note: note ?? merchant,
      merchant,
      isSubscription,
      status
    })
    return tx
  },

  setCardChargeStatus: async (chargeId, status) => {
    await db.transactions.update(chargeId, { status })
    set({ transactions: get().transactions.map(t => t.id === chargeId ? { ...t, status } : t) })
  },

  payCard: async ({ cardAccountId, amount, dateISO, note, fromAccountId, cash }) => {
    if (!fromAccountId && !cash) throw new Error('Indica desde qué cuenta o efectivo')
    const linkId = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    const cardTx: Transaction = {
      id: crypto.randomUUID(),
      accountId: cardAccountId,
      kind: 'card_payment',
      amount: -Math.abs(amount),
      date: dateISO,
      note: note ?? 'Pago tarjeta',
      linkId, createdAt
    }

    const outTx: Transaction | null = fromAccountId ? {
      id: crypto.randomUUID(),
      accountId: fromAccountId,
      kind: 'transfer',
      amount: -Math.abs(amount),
      date: dateISO,
      note: note ?? 'Pago TDC',
      linkId, createdAt
    } : null

    const list = outTx ? [cardTx, outTx] : [cardTx]
    await db.transactions.bulkAdd(list)
    set({ transactions: [...list, ...get().transactions] })
  },

  getAccountBalance: (accountId) => {
    const acc = get().accounts.find(a => a.id === accountId)
    if (!acc) return 0
    const inicial = acc.balance ?? 0
    const delta = get().transactions
      .filter(t => t.accountId === accountId)
      .filter(t => !t.status || t.status === 'posted')
      .reduce((s, t) => s + t.amount, 0)
    return inicial + delta
  },

  statementToAvoidInterest: (cardAccountId) => {
    const acc = get().accounts.find(a => a.id === cardAccountId)
    if (!acc?.cutoffDay) return 0
    const range = lastStatementRange(acc.cutoffDay, dayjs())
    const tx = get().transactions.filter(t =>
      t.accountId === cardAccountId &&
      (!t.status || t.status === 'posted') &&
      dayjs(t.date).isSameOrAfter(range.start) &&
      dayjs(t.date).isSameOrBefore(range.end)
    )
    const charges = tx.filter(t => t.kind === 'card_charge').reduce((s, t) => s + t.amount, 0)
    const payments = tx.filter(t => t.kind === 'card_payment').reduce((s, t) => s + Math.abs(t.amount), 0)
    return Math.max(charges - payments, 0)
  }
}))

export default useAppStore
