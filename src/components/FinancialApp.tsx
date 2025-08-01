import { useState } from 'react';
import { BottomNavigation } from './layout/BottomNavigation';
import { Dashboard } from './dashboard/Dashboard';
import { AccountsList } from './accounts/AccountsList';
import { NewTransactionForm } from './transactions/NewTransactionFormProps';
import { AccountForm }       from './accounts/AccountForm';
import { useFinancialData }  from '../hooks/useFinancialData';          // <-- Y aquí

import type { Account } from '../types/financial';

export const FinancialApp = () => {
  const [activeTab, setActiveTab] = useState<'home'|'accounts'|'new'|'reports'>('home');
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account|undefined>();

  const {
    accounts,
    transactions,
    isLoading,
    addAccount,
    updateAccount,
    addTransaction
  } = useFinancialData();

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === 'new') {
      setShowNewTransaction(true);
    } else {
      setShowNewTransaction(false);
      setEditingAccount(undefined);
      setActiveTab(tab);
    }
  };

  const handleNewTransaction = () => setShowNewTransaction(true);

  const handleSaveTransaction = (data:any) => {
    addTransaction(data);
    setShowNewTransaction(false);
    setActiveTab('home');
  };

  const handleAddAccount = () => {
    setEditingAccount(undefined);
    setActiveTab('accounts');
  };

  const handleSelectAccount = (account:Account) => {
    setEditingAccount(account);
    setActiveTab('accounts');
  };

  const handleSaveAccount = (data: Omit<Account,'id'|'createdAt'>) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
    } else {
      addAccount(data);
    }
    setEditingAccount(undefined);
    setActiveTab('accounts');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando FinApp...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <main className="p-4">
          {showNewTransaction ? (
            <NewTransactionForm
              accounts={accounts}
              onSave={handleSaveTransaction}
              onCancel={() => setShowNewTransaction(false)}
            />
          ) : activeTab === 'accounts' ? (
            editingAccount ? (
              <AccountForm
                initial={editingAccount}
                onSave={handleSaveAccount}
                onCancel={() => setEditingAccount(undefined)}
              />
            ) : (
              <AccountsList
                accounts={accounts}
                onAddAccount={() => handleSelectAccount(undefined)}
                onAccountSelect={handleSelectAccount}
              />
            )
          ) : activeTab === 'home' ? (
            <Dashboard
              accounts={accounts}
              transactions={transactions}
              onNewTransaction={handleNewTransaction}
            />
          ) : (
            <div className="text-center py-20 text-muted-foreground">Próximamente</div>
          )}
        </main>

        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};
