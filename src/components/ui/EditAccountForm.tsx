import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'
import type { Account, AccountType } from '../../types'

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['checking','savings','cash','credit_card','other']),
  provider: z.string().optional(),
  isExempt4x1000: z.boolean().optional(),
  // Solo editamos el saldo ACTUAL (reconciliar). No hay "saldo inicial" aquí.
  targetCurrentBalance: z.coerce.number()
})
type FormValues = z.infer<typeof schema>

const TYPES: {label:string; value:AccountType}[] = [
  { label:'Cuenta corriente', value:'checking' },
  { label:'Ahorros', value:'savings' },
  { label:'Efectivo', value:'cash' },
  { label:'Tarjeta crédito', value:'credit_card' },
  { label:'Otra', value:'other' }
]

export default function EditAccountForm({ account, onDone }: { account: Account; onDone?: () => void }) {
  const updateAccount = useAppStore(s => s.updateAccount)
  const reconcile      = useAppStore(s => s.reconcileAccountBalance)
  const getBalance     = useAppStore(s => s.getAccountBalance)

  const current = getBalance(account.id)

  const { register, handleSubmit, formState:{ isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: account.name,
      type: account.type,
      provider: account.provider ?? '',
      isExempt4x1000: !!account.isExempt4x1000,
      targetCurrentBalance: current
    }
  })

  const onSubmit = async (v: FormValues) => {
    // Actualiza datos de la cuenta (sin tocar el balance inicial)
    await updateAccount(account.id, {
      name: v.name,
      type: v.type,
      provider: v.provider || undefined,
      isExempt4x1000: !!v.isExempt4x1000,
    })
    // Reconciliar saldo actual
    await reconcile(account.id, v.targetCurrentBalance)
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Nombre</span>
        <input className="border rounded-xl p-2" {...register('name')} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Tipo</span>
        <select className="border rounded-xl p-2" {...register('type')}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Proveedor</span>
        <input className="border rounded-xl p-2" {...register('provider')} />
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('isExempt4x1000')} />
        <span className="text-sm">Exenta de 4×1000</span>
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Saldo actual (reconciliar)</span>
        <input type="number" className="border rounded-xl p-2" {...register('targetCurrentBalance')} />
        <span className="text-xs text-gray-500">
          Saldo actual hoy: {current.toLocaleString('es-CO', { style:'currency', currency:'COP' })}
        </span>
      </label>

      <div className="md:col-span-2 flex gap-2">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">Guardar</button>
        <button type="button" onClick={() => reset()} className="px-3 py-2 rounded-xl border">Restablecer</button>
      </div>
    </form>
  )
}
