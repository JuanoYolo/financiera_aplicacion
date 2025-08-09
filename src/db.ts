import Dexie, { Table } from 'dexie'
import { Account, Transaction, Category } from './types'

export class AppDB extends Dexie {
  accounts!: Table<Account, string>
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>

  constructor() {
    super('finanjuano')
    this.version(1).stores({
      accounts: 'id, name, type, createdAt',
      transactions: 'id, accountId, date, kind, linkId, createdAt',
      categories: 'id, name'
    })
  }
}
export const db = new AppDB()

export async function ensureSeed() {
  const count = await db.categories.count()
  if (count === 0) {
    const now = new Date().toISOString()
    await db.categories.bulkAdd([
      { id: 'cat-food', name: 'Alimentación', emoji: '🍽️', createdAt: now },
      { id: 'cat-transport', name: 'Transporte', emoji: '🚌', createdAt: now },
      { id: 'cat-fees', name: 'Comisiones / GMF', emoji: '🏦', createdAt: now }
    ])
  }
}