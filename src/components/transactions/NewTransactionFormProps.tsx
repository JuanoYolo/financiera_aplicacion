// src/components/transactions/NewTransactionForm.tsx
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Save,
} from 'lucide-react';
import type {
  Account,
  Transaction,
  TransactionType,
  Category,
} from '../../types/financial';
import {
  formatCurrency,
  calculate4x1000Tax,
  getCategoryIcon,
  getAvailableBalance,
} from '../../utils/financial';
import { toast } from '../ui/use-toast';

interface NewTransactionFormProps {
  accounts: Account[];
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const NewTransactionForm: React.FC<NewTransactionFormProps> = ({
  accounts,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    accountId: '',
    destinationAccountId: '',
    category: 'Otros' as Category,
    description: '',
    date: new Date().toISOString().split('T')[0],
    exemptFrom4x1000: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAccount = accounts.find(
    (a) => a.id === formData.accountId
  );
  const isTransfer = formData.type === 'transfer';
  const needsCategory = formData.type !== 'transfer';

  const amountValue = parseFloat(formData.amount) || 0;
  const tax4x1000 =
    amountValue > 0 && !formData.exemptFrom4x1000
      ? calculate4x1000Tax(amountValue, false)
      : 0;
  const totalAmount = amountValue + tax4x1000;

  const validateForm = () => {
    const errs: Record<string, string> = {};

    // Monto válido
    if (!formData.amount || amountValue <= 0) {
      errs.amount = 'El monto debe ser mayor a 0';
    }
    // Límite de crédito
    if (
      formData.type === 'expense' &&
      selectedAccount?.type === 'credit' &&
      amountValue > getAvailableBalance(selectedAccount)
    ) {
      errs.amount = 'El monto excede el disponible de la tarjeta';
    }
    // Cuenta origen
    if (!formData.accountId) {
      errs.accountId = 'Selecciona una cuenta';
    }
    // Transferencias
    if (isTransfer) {
      if (!formData.destinationAccountId) {
        errs.destinationAccountId = 'Selecciona la cuenta destino';
      } else if (
        formData.accountId === formData.destinationAccountId
      ) {
        errs.destinationAccountId =
          'La cuenta destino debe ser diferente';
      }
    }
    // Descripción
    if (!formData.description.trim()) {
      errs.description = 'Agrega una descripción';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Error en el formulario',
        description: 'Por favor corrige los errores marcados',
        variant: 'destructive',
      });
      return;
    }
    const transaction: Omit<
      Transaction,
      'id' | 'createdAt'
    > = {
      type: formData.type,
      amount: amountValue,
      accountId: formData.accountId,
      destinationAccountId: isTransfer
        ? formData.destinationAccountId
        : undefined,
      category: needsCategory ? formData.category : undefined,
      description: formData.description.trim(),
      date: new Date(formData.date),
      exemptFrom4x1000: formData.exemptFrom4x1000,
      tax4x1000,
    };
    onSave(transaction);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nueva Transacción</h1>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields (omit here for brevity) */}
        {/* Tipo, Monto, Cuenta, Destino, Categoría, Descripción, Fecha, Exento */}
        <Button type="submit" className="w-full" size="lg">
          <Save size={20} className="mr-2" /> Guardar Transacción
        </Button>
      </form>
    </div>
  );
};
