// src/main.tsx
import './index.css';       // <- Asegúrate de que este sea el path correcto

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FinancialApp } from './components/FinancialApp';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <FinancialApp />
  </React.StrictMode>
);


