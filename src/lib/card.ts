// src/lib/card.ts
import dayjs from './dayjs'

export type CardCycle = {
  start: string   // inclusive
  end: string     // inclusive (día de corte)
  due: string     // fecha de pago (mismo mes o siguiente)
  daysToDue: number
}

export function currentCycle(cutoffDay: number, dueDay: number, baseDate = dayjs()) : CardCycle {
  const d = baseDate
  const cutoffThis = d.date(cutoffDay)
  const end = d.isAfter(cutoffThis, 'day') ? cutoffThis : cutoffThis.subtract(1, 'month')
  const start = end.add(1, 'day').subtract(1, 'month')
  // due: si dueDay < end.day -> siguiente mes
  let due = end.date(dueDay).add(1, 'month')
  if (due.date() !== dueDay) due = due.set('date', dueDay) // ajuste meses cortos
  const daysToDue = due.startOf('day').diff(d.startOf('day'), 'day')
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD'), due: due.format('YYYY-MM-DD'), daysToDue }
}

export function lastStatementRange(cutoffDay: number, baseDate = dayjs()) {
  // último ciclo cerrado (terminó en el corte anterior)
  const end = baseDate.date(cutoffDay).subtract(1, 'month')
  const start = end.add(1, 'day').subtract(1, 'month')
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') }
}
