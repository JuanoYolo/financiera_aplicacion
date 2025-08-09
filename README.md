# FinanJuano (MVP)

Pequeña app personal de finanzas en **React + Vite + TypeScript**.
No tiene backend: todo se guarda localmente en **IndexedDB (Dexie)**.

## ✨ Funcionalidades

* **Routing por pestañas**: Cuentas · Transacciones · Transferir · Reportes · Ajustes · **TDC** (Tarjeta de crédito).
* **Cuentas**

  * Crear (corriente, ahorros, efectivo, crédito, otras).
  * Marcar **exenta 4×1000** (GMF).
  * **Editar / reconciliar saldo actual**.
* **Transacciones**

  * Ingreso · Gasto · Transferencia.
  * GMF 4×1000 se calcula y registra automáticamente en la cuenta origen (si no es exenta).
  * Categoría y nota opcionales.
* **Transferencias**

  * Entre cuentas propias (con GMF si aplica).
* **Reportes**

  * Totales mensuales (ingresos, gastos, balance).
  * Gráficos: totales por categoría y **serie diaria**.
* **Exportar**

  * **JSON** (backup completo de la base local).
  * **CSV** de **transacciones** y **cuentas**.
* **Tarjeta de crédito (MVP)**

  * Crear tarjeta (cupo, día de **corte**, día de **pago**).
  * **Resumen**: deuda, disponible, **% de utilización** (semáforo), ciclo actual y días para pagar.
  * **Compras** (confirmadas o **pendientes**).
    ⚠️ Si una compra **excede el cupo** (límite − deuda − pendientes), se pide **confirmación**.
  * **Pagar tarjeta** desde otra cuenta o en efectivo (baja deuda y descuenta la cuenta origen si aplica).
  * “**Para no intereses**”: estimado simple con base en el **último ciclo cerrado**.
* **Persistencia**: Dexie/IndexedDB; manejo de fechas con Dayjs.

> Moneda por defecto: **COP**.

---

## 🧰 Stack

* React 18 · Vite · TypeScript
* Zustand (estado)
* Dexie (IndexedDB)
* React Hook Form + Zod
* Dayjs (locale **es** + plugins `isSameOrAfter` / `isSameOrBefore`)
* Recharts (gráficas)
* Tailwind (estilos utilitarios)

---

## 🚀 Arranque rápido

```bash
# 1) Instalar dependencias
npm install

# 2) Dev server
npm run dev
# Vite mostrará la URL, típicamente http://localhost:5173

# 3) Build y preview
npm run build
npm run preview
```

Rutas principales:

* `/accounts`, `/transactions`, `/transfers`, `/reports`, `/settings`, `/card`.

---

## 🗂️ Modelo de datos (resumen)

```ts
type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'other'

type TransactionKind =
  | 'income' | 'expense' | 'transfer'
  | 'fee'    // GMF u otros cargos
  | 'card_charge'  // compra TDC (+ deuda)
  | 'card_payment' // pago TDC (− deuda)

type TxStatus = 'pending' | 'posted' | 'reversed'
```

* **Saldo** de una cuenta = `balance inicial` + suma de transacciones **posteadas** (se ignoran `pending` y `reversed`).
* Transferencias generan **par** de asientos (salida/entrada) y, si aplica, un asiento `fee` por GMF.

---

## 📤 Exportar datos

En **Ajustes**:

* **Exportar JSON (todo)** → backup completo.
* **CSV — Transacciones** / **CSV — Cuentas** → datasets planos para análisis.

---

## 🧹 Reset rápido (solo para pruebas)

En la consola del navegador (DevTools → **Console**):

```js
(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
  }
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    await Promise.all(dbs.map(d => d.name && new Promise(res => {
      const req = indexedDB.deleteDatabase(d.name);
      req.onsuccess = req.onerror = req.onblocked = () => res();
    })));
  }
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
})();
```

---

## 📌 Notas de implementación

* **Dayjs**: importa siempre desde `src/lib/dayjs` (ya trae locale y plugins).

  ```ts
  import dayjs from '../lib/dayjs'
  ```
* **GMF 4×1000**: función en `src/lib/gmf.ts`. Se aplica a transferencias salientes cuando la cuenta **no** es exenta.

---

## 🛣️ Roadmap (próximo sprint)

* Reportes: **selector de cuentas** (una, varias o todas).
* TDC:

  * **Mínimo a pagar** y **total** del último estado.
  * Días de corte/pago hasta **31**.
  * Cambiar estado **pendiente → confirmado** desde UI.
  * Diferidos/cuotas (meses, tasa, próxima cuota, total comprometido).
* Importación de extractos **PDF/CSV** (deduplicación).
* UI polish y dark mode.
* Multi-tarjeta (selector) y filtros avanzados.

---

## 🤝 Contribuir

* Rama por feature: `feature/<breve-descripcion>`
* Commits con prefijo: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
* PR con descripción corta, checklist de QA y capturas cuando aplique.

---

## Licencia
MIT
