// src/components/ui/NewTransferForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'
import { gmfFee, netOut } from '../../lib/gmf'

const schema = z.object({
  fromAccountId: z.string().min(1, 'Selecciona cuenta origen'),
  toAccountId: z.string().min(1, 'Selecciona cuenta destino'),
  amount: z.coerce.number().positive('Monto > 0'),
  date: z.string().min(1, 'Fecha requerida'),
  note: z.string().optional()
}).refine(v => v.fromAccountId !== v.toAccountId, {
  message: 'Origen y destino deben ser diferentes',
  path: ['toAccountId']
})

type FormValues = z.infer<typeof schema>

export default function NewTransferForm() {
  const { accounts, createTransfer } = useAppStore()
  const has2Accounts = accounts.length >= 2

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0,10)
    }
  })

  const fromId = watch('fromAccountId')
  const amount = watch('amount') || 0
  const fromAcc = accounts.find(a => a.id === fromId)
  const fee = amount > 0 ? gmfFee(amount, fromAcc?.isExempt4x1000) : 0
  const totalSale = amount > 0 ? netOut(amount, fromAcc?.isExempt4x1000) : 0

  const onSubmit = async (v: FormValues) => {
    await createTransfer({
      fromAccountId: v.fromAccountId,
      toAccountId: v.toAccountId,
      amount: v.amount,
      dateISO: v.date,
      note: v.note || undefined
    })
    reset({ fromAccountId: v.fromAccountId, toAccountId: v.toAccountId, amount: 0, date: v.date, note: '' })
  }

  if (!has2Accounts) {
    return <p className="text-sm text-gray-500">Necesitas al menos dos cuentas para transferir.</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Desde</span>
        <select className="border rounded-xl p-2" {...register('fromAccountId')}>
          <option value="">— Origen —</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.fromAccountId && <span className="text-xs text-red-600">{errors.fromAccountId.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Hacia</span>
        <select className="border rounded-xl p-2" {...register('toAccountId')}>
          <option value="">— Destino —</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.toAccountId && <span className="text-xs text-red-600">{errors.toAccountId.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Monto (BRUTO)</span>
        <input type="number" step="1" className="border rounded-xl p-2" placeholder="0" {...register('amount')} />
        {errors.amount && <span className="text-xs text-red-600">{errors.amount.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Fecha</span>
        <input type="date" className="border rounded-xl p-2" {...register('date')} />
        {errors.date && <span className="text-xs text-red-600">{errors.date.message}</span>}
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Nota (opcional)</span>
        <input type="text" className="border rounded-xl p-2" placeholder="Descripción" {...register('note')} />
      </label>

      <div className="md:col-span-2 text-sm text-gray-600">
        <div>GMF estimado: <strong>{fee.toLocaleString('es-CO')}</strong> {fromAcc?.isExempt4x1000 ? '(Cuenta exenta)' : ''}</div>
        <div>Sale en total de la cuenta origen: <strong>{totalSale.toLocaleString('es-CO')}</strong></div>
      </div>

      <div className="md:col-span-2">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60">
          Ejecutar transferencia
        </button>
      </div>
    </form>
  )
}
