import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAccounts } from '../api/accountsApi';
import { convertToUZS } from '../utils/format';

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
      const data = await getAccounts();
      setAccounts(Array.isArray(data) ? data : data?.content || []);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const totals = useMemo(() => {
    const totalBalanceUZS = accounts.reduce(
      (sum, acc) => sum + convertToUZS(acc.balance, acc.currency),
      0
    );
    return { totalBalanceUZS };
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
