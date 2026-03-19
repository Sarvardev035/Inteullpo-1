import React, { useState, useEffect } from 'react';
import { getExpenses, type Expense } from '../api/expensesApi';
import { getIncomes, type Income } from '../api/incomeApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

const Statistics: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expData, incData] = await Promise.all([
          getExpenses(month, year),
          getIncomes()
        ]);
        
        setExpenses(Array.isArray(expData) ? expData : expData?.content || []);
        
        // Income doesn't have native month/year filter in our API currently, so we filter locally
        const allIncomes = Array.isArray(incData) ? incData : incData?.content || [];
        const filteredIncomes = allIncomes.filter((i: any) => new Date(i.date).getMonth() + 1 === month && new Date(i.date).getFullYear() === year);
        setIncomes(filteredIncomes);

      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [month, year]);

  if (loading) return <div className="p-8">Loading statistics...</div>;

  // Prepare Pie Chart Data (Expenses by Category)
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value);

  // Prepare Bar Chart Data (Daily Spending for the month)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayExp = expenses.filter(e => e.date.startsWith(dateStr)).reduce((sum, e) => sum + Number(e.amount), 0);
    const dayInc = incomes.filter(i => i.date.startsWith(dateStr)).reduce((sum, i) => sum + Number(i.amount), 0);
    
    return { day: String(day), expense: dayExp, income: dayInc };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border p-2 rounded-lg text-sm bg-white">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border p-2 rounded-lg text-sm bg-white">
            {[year-1, year, year+1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 w-full mb-4">Expenses by Category</h2>
          {pieData.length === 0 ? (
            <p className="text-gray-500 m-auto">No expenses this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Categories List Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Spending Breakdown</h2>
          <div className="space-y-4">
            {pieData.length === 0 ? (
              <p className="text-gray-500">No data</p>
            ) : (
              pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Cashflow Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 h-[450px]">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            Daily Cashflow
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
