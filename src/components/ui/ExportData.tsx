import React from 'react'
import useAppStore from '../../store'
import { toCSV } from '../../lib/csv'
import dayjs from 'dayjs'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportData() {
  const { accounts, transactions, categories, getAccountBalance } = useAppStore()
  const ts = dayjs().format('YYYYMMDD_HHmm')

  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
      categories
    }
    download(`finanjuano_backup_${ts}.json`, JSON.stringify(data, null, 2), 'application/json')
  }

  const handleExportTxCSV = () => {
    const rows = transactions.map(t => ({
      id: t.id,
      date: t.date,
      kind: t.kind,
      amount: t.amount,
      accountId: t.accountId,
      categoryId: t.categoryId ?? '',
      note: t.note ?? '',
      linkId: t.linkId ?? ''
    }))
    download(`transactions_${ts}.csv`, toCSV(rows), 'text/csv')
  }

  const handleExportAccCSV = () => {
    const rows = accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      provider: a.provider ?? '',
      isExempt4x1000: a.isExempt4x1000 ? 1 : 0,
      initial_balance: a.balance ?? 0,
      current_balance: getAccountBalance(a.id)
    }))
    download(`accounts_${ts}.csv`, toCSV(rows), 'text/csv')
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Exportar / Backup</h3>
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded-xl border" onClick={handleExportJSON}>
          Exportar JSON (todo)
        </button>
        <button className="px-3 py-2 rounded-xl border" onClick={handleExportTxCSV}>
          CSV — Transacciones
        </button>
        <button className="px-3 py-2 rounded-xl border" onClick={handleExportAccCSV}>
          CSV — Cuentas
        </button>
      </div>
      <p className="text-xs text-gray-500">El JSON sirve como backup completo; los CSVs son para análisis.</p>
    </div>
  )
}
