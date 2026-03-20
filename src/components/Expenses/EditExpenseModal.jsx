import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { toISODate } from '../../utils/format';

export default function EditExpenseModal({ open, onOpenChange, onSubmit, submitting, accounts, expense }) {
  const [form, setForm] = useState({ amount: '', date: '', description: '', category: 'FOOD', accountId: '' });

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount,
        date: toISODate(expense.date),
        description: expense.description || '',
        category: expense.category || 'FOOD',
        accountId: expense.accountId || '',
      });
    }
  }, [expense]);

  if (!expense) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit expense">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), date: toISODate(form.date) }); }} className="space-y-3">
        <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <input required type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <input required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select required value={form.accountId} onChange={(e) => setForm((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <button disabled={submitting} className="w-full rounded-lg bg-blue-600 py-2 text-white">{submitting ? 'Saving...' : 'Update'}</button>
      </form>
    </Modal>
  );
}
