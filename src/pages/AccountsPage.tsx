import React from 'react'
import { Link } from 'react-router-dom'
import useAppStore from '../store'
import NewAccountForm from '../components/ui/NewAccountForm'
import EditAccountForm from '../components/ui/EditAccountForm'

export default function AccountsPage() {
  const { accounts, addAccount, getAccountBalance } = useAppStore()
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const handleDemo = () =>
    addAccount({
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

      <ul className="mt-2 space-y-2">
        {accounts.map(a => (
          <li key={a.id} className="border rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">
                  {a.name} — {a.type} {a.isExempt4x1000 ? '(Exenta GMF)' : ''}
                </div>
                <div className="text-sm text-gray-600">
                  {getAccountBalance(a.id).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/accounts/${encodeURIComponent(a.id)}`}
                  className="px-3 py-2 rounded-xl border"
                >
                  Ver
                </Link>
                <button
                  className="px-3 py-2 rounded-xl border"
                  onClick={() => setEditingId(editingId === a.id ? null : a.id)}
                >
                  {editingId === a.id ? 'Cerrar' : 'Editar'}
                </button>
              </div>
            </div>

            {editingId === a.id && (
              <div className="mt-3 border-t pt-3">
                <EditAccountForm account={a} onDone={() => setEditingId(null)} />
              </div>
            )}
          </li>
        ))}
        {accounts.length === 0 && (
          <li className="text-sm text-gray-500">No hay cuentas aún.</li>
        )}
      </ul>
    </section>
  )
}
