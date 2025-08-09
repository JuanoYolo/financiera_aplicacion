// src/lib/csv.ts
export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]) {
  if (!rows || rows.length === 0) return ''

  // Fuerza el tipo del acumulador para evitar el error de TS
  const cols = headers ?? Array.from(
    rows.reduce<Set<string>>((s, r) => {
      Object.keys(r).forEach(k => s.add(k))
      return s
    }, new Set<string>())
  )

  const esc = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const head = cols.join(',')
  const body = rows.map(r => cols.map(c => esc((r as any)[c])).join(',')).join('\n')
  return head + '\n' + body
}
