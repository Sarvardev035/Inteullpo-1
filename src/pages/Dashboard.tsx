import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getExpenses, type Expense } from '../api/expensesApi';
import { getIncomes, type Income } from '../api/incomeApi';
import { getDebts, type Debt } from '../api/debtsApi';
import { getBudget } from '../api/budgetApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { totalBalance, loading: contextLoading } = useFinance();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  // We mock the budget response type for now until clarified
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [incData, expData, debtData, budData] = await Promise.all([
          getIncomes(), // Ideally filtered by month/year if API supports it natively
          getExpenses(month, year),
          getDebts(),
          getBudget().catch(() => ({ target: 0 }))
        ]);
        
        setIncomes(Array.isArray(incData) ? incData : incData?.content || []);
        setExpenses(Array.isArray(expData) ? expData : expData?.content || []);
        setDebts(Array.isArray(debtData) ? debtData : debtData?.content || []);
        setBudgetTarget(budData.target || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (contextLoading || loading) return <div className="p-8">Loading dashboard...</div>;

  // 1-4. Summary Stats
  const thisMonthIncomes = incomes.filter(i => new Date(i.date).getMonth() === new Date().getMonth());
  const totalIncome = thisMonthIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // 5. Recent 5 Transactions
  const allTransactions = [
    ...thisMonthIncomes.map(i => ({ ...i, type: 'income' })),
    ...expenses.map(e => ({ ...e, type: 'expense' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // 6. Debts Summary
  const owedToMe = debts.filter(d => d.type === 'LENT' && d.status === 'OPEN').reduce((sum, d) => sum + Number(d.amount), 0);
  const iOwe = debts.filter(d => d.type === 'BORROWED' && d.status === 'OPEN').reduce((sum, d) => sum + Number(d.amount), 0);

  // 7. Budget Health
  const budgetUsedPct = budgetTarget > 0 ? (totalExpense / budgetTarget) * 100 : 0;
  const budgetColor = budgetUsedPct < 70 ? 'bg-green-500' : budgetUsedPct < 90 ? 'bg-yellow-500' : 'bg-red-500';

  // 8. Bar chart: last 7 days spending
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayExp = expenses.filter(e => e.date.startsWith(date)).reduce((sum, e) => sum + Number(e.amount), 0);
    return { date: date.slice(5), amount: dayExp };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Balance</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Income (This Month)</p>
          <p className="mt-2 text-3xl font-bold text-green-600">+{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Expenses (This Month)</p>
          <p className="mt-2 text-3xl font-bold text-red-600">-{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Net Savings</p>
          <p className={`mt-2 text-3xl font-bold ${netSavings >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days Spending</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {allTransactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions found this month.</p>
              ) : (
                allTransactions.map((tx: any) => (
                  <div key={tx.id + tx.type} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{tx.description || tx.category}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Budget Health */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Health</h3>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">Spent: {totalExpense.toLocaleString()}</span>
              <span className="font-medium text-gray-900">Target: {budgetTarget ? budgetTarget.toLocaleString() : 'Not Set'}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${budgetColor}`} style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}></div>
            </div>
            <p className="mt-3 text-xs text-center text-gray-500">
              {budgetTarget > 0 ? `${budgetUsedPct.toFixed(1)}% of monthly budget used` : 'Set a budget to see health'}
            </p>
          </div>

          {/* Debts Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debts Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Owed to Me</span>
                <span className="font-bold text-green-700">{owedToMe.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">I Owe</span>
                <span className="font-bold text-red-700">{iOwe.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
