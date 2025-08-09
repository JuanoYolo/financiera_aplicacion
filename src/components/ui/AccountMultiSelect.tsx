import React from 'react'
import type { Account } from '../../types'

type Props = {
  accounts: Account[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export default function AccountMultiSelect({ accounts, selectedIds, onChange }: Props) {
  const allIds = React.useMemo(() => accounts.map(a => a.id), [accounts])
  const allSelected = selectedIds.length === allIds.length

  const toggleAll = () => onChange(allSelected ? [] : allIds)

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id))
    else onChange([...selectedIds, id])
  }

  return (
    <div className="rounded-xl border p-2 space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleAll} className="px-2 py-1 rounded-lg border">
          {allSelected ? 'Quitar todas' : 'Seleccionar todas'}
        </button>
        <span className="text-sm text-gray-600">
          {selectedIds.length}/{allIds.length} seleccionadas
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-1">
        {accounts.map(a => (
          <label key={a.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.includes(a.id)}
              onChange={() => toggleOne(a.id)}
            />
            <span>{a.name} — {a.type}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
