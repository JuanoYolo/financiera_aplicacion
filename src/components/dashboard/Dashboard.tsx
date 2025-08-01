import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { Account, Transaction } from '../../types/financial';
import { formatCurrency, calculateTotalPatrimony, getNextCreditCardDates } from '../../utils/financial';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  onNewTransaction: () => void;
}

export const Dashboard = ({ accounts, transactions, onNewTransaction }: DashboardProps) => {
  const totalPatrimony = calculateTotalPatrimony(accounts);
  
  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get upcoming credit card payments
  const upcomingPayments = accounts
    .filter(acc => acc.type === 'credit')
    .map(acc => {
      const dates = getNextCreditCardDates(acc);
      return dates ? { account: acc, ...dates } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  // Calculate monthly expenses
  const currentDate = new Date();
  const monthlyExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && 
             tDate.getMonth() === currentDate.getMonth() &&
             tDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-header text-white p-6 -mx-4 -mt-4">
        <div className="pt-safe">
          <h1 className="text-2xl font-bold mb-2">FinApp</h1>
          <p className="text-white/80">Bienvenido de vuelta</p>
        </div>
      </div>

      {/* Patrimony Summary */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-1">Patrimonio Total</p>
          <h2 className="text-3xl font-bold text-primary mb-4">
            {formatCurrency(totalPatrimony)}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingUp size={16} />
            <span>Este mes: {formatCurrency(monthlyExpenses)} gastados</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onNewTransaction}
          className="h-16 flex-col gap-2 bg-gradient-primary shadow-account"
          size="lg"
        >
          <Plus size={20} />
          <span className="text-sm">Nueva Transacción</span>
        </Button>
        
        <Card className="p-4 flex items-center justify-center">
          <div className="text-center">
            <CreditCard className="mx-auto mb-2 text-muted-foreground" size={20} />
            <p className="text-sm text-muted-foreground">
              {accounts.filter(a => a.type === 'credit').length} tarjetas
            </p>
          </div>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-warning" />
            <h3 className="font-semibold">Próximos Pagos</h3>
          </div>
          <div className="space-y-2">
            {upcomingPayments.map((payment) => (
              <div key={payment!.account.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{payment!.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Pago: {payment!.paymentDate.toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive">
                    {formatCurrency(payment!.account.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Transacciones Recientes</h3>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay transacciones registradas
            </p>
          ) : (
            recentTransactions.map((transaction) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              return (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {account?.name} • {transaction.date.toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.tax4x1000 && transaction.tax4x1000 > 0 && (
                      <p className="text-xs text-muted-foreground">
                        4×1000: {formatCurrency(transaction.tax4x1000)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};