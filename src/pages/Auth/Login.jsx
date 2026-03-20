import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/http';
import { Button, Input } from '../../components/ui';
import { pageVariants, listVariants, itemVariants } from '../../utils/animations';

const extractToken = (response) => {
  const data = response?.data;
  const authHeader = response?.headers?.authorization || response?.headers?.Authorization;

  if (typeof data === 'string') return data;
  if (data?.token) return data.token;
  if (data?.accessToken) return data.accessToken;
  if (data?.access_token) return data.access_token;
  if (data?.jwt) return data.jwt;
  if (data?.data?.token) return data.data.token;
  if (data?.data?.accessToken) return data.data.accessToken;
  if (data?.data?.access_token) return data.data.access_token;
  if (data?.result?.token) return data.result.token;
  if (data?.result?.accessToken) return data.result.accessToken;

  if (typeof authHeader === 'string') {
    return authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : authHeader.trim();
  }

  return '';
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const token = extractToken(res);
      if (!token) throw new Error('Token not returned by backend');
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Form Container */}
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <motion.div variants={listVariants} initial="hidden" animate="show" className="mb-8">
            <motion.div variants={itemVariants} className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                F
              </div>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-center text-slate-900">
              Welcome Back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-center text-slate-600 mt-2">
              Sign in to your Finly account
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Email Input */}
            <motion.div variants={itemVariants}>
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                error={errors.email}
                icon={Mail}
                required
              />
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-900">
                  Password
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                    }}
                    className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      errors.password ? 'border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            </motion.div>

            {/* Remember Me Checkbox */}
            <motion.div variants={itemVariants} className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-600 cursor-pointer">
                Remember me
              </label>
            </motion.div>

            {/* Sign In Button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">Don't have an account?</span>
            <div className="h-px flex-1 bg-slate-200" />
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants}>
            <Link to="/register">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Create Account
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-white/60 mt-6"
        >
          By signing in, you agree to our{' '}
          <a href="#" className="underline hover:text-white/80">
            Terms of Service
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
