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
      if (!name.trim()) { setError('Please enter your name'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
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
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex flex-col safe-top safe-bottom">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <LogoMark size={32} />
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 tracking-tight mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Vault'}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm">
            {mode === 'login' ? 'Your purchases are waiting.' : 'Start organizing your receipts with AI in seconds.'}
          </p>
        </div>

        {/* Social auth buttons (placeholder integrations) */}
        <div className="space-y-3 mb-4">
          <button onClick={() => setError('Google sign-in coming soon. Use email for now.')}
            className="w-full h-14 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors">
            <GoogleIcon /> Continue with Google
          </button>
          <button onClick={() => setError('Apple sign-in coming soon. Use email for now.')}
            className="w-full h-14 rounded-2xl bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-ink-800 dark:hover:bg-white transition-colors">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
          <span className="text-ink-400 dark:text-ink-500 text-xs font-medium">or</span>
          <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <InputField icon={<User className="w-5 h-5" />} type="text" placeholder="Full Name" value={name} onChange={setName} />
          )}
          <InputField icon={<Mail className="w-5 h-5" />} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
          <InputField icon={<Lock className="w-5 h-5" />} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={setPassword}
            trailing={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink-400 hover:text-ink-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>} />
          {mode === 'signup' && (
            <InputField icon={<Lock className="w-5 h-5" />} type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />
          )}
          {mode === 'login' && (
            <div className="text-right">
              <button type="button" onClick={() => setError('Password reset coming soon.')} className="text-primary-500 text-sm font-semibold hover:text-primary-600">Forgot password?</button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl animate-fade-in">{error}</div>
          )}
          <button type="submit" disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary-500 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-60 disabled:active:scale-100">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-ink-500 dark:text-ink-400 text-sm">{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}</span>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} className="text-primary-500 font-semibold text-sm hover:text-primary-600">
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, trailing }: {
  icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void; trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">{icon}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 font-medium text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
      {trailing && <div className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C5.36 15.25 6.1 8.06 10.27 7.4c1.36-.18 2.18.36 2.92.4.95-.19 1.74-.76 2.8-.62 1.38.19 2.41.9 3.04 2.02-2.77 1.65-2.66 5.5.02 6.55-.36.93-.82 1.85-1.48 2.53zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
  );
}
