import React from 'react'
import useAppStore from '../store'
import dayjs from '../lib/dayjs'
import { formatCOP } from '../lib/format'
import AccountMultiSelect from '../components/ui/AccountMultiSelect'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line
} from 'recharts'

const monthOptions = Array.from({ length: 12 }, (_, i) =>
  dayjs().month(i).format('MMMM')
)

export default function ReportsPage() {
  const { accounts, transactions, categories } = useAppStore()
  const [month, setMonth] = React.useState<number>(dayjs().month()) // 0..11
  const [year, setYear] = React.useState<number>(dayjs().year())
  const [selectedIds, setSelectedIds] = React.useState<string[]>(accounts.map(a => a.id))

  // Si cambian cuentas (p.ej. al borrar datos), resetea selección
  React.useEffect(() => {
    if (selectedIds.length === 0 && accounts.length > 0) {
      setSelectedIds(accounts.map(a => a.id))
    }
  }, [accounts]) // eslint-disable-line

  const start = dayjs().year(year).month(month).startOf('month')
  const end   = start.endOf('month')

  // Filtro por mes y cuentas seleccionadas
  const monthTx = transactions.filter(t =>
    selectedIds.includes(t.accountId) &&
    dayjs(t.date).isSameOrAfter(start) &&
    dayjs(t.date).isSameOrBefore(end)
  )

  const incomes = monthTx.filter(t => t.kind === 'income').reduce((s,t)=>s+t.amount,0)
  const expenses = monthTx.filter(t => t.kind === 'expense' || t.kind === 'fee').reduce((s,t)=>s+Math.abs(t.amount),0)
  const balance = incomes - expenses

  // Datos por categoría (solo gastos positivos para la barra)
  const byCatMap = new Map<string, { name: string; ingresos: number; gastos: number }>()
  for (const tx of monthTx) {
    const key = tx.categoryId ?? 'otros'
    const cat = categories.find(c => c.id === key)?.name ?? (key === 'otros' ? 'Otros' : key)
    if (!byCatMap.has(key)) byCatMap.set(key, { name: cat, ingresos: 0, gastos: 0 })
    const agg = byCatMap.get(key)!
    if (tx.kind === 'income') agg.ingresos += tx.amount
    if (tx.kind === 'expense' || tx.kind === 'fee') agg.gastos += Math.abs(tx.amount)
  }
  const byCat = Array.from(byCatMap.values())

  // Serie diaria
  const daysInMonth = end.date()
  const daily: { day: string; ingresos: number; gastos: number }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = start.date(d).format('YYYY-MM-DD')
    const dayIncomes = monthTx.filter(t => t.date === dateStr && t.kind === 'income')
      .reduce((s,t)=>s+t.amount,0)
    const dayExpenses = monthTx.filter(t => t.date === dateStr && (t.kind === 'expense' || t.kind === 'fee'))
      .reduce((s,t)=>s+Math.abs(t.amount),0)
    daily.push({ day: String(d).padStart(2,'0'), ingresos: dayIncomes, gastos: dayExpenses })
  }

  const years = Array.from(new Set(transactions.map(t => dayjs(t.date).year()))).sort((a,b)=>b-a)
  if (!years.includes(year)) years.unshift(year)

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">Reportes</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-sm">Mes</label>
        <select className="border rounded-xl p-2" value={month} onChange={e=>setMonth(Number(e.target.value))}>
          {monthOptions.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <label className="text-sm">Año</label>
        <select className="border rounded-xl p-2" value={year} onChange={e=>setYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Selector de cuentas */}
      <AccountMultiSelect
        accounts={accounts}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-3">
        <Kpi title="Ingresos" value={formatCOP(incomes)} />
        <Kpi title="Gastos" value={formatCOP(expenses)} />
        <Kpi title="Balance" value={formatCOP(balance)} positive={balance>=0} />
      </div>

      {/* Gastos vs Ingresos (barras) */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Gastos vs Ingresos</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={[{ name: start.format('MMM YYYY'), ingresos: incomes, gastos: expenses }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" />
            <Bar dataKey="gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Totales por categoría */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Totales por categoría</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={byCat}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" />
            <Bar dataKey="gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Serie diaria */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Serie diaria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingresos" dot={false} />
            <Line type="monotone" dataKey="gastos" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function Kpi({ title, value, positive }: { title: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-semibold ${positive === false ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  )
}
