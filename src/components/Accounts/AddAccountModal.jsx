import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { ACCOUNT_TYPES, CURRENCIES } from '../../utils/constants';

const initial = { name: '', type: 'CARD', currency: 'UZS', initialBalance: '' };

export default function AddAccountModal({ open, onOpenChange, onSubmit, submitting, editData }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        type: editData.type || 'CARD',
        currency: editData.currency || 'UZS',
        initialBalance: editData.balance ?? editData.initialBalance ?? '',
      });
    } else {
      setForm(initial);
    }
  }, [editData, open]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, initialBalance: Number(form.initialBalance) });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={editData ? 'Edit account' : 'Add account'}>
      <form onSubmit={submit} className="space-y-3">
        <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Account name" className="w-full rounded-lg border px-3 py-2" />
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
          {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input required type="number" min="0" step="0.01" value={form.initialBalance} onChange={(e) => setForm((p) => ({ ...p, initialBalance: e.target.value }))} placeholder="Initial balance" className="w-full rounded-lg border px-3 py-2" />
        <button disabled={submitting} className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-60">{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    </Modal>
  );
}
