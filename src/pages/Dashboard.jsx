import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Bell, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import CountUp from 'react-countup';
import AppShell from '../components/Layout/AppShell';
import { StatCard, EmptyState, ProgressBar, Button, TransactionItem } from '../components/ui';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useFinance } from '../context/FinanceContext';
import { getIncome } from '../api/incomeApi';
import { getExpenses } from '../api/expensesApi';
import { getDebts } from '../api/debtsApi';
import { getBudget, getBudgetCategories } from '../api/budgetApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency, groupByDate, getCategoryMeta, getTimeOfDay, smartDate } from '../utils/helpers';
import { pageVariants, listVariants, itemVariants, cardVariants } from '../utils/animations';

export default function Dashboard() {
  const { accounts, totalBalanceUZS, refreshAccounts } = useFinance();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budget, setBudgetState] = useState({ target: 0 });
  const [categories, setCategories] = useState([]);
  const [last7Days, setLast7Days] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [inc, exp, d, b, c] = await Promise.all([
          getIncome(), getExpenses(), getDebts(), getBudget(), getBudgetCategories(),
        ]);
        setIncome(toArray(inc));
        setExpenses(toArray(exp));
        setDebts(toArray(d));
        setBudgetState(b || { target: 0 });
        setCategories(toArray(c));
        
        generateLast7DaysChart(toArray(exp));
      } catch (error) {
        console.error(getErrorMessage(error, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const generateLast7DaysChart = (expensesList) => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = expensesList
        .filter((e) => e.date.split('T')[0] === dateStr)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      data.push({ date: format(date, 'EEE'), value: dayExpenses, fullDate: dateStr });
    }
    setLast7Days(data);
  };

  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthIncome = useMemo(() => income.filter((x) => {
    const d = new Date(x.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).reduce((s, x) => s + Number(x.amount || 0), 0), [income, month, year]);
  
  const monthExpense = useMemo(() => expenses.filter((x) => {
    const d = new Date(x.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).reduce((s, x) => s + Number(x.amount || 0), 0), [expenses, month, year]);
  
  const net = monthIncome - monthExpense;
  const owedToMe = debts.filter((d) => d.type === 'LENT' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0);
  const iOwe = debts.filter((d) => d.type === 'BORROWED' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0);
  const openDebts = debts.filter((d) => d.status === 'OPEN').length;
  const budgetTarget = Number(budget?.target || budget?.incomeTarget || 0);
  const budgetHealth = budgetTarget > 0 ? Math.max(0, 100 - ((monthExpense / budgetTarget) * 100)) : 100;

  const recentTx = useMemo(() => {
    const merged = [
      ...expenses.map((e) => ({ ...e, type: 'expense', categoryMeta: getCategoryMeta(e.category) })),
      ...income.map((i) => ({ ...i, type: 'income', categoryMeta: getCategoryMeta(i.category) })),
    ];
    return merged.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [income, expenses]);

  const budgetCategories = useMemo(() => {
    return categories.slice(0, 4).map((c) => ({
      category: c.category,
      spent: Number(c.spentAmount || 0),
      limit: Number(c.limitAmount || 0),
      meta: getCategoryMeta(c.category),
    }));
  }, [categories]);

  return (
    <AppShell title="Dashboard">
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="space-y-6 pb-24"
      >
        {/* SECTION 1: Hero Header */}
        <motion.div variants={cardVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Good {getTimeOfDay().replace('_', ' ')} 👋</h1>
            <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <button className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
            <Bell size={20} className="text-slate-600" />
          </button>
        </motion.div>

        {loading ? (
          <LoadingSpinner label="Loading dashboard..." />
        ) : (
          <>
            {/* SECTION 2: Big Balance Hero Card */}
            <motion.div
              variants={cardVariants}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-lg"
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
              
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-80">TOTAL BALANCE</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    <CountUp end={totalBalanceUZS} duration={2} separator="," />
                  </span>
                  <span className="text-lg opacity-80">UZS</span>
                </div>
                <p className="mt-2 text-sm opacity-75">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>

                {/* Income/Expense Row */}
                <div className="mt-6 flex gap-8">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-400/20 p-3">
                      <TrendingUp size={20} className="text-green-200" />
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Income</p>
                      <p className="text-xl font-semibold text-green-200">↑ {formatCurrency(monthIncome)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-400/20 p-3">
                      <TrendingDown size={20} className="text-red-200" />
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Expenses</p>
                      <p className="text-xl font-semibold text-red-200">↓ {formatCurrency(monthExpense)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECTION 3: Quick Stat Pills */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
            >
              <motion.div variants={itemVariants} className="rounded-2xl bg-purple-50 p-4 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 uppercase">Net Savings</p>
                <p className="mt-2 text-xl font-bold text-purple-700">{formatCurrency(net)}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 uppercase">Accounts</p>
                <p className="mt-2 text-xl font-bold text-blue-700">{accounts.length}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                <p className="text-xs font-medium text-amber-600 uppercase">Open Debts</p>
                <p className="mt-2 text-xl font-bold text-amber-700">{openDebts}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-2xl bg-green-50 p-4 border border-green-100">
                <p className="text-xs font-medium text-green-600 uppercase">Budget Health</p>
                <p className="mt-2 text-xl font-bold text-green-700">{budgetHealth.toFixed(0)}%</p>
              </motion.div>
            </motion.div>

            {/* SECTION 4: My Accounts */}
            {accounts.length > 0 && (
              <motion.div variants={cardVariants} className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">My Accounts</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  <AnimatePresence>
                    {accounts.map((acc, idx) => (
                      <motion.div
                        key={acc.id}
                        variants={itemVariants}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="min-w-[280px] rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md"
                      >
                        <p className="text-xs font-medium opacity-75">{acc.type || 'CARD'}</p>
                        <p className="mt-2 text-lg font-semibold">{acc.name}</p>
                        <p className="mt-4 text-sm opacity-70">•••• •••• •••• {String(acc.id).slice(-4)}</p>
                        <p className="mt-4 text-2xl font-bold">{formatCurrency(acc.balance, acc.currency)}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* SECTION 5: Two-Column Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <motion.div variants={cardVariants} className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                {recentTx.length ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {recentTx.map((tx, idx) => (
                        <motion.div
                          key={`${tx.type}-${tx.id}`}
                          variants={itemVariants}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center justify-between rounded-xl border p-3 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-full p-2" style={{ backgroundColor: tx.categoryMeta?.bg }}>
                              <span className="text-lg">{tx.categoryMeta?.emoji}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{tx.description || tx.category}</p>
                              <p className="text-xs text-slate-500">{smartDate(tx.date)}</p>
                            </div>
                          </div>
                          <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <EmptyState
                    icon="📊"
                    title="No transactions yet"
                    description="Your transaction history will appear here"
                  />
                )}
              </motion.div>

              {/* Budget Health */}
              <motion.div variants={cardVariants} className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">Budget by Category</h3>
                {budgetCategories.length ? (
                  <div className="space-y-4">
                    {budgetCategories.map((cat, idx) => {
                      const percent = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                      const statusColor = percent >= 90 ? 'text-red-600' : percent >= 70 ? 'text-amber-600' : 'text-green-600';
                      const barColor = percent >= 90 ? 'bg-red-600' : percent >= 70 ? 'bg-amber-500' : 'bg-green-500';
                      return (
                        <motion.div
                          key={cat.category}
                          variants={itemVariants}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cat.meta?.emoji}</span>
                              <span className="text-sm font-medium">{cat.category}</span>
                            </div>
                            <span className={`text-sm font-semibold ${statusColor}`}>
                              {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                            </span>
                          </div>
                          <ProgressBar percent={Math.min(100, percent)} color={barColor.replace('bg-', '')} animate />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon="🎯"
                    title="No budget limits set"
                    description="Set category limits in Budget page"
                  />
                )}
              </motion.div>
            </div>

            {/* SECTION 6: Quick Actions */}
            <motion.div variants={listVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <motion.div variants={itemVariants}>
                <Button variant="primary" className="w-full" size="sm">
                  <Plus size={16} className="mr-1" /> Expense
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="primary" className="w-full" size="sm">
                  <Plus size={16} className="mr-1" /> Income
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="secondary" className="w-full" size="sm">
                  Transfer
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="secondary" className="w-full" size="sm">
                  Debt
                </Button>
              </motion.div>
            </motion.div>

            {/* SECTION 7: Last 7 Days Chart */}
            <motion.div variants={cardVariants} className="rounded-2xl border bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Last 7 Days Spending</h3>
              <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AppShell>
  );
}
