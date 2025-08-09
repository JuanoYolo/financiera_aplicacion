import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function NavItem({
  to,
  children,
  end = false
}: {
  to: string
  children: React.ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl border ${
          isActive ? 'bg-sky-600 text-white' : 'bg-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">FinanJuano (MVP)</h1>
        <nav className="flex gap-2">
          <NavItem to="/accounts" end>Cuentas</NavItem>
          <NavItem to="/transfers">Transferir</NavItem>
          <NavItem to="/card">TDC</NavItem>          {/* NUEVA */}
          <NavItem to="/transactions">Transacciones</NavItem>
          <NavItem to="/transfers">Transferir</NavItem>
          <NavItem to="/reports">Reportes</NavItem>
          <NavItem to="/settings">Ajustes</NavItem>
        </nav>
      </header>

      <main className="space-y-4">
        <Outlet />
      </main>
    </div>
  )
}
