// src/lib/format.ts
export function formatCOP(n: number) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
}
