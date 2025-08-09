import React from 'react'
import dayjs from '../../lib/dayjs'
import useAppStore from '../../store'
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { formatCOP } from '../../lib/format'

type MonthKey = string // 'YYYY-MM'
const monthKey = (d: string) => dayjs(d).format('YYYY-MM')

export default function IncomeVsExpense() {
  const tx = useAppStore(s => s.transactions)

  const months = React.useMemo(() => {
    const s = new Set<MonthKey>()
    tx.forEach(t => s.add(monthKey(t.date)))
    return Array.from(s).sort().reverse()
  }, [tx])

  const [selected, setSelected] = React.useState<MonthKey>(() => months[0] ?? dayjs().format('YYYY-MM'))

  const filtered = tx.filter(t => (t.kind === 'income' || t.kind === 'expense') && monthKey(t.date) === selected)

  const totalIncome = filtered.filter(t => t.kind === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = Math.abs(filtered.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0))
  const balance = totalIncome - totalExpense

  const data = [{ name: dayjs(selected + '-01').format('MMM YYYY'), Ingresos: totalIncome, Gastos: totalExpense }]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Mes</label>
        <select className="border rounded-xl p-2" value={selected} onChange={e => setSelected(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{dayjs(m + '-01').format('MMMM YYYY')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Ingresos</div>
          <div className="text-2xl font-semibold">{formatCOP(totalIncome)}</div>
        </div>
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Gastos</div>
          <div className="text-2xl font-semibold">{formatCOP(totalExpense)}</div>
        </div>
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Balance</div>
          <div className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCOP(balance)}</div>
        </div>
      </div>

      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Gastos vs Ingresos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCOP(v)} />
              <Legend />
              <Bar dataKey="Ingresos" />
              <Bar dataKey="Gastos" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
