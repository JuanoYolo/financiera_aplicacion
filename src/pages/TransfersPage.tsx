import React from 'react'
import NewTransferForm from '../components/ui/NewTransferForm'

export default function TransfersPage() {
  return (
    <section className="p-3 rounded-2xl border">
      <h2 className="font-semibold mb-2">Transferencia</h2>
      <NewTransferForm />
    </section>
  )
}
