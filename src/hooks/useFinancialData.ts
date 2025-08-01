import { useState, useEffect } from 'react';
import { Account, Transaction } from '../types/financial';
import { saveAccounts, loadAccounts, saveTransactions, loadTransactions } from '../services/storage';
import { toast } from '../components/ui/use-toast';

export const useFinancialData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    try {
      const loadedAccounts = loadAccounts();
      const loadedTransactions = loadTransactions();
      
      setAccounts(loadedAccounts);
      setTransactions(loadedTransactions);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Se iniciará con datos vacíos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save accounts when they change
  useEffect(() => {
    if (!isLoading && accounts.length >= 0) {
      saveAccounts(accounts);
    }
  }, [accounts, isLoading]);

  // Save transactions when they change
  useEffect(() => {
    if (!isLoading && transactions.length >= 0) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoading]);

  const addAccount = (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    setAccounts(prev => [...prev, newAccount]);
    
    toast({
      title: "Cuenta creada",
      description: `La cuenta "${newAccount.name}" ha sido agregada exitosamente.`
    });

    return newAccount;
  };

  const updateAccount = (accountId: string, updates: Partial<Account>) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, ...updates }
          : account
      )
    );

    toast({
      title: "Cuenta actualizada",
      description: "Los cambios han sido guardados."
    });
  };

  const deleteAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    // Check if account has transactions
    const hasTransactions = transactions.some(t => 
      t.accountId === accountId || t.destinationAccountId === accountId
    );

    if (hasTransactions) {
      toast({
        title: "No se puede eliminar",
        description: "Esta cuenta tiene transacciones asociadas. Elimina primero las transacciones.",
        variant: "destructive"
      });
      return;
    }

    setAccounts(prev => prev.filter(a => a.id !== accountId));
    
    toast({
      title: "Cuenta eliminada",
      description: `La cuenta "${account.name}" ha sido eliminada.`
    });
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    // Update account balances
    setAccounts(prev => prev.map(account => {
      let newBalance = account.balance;

      // Update source account balance
      if (account.id === transactionData.accountId) {
        switch (transactionData.type) {
          case 'income':
            newBalance += transactionData.amount;
            break;
          case 'expense':
            newBalance -= (transactionData.amount + (transactionData.tax4x1000 || 0));
            break;
          case 'transfer':
            newBalance -= (transactionData.amount + (transactionData.tax4x1000 || 0));
            break;
        }
      }

      // Update destination account balance (for transfers)
      if (transactionData.type === 'transfer' && account.id === transactionData.destinationAccountId) {
        newBalance += transactionData.amount;
      }

      return { ...account, balance: newBalance };
    }));

    setTransactions(prev => [...prev, newTransaction]);

    toast({
      title: "Transacción registrada",
      description: `${transactionData.type === 'income' ? 'Ingreso' : 
                    transactionData.type === 'expense' ? 'Gasto' : 'Transferencia'} de ${new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(transactionData.amount)} registrado exitosamente.`
    });

    return newTransaction;
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Reverse account balance changes
    setAccounts(prev => prev.map(account => {
      let newBalance = account.balance;

      // Reverse source account balance
      if (account.id === transaction.accountId) {
        switch (transaction.type) {
          case 'income':
            newBalance -= transaction.amount;
            break;
          case 'expense':
            newBalance += (transaction.amount + (transaction.tax4x1000 || 0));
            break;
          case 'transfer':
            newBalance += (transaction.amount + (transaction.tax4x1000 || 0));
            break;
        }
      }

      // Reverse destination account balance (for transfers)
      if (transaction.type === 'transfer' && account.id === transaction.destinationAccountId) {
        newBalance -= transaction.amount;
      }

      return { ...account, balance: newBalance };
    }));

    setTransactions(prev => prev.filter(t => t.id !== transactionId));

    toast({
      title: "Transacción eliminada",
      description: "La transacción ha sido eliminada y los saldos han sido actualizados."
    });
  };

  return {
    accounts,
    transactions,
    isLoading,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction
  };
};