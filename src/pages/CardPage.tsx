import React from 'react'
import useAppStore from '../store'
import NewCreditCardForm from '../components/ui/NewCreditCardForm'
import PayCardForm from '../components/ui/PayCardForm'
import NewCardChargeForm from '../components/ui/NewCardChargeForm'
import { currentCycle } from '../lib/card'
import dayjs from '../lib/dayjs'
import { formatCOP } from '../lib/format'

export default function CardPage() {
  const { accounts, transactions, getAccountBalance } = useAppStore()
  const cards = accounts.filter(a => a.type === 'credit_card')

  if (cards.length === 0) {
    return (
      <section className="p-3 rounded-2xl border space-y-3">
        <h2 className="font-semibold">Tarjeta de crédito</h2>
        <NewCreditCardForm />
      </section>
    )
  }

  const card = cards[0] // TODO: selector si hay varias
  const debt = getAccountBalance(card.id)
  const limit = card.creditLimit ?? 0
  const available = Math.max(limit - debt, 0)
  const util = limit ? Math.round((debt / limit) * 100) : 0

  const cutoff = card.cutoffDay ?? 15
  const due = card.dueDay ?? 30
  const cyc = currentCycle(cutoff, due, dayjs())

  const pending = transactions.filter(t => t.accountId === card.id && t.kind === 'card_charge' && t.status === 'pending')
  const posted  = transactions.filter(t => t.accountId === card.id && t.kind === 'card_charge' && (!t.status || t.status === 'posted'))

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border p-3 grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-xs text-gray-500">Deuda</div>
          <div className="text-2xl font-semibold">{formatCOP(debt)}</div>
          <div className="text-xs text-gray-500">Disponible: {formatCOP(available)} / Cupo: {formatCOP(limit)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">% Utilización</div>
          <div className={`text-2xl font-semibold ${util >= 80 ? 'text-red-600' : util >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{util}%</div>
          <div className="text-xs text-gray-500">Corte: {cutoff} — Pago: {due}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Ciclo</div>
          <div className="text-sm">{cyc.start} → {cyc.end} — Vence {cyc.due}</div>
          <div className="text-xs text-gray-500">Días para pagar: {cyc.daysToDue}</div>
        </div>
      </div>

      {/* Nueva compra con validación de cupo */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Registrar compra</h3>
        <NewCardChargeForm />
      </div>

      {/* Pagos */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Pagar tarjeta</h3>
        <PayCardForm />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border p-3">
          <h3 className="font-semibold mb-2">Compras confirmadas</h3>
          <ul className="space-y-1">
            {posted.map(t => (
              <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
                {t.date} — {t.merchant ?? t.note ?? 'Compra'} — {formatCOP(t.amount)}
              </li>
            ))}
            {posted.length === 0 && <li className="text-sm text-gray-500">Sin registros.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border p-3">
          <h3 className="font-semibold mb-2">Pendientes por confirmar</h3>
          <ul className="space-y-1">
            {pending.map(t => (
              <li key={t.id} className="text-sm border rounded-xl px-3 py-2">
                {t.date} — {t.merchant ?? t.note ?? 'Compra'} — {formatCOP(t.amount)} — <span className="text-amber-600">pendiente</span>
              </li>
            ))}
            {pending.length === 0 && <li className="text-sm text-gray-500">Sin pendientes.</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}
