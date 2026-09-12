import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Factory,
  Sparkles,
  ShieldCheck,
  Flame,
  Recycle,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Work email address is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid work email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res?.success) {
        // Redirect to Login Page with success toast and pre-filled email
        navigate('/', {
          state: {
            registeredEmail: email.trim().toLowerCase(),
            successMessage: 'Account created successfully! Please sign in with your new credentials.',
          },
        });
      } else {
        setServerError(res?.message || 'Unable to create account. Please try again.');
      }
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        'Unable to create your account right now. Please try again.';
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-slate-950 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Left Panel: Enterprise Branding & Architecture */}
      <div className="w-full lg:w-3/5 bg-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  EcoForge <span className="text-emerald-400">AI</span>
                </span>
                <p className="text-[11px] text-slate-400">Industrial Telemetry Platform</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Decision Platform</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-Time Emission Intelligence Engine
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Industrial Emission Leak-Point Detector
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 mt-1">
              & Circular Alternative Recommender
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Join environmental engineers and plant operators leveraging deterministic GHG Protocol mass calculations, automated leak-point diagnostics, and machine-learning ranked circular economy roadmaps.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Scope 1, 2 & 3 Deterministic</span>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Leak Point Diagnostics</span>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Circular Action Roadmaps</span>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">What-If Decarbon Simulator</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by EcoForge Intelligence</span>
          <span>Enterprise System v2.4</span>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 relative">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Create an EcoForge Account
            </h2>
            <p className="text-xs text-slate-500">
              Set up industrial credentials to access telemetry, diagnostic analytics, and circular interventions.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs flex items-start space-x-2.5 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold block">Registration Error</span>
                <p className="text-red-700 leading-snug">{serverError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm shadow-sm ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena.rostova@ecoforge.ai"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm shadow-sm ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm shadow-sm ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:outline-none transition-all text-sm shadow-sm ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-75 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account? Sign In */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/"
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            By creating an account, you agree to EcoForge Industrial Security & Compliance Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
