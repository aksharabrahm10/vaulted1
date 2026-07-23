import { ArrowLeft, Sparkles, Infinity as InfinityIcon, Lock, Crown } from 'lucide-react';
import { useSubscription } from '../lib/subscription';
import { PremiumFeature } from '../lib/types';

interface PremiumHubProps {
  onBack: () => void;
  onFeatureSelect: (feature: PremiumFeature) => void;
  onUpgrade: () => void;
}

const features: { id: PremiumFeature; title: string; subtitle: string; emoji: string }[] = [
  { id: 'ai-assistant', title: 'AI Purchase Assistant', subtitle: 'Ask anything about your purchases', emoji: '🤖' },
  { id: 'warranty', title: 'Warranty Tracker', subtitle: 'Track warranties and expirations', emoji: '🛡️' },
  { id: 'returns', title: 'Return Reminder', subtitle: 'Never miss a return deadline', emoji: '↩️' },
  { id: 'price-history', title: 'Price History', subtitle: 'Track price changes over time', emoji: '📈' },
  { id: 'pantry', title: 'Pantry Tracking', subtitle: 'AI-estimated grocery inventory', emoji: '🥫' },
  { id: 'email-import', title: 'Email Receipt Import', subtitle: 'Gmail & Outlook integration', emoji: '📧' },
  { id: 'family-vault', title: 'Shared Family Vault', subtitle: 'Share receipts with family', emoji: '👨‍👩‍👧' },
  { id: 'advanced-analytics', title: 'Advanced Analytics', subtitle: 'Forecasts, trends & AI insights', emoji: '📊' },
];

export function PremiumHub({ onBack, onFeatureSelect, onUpgrade }: PremiumHubProps) {
  const { isPremium, receiptCount, receiptLimit } = useSubscription();
  const usagePct = Math.min((receiptCount / receiptLimit) * 100, 100);

  return (
    <div className="fixed inset-0 bg-ink-50 dark:bg-ink-950 z-50 overflow-y-auto safe-top safe-bottom">
      <div className="sticky top-0 glass border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-accent-500" />
          <h1 className="text-lg font-extrabold text-ink-900 dark:text-ink-100">Vaulted Pro</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-32">
        {/* Status card */}
        <div className={`rounded-3xl p-6 mb-6 shadow-card ${isPremium ? 'bg-gradient-to-br from-accent-500 to-primary-500' : 'bg-gradient-to-br from-primary-500 to-primary-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isPremium ? <Crown className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
              <span className="text-white font-bold text-sm uppercase tracking-wide">{isPremium ? 'Pro Member' : 'Free Plan'}</span>
            </div>
            {!isPremium && (
              <button onClick={onUpgrade} className="px-4 h-9 rounded-full bg-white text-primary-600 font-bold text-xs hover:bg-ink-50 transition-colors">Upgrade</button>
            )}
          </div>
          {isPremium ? (
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-6 h-6 text-white" />
              <p className="text-white text-lg font-extrabold">Unlimited Receipts</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-white text-2xl font-extrabold">{receiptCount}</span>
                <span className="text-white/70 text-sm font-medium">/ {receiptLimit} Receipts Used</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-white/70 text-xs mt-2">{receiptLimit - receiptCount} receipts remaining. Upgrade for unlimited storage.</p>
            </>
          )}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <button key={feature.id} onClick={() => onFeatureSelect(feature.id)}
              className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-100 dark:border-ink-700 shadow-soft hover:shadow-card transition-all active:scale-[0.98] text-left relative">
              {!isPremium && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-ink-400" />
                </div>
              )}
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-3">
                <span className="text-xl">{feature.emoji}</span>
              </div>
              <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm leading-tight mb-1">{feature.title}</h3>
              <p className="text-xs text-ink-400 dark:text-ink-500 leading-snug">{feature.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Free plan benefits */}
        {!isPremium && (
          <div className="mt-6">
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-3 px-1">Your Free Plan Includes</h3>
            <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-100 dark:border-ink-700 shadow-soft">
              <ul className="space-y-2.5 text-sm text-ink-600 dark:text-ink-300">
                {['Up to 250 stored receipts', 'Basic AI extraction', 'Basic receipt search', 'Manual editing', 'Spending dashboard', 'Cloud sync', 'Favorites', 'PDF export'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <span className="text-emerald-600 text-[10px] font-bold">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
