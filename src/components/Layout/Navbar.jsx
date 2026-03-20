import { Bell } from 'lucide-react';

export default function Navbar({ title = 'Finly' }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <button className="rounded-lg p-2 hover:bg-slate-100">
        <Bell size={18} />
      </button>
    </header>
  );
}
