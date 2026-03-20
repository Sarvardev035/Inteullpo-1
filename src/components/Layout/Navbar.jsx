import { Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-slate-900 font-space-grotesk">Finly</h1>
      <button className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
        <Bell size={20} className="text-slate-600" />
      </button>
    </header>
  );
}
