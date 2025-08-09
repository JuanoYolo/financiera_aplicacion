import React from 'react'
import useAppStore from './store'
import GMF from './lib/gmf'
import NewTransactionForm from './components/ui/NewTransactionForm'
import NewTransferForm from './components/ui/NewTransferForm'
import NewAccountForm from './components/ui/NewAccountForm'

export default function App() {
  const { accounts, transactions, addAccount, getAccountBalance } = useAppStore()
  const hasAccounts = accounts.length > 0

  const handleCreateDemo = async () => {
    await addAccount({
      name: 'Bolsillo Principal',
      type: 'checking',
      provider: 'MiBanco',
      isExempt4x1000: false,
      balance: 0 // saldo inicial demo (puedes quitar el botón si quieres)
    })
  }

  // Demo 4×1000
  const brutoMax = GMF.grossFromNetAvailable(100000, false)
  const netoSale = GMF.netOut(brutoMax, false)

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">FinanJuano (MVP)</h1>

      {/* Cuentas */}
      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">Cuentas</h2>
        <button
          className="px-3 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-60"
          onClick={handleCreateDemo}
        >
          + Crear cuenta demo
        </button>

        {/* Form crear cuenta con saldo inicial */}
        <NewAccountForm />

        <ul className="mt-3 space-y-1">
          {accounts.map(a => (
            <li key={a.id} className="flex justify-between border rounded-xl px-3 py-2">
              <span>{a.name} — {a.type} {a.isExempt4x1000 ? '(Exenta GMF)' : ''}</span>
              <span>
                {getAccountBalance(a.id).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </span>
            </li>
          ))}
          {!hasAccounts && <li className="text-sm text-gray-500">No hay cuentas aún.</li>}
        </ul>
      </section>

      {/* Nueva transacción */}
      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">Nueva transacción</h2>
        <NewTransactionForm />

        <h3 className="font-semibold mt-4">Últimas</h3>
        <ul className="mt-2 space-y-1">
          {transactions.slice(0, 8).map(t => (
            <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
              {t.date} — {t.kind} — {t.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} {t.note ?? ''}
            </li>
          ))}
          {transactions.length === 0 && (
            <li className="text-sm text-gray-500">Aún no hay transacciones.</li>
          )}
        </ul>
      </section>

      {/* Transferencia */}
      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">Transferencia</h2>
        <NewTransferForm />
      </section>

      {/* 4×1000 rápido */}
      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">4×1000 rápido</h2>
        <p className="text-sm">
          Si puedes sacar neto 100.000 COP (no exenta), el bruto máx. es {brutoMax.toLocaleString()} y el
          neto que sale con fee es {netoSale.toLocaleString()}.
        </p>
      </section>
    </div>
  )
}
