import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAppStore from '../../store'

const schema = z.object({
  name: z.string().min(1),
  provider: z.string().optional(),
  creditLimit: z.coerce.number().positive(),
  cutoffDay: z.coerce.number().min(1).max(28),
  dueDay: z.coerce.number().min(1).max(28),
  aprAnnual: z.coerce.number().optional()
})
type FormValues = z.infer<typeof schema>

export default function NewCreditCardForm() {
  const addCard = useAppStore(s => s.addCreditCard)
  const { register, handleSubmit, formState:{ isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cutoffDay: 15, dueDay: 30 }
  })
  const onSubmit = async (v: FormValues) => {
    await addCard(v)
    reset()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-3">
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm">Nombre</span>
        <input className="border rounded-xl p-2" placeholder="Visa Banco X" {...register('name')} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">Proveedor</span>
        <input className="border rounded-xl p-2" placeholder="Bancolombia…" {...register('provider')} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">Cupo</span>
        <input type="number" className="border rounded-xl p-2" {...register('creditLimit')} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">Corte (1–28)</span>
        <input type="number" className="border rounded-xl p-2" {...register('cutoffDay')} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">Pago (1–28)</span>
        <input type="number" className="border rounded-xl p-2" {...register('dueDay')} />
      </label>
      <div className="md:col-span-3">
        <button disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-sky-600 text-white">Crear TDC</button>
      </div>
    </form>
  )
}
