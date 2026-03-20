import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { toISODate } from '../../utils/format';

const makeInitial = (accounts) => ({ amount: '', date: toISODate(new Date()), description: '', category: 'FOOD', accountId: accounts?.[0]?.id || '' });

export default function AddExpenseModal({ open, onOpenChange, onSubmit, submitting, accounts }) {
  const [form, setForm] = useState(makeInitial(accounts));

  useEffect(() => {
    setForm(makeInitial(accounts));
  }, [open, accounts]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount), date: toISODate(form.date) });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add expense">
      <form onSubmit={submit} className="space-y-3">
        <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="w-full rounded-lg border px-3 py-2" />
        <input required type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <input required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full rounded-lg border px-3 py-2" />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select required value={form.accountId} onChange={(e) => setForm((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <button disabled={submitting} className="w-full rounded-lg bg-blue-600 py-2 text-white">{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    </Modal>
  );
}
