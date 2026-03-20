import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Transfers from './pages/Transfers';
import Debts from './pages/Debts';
import Budget from './pages/Budget';
import Statistics from './pages/Statistics';
import CalendarView from './pages/CalendarView';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/income" element={<Income />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
