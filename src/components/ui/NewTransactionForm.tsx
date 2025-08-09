import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'

const schema = z.object({
  accountId: z.string().min(1, 'Selecciona una cuenta'),
  kind: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Monto debe ser > 0'),
  date: z.string().min(1, 'Fecha requerida'),
  categoryId: z.string().optional(),
  note: z.string().optional()
})

type FormValues = z.infer<typeof schema>

export default function NewTransactionForm() {
  const { accounts, categories, addTransaction } = useAppStore()
  const hasAccounts = accounts.length > 0

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: 'expense',
      date: new Date().toISOString().slice(0,10)
    }
  })

  const onSubmit = async (values: FormValues) => {
    const sign = values.kind === 'expense' ? -1 : 1
    await addTransaction({
      accountId: values.accountId,
      kind: values.kind,
      amount: sign * Math.abs(values.amount),
      date: values.date,
      categoryId: values.categoryId || undefined,
      note: values.note || undefined
    })
    reset({ kind: values.kind, date: values.date, amount: 0, accountId: values.accountId, categoryId: values.categoryId, note: '' })
  }

  if (!hasAccounts) {
    return <p className="text-sm text-gray-500">Crea una cuenta primero para registrar transacciones.</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Cuenta</span>
        <select className="border rounded-xl p-2" {...register('accountId')}>
          <option value="">— Selecciona —</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.accountId && <span className="text-xs text-red-600">{errors.accountId.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Tipo</span>
        <select className="border rounded-xl p-2" {...register('kind')}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Monto</span>
        <input type="number" step="1" className="border rounded-xl p-2" placeholder="0"
               {...register('amount')} />
        {errors.amount && <span className="text-xs text-red-600">{errors.amount.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Fecha</span>
        <input type="date" className="border rounded-xl p-2" {...register('date')} />
        {errors.date && <span className="text-xs text-red-600">{errors.date.message}</span>}
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Categoría (opcional)</span>
        <select className="border rounded-xl p-2" {...register('categoryId')}>
          <option value="">— Sin categoría —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji ?? ''} {c.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Nota (opcional)</span>
        <input type="text" className="border rounded-xl p-2" placeholder="Descripción"
               {...register('note')} />
      </label>

      <div className="md:col-span-2">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60">
          Guardar transacción
        </button>
      </div>
    </form>
  )
}