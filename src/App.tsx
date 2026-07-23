import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Receipt, ExtractedReceipt, PremiumFeature } from './lib/types';
import { SubscriptionProvider } from './lib/subscription';
import { ThemeProvider } from './lib/theme';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { Scan } from './components/Scan';
import { ConfirmReceipt } from './components/ConfirmReceipt';
import { SearchScreen } from './components/SearchScreen';
import { ReceiptDetail } from './components/ReceiptDetail';
import { Insights } from './components/Insights';
import { Profile } from './components/Profile';
import { BottomNav, Tab } from './components/BottomNav';
import { Paywall } from './components/Paywall';
import { PremiumHub } from './components/PremiumHub';
import { PremiumScreen } from './components/PremiumScreen';

type AppState = 'onboarding' | 'auth' | 'app';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState<{ receipt: ExtractedReceipt; image: string } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [userName, setUserName] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string | undefined>(undefined);
  const [showPremiumHub, setShowPremiumHub] = useState(false);
  const [activePremiumFeature, setActivePremiumFeature] = useState<PremiumFeature | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserName(data.session.user?.user_metadata?.full_name || 'there');
        setAppState('app');
      }
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUserName(session.user?.user_metadata?.full_name || 'there');
        setAppState('app');
      } else if (event === 'SIGNED_OUT') {
        setAppState('onboarding');
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const handleOnboardingComplete = () => {
    if (authChecked) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setUserName(data.session.user?.user_metadata?.full_name || 'there');
          setAppState('app');
        } else setAppState('auth');
      });
    } else setAppState('auth');
  };

  const handleAuthSuccess = () => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(data.user?.user_metadata?.full_name || 'there');
      setAppState('app');
    });
  };

  const handleScanComplete = (receipt: ExtractedReceipt, imageBase64: string) => {
    setConfirming({ receipt, image: imageBase64 });
    setScanning(false);
  };

  const handleConfirmDone = () => { setConfirming(null); setActiveTab('home'); };

  const handleSignOut = () => { setAppState('onboarding'); setActiveTab('home'); };

  const handlePremiumFeature = (feature: PremiumFeature) => {
    // In production, check subscription status from store
    const isPremium = localStorage.getItem('vaulted_premium') === 'true';
    if (isPremium) {
      setShowPremiumHub(false);
      setActivePremiumFeature(feature);
    } else {
      const featureNames: Record<PremiumFeature, string> = {
        'ai-assistant': 'AI Purchase Assistant', 'warranty': 'Warranty Tracker', 'returns': 'Return Reminders',
        'price-history': 'Price History', 'pantry': 'Pantry Tracking', 'email-import': 'Email Receipt Import',
        'family-vault': 'Family Vault', 'advanced-analytics': 'Advanced Analytics',
      };
      setPaywallFeature(featureNames[feature]);
      setShowPaywall(true);
    }
  };

  if (appState === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;
  if (appState === 'auth') return <Auth onSuccess={handleAuthSuccess} onBack={() => setAppState('onboarding')} />;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {activeTab === 'home' && (
        <Home onScan={() => setScanning(true)} onReceiptClick={setSelectedReceipt} onSearchClick={() => setActiveTab('search')} onPremiumClick={() => setShowPremiumHub(true)} userName={userName} />
      )}
      {activeTab === 'search' && <SearchScreen onReceiptClick={setSelectedReceipt} />}
      {activeTab === 'insights' && <Insights />}
      {activeTab === 'profile' && <Profile onSignOut={handleSignOut} onPremiumClick={() => setShowPremiumHub(true)} />}

      <BottomNav active={activeTab} onChange={setActiveTab} onScan={() => setScanning(true)} />

      {scanning && <Scan onClose={() => setScanning(false)} onExtracted={handleScanComplete} />}
      {confirming && <ConfirmReceipt receipt={confirming.receipt} imageBase64={confirming.image} onDone={handleConfirmDone} />}
      {selectedReceipt && (
        <ReceiptDetail receipt={selectedReceipt} onBack={() => setSelectedReceipt(null)} onDeleted={() => { setSelectedReceipt(null); setActiveTab('home'); }} />
      )}

      {showPremiumHub && (
        <PremiumHub onBack={() => setShowPremiumHub(false)} onFeatureSelect={handlePremiumFeature} onUpgrade={() => { setShowPremiumHub(false); setShowPaywall(true); }} />
      )}
      {activePremiumFeature && (
        <PremiumScreen feature={activePremiumFeature} onBack={() => setActivePremiumFeature(null)} />
      )}
      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} featureName={paywallFeature} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
