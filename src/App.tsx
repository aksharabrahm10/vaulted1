import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Receipt, ExtractedReceipt } from './lib/types';
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

type AppState = 'onboarding' | 'auth' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState<{ receipt: ExtractedReceipt; image: string } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [userName, setUserName] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserName(data.session.user?.user_metadata?.full_name || 'there');
        setAppState('app');
      }
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session) {
          setUserName(session.user?.user_metadata?.full_name || 'there');
          setAppState('app');
        } else if (event === 'SIGNED_OUT') {
          setAppState('onboarding');
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = () => {
    if (authChecked) {
      // Check if already logged in
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setUserName(data.session.user?.user_metadata?.full_name || 'there');
          setAppState('app');
        } else {
          setAppState('auth');
        }
      });
    } else {
      setAppState('auth');
    }
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

  const handleConfirmDone = () => {
    setConfirming(null);
    setActiveTab('home');
  };

  const handleSignOut = () => {
    setAppState('onboarding');
    setActiveTab('home');
  };

  // Onboarding
  if (appState === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Auth
  if (appState === 'auth') {
    return <Auth onSuccess={handleAuthSuccess} onBack={() => setAppState('onboarding')} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Active tab content */}
      {activeTab === 'home' && (
        <Home
          onScan={() => setScanning(true)}
          onReceiptClick={setSelectedReceipt}
          onSearchClick={() => setActiveTab('search')}
          userName={userName}
        />
      )}

      {activeTab === 'search' && (
        <SearchScreen onReceiptClick={setSelectedReceipt} />
      )}

      {activeTab === 'insights' && <Insights />}

      {activeTab === 'profile' && <Profile onSignOut={handleSignOut} />}

      {/* Bottom navigation */}
      <BottomNav
        active={activeTab}
        onChange={setActiveTab}
        onScan={() => setScanning(true)}
      />

      {/* Scan overlay */}
      {scanning && (
        <Scan
          onClose={() => setScanning(false)}
          onExtracted={handleScanComplete}
        />
      )}

      {/* Confirm receipt overlay */}
      {confirming && (
        <ConfirmReceipt
          receipt={confirming.receipt}
          imageBase64={confirming.image}
          onDone={handleConfirmDone}
        />
      )}

      {/* Receipt detail overlay */}
      {selectedReceipt && (
        <ReceiptDetail
          receipt={selectedReceipt}
          onBack={() => setSelectedReceipt(null)}
          onDeleted={() => {
            setSelectedReceipt(null);
            setActiveTab('home');
          }}
        />
      )}
    </div>
  );
}
