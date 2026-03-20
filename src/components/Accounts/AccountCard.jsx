import { formatMoney } from '../../utils/format';

export default function AccountCard({ account, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{account.type}</p>
          <h3 className="mt-1 text-lg font-semibold">{account.name}</h3>
          <p className="text-sm text-slate-500">{account.currency}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Balance</p>
          <p className="text-lg font-bold text-slate-900">{formatMoney(account.balance, account.currency)}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(account)} className="rounded-lg border px-3 py-1.5 text-sm">Edit</button>
        <button onClick={() => onDelete(account)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">Delete</button>
      </div>
    </div>
  );
}
