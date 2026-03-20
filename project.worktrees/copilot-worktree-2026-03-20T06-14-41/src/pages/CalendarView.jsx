import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { toast } from 'react-toastify';
import 'react-calendar/dist/Calendar.css';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getExpenses } from '../api/expensesApi';
import { getIncome } from '../api/incomeApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatMoney } from '../utils/format';

export default function CalendarView() {
  const [value, setValue] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [expenses, income] = await Promise.all([getExpenses(), getIncome()]);
      const exp = toArray(expenses).map((e) => ({ ...e, txType: 'expense' }));
      const inc = toArray(income).map((i) => ({ ...i, txType: 'income' }));
      setTransactions([...exp, ...inc]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load calendar data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedDay = value.toISOString().slice(0, 10);
  const dayItems = useMemo(() => transactions.filter((t) => String(t.date).slice(0, 10) === selectedDay), [transactions, selectedDay]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key = date.toISOString().slice(0, 10);
    const dayTx = transactions.filter((t) => String(t.date).slice(0, 10) === key);
    if (!dayTx.length) return null;
    const hasIncome = dayTx.some((t) => t.txType === 'income');
    const hasExpense = dayTx.some((t) => t.txType === 'expense');
    return (
      <div className="mt-1 flex justify-center gap-1">
        {hasIncome && <span className="h-2 w-2 rounded-full bg-green-500" />}
        {hasExpense && <span className="h-2 w-2 rounded-full bg-red-500" />}
      </div>
    );
  };

  return (
    <AppShell title="Calendar">
      <div className="fade-page grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border bg-white p-4">
          {loading ? <LoadingSpinner label="Loading calendar..." /> : <Calendar value={value} onChange={setValue} tileContent={tileContent} />}
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <h3 className="text-lg font-semibold">Transactions on {selectedDay}</h3>
          <div className="mt-3 space-y-2">
            {dayItems.length ? dayItems.map((tx) => (
              <div key={`${tx.txType}-${tx.id}`} className="rounded-lg border p-3">
                <p className="font-medium">{tx.description || tx.source || tx.category}</p>
                <p className={`font-semibold ${tx.txType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.txType === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency || 'UZS')}
                </p>
              </div>
            )) : <p className="text-sm text-slate-500">No transactions for this day.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
