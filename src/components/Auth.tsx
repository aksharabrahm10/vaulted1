import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LogoMark } from './Logo';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'signup';

export function Auth({ onSuccess, onBack }: AuthProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-ink-600 hover:bg-ink-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <LogoMark size={32} />
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Vault'}
          </h1>
          <p className="text-ink-500 text-sm">
            {mode === 'login' ? 'Your purchases are waiting.' : 'Start organizing your receipts with AI in seconds.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <InputField
              icon={<User className="w-5 h-5" />}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={setName}
            />
          )}

          <InputField
            icon={<Mail className="w-5 h-5" />}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={setEmail}
          />

          <InputField
            icon={<Lock className="w-5 h-5" />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ink-400 hover:text-ink-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />

          {mode === 'signup' && (
            <InputField
              icon={<Lock className="w-5 h-5" />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary-600 text-white font-semibold text-base
              flex items-center justify-center gap-2
              hover:bg-primary-700 active:scale-[0.98] transition-all
              shadow-lg shadow-primary-600/20
              disabled:opacity-60 disabled:active:scale-100"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <span className="text-ink-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-primary-600 font-semibold text-sm hover:text-primary-700"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  trailing,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white border border-ink-200
          text-ink-900 placeholder:text-ink-400 font-medium text-sm
          focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          transition-all"
      />
      {trailing && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {trailing}
        </div>
      )}
    </div>
  );
}
