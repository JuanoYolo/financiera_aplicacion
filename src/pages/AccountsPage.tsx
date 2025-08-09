import React from 'react'
import useAppStore from '../store'
import NewAccountForm from '../components/ui/NewAccountForm'

export default function AccountsPage() {
  const { accounts, addAccount, getAccountBalance } = useAppStore()
  const handleDemo = () => addAccount({
    name: 'Bolsillo Principal',
    type: 'checking',
    provider: 'MiBanco',
    isExempt4x1000: false,
    balance: 0
  })

  return (
    <section className="p-3 rounded-2xl border space-y-3">
      <h2 className="font-semibold">Cuentas</h2>

      <button className="px-3 py-2 rounded-xl bg-sky-600 text-white" onClick={handleDemo}>
        + Crear cuenta demo
      </button>

      <NewAccountForm />

      <ul className="mt-2 space-y-1">
        {accounts.map(a => (
          <li key={a.id} className="flex justify-between border rounded-xl px-3 py-2">
            <span>{a.name} — {a.type} {a.isExempt4x1000 ? '(Exenta GMF)' : ''}</span>
            <span>{getAccountBalance(a.id).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</span>
          </li>
        ))}
        {accounts.length === 0 && <li className="text-sm text-gray-500">No hay cuentas aún.</li>}
      </ul>
    </section>
  )
}
