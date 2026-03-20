import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useFinance } from '../context/FinanceContext';
import { incomeApi } from '../api/incomeApi';
import { expensesApi } from '../api/expensesApi';
import { debtsApi } from '../api/debtsApi';
import { budgetApi } from '../api/budgetApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatMoney } from '../utils/format';
import { format } from 'date-fns';

export default function Dashboard() {
  const { accounts, totalBalanceUZS } = useFinance();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budget, setBudgetState] = useState({ target: 0 });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [inc, exp, d, b, c] = await Promise.all([
          incomeApi.getAll(), expensesApi.getAll(), debtsApi.getAll(), budgetApi.get(), budgetApi.getCategories(),
        ]);
        setIncome(toArray(inc?.data || inc));
        setExpenses(toArray(exp?.data || exp));
        setDebts(toArray(d?.data || d));
        setBudgetState((b?.data || b) || { target: 0 });
        setCategories(toArray(c?.data || c));
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const month = new Date().getMonth();
  const monthIncome = useMemo(() => income.filter((x) => new Date(x.date).getMonth() === month).reduce((s, x) => s + Number(x.amount || 0), 0), [income, month]);
  const monthExpense = useMemo(() => expenses.filter((x) => new Date(x.date).getMonth() === month).reduce((s, x) => s + Number(x.amount || 0), 0), [expenses, month]);
  const net = monthIncome - monthExpense;
  const owedToMe = debts.filter((d) => d.type === 'LENT' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0);
  const iOwe = debts.filter((d) => d.type === 'BORROWED' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0);

  const tx = useMemo(() => {
    const merged = [
      ...income.map((i) => ({ ...i, txType: 'income' })),
      ...expenses.map((e) => ({ ...e, txType: 'expense' })),
    ];
    return merged.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [income, expenses]);

  const last7DaysSpending = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - idx));
      const key = d.toISOString().slice(0, 10);
      const value = expenses.filter((e) => String(e.date).slice(0, 10) === key).reduce((s, e) => s + Number(e.amount || 0), 0);
      return { label: format(d, 'MMM dd'), value };
    });
  }, [expenses]);

  const budgetTarget = Number(budget?.target || budget?.incomeTarget || 0);
  const budgetUsed = budgetTarget > 0 ? (monthExpense / budgetTarget) * 100 : 0;

  return (
    <AppShell title="Dashboard">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">Good day 👋</h2>
            <p className="text-sm text-slate-500">Dashboard overview</p>
          </div>
          <p className="text-sm text-slate-500">{format(new Date(), 'PPP')}</p>
        </div>

        {loading ? <LoadingSpinner label="Loading dashboard..." /> : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Balance" value={formatMoney(totalBalanceUZS, 'UZS')} color="text-slate-900" />
              <StatCard label="Income this month" value={formatMoney(monthIncome, 'UZS')} color="text-green-600" />
              <StatCard label="Expenses this month" value={formatMoney(monthExpense, 'UZS')} color="text-red-600" />
              <StatCard label="Net savings" value={formatMoney(net, 'UZS')} color={net >= 0 ? 'text-blue-700' : 'text-red-600'} />
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <h3 className="mb-3 text-lg font-semibold">Accounts</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {accounts.map((a) => (
                  <div key={a.id} className="min-w-[240px] rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#2563eb] p-4 text-white">
                    <p className="text-xs opacity-80">Finly Card</p>
                    <p className="mt-1 text-lg font-semibold">{a.name}</p>
                    <p className="mt-3 text-sm">•••• •••• •••• {String(a.id).slice(-4)}</p>
                    <p className="mt-3 text-xl font-bold">{formatMoney(a.balance, a.currency)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4">
                <h3 className="mb-3 text-lg font-semibold">Recent transactions</h3>
                <div className="space-y-2">
                  {tx.length ? tx.map((item) => (
                    <div key={`${item.txType}-${item.id}`} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{item.description || item.source || item.category}</p>
                        <p className="text-sm text-slate-500">{String(item.date).slice(0, 10)}</p>
                      </div>
                      <p className={`font-semibold ${item.txType === 'income' ? 'text-green-600' : 'text-red-600'}`}>{item.txType === 'income' ? '+' : '-'}{formatMoney(item.amount, item.currency || 'UZS')}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No recent transactions.</p>}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border bg-white p-4">
                  <h3 className="text-lg font-semibold">Debt summary</h3>
                  <p className="mt-2 text-sm text-slate-600">Owed to me: <span className="font-semibold text-green-700">{formatMoney(owedToMe, 'UZS')}</span></p>
                  <p className="text-sm text-slate-600">I owe: <span className="font-semibold text-red-700">{formatMoney(iOwe, 'UZS')}</span></p>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <h3 className="text-lg font-semibold">Budget health</h3>
                  <p className="mt-2 text-sm text-slate-600">{budgetTarget ? `${budgetUsed.toFixed(1)}% used` : 'No target set'}</p>
                  <div className="mt-2 h-3 rounded-full bg-slate-100">
                    <div className={`${budgetUsed > 90 ? 'bg-red-500' : budgetUsed >= 70 ? 'bg-amber-500' : 'bg-green-500'} h-3 rounded-full`} style={{ width: `${Math.min(100, budgetUsed)}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <h3 className="text-lg font-semibold">Category progress</h3>
                  <div className="mt-2 space-y-2">
                    {categories.slice(0, 4).map((c) => {
                      const limit = Number(c.limitAmount || c.limit || 0);
                      const spent = Number(c.spentAmount || c.spent || 0);
                      const pct = limit > 0 ? (spent / limit) * 100 : 0;
                      return (
                        <div key={c.category}>
                          <div className="mb-1 flex items-center justify-between text-sm"><span>{c.category}</span><span>{pct.toFixed(0)}%</span></div>
                          <div className="h-2 rounded-full bg-slate-100"><div className={`${pct > 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'} h-2 rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <h3 className="mb-3 text-lg font-semibold">Last 7 days spending</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysSpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

function StatCard({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
