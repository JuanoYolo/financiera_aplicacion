import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Calendar, CreditCard as CreditCardIcon } from 'lucide-react';
import { Account } from '../../types/financial';
import { formatCurrency, getAvailableBalance, getNextCreditCardDates, getAccountTypeConfig } from '../../utils/financial';

interface AccountsListProps {
  accounts: Account[];
  onAddAccount: () => void;
  onAccountSelect: (account: Account) => void;
}

export const AccountsList = ({ accounts, onAddAccount, onAccountSelect }: AccountsListProps) => {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Cuentas</h1>
        <Button onClick={onAddAccount} size="sm" className="bg-gradient-primary">
          <Plus size={16} className="mr-1" />
          Agregar
        </Button>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Ahorro</p>
          <p className="font-semibold text-success">
            {accounts.filter(a => a.type === 'savings').length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Corriente</p>
          <p className="font-semibold text-primary">
            {accounts.filter(a => a.type === 'checking').length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Crédito</p>
          <p className="font-semibold text-warning">
            {accounts.filter(a => a.type === 'credit').length}
          </p>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCardIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tienes cuentas registradas</h3>
            <p className="text-muted-foreground mb-4">
              Agrega tu primera cuenta para comenzar a gestionar tus finanzas
            </p>
            <Button onClick={onAddAccount} className="bg-gradient-primary">
              <Plus size={16} className="mr-2" />
              Crear Primera Cuenta
            </Button>
          </Card>
        ) : (
          accounts.map((account) => {
            const config = getAccountTypeConfig(account.type);
            const availableBalance = getAvailableBalance(account);
            const creditDates = account.type === 'credit' ? getNextCreditCardDates(account) : null;

            return (
              <Card 
                key={account.id} 
                className="p-4 cursor-pointer hover:shadow-account transition-all duration-200"
                onClick={() => onAccountSelect(account)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config.bgColor}`}>
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className={`text-sm ${config.textColor}`}>
                        {config.label}
                        {account.exemptFrom4x1000 && (
                          <span className="ml-2 text-xs bg-success-light text-success px-1 rounded">
                            Exenta 4×1000
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(account.balance)}
                    </p>
                    
                    {account.type === 'credit' && account.creditLimit && (
                      <div className="text-sm text-muted-foreground">
                        <p>Disponible: {formatCurrency(availableBalance)}</p>
                        <p>Límite: {formatCurrency(account.creditLimit)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credit card specific info */}
                {account.type === 'credit' && creditDates && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Corte: {creditDates.cutoffDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Pago: {creditDates.paymentDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};