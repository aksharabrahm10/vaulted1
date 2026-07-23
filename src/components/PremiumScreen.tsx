import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, ShieldCheck, Undo2, TrendingUp, Soup, Mail, Users, BarChart3, Bell, Plus } from 'lucide-react';
import { PremiumFeature } from '../lib/types';
import { formatCurrency } from '../lib/types';

interface PremiumScreenProps {
  feature: PremiumFeature;
  onBack: () => void;
}

// Map feature IDs to display metadata
const featureMeta: Record<PremiumFeature, { title: string; emoji: string }> = {
  'ai-assistant': { title: 'AI Assistant', emoji: '🤖' },
  'warranty': { title: 'Warranty Tracker', emoji: '🛡️' },
  'returns': { title: 'Return Reminders', emoji: '↩️' },
  'price-history': { title: 'Price History', emoji: '📈' },
  'pantry': { title: 'Pantry Tracking', emoji: '🥫' },
  'email-import': { title: 'Email Import', emoji: '📧' },
  'family-vault': { title: 'Family Vault', emoji: '👨‍👩‍👧' },
  'advanced-analytics': { title: 'Advanced Analytics', emoji: '📊' },
};

export function PremiumScreen({ feature, onBack }: PremiumScreenProps) {
  const meta = featureMeta[feature];

  return (
    <div className="fixed inset-0 bg-ink-50 dark:bg-ink-950 z-50 overflow-y-auto safe-top safe-bottom">
      <div className="sticky top-0 glass border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <h1 className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{meta.title}</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-32">
        {feature === 'ai-assistant' && <AIAssistant />}
        {feature === 'warranty' && <WarrantyTracker />}
        {feature === 'returns' && <ReturnReminders />}
        {feature === 'price-history' && <PriceHistory />}
        {feature === 'pantry' && <PantryTracking />}
        {feature === 'email-import' && <EmailImport />}
        {feature === 'family-vault' && <FamilyVault />}
        {feature === 'advanced-analytics' && <AdvancedAnalytics />}
      </div>
    </div>
  );
}

/* ---------- Shared Header Component ---------- */
function ScreenHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 dark:text-ink-100">{title}</h2>
        <p className="text-sm text-ink-400">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------- AI Purchase Assistant (Chat Interface) ---------- */
interface ChatMessage { role: 'user' | 'assistant'; text: string }

const mockResponses: Record<string, string> = {
  'headphones': 'You purchased Sony WH-1000XM5 Headphones on July 12, 2026 from Amazon for $249.00. The receipt is saved in your vault.',
  'costco': 'I found 3 Costco receipts in your vault. The most recent was on July 8, 2026 for $156.42. Would you like me to show all of them?',
  'groceries': 'Last month you spent $487.23 on groceries across 7 receipts. Your top store was Whole Foods at $203.45.',
  'over 500': 'You have 2 purchases over $500: MacBook Air ($1,299.00 on June 15) and iPhone 15 Pro ($999.00 on May 22).',
};

const suggestedQueries = [
  'When did I buy my headphones?',
  'Find my Costco receipt.',
  'How much did I spend on groceries last month?',
  'Show purchases over $500.',
];

