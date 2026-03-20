import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { EmptyState } from '../components/ui';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  getExpenseStats,
  getIncomeStats,
  getCategoryBreakdown,
  getIncomeVsExpense,
} from '../api/statisticsApi';
import { getErrorMessage, toArray } from '../utils/http';
import {
  formatCurrency,
  getCategoryMeta,
} from '../utils/helpers';
import {
  pageVariants,
  listVariants,
  itemVariants,
  cardVariants,
} from '../utils/animations';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Monthly');
  const [incomeStats, setIncomeStats] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const periodKey = period.toUpperCase();
      const [inc, exp, cat, ivse] = await Promise.all([
        getIncomeStats(periodKey),
        getExpenseStats(periodKey),
        getCategoryBreakdown(),
        getIncomeVsExpense(),
      ]);
      setIncomeStats(toArray(inc));
      setExpenseStats(toArray(exp));
      setCategoryBreakdown(toArray(cat));
      setIncomeVsExpense(toArray(ivse));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period]);

  const totals = useMemo(() => {
    const totalIn = incomeStats.reduce((s, x) => s + (x.amount || 0), 0);
    const totalOut = expenseStats.reduce((s, x) => s + (x.amount || 0), 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [incomeStats, expenseStats]);

  const expenseCategoryData = useMemo(() => {
    return categoryBreakdown
      .filter((cat) => cat.type === 'EXPENSE')
      .map((cat) => ({
        name: cat.category,
        value: cat.amount || 0,
      }))
      .filter((cat) => cat.value > 0);
  }, [categoryBreakdown]);

  const incomeCategoryData = useMemo(() => {
    return categoryBreakdown
      .filter((cat) => cat.type === 'INCOME')
      .map((cat) => ({
        name: cat.category,
        value: cat.amount || 0,
      }))
      .filter((cat) => cat.value > 0);
  }, [categoryBreakdown]);

  const chartData = useMemo(() => {
    if (incomeVsExpense.length > 0) return incomeVsExpense;
    return incomeStats.map((item, idx) => ({
      name: item.period || `Period ${idx + 1}`,
      income: item.amount || 0,
      expense: expenseStats[idx]?.amount || 0,
    }));
  }, [incomeVsExpense, incomeStats, expenseStats]);

  const savingsTrendData = useMemo(() => {
    return chartData.map((item) => ({
      name: item.name,
      savings: (item.income || 0) - (item.expense || 0),
    }));
  }, [chartData]);

  return (
    <AppShell title="Statistics">
      <div className="space-y-6 pb-24">
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold text-slate-900">Statistics</h1>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="space-y-6"
        >
          <motion.div variants={listVariants} className="grid gap-3 md:grid-cols-3">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-green-100 bg-green-50 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                Total Income
              </p>
              <p className="mt-3 text-3xl font-bold text-green-700">
                {formatCurrency(totals.totalIn)}
              </p>
              <p className="mt-2 text-xs text-green-600">
                {incomeStats.length} {incomeStats.length === 1 ? 'period' : 'periods'}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-red-100 bg-red-50 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Total Expenses
              </p>
              <p className="mt-3 text-3xl font-bold text-red-700">
                {formatCurrency(totals.totalOut)}
              </p>
              <p className="mt-2 text-xs text-red-600">
                {expenseStats.length} {expenseStats.length === 1 ? 'period' : 'periods'}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`rounded-2xl border p-6 ${
                totals.net >= 0
                  ? 'border-blue-100 bg-blue-50'
                  : 'border-amber-100 bg-amber-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  totals.net >= 0 ? 'text-blue-600' : 'text-amber-600'
                }`}
              >
                Net Savings
              </p>
              <p
                className={`mt-3 text-3xl font-bold ${
                  totals.net >= 0 ? 'text-blue-700' : 'text-amber-700'
                }`}
              >
                {formatCurrency(totals.net)}
              </p>
              <p
                className={`mt-2 text-xs ${
                  totals.net >= 0 ? 'text-blue-600' : 'text-amber-600'
                }`}
              >
                {totals.net >= 0 ? 'You saved' : 'Deficit of'} this period
              </p>
            </motion.div>
          </motion.div>

          {chartData.length > 0 && (
            <motion.div
              variants={cardVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-6 text-lg font-semibold text-slate-900">
                Income vs Expenses
              </h3>
              <div style={{ width: '100%', minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {expenseCategoryData.length > 0 && (
              <motion.div
                variants={cardVariants}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-6 text-lg font-semibold text-slate-900">
                  Expenses by Category
                </h3>
                <div style={{ width: '100%', minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f1f5f9',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                  {expenseCategoryData.map((cat, idx) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-slate-600">
                          {getCategoryMeta(cat.name).emoji}{' '}
                          {getCategoryMeta(cat.name).label}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {incomeCategoryData.length > 0 && (
              <motion.div
                variants={cardVariants}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-6 text-lg font-semibold text-slate-900">
                  Income by Category
                </h3>
                <div style={{ width: '100%', minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={incomeCategoryData}
                      layout="vertical"
                      margin={{ left: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f1f5f9',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          {savingsTrendData.length > 0 && (
            <motion.div
              variants={cardVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-6 text-lg font-semibold text-slate-900">
                Net Savings Trend
              </h3>
              <div style={{ width: '100%', minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={savingsTrendData}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSavings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {totals.totalIn === 0 && totals.totalOut === 0 && (
            <EmptyState
              icon="📊"
              title="No statistics yet"
              description="Start tracking your income and expenses to see detailed statistics"
            />
          )}
        </motion.div>
      )}
      </div>
    </AppShell>
  );
}
