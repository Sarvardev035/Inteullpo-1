import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook for fetching dashboard statistics
 * Uses Promise.allSettled so one failing API doesn't crash the entire dashboard
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.get('/api/accounts'),
          api.get('/api/expenses'),
          api.get('/api/income'),
        ]);

        const accountsData = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const expensesData = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const incomeData = results[2].status === 'fulfilled' ? results[2].value.data : [];

        // Calculate this month's totals
        const now = new Date();
        const thisMonth = (items) => {
          return items.filter((i) => {
            const d = new Date(i.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
        };

        const totalBalance = accountsData.reduce((sum, a) => sum + (a.balance || 0), 0);
        const monthlyIncome = thisMonth(incomeData).reduce((sum, i) => sum + (i.amount || 0), 0);
        const monthlyExpenses = thisMonth(expensesData).reduce((sum, e) => sum + (e.amount || 0), 0);
        const netSavings = monthlyIncome - monthlyExpenses;

        // Combine and sort recent transactions
        const recentTransactions = [
          ...expensesData.map((e) => ({ ...e, type: 'expense', color: '#f43f5e' })),
          ...incomeData.map((i) => ({ ...i, type: 'income', color: '#10b981' })),
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

        setStats({
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          netSavings,
          accountCount: accountsData.length,
          accounts: accountsData,
          recentTransactions,
        });
        setError(null);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err);
        // Set default empty state
        setStats({
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          netSavings: 0,
          accountCount: 0,
          accounts: [],
          recentTransactions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { stats, loading, error };
};
