import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../ui/use-toast';
import type { Account, AccountType } from '../../types/financial';

interface AccountFormProps {
  initial?: Partial<Account>;
  onSave: (data: Omit<Account, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ initial = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initial.name || '');
  const [type, setType] = useState<AccountType>(initial.type || 'savings');
  const [provider, setProvider] = useState(initial.provider || 'Bancolombia');
  const [balance, setBalance] = useState(initial.balance?.toString() || '0');
  const [creditLimit, setCreditLimit] = useState(initial.creditLimit?.toString() || '0');
  const [cutoffDay, setCutoffDay] = useState(initial.cutoffDay?.toString() || '1');
  const [paymentDay, setPaymentDay] = useState(initial.paymentDay?.toString() || '1');
  const [exempt, setExempt] = useState(initial.exemptFrom4x1000 || false);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }
    onSave({
      name: name.trim(),
      type,
      provider,
      balance: parseFloat(balance),
      creditLimit: type === 'credit' ? parseFloat(creditLimit) : undefined,
      cutoffDay: type === 'credit' ? parseInt(cutoffDay, 10) : undefined,
      paymentDay: type === 'credit' ? parseInt(paymentDay, 10) : undefined,
      exemptFrom4x1000: exempt,
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-6 p-6 space-y-6 shadow-card rounded-2xl">
      <h2 className="text-2xl font-bold text-primary">Crear / Editar Cuenta</h2>
      <div className="grid grid-cols-1 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la cuenta" />
        </div>

        {/* Tipo de cuenta */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de cuenta</label>
          <Select value={type} onValueChange={v => setType(v as AccountType)}>
            <SelectTrigger className="w-full" />
            <SelectContent className="z-50" position="popper" sideOffset={4}>
              <SelectItem value="savings">Ahorro</SelectItem>
              <SelectItem value="checking">Corriente</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium mb-1">Proveedor/Banco</label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-full" />
            <SelectContent className="z-50" position="popper" sideOffset={4}>
              <SelectItem value="Bancolombia">Bancolombia</SelectItem>
              <SelectItem value="Nequi">Nequi</SelectItem>
              <SelectItem value="Nu">Nu</SelectItem>
              <SelectItem value="Lulo">Lulo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Saldo inicial y exención */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Saldo inicial</label>
            <Input
              type="number"
              value={balance}
              onChange={e => setBalance(e.target.value)}
            />
          </div>
          <div className="flex items-center mt-6">
            <Checkbox
              checked={exempt}
              onCheckedChange={checked => setExempt(checked as boolean)}
            />
            <span className="ml-2 text-sm">Exenta 4×1000</span>
          </div>
        </div>

        {/* Campos de crédito */}
        {type === 'credit' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Límite crédito</label>
              <Input
                type="number"
                value={creditLimit}
                onChange={e => setCreditLimit(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Día de corte</label>
              <Input
                type="number"
                value={cutoffDay}
                onChange={e => setCutoffDay(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Días hasta pago</label>
              <Input
                type="number"
                value={paymentDay}
                onChange={e => setPaymentDay(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-border">
        <Button variant="secondary" onClick={onCancel} className="px-6">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="px-6">
          Guardar
        </Button>
      </div>
    </Card>
  );
};
