import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/http';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { fullName: fullName.trim(), email: email.trim(), password });
      toast.success('Registration successful');
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to register'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Start tracking your money today</p>
        <div className="mt-4 space-y-3">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border px-3 py-2" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-60">{loading ? 'Creating...' : 'Register'}</button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link className="font-medium text-blue-600" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
