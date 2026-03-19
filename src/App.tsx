import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FinanceProvider } from './context/FinanceContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Expenses from './pages/Expenses';
import IncomePage from './pages/Income';
import Transfers from './pages/Transfers';
import Debts from './pages/Debts';
import Budget from './pages/Budget';
import Statistics from './pages/Statistics';
import CalendarView from './pages/CalendarView';

function App() {
  return (
    <Router>
      <FinanceProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/calendar" element={<CalendarView />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </FinanceProvider>
    </Router>
  );
}

export default App;
