import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/http';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const token = res?.data?.token || res?.data?.accessToken;
      if (!token) throw new Error('Token not returned by backend');
      localStorage.setItem('token', token);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to your Finly account</p>
        <div className="mt-4 space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Don&apos;t have an account? <Link className="font-medium text-blue-600" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
