import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, CreditCard, ArrowDownRight, ArrowUpRight, 
  RefreshCcw, Users, Target, BarChart2, Calendar, LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/expenses', icon: ArrowUpRight, label: 'Expenses' },
    { path: '/income', icon: ArrowDownRight, label: 'Income' },
    { path: '/transfers', icon: RefreshCcw, label: 'Transfers' },
    { path: '/debts', icon: Users, label: 'Debts' },
    { path: '/budget', icon: Target, label: 'Budget' },
    { path: '/statistics', icon: BarChart2, label: 'Statistics' },
    { path: '/calendar', icon: Calendar, label: 'Calendar View' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-primary-500">Fineco</h1>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-gray-400 hover:text-white w-full px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
