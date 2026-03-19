import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccounts, type Account } from '../api/accountsApi';
import { toast } from 'react-toastify';

interface FinanceContextType {
  accounts: Account[];
  totalBalance: number;
  loading: boolean;
  refreshAccounts: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      
      // Parse backend structure if needed
      const items = Array.isArray(data) ? data : data?.content || [];
      setAccounts(items);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch accounts if token exists (so we don't spam API when unauthenticated)
    const token = localStorage.getItem('token');
    if (token) {
      fetchAccounts();
    } else {
      setLoading(false);
    }
  }, []); // Initial load only, authentication flow will manage calling refreshAccounts after login

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        totalBalance,
        loading,
        refreshAccounts: fetchAccounts,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
