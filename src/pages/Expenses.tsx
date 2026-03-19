import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getExpenses, createExpense, editExpense, deleteExpense, type Expense } from '../api/expensesApi';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'OTHER'];

const Expenses: React.FC = () => {
  const { accounts, refreshAccounts } = useFinance();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: CATEGORIES[0],
    accountId: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses(month, year);
      setExpenses(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We should make sure accounts are loaded before allowing a new expense, but it's handled globally
    fetchExpenses();
  }, [month, year]);

  const handleOpenModal = (exp?: Expense) => {
    if (exp) {
      setEditingId(exp.id);
      setFormData({
        amount: exp.amount,
        date: exp.date.slice(0, 10),
        description: exp.description,
        category: CATEGORIES.includes(exp.category) ? exp.category : CATEGORIES[0],
        accountId: exp.accountId || accounts[0]?.id || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        amount: 0, 
        date: new Date().toISOString().slice(0, 10), 
        description: '', 
        category: CATEGORIES[0], 
        accountId: accounts[0]?.id || '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await editExpense(editingId, formData);
        toast.success('Expense updated');
      } else {
        await createExpense(formData);
        toast.success('Expense added');
      }
      setIsModalOpen(false);
      fetchExpenses();
      refreshAccounts(); // Refresh global balance
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      fetchExpenses();
      refreshAccounts();
    } catch (error: any) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select 
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-2 rounded-lg text-sm bg-white"
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border p-2 rounded-lg text-sm bg-white"
          >
            {[year-1, year, year+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition ml-auto"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No expenses found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{exp.date.slice(0, 10)}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{exp.description}</td>
                    <td className="p-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-red-600">-{Number(exp.amount).toLocaleString()}</td>
                    <td className="p-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <button onClick={() => handleOpenModal(exp)} className="text-gray-400 hover:text-primary-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(exp.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="expenseForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input required type="number" min="0.01" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                    value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input required type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                    <option value="" disabled>Select an account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>)}
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button disabled={submitting} type="submit" form="expenseForm" className="px-4 py-2 font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
