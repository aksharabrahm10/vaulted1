import { useEffect, useState } from 'react';
import { Camera, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Receipt, CATEGORY_ICONS, CATEGORY_COLORS, formatDate, formatCurrency } from '../lib/types';

interface HomeProps {
  onScan: () => void;
  onReceiptClick: (receipt: Receipt) => void;
  onSearchClick: () => void;
  userName: string;
}

export function Home({ onScan, onReceiptClick, onSearchClick, userName }: HomeProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, products: 0, stores: 0, monthTotal: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setReceipts(data as Receipt[]);

      const stores = new Set(data.map((r: Receipt) => r.store_name));
      const products = data.reduce((sum: number, r: Receipt) => sum + (r.item_count || 0), 0);

      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthTotal = data
        .filter((r: Receipt) => r.receipt_date.startsWith(monthStr))
        .reduce((sum: number, r: Receipt) => sum + Number(r.total_amount), 0);

      setStats({
        count: data.length,
        products,
        stores: stores.size,
        monthTotal,
      });
    }
    setLoading(false);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-ink-50 pb-28">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-ink-400 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">
              {firstName} 👋
            </h1>
          </div>
          <button
            onClick={onSearchClick}
            className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-600 hover:bg-ink-100 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-primary-500" />
          </button>
        </div>
      </div>

      {/* Vault Stats Card */}
      <div className="px-6 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 shadow-xl shadow-primary-600/20">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 font-semibold text-sm">Your Vault</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-8 w-32 shimmer-bg rounded-lg animate-shimmer" />
                <div className="h-4 w-48 shimmer-bg rounded animate-shimmer" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-white text-3xl font-extrabold">{stats.count}</span>
                  <span className="text-white/70 text-sm font-medium">Receipts</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Stat label="Products" value={stats.products} />
                  <Stat label="Stores" value={stats.stores} />
                  <Stat label="This Month" value={formatCurrency(stats.monthTotal)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scan Button */}
      <div className="px-6 mb-8">
        <button
          onClick={onScan}
          className="w-full h-16 rounded-2xl bg-ink-900 text-white font-semibold text-base
            flex items-center justify-between px-5
            hover:bg-ink-800 active:scale-[0.98] transition-all
            shadow-lg shadow-ink-900/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-base font-semibold leading-tight">Scan Receipt</p>
              <p className="text-ink-400 text-xs">AI will organize it automatically</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink-400" />
        </button>
      </div>

      {/* Recent Receipts */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-900">Recent Receipts</h2>
          {receipts.length > 0 && (
            <button onClick={onSearchClick} className="text-primary-600 text-sm font-semibold hover:text-primary-700">
              See all
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 shimmer-bg rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : receipts.length === 0 ? (
          <EmptyState onScan={onScan} />
        ) : (
          <div className="space-y-3">
            {receipts.slice(0, 5).map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} onClick={() => onReceiptClick(receipt)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-white font-bold text-lg leading-tight">{value}</p>
      <p className="text-white/60 text-xs font-medium">{label}</p>
    </div>
  );
}

function ReceiptCard({ receipt, onClick }: { receipt: Receipt; onClick: () => void }) {
  const icon = CATEGORY_ICONS[receipt.store_category] || CATEGORY_ICONS.Other;
  const color = CATEGORY_COLORS[receipt.store_category] || CATEGORY_COLORS.Other;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 flex items-center gap-3
        hover:shadow-md transition-all active:scale-[0.99] text-left
        border border-ink-100"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-ink-900 text-sm truncate">{receipt.store_name}</p>
        <p className="text-ink-400 text-xs">
          {receipt.item_count} item{receipt.item_count !== 1 ? 's' : ''} · {formatDate(receipt.receipt_date)}
        </p>
      </div>
      <p className="font-bold text-ink-900 text-sm shrink-0">{formatCurrency(Number(receipt.total_amount))}</p>
    </button>
  );
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-ink-100">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
        <Camera className="w-7 h-7 text-primary-400" />
      </div>
      <p className="font-semibold text-ink-900 mb-1">Your vault is empty</p>
      <p className="text-ink-400 text-sm mb-4">Scan your first receipt and let Vaulted organize it for you.</p>
      <button
        onClick={onScan}
        className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
      >
        <Camera className="w-4 h-4" />
        Scan Receipt
      </button>
    </div>
  );
}
