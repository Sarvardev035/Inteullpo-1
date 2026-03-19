import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getExpenses, type Expense } from '../api/expensesApi';
import { getIncomes, type Income } from '../api/incomeApi';
import { getTransfers, type Transfer } from '../api/transfersApi';
import { toast } from 'react-toastify';

type Transaction = {
  id: string;
  date: string;
  amount: number | string;
  type: 'income' | 'expense' | 'transfer';
  desc: string;
};

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch all generally (may need to fetch current month/year for optimization if API supports)
        const [exp, inc, trf] = await Promise.all([
          getExpenses(date.getMonth() + 1, date.getFullYear()),
          getIncomes(),
          getTransfers()
        ]);

        const expArr: Expense[] = Array.isArray(exp) ? exp : exp?.content || [];
        const incArr: Income[] = Array.isArray(inc) ? inc : inc?.content || [];
        const trfArr: Transfer[] = Array.isArray(trf) ? trf : trf?.content || [];

        const combined: Transaction[] = [
          ...expArr.map(e => ({ id: `exp-${e.id}`, date: e.date, amount: e.amount, type: 'expense' as const, desc: e.description })),
          ...incArr.map(i => ({ id: `inc-${i.id}`, date: i.date, amount: i.amount, type: 'income' as const, desc: i.source || i.description })),
          ...trfArr.map(t => ({ id: `trf-${t.id}`, date: t.date, amount: t.amount, type: 'transfer' as const, desc: t.note || 'Transfer' })),
        ];

        setTransactions(combined);
      } catch (err) {
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [date.getMonth(), date.getFullYear()]); // Refetch when month changes

  // Custom tileContent to show dots
  const tileContent = ({ date: tileDate, view }: any) => {
    if (view === 'month') {
      const dateStr = tileDate.toISOString().slice(0, 10);
      const dayTxs = transactions.filter(t => t.date.slice(0, 10) === dateStr);
      
      const hasIncome = dayTxs.some(t => t.type === 'income');
      const hasExpense = dayTxs.some(t => t.type === 'expense');
      const hasTransfer = dayTxs.some(t => t.type === 'transfer');

      return (
        <div className="flex justify-center flex-wrap gap-1 mt-1">
          {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
          {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
          {hasTransfer && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
        </div>
      );
    }
    return null;
  };

  const selectedDateStr = date.toISOString().slice(0, 10);
  const selectedTransactions = transactions.filter(t => t.date.slice(0, 10) === selectedDateStr);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-500 mt-1">View your transactions mapped out by day.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-center">
          <div className="w-full max-w-lg">
             <Calendar 
               onChange={(val) => setDate(val as Date)} 
               value={date} 
               tileContent={tileContent}
               className="w-full border-0 !font-sans pb-4"
             />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
            Transactions for {date.toLocaleDateString()}
          </h2>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 mt-8">Loading...</p>
            ) : selectedTransactions.length === 0 ? (
              <div className="text-center mt-8 text-gray-500">
                <p>No transactions on this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTransactions.map(tx => (
                  <div key={tx.id} className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{tx.desc}</p>
                      <span className={`text-xs capitalize font-medium
                        ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div>
                      <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {Number(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
{/* Added global styles for Calendar component overrides */}
<style>{`
  .react-calendar {
    width: 100% !important;
    background: white;
    border: none !important;
    font-family: inherit;
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
    border-radius: 8px;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f3f4f6;
  }
  .react-calendar__tile {
    padding: 16px 8px;
    border-radius: 8px;
  }
  .react-calendar__tile--now {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: bold;
  }
  .react-calendar__tile--active {
    background: #3b82f6 !important;
    color: white !important;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f3f4f6;
  }
`}</style>
    </div>
  );
};

export default CalendarView;
