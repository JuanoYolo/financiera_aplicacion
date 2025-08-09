import React from 'react'
import ExportData from '../components/ui/ExportData'

export default function SettingsPage() {
  return (
    <section className="p-3 rounded-2xl border space-y-3">
      <h2 className="font-semibold">Ajustes</h2>
      <ExportData />
      <p className="text-xs text-gray-500">Próximamente: importar backup, tema oscuro, etc.</p>
    </section>
  )
}
