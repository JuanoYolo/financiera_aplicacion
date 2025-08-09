import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'
import { formatCOP } from '../../lib/format'

const schema = z.object({
  cardAccountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  note: z.string().optional(),
  fromAccountId: z.string().optional(),
  cash: z.boolean().optional()
}).refine(v => v.fromAccountId || v.cash, { message: 'Indica origen del pago', path: ['fromAccountId'] })

type FormValues = z.infer<typeof schema>

export default function PayCardForm() {
  const { accounts, payCard, getAccountBalance, statementToAvoidInterest } = useAppStore()
  const cards = accounts.filter(a => a.type === 'credit_card')
  const sources = accounts.filter(a => a.type !== 'credit_card')

  const { register, handleSubmit, watch, formState:{ isSubmitting, errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0,10), cash: false }
  })

  const selectedCardId = watch('cardAccountId')
  const selectedCard = cards.find(c => c.id === selectedCardId)
  const debt = selectedCard ? getAccountBalance(selectedCard.id) : 0
  const avoid = selectedCard ? statementToAvoidInterest(selectedCard.id) : 0

  const onSubmit = async (v: FormValues) => {
    try {
      await payCard({
        cardAccountId: v.cardAccountId,
        amount: v.amount,
        dateISO: v.date,
        note: v.note || undefined,
        fromAccountId: v.cash ? undefined : v.fromAccountId,
        cash: v.cash
      })
      reset({ date: v.date, cash: v.cash })
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo registrar el pago')
    }
  }

  if (cards.length === 0) return <p className="text-sm text-gray-500">Crea una TDC primero.</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Tarjeta</span>
        <select className="border rounded-xl p-2" {...register('cardAccountId')}>
          <option value="">— Selecciona —</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedCard && (
          <span className="text-xs text-gray-600">
            Deuda actual: {formatCOP(debt)} — Para no intereses (último estado): {formatCOP(avoid)}
          </span>
        )}
        {errors.cardAccountId && <span className="text-xs text-red-600">{errors.cardAccountId.message as string}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Fecha</span>
        <input type="date" className="border rounded-xl p-2" {...register('date')} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Monto</span>
        <input type="number" className="border rounded-xl p-2" {...register('amount')} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Desde la cuenta</span>
        <select className="border rounded-xl p-2" {...register('fromAccountId')}>
          <option value="">— Selecciona —</option>
          {sources.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm mt-1">
          <input type="checkbox" {...register('cash')} /> Efectivo
        </label>
        {errors.fromAccountId && <span className="text-xs text-red-600">{errors.fromAccountId.message as string}</span>}
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Nota (opcional)</span>
        <input className="border rounded-xl p-2" {...register('note')} placeholder="Pago total, abono, etc."/>
      </label>

      <div className="md:col-span-2">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
          Pagar tarjeta
        </button>
      </div>
    </form>
  )
}
