// src/components/reports/MonthlyReport.tsx
import React from 'react'
import useAppStore from '../../store'
import dayjs from 'dayjs'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import { formatCOP } from '../../lib/format'


type MonthKey = string // 'YYYY-MM'

function monthKey(d: string) { return dayjs(d).format('YYYY-MM') }
function labelDay(d: string) { return dayjs(d).format('DD') }

export default function MonthlyReport() {
  const { transactions, categories } = useAppStore()

  // Solo ingresos/gastos por defecto (excluye transfer/fee)
  const baseTx = React.useMemo(
    () => transactions.filter(t => t.kind === 'income' || t.kind === 'expense'),
    [transactions]
  )

  // Meses disponibles en datos
  const months: MonthKey[] = React.useMemo(() => {
    const s = new Set<MonthKey>()
    baseTx.forEach(t => s.add(monthKey(t.date)))
    return Array.from(s).sort().reverse()
  }, [baseTx])

  // Selección de mes (por defecto el más reciente o el actual si no hay)
  const [selectedMonth, setSelectedMonth] = React.useState<MonthKey>(() => {
    return months[0] ?? dayjs().format('YYYY-MM')
  })

  React.useEffect(() => {
    if (!months.includes(selectedMonth) && months.length) {
      setSelectedMonth(months[0])
    }
  }, [months, selectedMonth])

  // Filtrar por mes
  const monthTx = React.useMemo(() => {
    return baseTx.filter(t => monthKey(t.date) === selectedMonth)
  }, [baseTx, selectedMonth])

  // Resumen por categoría (gasto negativo, ingreso positivo)
  const byCat = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const t of monthTx) {
      const k = t.categoryId ?? 'otros'
      const prev = map.get(k) ?? 0
      map.set(k, prev + t.amount)
    }
    // Construir dataset para Recharts y nombres legibles
    return Array.from(map.entries()).map(([categoryId, total]) => {
      const catName = categoryId === 'otros'
        ? 'Otros'
        : (categories.find(c => c.id === categoryId)?.name ?? 'Otros')
      return { categoryId, category: catName, ingresos: Math.max(total, 0), gastos: Math.min(total, 0) }
    }).sort((a, b) => Math.abs(b.gastos) - Math.abs(a.gastos))
  }, [monthTx, categories])

  // Serie diaria (dos líneas: ingresos y gastos)
  const byDay = React.useMemo(() => {
    const daysInMonth = dayjs(selectedMonth + '-01').daysInMonth()
    const base = Array.from({ length: daysInMonth }, (_, i) => {
      const d = dayjs(selectedMonth + '-01').date(i + 1).format('YYYY-MM-DD')
      return { day: labelDay(d), ingresos: 0, gastos: 0 }
    })
    const idx = (d: string) => dayjs(d).date() - 1
    for (const t of monthTx) {
      if (t.kind === 'income') base[idx(t.date)].ingresos += t.amount
      if (t.kind === 'expense') base[idx(t.date)].gastos += Math.abs(t.amount) // positivo para graficar
    }
    return base
  }, [monthTx, selectedMonth])

  const totalIngresos = monthTx.filter(t => t.kind === 'income').reduce((s, t) => s + t.amount, 0)
  const totalGastos = Math.abs(monthTx.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0))
  const balance = totalIngresos - totalGastos

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center gap-3">
        <label className="text-sm">Mes</label>
        <select
          className="border rounded-xl p-2"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {months.map(m => (
            <option key={m} value={m}>
              {dayjs(m + '-01').format('MMMM YYYY')}
            </option>
          ))}
        </select>
        {months.length === 0 && <span className="text-sm text-gray-500">Sin datos aún</span>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Ingresos</div>
          <div className="text-lg font-semibold">{formatCOP(totalIngresos)}</div>
        </div>
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Gastos</div>
          <div className="text-lg font-semibold">{formatCOP(totalGastos)}</div>
        </div>
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-500">Balance</div>
          <div className={`text-lg font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCOP(balance)}
          </div>
        </div>
      </div>

      {/* Barras: total por categoría */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Totales por categoría</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCat}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCOP(v)} />
              <Legend />
              <Bar dataKey="ingresos" stackId="a" />
              <Bar dataKey="gastos" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Línea: serie diaria */}
      <div className="rounded-2xl border p-3">
        <h3 className="font-semibold mb-2">Serie diaria</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCOP(v)} />
              <Legend />
              <Line type="monotone" dataKey="ingresos" />
              <Line type="monotone" dataKey="gastos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
