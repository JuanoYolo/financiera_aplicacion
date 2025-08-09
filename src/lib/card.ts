import dayjs from './dayjs'

export type CardCycle = {
  start: string   // inclusive
  end: string     // inclusive (día de corte)
  due: string     // fecha de pago de ese ciclo
  daysToDue: number
}

function safeSetDate(d: dayjs.Dayjs, dom: number) {
  const clamp = Math.min(Math.max(dom, 1), d.daysInMonth())
  return d.set('date', clamp)
}

// Ciclo abierto actual (desde el día siguiente al último corte hasta el próximo corte)
export function currentCycle(cutoffDay: number, dueDay: number, baseDate = dayjs()): CardCycle {
  const now = baseDate
  const cutoffThis = safeSetDate(now, cutoffDay)
  const end = now.isAfter(cutoffThis, 'day') ? cutoffThis : cutoffThis.subtract(1, 'month')
  const start = end.add(1, 'day').subtract(1, 'month')

  const due = safeSetDate(end.add(1, 'month'), dueDay)
  const daysToDue = due.startOf('day').diff(now.startOf('day'), 'day')

  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD'), due: due.format('YYYY-MM-DD'), daysToDue }
}

// Último ciclo CERRADO (estado anterior) + fecha de pago
export function lastStatementMeta(cutoffDay: number, dueDay: number, baseDate = dayjs()) {
  const end = safeSetDate(baseDate, cutoffDay).subtract(1, 'month')
  const start = end.add(1, 'day').subtract(1, 'month')
  const due = safeSetDate(end.add(1, 'month'), dueDay)
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
    due: due.format('YYYY-MM-DD')
  }
}
