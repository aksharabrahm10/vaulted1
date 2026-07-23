import { useState } from 'react';
import { Camera, Search, ShieldCheck, ArrowRight, Receipt, Sparkles, BarChart3 } from 'lucide-react';
import { LogoMark } from './Logo';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: <Camera className="w-7 h-7" />,
    title: 'Never Lose a Receipt Again',
    subtitle: 'Scan any receipt and let Vaulted automatically organize every detail. No more digging through wallets, drawers, or emails.',
    illustration: <ScanIllustration />,
  },
  {
    icon: <Search className="w-7 h-7" />,
    title: 'Find Anything Instantly',
    subtitle: 'Search receipts by store, product, date, category, or simply ask Vaulted using natural language.',
    illustration: <SearchIllustration />,
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: 'Your Purchase Memory',
    subtitle: 'Track purchases, warranties, returns, and spending securely in one intelligent vault.',
    illustration: <VaultIllustration />,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex flex-col safe-top safe-bottom">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <LogoMark size={36} />
        {current < slides.length - 1 && (
          <button onClick={onComplete} className="text-ink-400 dark:text-ink-500 font-semibold text-sm hover:text-ink-600 transition-colors">Skip</button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div key={current} className="flex flex-col items-center text-center animate-slide-up">
          {slide.illustration}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">{slide.icon}</div>
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 mb-3 tracking-tight max-w-xs">{slide.title}</h1>
          <p className="text-ink-500 dark:text-ink-400 text-base leading-relaxed max-w-sm">{slide.subtitle}</p>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-7 bg-primary-500' : 'w-2 bg-ink-200 dark:bg-ink-700'}`} />
          ))}
        </div>
        <button onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-primary-500 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20">
          {current === slides.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ScanIllustration() {
  return (
    <div className="relative w-48 h-48 mb-8">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center animate-float"><Camera className="w-7 h-7 text-primary-500" /></div>
        <div className="w-px h-6 bg-primary-300 dark:bg-primary-700" />
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center"><Receipt className="w-7 h-7 text-primary-500" /></div>
        <div className="w-px h-6 bg-primary-300 dark:bg-primary-700" />
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center"><Sparkles className="w-7 h-7 text-accent-500" /></div>
      </div>
    </div>
  );
}

function SearchIllustration() {
  return (
    <div className="w-full max-w-xs mb-8">
      <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-lg p-3 flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary-500" />
        <div className="flex-1 text-left">
          <span className="text-ink-800 dark:text-ink-200 font-medium text-sm">Find my headphones</span>
          <span className="inline-block w-px h-4 bg-primary-500 ml-0.5 animate-pulse-soft align-middle" />
        </div>
      </div>
      <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-scale-in">
        <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">📦</div>
        <div className="flex-1 text-left">
          <p className="text-xs text-ink-400 font-medium">Amazon</p>
          <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Sony Headphones</p>
          <p className="text-xs text-ink-400">July 12, 2026</p>
        </div>
        <p className="text-sm font-bold text-ink-900 dark:text-ink-100">$249</p>
      </div>
    </div>
  );
}

function VaultIllustration() {
  return (
    <div className="relative w-48 h-48 mb-8">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center"><Receipt className="w-6 h-6 text-primary-500" /></div>
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-primary-500" /></div>
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-ink-800 shadow-lg flex items-center justify-center"><BarChart3 className="w-6 h-6 text-primary-500" /></div>
      </div>
    </div>
  );
}
