import React from 'react'
import useAppStore from './store'
import GMF from './lib/gmf'

export default function App() {
  const { accounts, transactions, addAccount, addTransaction } = useAppStore()
  const hasAccounts = accounts.length > 0

  const handleCreateDemo = async () => {
    await addAccount({
      name: 'Bolsillo Principal',
      type: 'checking',
      provider: 'MiBanco',
      isExempt4x1000: false
    })
  }

  // Demo 4x1000
  const brutoMax = GMF.grossFromNetAvailable(100000, false)
  const netoSale = GMF.netOut(brutoMax, false)

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">FinanJuano (MVP)</h1>

      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">Cuentas</h2>
        <button
          className="px-3 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-60"
          onClick={handleCreateDemo}
        >
          + Crear cuenta demo
        </button>

        <ul className="mt-3 space-y-1">
          {accounts.map(a => (
            <li key={a.id} className="flex justify-between border rounded-xl px-3 py-2">
              <span>{a.name} — {a.type} {a.isExempt4x1000 ? '(Exenta GMF)' : ''}</span>
              <span>{a.balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
            </li>
          ))}
          {!hasAccounts && <li className="text-sm text-gray-500">No hay cuentas aún.</li>}
        </ul>
      </section>

      <section className="p-3 rounded-2xl border">
        <h2 className="font-semibold mb-2">Transacciones (demo)</h2>
        <button
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
          disabled={!hasAccounts}
          onClick={() => addTransaction({
            accountId: accounts[0].id,
            kind: 'expense',
            amount: -25000,
            date: new Date().toISOString().slice(0, 10),
            note: 'Café y algo más'
          })}
        >
          + Gasto demo
        </button>
        {!hasAccounts && <p className="text-xs mt-2 text-gray-500">Crea una cuenta primero.</p>}

        <ul className="mt-3 space-y-1">
          {transactions.slice(0, 6).map(t => (
            <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
              {t.date} — {t.kind} — {t.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} {t.note ?? ''}
            </li>
          ))}
        </ul>
      </section>

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