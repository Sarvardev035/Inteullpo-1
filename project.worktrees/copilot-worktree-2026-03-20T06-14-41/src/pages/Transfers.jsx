import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import TransferForm from '../components/Transfers/TransferForm';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { transfersApi } from '../api/transfersApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';
import { toReadableDate, formatMoney } from '../utils/format';

export default function Transfers() {
  const { accounts, refreshAccounts } = useFinance();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await transfersApi.getAll();
      setItems(toArray(data?.data || data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load transfers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      await transfersApi.create(payload);
      toast.success('Transfer completed');
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create transfer'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Transfers">
      <div className="fade-page grid gap-4 lg:grid-cols-2">
        <TransferForm accounts={accounts} onSubmit={submit} submitting={submitting} />
        <div className="rounded-2xl border bg-white p-4">
          <h3 className="mb-3 text-lg font-semibold">Transfer history</h3>
          {loading ? <LoadingSpinner label="Loading transfers..." /> : !items.length ? (
            <div className="text-sm text-slate-500">No transfers recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {items.map((t) => (
                <div key={t.id} className="rounded-lg border p-3">
                  <p className="font-medium">{t.note || 'Transfer'}</p>
                  <p className="text-sm text-slate-500">{toReadableDate(t.date)}</p>
                  <p className="font-semibold text-blue-700">{formatMoney(t.amount, t.currency || 'UZS')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
