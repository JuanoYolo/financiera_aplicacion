import { Account, Transaction, Category} from '../types/financial';

// 4x1000 tax calculation (Colombia financial transaction tax)
export const calculate4x1000Tax = (amount: number, exemptFrom4x1000: boolean): number => {
  if (exemptFrom4x1000) return 0;
  return Math.round((amount * 0.004) * 100) / 100; // 4 per 1000, rounded to 2 decimals
};

// Format currency for Colombian pesos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format numbers with thousand separators
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('es-CO').format(amount);
};

// Calculate account available balance (for credit cards)
export function getAvailableBalance(account: Account): number {
  if (account.type === 'credit' && typeof account.creditLimit === 'number') {
    return Math.max(0, account.creditLimit - Math.abs(account.balance));
  }
  return account.balance;
};

// Calculate next cutoff and payment dates for credit cards
export const getNextCreditCardDates = (account: Account) => {
  if (account.type !== 'credit' || !account.cutoffDay || !account.paymentDay) {
    return null;
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate next cutoff date
  let cutoffDate = new Date(currentYear, currentMonth, account.cutoffDay);
  if (cutoffDate <= today) {
    cutoffDate = new Date(currentYear, currentMonth + 1, account.cutoffDay);
  }
  
  // Calculate payment date (days after cutoff)
  const paymentDate = new Date(cutoffDate);
  paymentDate.setDate(cutoffDate.getDate() + account.paymentDay);
  
  return {
    cutoffDate,
    paymentDate
  };
};

// Get category icon
export const getCategoryIcon = (category: Category): string => {
  const icons = {
    'Comida': '🍽️',
    'Transporte': '🚗',
    'Ocio': '🎮',
    'Otros': '📦'
  };
  return icons[category];
};

// Get account type icon and color
export const getAccountTypeConfig = (type: Account['type']) => {
  const config = {
    savings: {
      icon: '💰',
      bgColor: 'bg-success-light',
      textColor: 'text-success',
      label: 'Ahorro'
    },
    checking: {
      icon: '🏛️',
      bgColor: 'bg-primary-light',
      textColor: 'text-primary',
      label: 'Corriente'
    },
    credit: {
      icon: '💳',
      bgColor: 'bg-warning/20',
      textColor: 'text-warning',
      label: 'Crédito'
    }
  };
  return config[type];
};

// Calculate total balance excluding credit card debt
export const calculateTotalPatrimony = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => {
    if (account.type === 'credit') {
      // For credit cards, negative balance is debt, so we subtract it
      return total - Math.abs(account.balance);
    }
    return total + account.balance;
  }, 0);
};

// Generate monthly expense summary by category
export const getMonthlyExpensesByCategory = (
  transactions: Transaction[],
  month: number,
  year: number
): Record<Category, number> => {
  const monthlyExpenses: Record<Category, number> = {
    'Comida': 0,
    'Transporte': 0,
    'Ocio': 0,
    'Otros': 0
  };

  transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && 
             tDate.getMonth() === month && 
             tDate.getFullYear() === year &&
             t.category;
    })
    .forEach(t => {
      if (t.category) {
        monthlyExpenses[t.category] += t.amount;
      }
    });

  return monthlyExpenses;
};