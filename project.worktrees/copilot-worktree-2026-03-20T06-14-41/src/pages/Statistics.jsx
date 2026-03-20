import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import TimePeriodFilter from '../components/Statistics/TimePeriodFilter';
import IncomeVsExpense from '../components/Statistics/IncomeVsExpense';
import ExpenseByCategory from '../components/Statistics/ExpenseByCategory';
import { statsApi } from '../api/statisticsApi';
import { getErrorMessage, toArray } from '../utils/http';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';

export default function Statistics() {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [expenseSeries, setExpenseSeries] = useState([]);
  const [incomeSeries, setIncomeSeries] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [exp, inc, cat, ivs] = await Promise.all([
        statsApi.expenses(period),
        statsApi.income(period),
        statsApi.breakdown(),
        statsApi.vsIncome(period),
      ]);
      setExpenseSeries(toArray(exp?.data || exp));
      setIncomeSeries(toArray(inc?.data || inc));
      setCategoryData(toArray(cat?.data || cat).map((c) => ({ name: c.category || c.name, value: Number(c.amount || c.value || 0) })));
      setIncomeExpenseData(toArray(ivs?.data || ivs).map((r, idx) => ({
        label: r.label || r.period || r.date || `#${idx + 1}`,
        income: Number(r.income || 0),
        expense: Number(r.expense || 0),
        balance: Number(r.balance ?? (Number(r.income || 0) - Number(r.expense || 0))),
      })));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  const totals = useMemo(() => {
    const totalIn = incomeExpenseData.reduce((s, x) => s + x.income, 0);
    const totalOut = incomeExpenseData.reduce((s, x) => s + x.expense, 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [incomeExpenseData]);

  return (
    <AppShell title="Statistics">
      <div className="fade-page space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Statistics</h2>
          <TimePeriodFilter value={period} onChange={setPeriod} />
        </div>

        {loading ? <LoadingSpinner label="Loading statistics..." /> : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Total income</p><p className="text-xl font-bold text-green-600">{totals.totalIn.toLocaleString()}</p></div>
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Total expense</p><p className="text-xl font-bold text-red-600">{totals.totalOut.toLocaleString()}</p></div>
              <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Net</p><p className="text-xl font-bold text-blue-700">{totals.net.toLocaleString()}</p></div>
            </div>

            <IncomeVsExpense data={incomeExpenseData} />

            <div className="grid gap-4 lg:grid-cols-2">
              <ExpenseByCategory data={categoryData} />

              <div className="rounded-2xl border bg-white p-4">
                <h3 className="mb-3 text-lg font-semibold">Balance trend</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={incomeExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4">
                <h3 className="mb-3 text-lg font-semibold">Income by period</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeSeries.map((x, i) => ({ label: x.label || x.period || x.date || `#${i + 1}`, value: Number(x.amount || x.value || 0) }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <h3 className="mb-3 text-lg font-semibold">Expense trend</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={expenseSeries.map((x, i) => ({ label: x.label || x.period || x.date || `#${i + 1}`, value: Number(x.amount || x.value || 0) }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#fecaca" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
