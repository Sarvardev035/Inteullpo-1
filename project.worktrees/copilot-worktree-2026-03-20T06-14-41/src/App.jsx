import { Navigate, Route, Routes } from 'react-router-dom';
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

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
      <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
      <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
      <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
