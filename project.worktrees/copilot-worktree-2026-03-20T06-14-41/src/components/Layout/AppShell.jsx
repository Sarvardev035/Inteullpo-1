import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppShell({ title, children }) {
  return (
    <div className="min-h-screen bg-[var(--ice)] lg:flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar title={title} />
        <main className="mx-auto w-full max-w-[1200px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
