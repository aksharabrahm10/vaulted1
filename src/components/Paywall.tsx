import { useState } from 'react';
import { X, Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useSubscription, BillingCycle } from '../lib/subscription';

interface PaywallProps {
  onClose: () => void;
  featureName?: string;
}

const benefits = [
  'Unlimited Receipts', 'AI Assistant', 'Warranty Tracking', 'Return Reminders',
  'Price History', 'Family Vault', 'Advanced Insights', 'Email Receipt Import', 'Priority Features',
];

export function Paywall({ onClose, featureName }: PaywallProps) {
  const { upgrade } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Placeholder billing — replace with StoreKit / BillingClient.
    setTimeout(() => { upgrade(cycle); setLoading(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-ink-50 dark:bg-ink-900 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between border-b border-ink-100 dark:border-ink-800">
          <div className="w-8" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 dark:text-ink-100">Vaulted Pro</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-500 dark:text-ink-400 hover:bg-ink-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="text-center mb-6">
            {featureName && <p className="text-sm font-semibold text-accent-600 dark:text-accent-400 mb-2">{featureName} is a Pro feature</p>}
            <h2 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 tracking-tight mb-2">Unlock Vaulted Pro</h2>
            <p className="text-ink-500 dark:text-ink-400 text-sm">Your complete AI purchase memory.</p>
          </div>

          <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft mb-6">
            <div className="grid grid-cols-1 gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <PricingCard label="Monthly" price="$6.99" period="/month" selected={cycle === 'monthly'} onClick={() => setCycle('monthly')} />
            <PricingCard label="Yearly" price="$59.99" period="/year" badge="Save 28%" selected={cycle === 'yearly'} onClick={() => setCycle('yearly')} />
          </div>

          <button onClick={handleSubscribe} disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/30 disabled:opacity-60 mb-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" />Start Free Trial</>}
          </button>
          <button onClick={onClose} className="w-full h-12 rounded-2xl text-ink-500 dark:text-ink-400 font-semibold text-sm hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            Maybe Later
          </button>
          <p className="text-center text-xs text-ink-400 dark:text-ink-500 mt-4">
            Free for 7 days, then {cycle === 'monthly' ? '$6.99/month' : '$59.99/year'}. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ label, price, period, badge, selected, onClick }: {
  label: string; price: string; period: string; badge?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`relative rounded-2xl p-4 border-2 transition-all text-left ${
        selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-ink-300'
      }`}>
      {badge && <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-accent-500 text-white text-[10px] font-bold">{badge}</span>}
      <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-extrabold text-ink-900 dark:text-ink-100">{price}</span>
        <span className="text-xs text-ink-400">{period}</span>
      </div>
      <div className={`mt-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary-500 bg-primary-500' : 'border-ink-300 dark:border-ink-600'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}
