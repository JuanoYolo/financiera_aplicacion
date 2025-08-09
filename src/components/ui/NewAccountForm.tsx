import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'
import type { AccountType } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['checking','savings','cash','credit_card','other']),
  provider: z.string().optional(),
  isExempt4x1000: z.boolean().optional(),
  balance: z.coerce.number().min(0, 'Saldo inicial ≥ 0').default(0)
})

type FormValues = z.infer<typeof schema>

const TYPES: {label:string; value:AccountType}[] = [
  { label:'Cuenta corriente', value:'checking' },
  { label:'Ahorros', value:'savings' },
  { label:'Efectivo', value:'cash' },
  { label:'Tarjeta crédito', value:'credit_card' },
  { label:'Otra', value:'other' }
]

export default function NewAccountForm() {
  const addAccount = useAppStore(s => s.addAccount)

  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type:'checking', balance:0, isExempt4x1000:false }
  })

  const onSubmit = async (v: FormValues) => {
    await addAccount({
      name: v.name,
      type: v.type,
      provider: v.provider || undefined,
      isExempt4x1000: !!v.isExempt4x1000,
      balance: v.balance
    })
    reset({ name:'', type:'checking', provider:'', isExempt4x1000:false, balance:0 })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Nombre</span>
        <input className="border rounded-xl p-2" placeholder="Mi Banco / Efectivo" {...register('name')} />
        {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Tipo</span>
        <select className="border rounded-xl p-2" {...register('type')}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Proveedor (opcional)</span>
        <input className="border rounded-xl p-2" placeholder="Bancolombia, Nequi…" {...register('provider')} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Saldo inicial</span>
        <input type="number" step="1" className="border rounded-xl p-2" {...register('balance')} />
        {errors.balance && <span className="text-xs text-red-600">{errors.balance.message}</span>}
      </label>

      <label className="flex items-center gap-2 md:col-span-2">
        <input type="checkbox" {...register('isExempt4x1000')} />
        <span className="text-sm">Cuenta exenta de 4×1000</span>
      </label>

      <div className="md:col-span-2">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-60">
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
