export default function CategoryLimitCard({ item }) {
  const pct = item.limitAmount > 0 ? (item.spentAmount / item.limitAmount) * 100 : 0;
  const color = pct > 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">{item.category}</p>
        <p className="text-sm text-slate-500">{pct.toFixed(0)}%</p>
      </div>
      <p className="text-sm text-slate-500">{item.spentAmount?.toLocaleString()} / {item.limitAmount?.toLocaleString()}</p>
      <div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
    </div>
  );
}
