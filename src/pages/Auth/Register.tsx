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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Client-side validation
    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { fullName: fullName.trim(), email: email.trim(), password });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      const status = error?.response?.status;
      let msg: string;

      if (status === 409) {
        msg = 'An account with this email already exists. Please log in instead.';
      } else if (status === 400) {
        msg = extractErrorMessage(error, 'Invalid registration data. Please check your inputs.');
      } else if (status === 500) {
        msg = 'Server error. Please try again later.';
      } else if (!error?.response) {
        msg = 'Network error. Please check your internet connection.';
      } else {
        msg = extractErrorMessage(error, 'Registration failed. Please try again.');
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
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleRegister} autoComplete="off">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text" required placeholder="John Doe"
              autoComplete="off"
              className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={fullName} onChange={(e) => { setFullName(e.target.value); setErrorMsg(''); }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email" required placeholder="example@gmail.com"
              autoComplete="off"
              className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={email} onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" required placeholder="Min 6 characters"
              autoComplete="new-password"
              className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center text-sm pt-2">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

