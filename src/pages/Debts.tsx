import React, { useState, useEffect } from 'react';
import { getDebts, createDebt, updateDebt, deleteDebt, type Debt } from '../api/debtsApi';
import { toast } from 'react-toastify';
import { Plus, Check, Trash2 } from 'lucide-react';

const Debts: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BORROWED' | 'LENT'>('BORROWED');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Debt>>({
    personName: '',
    amount: 0,
    currency: 'UZS',
    dueDate: new Date().toISOString().slice(0, 10),
    type: 'BORROWED',
    description: '',
    status: 'OPEN'
  });

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const data = await getDebts();
      setDebts(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      toast.error('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleOpenModal = (type: 'BORROWED' | 'LENT') => {
    setFormData({ 
      personName: '', amount: 0, currency: 'UZS', 
      dueDate: new Date().toISOString().slice(0, 10), 
      type, description: '', status: 'OPEN' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDebt(formData);
      toast.success('Debt recorded');
      setIsModalOpen(false);
      fetchDebts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record debt');
    } finally {
      setSubmitting(false);
    }
  };

  const markClosed = async (debt: Debt) => {
    try {
      await updateDebt(debt.id, { ...debt, status: 'CLOSED' });
      toast.success('Debt marked as closed');
      fetchDebts();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteDebt(id);
      toast.success('Record deleted');
      fetchDebts();
    } catch (error: any) {
      toast.error('Failed to delete');
    }
  };

  const activeDebts = debts.filter(d => d.type === activeTab);
  
  const totalBorrowed = debts.filter(d => d.type === 'BORROWED' && d.status === 'OPEN').reduce((sum, d) => sum + Number(d.amount), 0);
  const totalLent = debts.filter(d => d.type === 'LENT' && d.status === 'OPEN').reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Debts & Receivables</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-gray-500">Total I Owe</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{totalBorrowed.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Total Owed to Me</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{totalLent.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button 
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'BORROWED' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('BORROWED')}
          >
            I Owe (Borrowed)
          </button>
          <button 
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'LENT' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('LENT')}
          >
            Owed to Me (Lent)
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button onClick={() => handleOpenModal(activeTab)} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
              <Plus size={18} />
              <span>Add Record</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading records...</div>
          ) : activeDebts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No records found.</div>
          ) : (
            <div className="space-y-4">
              {activeDebts.map(debt => (
                <div key={debt.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-gray-900">{debt.personName}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${debt.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {debt.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{debt.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Due: {debt.dueDate.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${activeTab === 'BORROWED' ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(debt.amount).toLocaleString()} {debt.currency}
                    </p>
                    <div className="flex justify-end space-x-2 mt-2">
                      {debt.status === 'OPEN' && (
                        <button onClick={() => markClosed(debt)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Mark Closed">
                          <Check size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(debt.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Record Debt</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="debtForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
                  <input required type="text" className="w-full border p-2.5 rounded-lg focus:ring-primary-500 outline-none" value={formData.personName} onChange={e => setFormData({...formData, personName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input required type="number" min="0.01" step="0.01" className="w-full border p-2.5 rounded-lg focus:ring-primary-500 outline-none" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select className="w-full border p-2.5 rounded-lg focus:ring-primary-500 outline-none" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input required type="date" className="w-full border p-2.5 rounded-lg focus:ring-primary-500 outline-none" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-primary-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button disabled={submitting} type="submit" form="debtForm" className="px-4 py-2 font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
