import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/http';
import { Button, Input } from '../../components/ui';
import { pageVariants, listVariants, itemVariants } from '../../utils/animations';

// Password strength calculation
const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (!password) return { score: 0, label: '', color: '' };

  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^a-zA-Z\d]/.test(password)) strength += 1;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  return {
    score: strength,
    label: labels[strength],
    color: colors[strength],
  };
};

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = calculatePasswordStrength(password);

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to register'));
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
              Create Account
            </motion.h1>
            <motion.p variants={itemVariants} className="text-center text-slate-600 mt-2">
              Start managing your finances with Finly
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
            {/* Full Name Input */}
            <motion.div variants={itemVariants}>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                }}
                error={errors.fullName}
                icon={User}
                required
              />
            </motion.div>

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
                    placeholder="Create a strong password"
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

                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Password Strength</span>
                      <span className={`font-medium ${passwordStrength.color?.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div variants={itemVariants}>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-900">
                  Confirm Password
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                    }}
                    className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}

                {/* Password Match Indicator */}
                {confirmPassword && password === confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-green-600"
                  >
                    <CheckCircle size={14} />
                    Passwords match
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div variants={itemVariants} className="flex items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors((p) => ({ ...p, agreeTerms: '' }));
                }}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
              </label>
            </motion.div>
            {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}

            {/* Create Account Button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">Already have an account?</span>
            <div className="h-px flex-1 bg-slate-200" />
          </motion.div>

          {/* Sign In Link */}
          <motion.div variants={itemVariants}>
            <Link to="/login">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-white/60 mt-6"
        >
          Create an account to start tracking your finances
        </motion.p>
      </motion.div>
    </div>
  );
}
