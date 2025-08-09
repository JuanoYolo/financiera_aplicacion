import React from 'react'
import MonthlyReport from '../components/reports/MonthlyReport'
import IncomeVsExpense from '../components/reports/IncomeVsExpense'

export default function ReportsPage() {
  return (
    <section className="p-3 rounded-2xl border space-y-4">
      <h2 className="font-semibold">Reportes</h2>

      <IncomeVsExpense />

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Detalle por categoría y día</h3>
        <MonthlyReport />
      </div>
    </section>
  )
}
