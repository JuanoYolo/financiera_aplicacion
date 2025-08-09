import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import useAppStore from './store'   // <- default import

function Boot() {
  const ready = useAppStore(s => s.ready)
  const loadAll = useAppStore(s => s.loadAll)
  React.useEffect(() => { loadAll() }, [])
  return ready ? <App/> : <div className="p-6">Cargando…</div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Boot/></React.StrictMode>
)
