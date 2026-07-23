import { useState, useEffect } from 'react';
import {
  ChevronRight, User, Shield, Cloud, Download, Bell, Moon, Globe, Accessibility,
  HelpCircle, MessageSquare, Info, LogOut, BellOff, Crown, Sun,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LogoMark } from './Logo';
import { useTheme } from '../lib/theme';
import { useSubscription } from '../lib/subscription';

interface ProfileProps {
  onSignOut: () => void;
  onPremiumClick: () => void;
}

export function Profile({ onSignOut, onPremiumClick }: ProfileProps) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const { theme, toggle } = useTheme();
  const { isPremium } = useSubscription();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.full_name || 'User');
        setEmail(data.user.email || '');
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-28">
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 tracking-tight mb-1">Profile</h1>
      </div>

      {/* Profile card */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-extrabold shrink-0">
            {userName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink-900 dark:text-ink-100 text-lg truncate">{userName}</p>
            <p className="text-ink-400 dark:text-ink-500 text-sm truncate">{email}</p>
            {isPremium && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30">
                <Crown className="w-3 h-3 text-accent-500" />
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400">Pro</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium card */}
      {!isPremium && (
        <div className="px-6 mb-6">
          <button onClick={onPremiumClick}
            className="w-full bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl p-4 border border-accent-100 dark:border-accent-900/30 flex items-center gap-3 hover:shadow-card transition-all active:scale-[0.98] text-left">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">Upgrade to Vaulted Pro</p>
              <p className="text-xs text-ink-400">Unlock all premium features</p>
            </div>
            <ChevronRight className="w-4 h-4 text-accent-500" />
          </button>
        </div>
      )}

      {/* Account section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Account</p>
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden">
          <Row icon={User} label="Personal Information" onClick={() => {}} />
          <Row icon={Shield} label="Security" onClick={() => {}} divider />
        </div>
      </div>

      {/* Vault section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Vault</p>
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden">
          <Row icon={Cloud} label="Cloud Backup" onClick={() => {}} />
          <Row icon={Download} label="Export Data" onClick={() => {}} divider />
        </div>
      </div>

      {/* Preferences section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Preferences</p>
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden">
          <ToggleRow icon={notifications ? Bell : BellOff} label="Notifications" value={notifications} onChange={setNotifications} />
          <ToggleRow icon={theme === 'dark' ? Moon : Sun} label="Dark Mode" value={theme === 'dark'} onChange={toggle} divider />
          <Row icon={Globe} label="Language" trailingLabel="English" onClick={() => {}} divider />
          <Row icon={Accessibility} label="Accessibility" onClick={() => {}} />
        </div>
      </div>

      {/* Support section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Support</p>
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden">
          <Row icon={HelpCircle} label="Help Center" onClick={() => {}} />
          <Row icon={MessageSquare} label="Feedback" onClick={() => {}} divider />
          <Row icon={Info} label="About Vaulted" onClick={() => {}} />
        </div>
      </div>

      {/* Sign out */}
      <div className="px-6 mb-6">
        <button onClick={handleSignOut}
          className="w-full bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft p-4 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 pb-4">
        <LogoMark size={28} />
        <p className="text-xs text-ink-400 dark:text-ink-500 font-medium">Vaulted v1.0 · Your purchases, remembered.</p>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, onClick, divider, trailingLabel }: {
  icon: React.ElementType; label: string; onClick: () => void; divider?: boolean; trailingLabel?: string;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors text-left ${divider ? 'border-b border-ink-50 dark:border-ink-700' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ink-600 dark:text-ink-300" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-200">{label}</span>
      {trailingLabel && <span className="text-sm text-ink-400 dark:text-ink-500">{trailingLabel}</span>}
      <ChevronRight className="w-4 h-4 text-ink-300 dark:text-ink-600" />
    </button>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange, divider }: {
  icon: React.ElementType; label: string; value: boolean; onChange: (v: boolean) => void; divider?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 ${divider ? 'border-b border-ink-50 dark:border-ink-700' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ink-600 dark:text-ink-300" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-200">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary-500' : 'bg-ink-200 dark:bg-ink-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
