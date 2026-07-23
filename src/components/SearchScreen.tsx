import { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Store, Calendar, Tag, DollarSign, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Receipt, CATEGORY_ICONS, CATEGORY_COLORS, formatDate, formatCurrency } from '../lib/types';

interface SearchProps {
  onReceiptClick: (receipt: Receipt) => void;
}

const exampleQueries = ['Find my Costco receipt', 'When did I buy batteries?', 'Show electronics purchases', 'Coffee last month'];
const recentSearchChips = ['Costco', 'Electronics', 'Coffee', 'July'];
const filterChips = [
  { icon: Store, label: 'Store' }, { icon: Calendar, label: 'Date' }, { icon: Tag, label: 'Category' },
  { icon: DollarSign, label: 'Amount' }, { icon: ShieldCheck, label: 'Warranty' },
];

export function SearchScreen({ onReceiptClick }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Receipt[]>([]);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const timer = setTimeout(() => { performSearch(query); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadAll = async () => {
    const { data } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
    if (data) setAllReceipts(data as Receipt[]);
  };

  const performSearch = (q: string) => {
    setLoading(true); setSearched(true);
    const lower = q.toLowerCase().trim();
    const filtered = allReceipts.filter((r) => {
      if (!lower) return true;
      if (r.store_name.toLowerCase().includes(lower)) return true;
      if (r.store_category.toLowerCase().includes(lower)) return true;
      const dateStr = new Date(r.receipt_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
      if (dateStr.includes(lower)) return true;
      if (lower.includes('last month')) {
        const lm = new Date(); lm.setMonth(lm.getMonth() - 1);
        const lmStr = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, '0')}`;
        if (r.receipt_date.startsWith(lmStr)) return true;
      }
      if (lower.includes('this month')) {
        const now = new Date();
        const tmStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (r.receipt_date.startsWith(tmStr)) return true;
      }
      const amountMatch = lower.match(/(?:under|below|less than)\s*\$?(\d+)/);
      if (amountMatch && Number(r.total_amount) < parseFloat(amountMatch[1])) return true;
      const overMatch = lower.match(/(?:over|above|more than)\s*\$?(\d+)/);
      if (overMatch && Number(r.total_amount) > parseFloat(overMatch[1])) return true;
      const haystack = `${r.store_name} ${r.store_category} ${dateStr}`.toLowerCase();
      return lower.split(/\s+/).every((word) => haystack.includes(word));
    });
    setResults(filtered); setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-28">
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-100 tracking-tight mb-1">Search Your Vault</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm">Find any receipt instantly</p>
      </div>

      <div className="px-6 mb-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"><Search className="w-5 h-5" /></div>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find my Costco receipt" autoFocus
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 font-medium text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center text-ink-500 hover:bg-ink-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterChips.map((chip) => (
            <button key={chip.label} className="shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 text-xs font-semibold hover:border-primary-400 hover:text-primary-600 transition-colors">
              <chip.icon className="w-3.5 h-3.5" />{chip.label}
            </button>
          ))}
        </div>
      </div>

      {!searched ? (
        <div className="px-6">
          <div className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-ink-800 rounded-2xl p-5 border border-primary-100 dark:border-primary-900/30 mb-6">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-primary-500" /><span className="text-sm font-bold text-primary-800 dark:text-primary-300">Try asking</span></div>
            <div className="space-y-2">
              {exampleQueries.map((ex) => (
                <button key={ex} onClick={() => setQuery(ex)} className="block w-full text-left text-sm text-ink-700 dark:text-ink-300 font-medium px-3 py-2.5 rounded-xl hover:bg-white dark:hover:bg-ink-700 transition-colors">"{ex}"</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900 dark:text-ink-100 mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearchChips.map((chip) => (
                <button key={chip} onClick={() => setQuery(chip)} className="px-4 h-9 rounded-full bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 text-sm font-medium hover:border-primary-400 hover:text-primary-600 transition-colors">{chip}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mx-auto mb-4"><Search className="w-7 h-7 text-ink-400" /></div>
              <p className="font-semibold text-ink-900 dark:text-ink-100 mb-1">Nothing found</p>
              <p className="text-ink-400 dark:text-ink-500 text-sm">Try searching for a store, product, or date.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-400 dark:text-ink-500 font-medium mb-3">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
              <div className="space-y-3">
                {results.map((receipt) => <SearchResultCard key={receipt.id} receipt={receipt} onClick={() => onReceiptClick(receipt)} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ receipt, onClick }: { receipt: Receipt; onClick: () => void }) {
  const icon = CATEGORY_ICONS[receipt.store_category] || CATEGORY_ICONS.Other;
  const color = CATEGORY_COLORS[receipt.store_category] || CATEGORY_COLORS.Other;
  return (
    <button onClick={onClick} className="w-full bg-white dark:bg-ink-800 rounded-2xl p-4 flex items-center gap-3 hover:shadow-card transition-all active:scale-[0.99] text-left border border-ink-100 dark:border-ink-700">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: `${color}15` }}>{icon}</div>
      <div className="flex-1 min-w-0 text-left"><p className="font-semibold text-ink-900 dark:text-ink-100 text-sm truncate">{receipt.store_name}</p><p className="text-ink-400 dark:text-ink-500 text-xs">{receipt.store_category} · {formatDate(receipt.receipt_date)}</p></div>
      <p className="font-bold text-ink-900 dark:text-ink-100 text-sm shrink-0">{formatCurrency(Number(receipt.total_amount))}</p>
    </button>
  );
}
