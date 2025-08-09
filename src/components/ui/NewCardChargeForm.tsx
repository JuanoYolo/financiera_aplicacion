import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'
import { formatCOP } from '../../lib/format'

const schema = z.object({
  cardAccountId: z.string().min(1),
  date: z.string().min(1),
  amount: z.coerce.number().positive(),
  merchant: z.string().optional(),
  status: z.enum(['pending','posted']).default('posted')
})
type FormValues = z.infer<typeof schema>

export default function NewCardChargeForm() {
  const { accounts, getAccountBalance, addCardCharge, transactions } = useAppStore()
  const cards = accounts.filter(a => a.type === 'credit_card')

  const { register, handleSubmit, watch, formState:{ isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0,10), status: 'posted' }
  })

  const selectedId = watch('cardAccountId')
  const card = cards.find(c => c.id === selectedId)
  const limit = card?.creditLimit ?? 0
  const debt = card ? getAccountBalance(card.id) : 0
  const pending = card ? transactions.filter(t => t.accountId === card.id && t.kind === 'card_charge' && t.status === 'pending').reduce((s,t)=>s+t.amount,0) : 0
  const available = Math.max(limit - (debt + pending), 0)

  const onSubmit = async (v: FormValues) => {
    try {
      await addCardCharge({
        cardAccountId: v.cardAccountId,
        amount: v.amount,
        dateISO: v.date,
        merchant: v.merchant || undefined,
        status: v.status as any
      })
      reset({ date: v.date, status: v.status })
    } catch (e: any) {
      if (e?.code === 'OVER_LIMIT') {
        const ok = confirm(
          `Esta compra excede el cupo disponible.\n\n` +
          `Límite: ${formatCOP(e.limit)}\n` +
          `Disponible actual: ${formatCOP(e.available)}\n` +
          `¿Deseas registrarla de todas formas?`
        )
        if (ok) {
          await addCardCharge({
            cardAccountId: v.cardAccountId,
            amount: v.amount,
            dateISO: v.date,
            merchant: v.merchant || undefined,
            status: v.status as any,
            allowOverLimit: true
          })
          reset({ date: v.date, status: v.status })
        }
      } else {
        alert(e?.message ?? 'No se pudo registrar la compra')
      }
    }
  }

  if (cards.length === 0) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-4">
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Tarjeta</span>
        <select className="border rounded-xl p-2" {...register('cardAccountId')}>
          <option value="">— Selecciona —</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {card && (
          <span className="text-xs text-gray-600">
            Límite {formatCOP(limit)} — Deuda {formatCOP(debt)} — Pendiente {formatCOP(pending)} — Disponible {formatCOP(available)}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Fecha</span>
        <input type="date" className="border rounded-xl p-2" {...register('date')} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Monto</span>
        <input type="number" className="border rounded-xl p-2" {...register('amount')} />
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Comercio / Nota</span>
        <input className="border rounded-xl p-2" {...register('merchant')} placeholder="Supermercado, Netflix…" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Estado</span>
        <select className="border rounded-xl p-2" {...register('status')}>
          <option value="posted">Confirmada</option>
          <option value="pending">Pendiente</option>
        </select>
      </label>

      <div className="md:col-span-4">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
          Registrar compra
        </button>
      </div>
    </form>
  )
}
