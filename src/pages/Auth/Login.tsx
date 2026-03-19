import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

// Extract a human-readable message from various backend error response formats
const extractErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return typeof data.error === 'string' ? data.error : fallback;
  if (data.detail) return data.detail;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e: any) => e.message || e.defaultMessage || e).join(', ');
  }
  return fallback;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      // Depending on backend, token can be in res.data.token or res.data.accessToken
      const token = res.data?.token || res.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        const msg = 'Login succeeded but no authentication token was received. Please contact support.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      let msg: string;

      if (status === 401) {
        msg = 'Invalid email or password. Please try again.';
      } else if (status === 403) {
        msg = 'Your account has been locked or disabled. Please contact support.';
      } else if (status === 404) {
        msg = 'No account found with this email. Please register first.';
      } else if (status === 500) {
        msg = 'Server error. Please try again later.';
      } else if (!error?.response) {
        msg = 'Network error. Please check your internet connection.';
      } else {
        msg = extractErrorMessage(error, 'Login failed. Please try again.');
      }

      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to Finly</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin} autoComplete="off">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                autoComplete="off"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

