import React from 'react'
import useAppStore from '../store'
import NewTransactionForm from '../components/ui/NewTransactionForm'

export default function TransactionsPage() {
  const transactions = useAppStore(s => s.transactions)

  return (
    <section className="p-3 rounded-2xl border">
      <h2 className="font-semibold mb-2">Nueva transacción</h2>
      <NewTransactionForm />

      <h3 className="font-semibold mt-4">Últimas</h3>
      <ul className="mt-2 space-y-1">
        {transactions.slice(0, 20).map(t => (
          <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
            {t.date} — {t.kind} — {t.amount.toLocaleString('es-CO',{style:'currency',currency:'COP'})} {t.note ?? ''}
          </li>
        ))}
        {transactions.length === 0 && <li className="text-sm text-gray-500">Aún no hay transacciones.</li>}
      </ul>
    </section>
  )
}
