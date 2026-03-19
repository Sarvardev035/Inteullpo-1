import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getTransfers, createTransfer, type Transfer } from '../api/transfersApi';
import { toast } from 'react-toastify';
import { RefreshCcw } from 'lucide-react';

const Transfers: React.FC = () => {
  const { accounts, refreshAccounts } = useFinance();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  
  // Custom logic for manual exchange rate
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const fromAcc = accounts.find((a: any) => a.id === fromAccountId);
  const toAcc = accounts.find((a: any) => a.id === toAccountId);
  const currenciesDiffer = fromAcc && toAcc && fromAcc.currency !== toAcc.currency;

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await getTransfers();
      setTransfers(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    // Default form select
    if (accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
    }
  }, [accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      toast.error('Sender and receiver accounts must be different');
      return;
    }
    if (amount <= 0) {
      toast.error('Amount must be positive');
      return;
    }
    if (fromAcc && amount > fromAcc.balance) {
      if (!window.confirm('Transfer amount exceeds available balance. Proceed anyway?')) return;
    }

    setSubmitting(true);
    try {
      // Create transfer logic. Assume backend handles exchange rate via note or implicit conversion if actual fields don't exist
      // Since `createTransfer` expects: fromAccountId, toAccountId, amount, date, note
      const payload = {
        fromAccountId,
        toAccountId,
        amount,
        date,
        note: currenciesDiffer ? `${note} [Rate: ${exchangeRate}]` : note
      };
      
      await createTransfer(payload);
      toast.success('Transfer successful');
      
      // Reset form
      setAmount(0);
      setNote('');
      fetchTransfers();
      refreshAccounts(); // Refresh global balance
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateConverted = () => {
    return (amount * exchangeRate).toLocaleString();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transfers</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transfer Form Component */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
            <RefreshCcw className="w-5 h-5 mr-2 text-primary-500" /> 
            New Transfer
          </h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={fromAccountId} onChange={e => setFromAccountId(e.target.value)}>
                <option value="" disabled>Select sender</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} {a.currency})</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
              <select required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={toAccountId} onChange={e => setToAccountId(e.target.value)}>
                <option value="" disabled>Select receiver</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} {a.currency})</option>)}
              </select>
            </div>

            {fromAccountId === toAccountId && fromAccountId !== '' && (
              <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded">Warning: Cannot transfer to the same account.</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({fromAcc?.currency || ''})</label>
              <input required type="number" min="0.01" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={amount || ''} onChange={e => setAmount(Number(e.target.value))} />
            </div>

            {currenciesDiffer && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                <p className="text-xs text-gray-500 font-medium uppercase">Cross-Currency Exchange</p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Exchange Rate ({fromAcc?.currency} → {toAcc?.currency})</label>
                  <input required type="number" min="0.0001" step="0.0001" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    value={exchangeRate || ''} onChange={e => setExchangeRate(Number(e.target.value))} />
                </div>
                <div className="text-sm font-medium text-gray-900 border-t border-gray-200 mt-2 pt-2">
                  Recipient gets: <span className="text-primary-600 font-bold">{calculateConverted()} {toAcc?.currency}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  value={note} onChange={e => setNote(e.target.value)} placeholder="Rent, Shared Bill..." />
              </div>
            </div>

            <button disabled={submitting || fromAccountId === toAccountId} type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Executing Transfer...' : 'Execute Transfer'}
            </button>
          </form>
        </div>

        {/* Transfer History List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Transfer History</h2>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading transfers...</div>
            ) : transfers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No transfers recorded yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {transfers.map(tx => {
                  const srcAcc = accounts.find((a: any) => a.id === tx.fromAccountId);
                  const destAcc = accounts.find((a: any) => a.id === tx.toAccountId);
                  return (
                    <li key={tx.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex justify-center items-center">
                            <RefreshCcw size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {srcAcc?.name || 'Unknown'} <span className="text-gray-400 mx-2">→</span> {destAcc?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{tx.date.slice(0, 10)} {tx.note && `• ${tx.note}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{Number(tx.amount).toLocaleString()} {srcAcc?.currency || ''}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Transfers;
