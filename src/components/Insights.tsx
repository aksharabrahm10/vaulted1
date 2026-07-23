import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Receipt, CATEGORY_ICONS, CATEGORY_COLORS, formatCurrency } from '../lib/types';

export function Insights() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data } = await supabase.from('receipts').select('*').order('receipt_date', { ascending: false });
    if (data) setReceipts(data as Receipt[]);
    setLoading(false);
  };

  const monthlyData = (() => {
    const months: { label: string; total: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = receipts.filter((r) => r.receipt_date.startsWith(key)).reduce((sum, r) => sum + Number(r.total_amount), 0);
      months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), total });
    }
    return months;
  })();

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  const categoryData = (() => {
    const map = new Map<string, number>();
    receipts.forEach((r) => map.set(r.store_category, (map.get(r.store_category) || 0) + Number(r.total_amount)));
    return Array.from(map.entries()).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
  })();

  const totalSpending = categoryData.reduce((sum, c) => sum + c.total, 0);

  const topStores = (() => {
    const map = new Map<string, { count: number; total: number }>();
    receipts.forEach((r) => {
      const ex = map.get(r.store_name) || { count: 0, total: 0 };
      map.set(r.store_name, { count: ex.count + 1, total: ex.total + Number(r.total_amount) });
    });
    return Array.from(map.entries()).map(([store, data]) => ({ store, ...data })).sort((a, b) => b.total - a.total).slice(0, 5);
  })();

  const largestPurchases = [...receipts].sort((a, b) => Number(b.total_amount) - Number(a.total_amount)).slice(0, 5);

  const thisMonth = monthlyData[monthlyData.length - 1]?.total || 0;
  const lastMonth = monthlyData[monthlyData.length - 2]?.total || 0;
  const trendPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-28">
        <div className="px-6 pt-12">
          <div className="h-8 w-40 shimmer-bg rounded-lg animate-shimmer mb-6" />
          <div className="h-40 shimmer-bg rounded-2xl animate-shimmer mb-4" />
          <div className="h-32 shimmer-bg rounded-2xl animate-shimmer mb-4" />
          <div className="h-48 shimmer-bg rounded-2xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-28 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-3xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
          <BarChart3 className="w-9 h-9 text-ink-400" />
        </div>
        <p className="font-semibold text-ink-900 dark:text-ink-100 mb-1">No insights yet</p>
        <p className="text-ink-400 dark:text-ink-500 text-sm text-center">Scan some receipts to see your spending insights.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-28">
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 tracking-tight mb-1">Your Spending</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm">Insights from your purchase history</p>
      </div>

      <div className="px-6 space-y-4">
        {/* Monthly spending */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Monthly Spending</h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-500 min-h-[4px] relative group" style={{ height: `${(m.total / maxMonthly) * 100}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-ink-900 dark:text-ink-100 whitespace-nowrap">{formatCurrency(m.total)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-ink-400 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend card */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            {trendPct > 0 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-emerald-500" />}
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Spending Trend</h3>
          </div>
          <p className="text-sm text-ink-600 dark:text-ink-300">
            You spent <span className={`font-bold ${trendPct > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{Math.abs(trendPct).toFixed(0)}% {trendPct > 0 ? 'more' : 'less'}</span> this month compared to last month.
          </p>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Top Categories</h3>
          </div>
          <div className="space-y-3">
            {categoryData.slice(0, 5).map(({ category, total }) => {
              const pct = totalSpending > 0 ? (total / totalSpending) * 100 : 0;
              const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
              const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2"><span className="text-sm">{icon}</span><span className="text-sm font-medium text-ink-700 dark:text-ink-300">{category}</span></div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-ink-900 dark:text-ink-100">{formatCurrency(total)}</span><span className="text-xs text-ink-400 w-10 text-right">{pct.toFixed(0)}%</span></div>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top stores */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Top Stores</h3>
          </div>
          <div className="space-y-3">
            {topStores.map((store, i) => (
              <div key={store.store} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-600 dark:text-ink-300 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{store.store}</p><p className="text-xs text-ink-400">{store.count} receipt{store.count !== 1 ? 's' : ''}</p></div>
                <p className="text-sm font-bold text-ink-900 dark:text-ink-100 shrink-0">{formatCurrency(store.total)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Largest purchases */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Largest Purchases</h3>
          </div>
          <div className="space-y-3">
            {largestPurchases.map((r) => {
              const icon = CATEGORY_ICONS[r.store_category] || CATEGORY_ICONS.Other;
              const color = CATEGORY_COLORS[r.store_category] || CATEGORY_COLORS.Other;
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${color}15` }}>{icon}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{r.store_name}</p><p className="text-xs text-ink-400">{r.receipt_date}</p></div>
                  <p className="text-sm font-bold text-ink-900 dark:text-ink-100 shrink-0">{formatCurrency(Number(r.total_amount))}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
