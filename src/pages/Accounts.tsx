import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { createAccount, editAccount, deleteAccount, type Account } from '../api/accountsApi';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Accounts: React.FC = () => {
  const { accounts, totalBalance, loading, refreshAccounts } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK',
    currency: 'UZS',
    initialBalance: 0
  });

  const handleOpenModal = (acc?: Account) => {
    if (acc) {
      setEditingId(acc.id);
      setFormData({
        name: acc.name,
        type: acc.type,
        currency: acc.currency,
        initialBalance: acc.balance
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', type: 'BANK', currency: 'UZS', initialBalance: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await editAccount(editingId, { ...formData, balance: formData.initialBalance });
        toast.success('Account updated');
      } else {
        await createAccount({ ...formData, balance: formData.initialBalance });
        toast.success('Account added');
      }
      setIsModalOpen(false);
      refreshAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccount(id);
      toast.success('Account deleted');
      refreshAccounts();
    } catch (error: any) {
      toast.error('Failed to delete account');
    }
  };

  if (loading) return <div className="p-8">Loading accounts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500 mt-1">Total Balance: {totalBalance.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={18} />
          <span>Add Account</span>
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-500 mb-4">You have no accounts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(acc)} className="p-1.5 text-gray-400 hover:text-primary-600 bg-gray-50 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded"><Trash2 size={16} /></button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{acc.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{acc.type}</span>
                    <span className="text-xs text-gray-500">{acc.currency}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{Number(acc.balance).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Account' : 'Add Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border p-2 rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="BANK">Bank</option>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full border p-2 rounded-lg" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="RUB">RUB</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                <input required type="number" className="w-full border p-2 rounded-lg" value={formData.initialBalance} onChange={e => setFormData({...formData, initialBalance: Number(e.target.value)})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
