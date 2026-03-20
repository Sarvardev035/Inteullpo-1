import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { accountsApi } from '../api/accountsApi';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const refreshAccounts = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAccounts([]);
      return;
    }

    setAccountsLoading(true);
    try {
      const response = await accountsApi.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.content || [];
      setAccounts(data);
    } catch (err) {
      console.error('Failed to refresh accounts:', err);
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    return { totalBalance };
  }, [accounts]);

  const value = useMemo(
    () => ({ accounts, accountsLoading, refreshAccounts, ...totals }),
    [accounts, accountsLoading, refreshAccounts, totals]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
