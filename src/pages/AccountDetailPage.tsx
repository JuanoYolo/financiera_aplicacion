import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import useAppStore from '../store'
import EditAccountForm from '../components/ui/EditAccountForm'

export default function AccountDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const ready = useAppStore(s => s.ready)
  const accounts = useAppStore(s => s.accounts)
  const transactions = useAppStore(s => s.transactions)
  const getAccountBalance = useAppStore(s => s.getAccountBalance)

  const decodedId = decodeURIComponent(id)
  const acc = React.useMemo(
    () => accounts.find(a => a.id === decodedId),
    [accounts, decodedId]
  )

  if (!ready) return <div className="p-3">Cargando…</div>

  if (!decodedId) {
    navigate('/accounts', { replace: true })
    return null
  }

  if (!acc) {
    return (
      <div className="p-3 space-y-3">
        <div>Cuenta no encontrada.</div>
        <div>
          <label className="text-sm mr-2">Ir a:</label>
          <select
            className="border rounded-xl p-2"
            onChange={e =>
              e.target.value && navigate(`/accounts/${encodeURIComponent(e.target.value)}`)
            }
          >
            <option value="">— Selecciona una cuenta —</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <Link to="/accounts" className="underline">
          Volver
        </Link>
      </div>
    )
  }

  const movs = transactions.filter(t => t.accountId === acc.id)
  const saldo = getAccountBalance(acc.id)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/accounts" className="underline">
          ← Volver
        </Link>
        <h2 className="text-xl font-semibold">{acc.name}</h2>
      </div>

      <div className="rounded-2xl border p-3">
        <div className="text-sm text-gray-500">Saldo actual</div>
        <div className="text-2xl font-semibold">
          {saldo.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
        </div>
      </div>

      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Editar cuenta</h3>
        <EditAccountForm account={acc} />
      </div>

      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Movimientos</h3>
        <ul className="space-y-1">
          {movs.map(t => (
            <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
              {t.date} — {t.kind} —{' '}
              {t.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}{' '}
              {t.note ?? ''}
            </li>
          ))}
          {movs.length === 0 && (
            <li className="text-sm text-gray-500">Sin movimientos.</li>
          )}
        </ul>
      </div>
    </section>
  )
}
