import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Plan = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionState {
  isPremium: boolean;
  plan: Plan;
  receiptCount: number;
  receiptLimit: number;
  setPremium: (value: boolean) => void;
  setReceiptCount: (n: number) => void;
  upgrade: (cycle: BillingCycle) => void;
  cancel: () => void;
}

const FREE_RECEIPT_LIMIT = 250;

const SubscriptionContext = createContext<SubscriptionState | null>(null);

// Placeholder billing integration. In production, connect to App Store / Play Store
// subscription APIs (RevenueCat / StoreKit / BillingClient).
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [receiptCount, setReceiptCount] = useState(178);

  useEffect(() => {
    const stored = localStorage.getItem('vaulted_premium');
    if (stored === 'true') setIsPremium(true);
    const storedCount = localStorage.getItem('vaulted_receipt_count');
    if (storedCount) setReceiptCount(parseInt(storedCount, 10));
  }, []);

  const setPremium = (value: boolean) => {
    setIsPremium(value);
    localStorage.setItem('vaulted_premium', String(value));
  };

  const handleSetReceiptCount = (n: number) => {
    setReceiptCount(n);
    localStorage.setItem('vaulted_receipt_count', String(n));
  };

  const upgrade = (_cycle: BillingCycle) => setPremium(true);
  const cancel = () => setPremium(false);

  return (
    <SubscriptionContext.Provider value={{
      isPremium, plan: isPremium ? 'pro' : 'free',
      receiptCount, receiptLimit: FREE_RECEIPT_LIMIT,
      setPremium, setReceiptCount: handleSetReceiptCount, upgrade, cancel,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionState {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