function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const getMockResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes('headphone')) return mockResponses['headphones'];
    if (lower.includes('costco')) return mockResponses['costco'];
    if (lower.includes('grocer')) return mockResponses['groceries'];
    if (lower.includes('over') && lower.includes('500')) return mockResponses['over 500'];
    return `I searched your vault for "${query}". I found a few matching receipts. In production, this will connect to OpenAI with vector search over your purchase history.`;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', text: getMockResponse(text) }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <>
      <ScreenHeader icon={Sparkles} title="AI Purchase Assistant" subtitle="Ask anything about your purchases" />

      <div ref={scrollRef} className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
        {messages.length === 0 && (
          <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <p className="font-bold text-ink-900 dark:text-ink-100 mb-1">Ask Vaulted AI</p>
            <p className="text-sm text-ink-400 mb-4">I can search your entire purchase history using natural language.</p>
            <div className="space-y-2">
              {suggestedQueries.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="block w-full text-left text-sm text-primary-600 dark:text-primary-400 font-medium px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 transition-colors">
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-primary-500 text-white font-medium'
                : 'bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-200 border border-ink-100 dark:border-ink-700 shadow-soft'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-ink-800 rounded-2xl px-4 py-3 border border-ink-100 dark:border-ink-700 shadow-soft flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-ink-300 animate-typing" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-ink-100 dark:border-ink-800 px-6 py-4 safe-bottom max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask Vaulted anything..."
            className="flex-1 h-12 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 px-4 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim()}
            className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 shrink-0">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- Warranty Tracker ---------- */
interface Warranty { product: string; store: string; purchaseDate: string; expiration: string; daysRemaining: number }

const mockWarranties: Warranty[] = [
  { product: 'MacBook Air M3', store: 'Apple Store', purchaseDate: '2026-06-15', expiration: '2027-06-15', daysRemaining: 357 },
  { product: 'Sony WH-1000XM5', store: 'Amazon', purchaseDate: '2026-07-12', expiration: '2027-07-12', daysRemaining: 384 },
  { product: 'Dyson V15 Detect', store: 'Best Buy', purchaseDate: '2026-03-22', expiration: '2028-03-22', daysRemaining: 608 },
  { product: 'iPad Pro 11"', store: 'Apple Store', purchaseDate: '2025-11-08', expiration: '2026-11-08', daysRemaining: 108 },
  { product: 'KitchenAid Mixer', store: 'Williams Sonoma', purchaseDate: '2025-08-01', expiration: '2027-08-01', daysRemaining: 404 },
];

function WarrantyTracker() {
  return (
    <>
      <ScreenHeader icon={ShieldCheck} title="Warranty Tracker" subtitle="Active warranties on your purchases" />
      <div className="space-y-3">
        {mockWarranties.map((w, i) => {
          const pct = Math.max(0, Math.min(100, (w.daysRemaining / 365) * 100));
          const isExpiring = w.daysRemaining < 120;
          return (
            <div key={i} className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-ink-900 dark:text-ink-100">{w.product}</h3>
                  <p className="text-xs text-ink-400">{w.store}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isExpiring ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {w.daysRemaining} days left
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-ink-400 mb-0.5">Purchased</p>
                  <p className="font-semibold text-ink-700 dark:text-ink-300">{new Date(w.purchaseDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-ink-400 mb-0.5">Expires</p>
                  <p className="font-semibold text-ink-700 dark:text-ink-300">{new Date(w.expiration + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
                <div className={`h-full rounded-full ${isExpiring ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Return Reminders ---------- */
interface ReturnItem { product: string; store: string; purchaseDate: string; returnDeadline: string; daysRemaining: number; price: number }

const mockReturns: ReturnItem[] = [
  { product: 'Nike Running Shoes', store: 'Nike', purchaseDate: '2026-07-18', returnDeadline: '2026-08-01', daysRemaining: 9, price: 129.99 },
  { product: 'Bluetooth Speaker', store: 'Target', purchaseDate: '2026-07-15', returnDeadline: '2026-07-29', daysRemaining: 6, price: 49.99 },
  { product: 'Cotton Sweater', store: 'Gap', purchaseDate: '2026-07-20', returnDeadline: '2026-08-03', daysRemaining: 11, price: 59.50 },
];

function ReturnReminders() {
  return (
    <>
      <ScreenHeader icon={Undo2} title="Return Reminders" subtitle="Upcoming return deadlines" />
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-amber-100 dark:border-amber-900/30">
        <Bell className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{mockReturns.length} returns due soon. Don't miss your deadlines!</p>
      </div>
      <div className="space-y-3">
        {mockReturns.map((r, i) => {
          const urgent = r.daysRemaining <= 7;
          return (
            <div key={i} className={`bg-white dark:bg-ink-800 rounded-2xl p-4 border shadow-soft ${urgent ? 'border-red-200 dark:border-red-900/40' : 'border-ink-100 dark:border-ink-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm">{r.product}</h3>
                  <p className="text-xs text-ink-400">{r.store} · {formatCurrency(r.price)}</p>
                </div>
                <div className={`text-center px-3 py-1.5 rounded-xl ${urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <p className={`text-lg font-extrabold leading-none ${urgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{r.daysRemaining}</p>
                  <p className={`text-[10px] font-bold uppercase ${urgent ? 'text-red-500' : 'text-amber-500'}`}>days</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <span>Return by {new Date(r.returnDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Price History ---------- */
interface PricePoint { date: string; price: number }
interface ProductPrice { product: string; store: string; currentPrice: number; history: PricePoint[] }

const mockPriceHistory: ProductPrice[] = [
  {
    product: 'Sony WH-1000XM5', store: 'Amazon', currentPrice: 249.00,
    history: [
      { date: 'Jan', price: 399.99 }, { date: 'Feb', price: 349.99 }, { date: 'Mar', price: 329.99 },
      { date: 'Apr', price: 299.99 }, { date: 'May', price: 279.99 }, { date: 'Jun', price: 249.00 },
    ],
  },
  {
    product: 'AirPods Pro 2', store: 'Apple', currentPrice: 199.00,
    history: [
      { date: 'Jan', price: 249.00 }, { date: 'Feb', price: 249.00 }, { date: 'Mar', price: 229.00 },
      { date: 'Apr', price: 229.00 }, { date: 'May', price: 209.00 }, { date: 'Jun', price: 199.00 },
    ],
  },
];

function PriceHistory() {
  return (
    <>
      <ScreenHeader icon={TrendingUp} title="Price History" subtitle="Track price changes over time" />
      <div className="space-y-4">
        {mockPriceHistory.map((p, i) => {
          const prices = p.history.map((h) => h.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const range = max - min || 1;
          const trend = p.history[p.history.length - 1].price < p.history[0].price ? 'down' : 'up';
          return (
            <div key={i} className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-ink-900 dark:text-ink-100">{p.product}</h3>
                  <p className="text-xs text-ink-400">{p.store}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(p.currentPrice)}</p>
                  <p className={`text-xs font-bold ${trend === 'down' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend === 'down' ? '▼' : '▲'} {formatCurrency(max - min)} since {p.history[0].date}
                  </p>
                </div>
              </div>
              {/* Simple SVG line chart */}
              <svg viewBox="0 0 300 80" className="w-full h-20" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#3155d9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={p.history.map((h, idx) => {
                    const x = (idx / (p.history.length - 1)) * 300;
                    const y = 70 - ((h.price - min) / range) * 60;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                <polyline
                  fill="url(#price-grad)"
                  stroke="none"
                  points={`${p.history.map((h, idx) => {
                    const x = (idx / (p.history.length - 1)) * 300;
                    const y = 70 - ((h.price - min) / range) * 60;
                    return `${x},${y}`;
                  }).join(' ')},300,80,0,80`}
                />
                <defs>
                  <linearGradient id="price-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3155d9" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3155d9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between mt-2">
                {p.history.map((h, idx) => (
                  <span key={idx} className="text-[10px] text-ink-400 font-medium">{h.date}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Pantry Tracking ---------- */
interface PantryItem { name: string; category: string; quantity: string; daysLeft: number; emoji: string }

const mockPantry: PantryItem[] = [
  { name: 'Whole Milk', category: 'Dairy', quantity: '1 carton', daysLeft: 3, emoji: '🥛' },
  { name: 'Sourdough Bread', category: 'Bakery', quantity: '1 loaf', daysLeft: 2, emoji: '🍞' },
  { name: 'Bananas', category: 'Produce', quantity: '6 count', daysLeft: 4, emoji: '🍌' },
  { name: 'Greek Yogurt', category: 'Dairy', quantity: '4 cups', daysLeft: 7, emoji: '🥛' },
  { name: 'Avocados', category: 'Produce', quantity: '3 count', daysLeft: 5, emoji: '🥑' },
  { name: 'Chicken Breast', category: 'Meat', quantity: '2 lbs', daysLeft: 1, emoji: '🍗' },
  { name: 'Pasta', category: 'Pantry', quantity: '2 boxes', daysLeft: 365, emoji: '🍝' },
  { name: 'Olive Oil', category: 'Pantry', quantity: '1 bottle', daysLeft: 300, emoji: '🫒' },
];

function PantryTracking() {
  const expiringSoon = mockPantry.filter((p) => p.daysLeft <= 5);
  return (
    <>
      <ScreenHeader icon={Soup} title="Pantry Tracking" subtitle="AI-estimated from your grocery receipts" />
      {expiringSoon.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-4 mb-4 border border-orange-100 dark:border-orange-900/30">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">{expiringSoon.length} items expiring soon</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">Use these before they go bad.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {mockPantry.map((item, i) => {
          const urgent = item.daysLeft <= 3;
          const warn = item.daysLeft > 3 && item.daysLeft <= 7;
          return (
            <div key={i} className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-100 dark:border-ink-700 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.emoji}</span>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${urgent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : warn ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {item.daysLeft}d
                </div>
              </div>
              <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm">{item.name}</h3>
              <p className="text-xs text-ink-400">{item.category} · {item.quantity}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Email Receipt Import ---------- */
function EmailImport() {
  return (
    <>
      <ScreenHeader icon={Mail} title="Email Receipt Import" subtitle="Auto-import receipts from your inbox" />
      <div className="space-y-3">
        <EmailProviderCard name="Gmail" color="bg-red-500" emoji="📧" connected={false} />
        <EmailProviderCard name="Outlook" color="bg-blue-500" emoji="📨" connected={false} />
      </div>
      <div className="mt-6 bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent-500" />
          </div>
          <div>
            <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm mb-1">How it works</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
              Vaulted scans your inbox for receipt emails, extracts purchase details with AI, and automatically adds them to your vault. No more manual entry.
            </p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-ink-400 mt-4">Coming soon. Connect your email to get started.</p>
    </>
  );
}

function EmailProviderCard({ name, emoji, connected }: { name: string; color: string; emoji: string; connected: boolean }) {
  return (
    <div className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-100 dark:border-ink-700 shadow-soft flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-ink-50 dark:bg-ink-700 flex items-center justify-center text-2xl">{emoji}</div>
      <div className="flex-1">
        <h3 className="font-bold text-ink-900 dark:text-ink-100">{name}</h3>
        <p className="text-xs text-ink-400">{connected ? 'Connected' : 'Not connected'}</p>
      </div>
      <button className={`px-4 h-10 rounded-xl font-semibold text-sm transition-colors ${connected ? 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}

/* ---------- Family Vault ---------- */
interface FamilyMember { name: string; email: string; role: string; avatar: string; color: string }

const mockFamily: FamilyMember[] = [
  { name: 'Sarah Chen', email: 'sarah@example.com', role: 'Admin', avatar: 'S', color: 'from-pink-400 to-rose-500' },
  { name: 'Mike Chen', email: 'mike@example.com', role: 'Member', avatar: 'M', color: 'from-blue-400 to-primary-500' },
  { name: 'Emma Chen', email: 'emma@example.com', role: 'Member', avatar: 'E', color: 'from-amber-400 to-orange-500' },
];

function FamilyVault() {
  return (
    <>
      <ScreenHeader icon={Users} title="Shared Family Vault" subtitle="Share receipts with your family" />
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Shared Receipts</p>
            <p className="text-2xl font-extrabold text-ink-900 dark:text-ink-100">142</p>
          </div>
          <div className="flex -space-x-2">
            {mockFamily.map((m, i) => (
              <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-ink-800`}>
                {m.avatar}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-3 px-1">Members</h3>
      <div className="space-y-3 mb-4">
        {mockFamily.map((m, i) => (
          <div key={i} className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-100 dark:border-ink-700 shadow-soft flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold`}>{m.avatar}</div>
            <div className="flex-1">
              <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm">{m.name}</h3>
              <p className="text-xs text-ink-400">{m.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.role === 'Admin' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-400'}`}>{m.role}</span>
          </div>
        ))}
      </div>

      <button className="w-full h-12 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-400 font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary-400 hover:text-primary-500 transition-colors">
        <Plus className="w-4 h-4" /> Invite Member
      </button>
    </>
  );
}

/* ---------- Advanced Analytics ---------- */
function AdvancedAnalytics() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const thisYear = [320, 410, 380, 520, 490, 610, 580, 640, 590, 720, 680, 750];
  const lastYear = [280, 340, 310, 420, 390, 480, 450, 510, 470, 580, 540, 610];
  const maxVal = Math.max(...thisYear, ...lastYear);

  return (
    <>
      <ScreenHeader icon={BarChart3} title="Advanced Analytics" subtitle="Year-over-year insights & forecasts" />

      {/* YoY chart */}
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm">Year-over-Year Spending</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary-500" />2026</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-ink-300" />2025</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-1 h-32">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end gap-0.5">
                <div className="flex-1 rounded-t bg-primary-500 min-h-[4px] transition-all" style={{ height: `${(thisYear[i] / maxVal) * 100}%` }} />
                <div className="flex-1 rounded-t bg-ink-300 dark:bg-ink-600 min-h-[4px] transition-all" style={{ height: `${(lastYear[i] / maxVal) * 100}%` }} />
              </div>
              <span className="text-[9px] text-ink-400 font-medium">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl p-5 border border-accent-100 dark:border-accent-900/30 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent-500" />
          <h3 className="font-bold text-accent-800 dark:text-accent-300 text-sm">AI Insights</h3>
        </div>
        <ul className="space-y-2.5 text-sm text-ink-700 dark:text-ink-300">
          <li className="flex items-start gap-2"><span className="text-accent-500 mt-0.5">•</span>Your spending is up 18% year-over-year, driven mainly by electronics purchases.</li>
          <li className="flex items-start gap-2"><span className="text-accent-500 mt-0.5">•</span>You're on track to spend $7,800 this year — 12% above last year.</li>
          <li className="flex items-start gap-2"><span className="text-accent-500 mt-0.5">•</span>Amazon is your fastest-growing store, up 34% from last year.</li>
        </ul>
      </div>

      {/* Forecast */}
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <h3 className="font-bold text-ink-900 dark:text-ink-100 text-sm">Forecast</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Next Month</p>
            <p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(780)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Q3 Total</p>
            <p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(2150)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Year End</p>
            <p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(7800)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
