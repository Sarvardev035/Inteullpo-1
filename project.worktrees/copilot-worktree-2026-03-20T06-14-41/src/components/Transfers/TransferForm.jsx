import { useMemo, useState } from 'react';
import { toISODate } from '../../utils/format';

export default function TransferForm({ accounts, onSubmit, submitting }) {
  const [fromAccountId, setFrom] = useState(accounts?.[0]?.id || '');
  const [toAccountId, setTo] = useState(accounts?.[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [note, setNote] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const from = useMemo(() => accounts.find((a) => String(a.id) === String(fromAccountId)), [accounts, fromAccountId]);
  const to = useMemo(() => accounts.find((a) => String(a.id) === String(toAccountId)), [accounts, toAccountId]);
  const differentCurrency = from && to && from.currency !== to.currency;

  const submit = (e) => {
    e.preventDefault();
    if (String(fromAccountId) === String(toAccountId)) return;

    const payload = {
      fromAccountId,
      toAccountId,
      amount: Number(amount),
      date: toISODate(date),
      note,
    };

    if (differentCurrency && exchangeRate) payload.exchangeRate = Number(exchangeRate);

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-4">
      <h3 className="text-lg font-semibold">Create transfer</h3>
      <select required value={fromAccountId} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border px-3 py-2">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}</select>
      <select required value={toAccountId} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border px-3 py-2">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}</select>
      {String(fromAccountId) === String(toAccountId) && <p className="text-sm text-red-600">From and to accounts must be different.</p>}
      <input required min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-lg border px-3 py-2" />
      <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
      {differentCurrency && (
        <input min="0.0001" step="0.0001" type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder="Exchange rate" className="w-full rounded-lg border px-3 py-2" />
      )}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="w-full rounded-lg border px-3 py-2" />
      <button disabled={submitting || String(fromAccountId) === String(toAccountId)} className="w-full rounded-lg bg-blue-600 py-2 text-white disabled:opacity-60">{submitting ? 'Processing...' : 'Transfer'}</button>
    </form>
  );
}
