import { useState, useEffect } from 'react';
import {
  ChevronRight, User, Shield, Cloud, Download, Bell, Moon, Globe, Accessibility,
  HelpCircle, MessageSquare, Info, LogOut, BellOff,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LogoMark } from './Logo';

interface ProfileProps {
  onSignOut: () => void;
}

export function Profile({ onSignOut }: ProfileProps) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
    <div className="min-h-screen bg-ink-50 pb-28">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight mb-1">Profile</h1>
      </div>

      {/* Profile card */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-extrabold shrink-0">
            {userName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink-900 text-lg truncate">{userName}</p>
            <p className="text-ink-400 text-sm truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Account</p>
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <Row icon={User} label="Personal Information" onClick={() => {}} />
          <Row icon={Shield} label="Security" onClick={() => {}} divider />
        </div>
      </div>

      {/* Vault section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Vault</p>
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <Row icon={Cloud} label="Cloud Backup" onClick={() => {}} />
          <Row icon={Download} label="Export Data" onClick={() => {}} divider />
        </div>
      </div>

      {/* Preferences section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Preferences</p>
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <ToggleRow icon={notifications ? Bell : BellOff} label="Notifications" value={notifications} onChange={setNotifications} />
          <ToggleRow icon={Moon} label="Dark Mode" value={darkMode} onChange={setDarkMode} divider />
          <Row icon={Globe} label="Language" trailingLabel="English" onClick={() => {}} divider />
          <Row icon={Accessibility} label="Accessibility" onClick={() => {}} />
        </div>
      </div>

      {/* Support section */}
      <div className="px-6 mb-6">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 px-2">Support</p>
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <Row icon={HelpCircle} label="Help Center" onClick={() => {}} />
          <Row icon={MessageSquare} label="Feedback" onClick={() => {}} divider />
          <Row icon={Info} label="About Vaulted" onClick={() => {}} />
        </div>
      </div>

      {/* Sign out */}
      <div className="px-6 mb-6">
        <button
          onClick={handleSignOut}
          className="w-full bg-white rounded-2xl border border-ink-100 shadow-sm p-4 flex items-center justify-center gap-2
            text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <LogoMark size={28} />
        <p className="text-xs text-ink-400 font-medium">Vaulted v1.0 · Your purchases, remembered.</p>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  onClick,
  divider,
  trailingLabel,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  divider?: boolean;
  trailingLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50 transition-colors text-left ${
        divider ? 'border-b border-ink-50' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ink-600" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink-800">{label}</span>
      {trailingLabel && <span className="text-sm text-ink-400">{trailingLabel}</span>}
      <ChevronRight className="w-4 h-4 text-ink-300" />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
  divider,
}: {
  icon: React.ElementType;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 ${divider ? 'border-b border-ink-50' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ink-600" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink-800">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? 'bg-primary-500' : 'bg-ink-200'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
