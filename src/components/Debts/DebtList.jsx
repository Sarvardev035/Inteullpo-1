import { formatMoney, toReadableDate } from '../../utils/format';

export default function DebtList({ debts, onClose, onDelete }) {
  if (!debts.length) return <div className="rounded-xl border bg-white p-6 text-center text-slate-500">You're all settled up! 🎉</div>;

  return (
    <div className="space-y-2">
      {debts.map((d) => (
        <div key={d.id} className="rounded-xl border bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{d.personName}</p>
              <p className="text-sm text-slate-500">Due {toReadableDate(d.dueDate)}</p>
              <p className="text-sm text-slate-500">{d.description}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatMoney(d.amount, d.currency || 'UZS')}</p>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${d.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>{d.status}</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {d.status === 'OPEN' && <button onClick={() => onClose(d)} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white">Mark closed</button>}
            <button onClick={() => onDelete(d)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
