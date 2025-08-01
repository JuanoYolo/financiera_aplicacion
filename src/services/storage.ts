import { Account, Transaction } from '../types/financial';

const STORAGE_KEYS = {
  ACCOUNTS: 'finapp_accounts',
  TRANSACTIONS: 'finapp_transactions',
  SETTINGS: 'finapp_settings'
} as const;

// Account storage
export const saveAccounts = (accounts: Account[]) => {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const loadAccounts = (): Account[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) return [];
    
    const accounts = JSON.parse(data);
    return accounts.map((account: any) => ({
      ...account,
      createdAt: new Date(account.createdAt)
    }));
  } catch (error) {
    console.error('Error loading accounts:', error);
    return [];
  }
};

// Transaction storage
export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) return [];
    
    const transactions = JSON.parse(data);
    return transactions.map((transaction: any) => ({
      ...transaction,
      date: new Date(transaction.date),
      createdAt: new Date(transaction.createdAt)
    }));
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

// Settings storage
export const saveSettings = (settings: any) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): any => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

// Clear all data (for reset functionality)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};