import React from 'react'
import MonthlyReport from '../components/reports/MonthlyReport'

export default function ReportsPage() {
  return (
    <section className="p-3 rounded-2xl border">
      <h2 className="font-semibold mb-2">Reporte mensual</h2>
      <MonthlyReport />
    </section>
  )
}
