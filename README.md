# FinApp

**FinApp** es una aplicación Android de gestión financiera personal, diseñada para llevar control de múltiples cuentas (ahorro, corriente y tarjetas de crédito), registrar gastos e ingresos, y visualizar reportes financieros.

---

## 🚀 Características esenciales

* **Gestión de cuentas**: Cuentas de ahorro, corriente y crédito con selección de proveedor (Bancolombia, Nequi, Nu, Lulo…)
* **Transacciones**: Registra ingresos, gastos y transferencias entre cuentas.
* **Impuesto 4×1000**: Cálculo automático con opción de exención.
* **Control de tarjetas de crédito**: Fecha de corte, días hasta pago y límite configurable.
* **Dashboard**: Patrimonio total, resumen de transacciones y próximos pagos.
* **Reportes mensuales**: Gráficos de pastel y líneas para analizar tus finanzas.
* **Modo offline**: Datos almacenados localmente con protección por PIN.
* **Interfaz móvil**: Diseño mobile‑first optimizado para Android.

---

## 🛠 Tecnologías usadas

* **React** + **Vite**
* **TypeScript**
* **Tailwind CSS**
* **lucide-react** (iconos)
* **Recharts** (gráficos futuros)

---

## 📦 Instalación y ejecución local

1. Clona o descarga este proyecto en tu máquina local.
2. Sitúate en la carpeta raíz del proyecto:

   ```bash
   cd finapp
   ```
3. Instala dependencias:

   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```
5. Abre en tu navegador Android o emulador:

   ```
   http://localhost:8080
   ```

---

## 📁 Estructura de carpetas

```
finapp/
├─ public/             # index.html y recursos estáticos
├─ src/
│  ├─ components/      # Componentes React (UI, cuentas, dashboard...)
│  ├─ hooks/           # Hooks personalizados (useFinancialData)
│  ├─ types/           # Definiciones TS (Account, Transaction)
│  ├─ utils/           # Funciones auxiliares (formatCurrency...)
│  ├─ index.css        # CSS global / Tailwind
│  ├─ main.tsx         # Punto de entrada
│  └─ App.tsx          # Monta FinancialApp
├─ tailwind.config.ts  # Configuración de Tailwind
├─ vite.config.ts      # Configuración de Vite
├─ tsconfig.app.json   # Paths y settings TS
└─ package.json        # Scripts y dependencias
```

---

## 📖 Uso básico

* 🚀 **Inicio**: Muestra tu patrimonio y transacciones recientes.
* 💳 **Cuentas**: Agrega, edita o elimina tus cuentas financieras.
* ➕ **Nuevo**: Registra un ingreso, gasto o transferencia.
* 📊 **Reportes**: Consulta los gráficos mensuales.

---



---

**¡Gracias por usar FinApp!**

