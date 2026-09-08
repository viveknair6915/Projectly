import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login({ email: email.trim(), password });
      showToast('Welcome back to Projectly!', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-glow-brand mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Projectly
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">
            Your Team’s Work, Organized.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800/80">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your credentials to access your projects and tasks.
          </p>

          {error && (
            <div className="p-3 mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="alex@projectly.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Demo Accounts (1-Click Fill)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex@projectly.dev')}
                className="px-2.5 py-2 text-left bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-200">Alex (Admin)</p>
                <p className="text-[10px] text-slate-400 truncate">alex@projectly.dev</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah@projectly.dev')}
                className="px-2.5 py-2 text-left bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-200">Sarah (Frontend)</p>
                <p className="text-[10px] text-slate-400 truncate">sarah@projectly.dev</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcus@projectly.dev')}
                className="px-2.5 py-2 text-left bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-200">Marcus (Backend)</p>
                <p className="text-[10px] text-slate-400 truncate">marcus@projectly.dev</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
