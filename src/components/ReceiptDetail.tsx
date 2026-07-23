import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Share2, FileText, StickyNote, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Receipt, ReceiptItem, CATEGORY_ICONS, CATEGORY_COLORS, formatCurrency } from '../lib/types';

interface DetailProps {
  receipt: Receipt;
  onBack: () => void;
  onDeleted: () => void;
}

export function ReceiptDetail({ receipt, onBack, onDeleted }: DetailProps) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(receipt.is_favorite);
  const [note, setNote] = useState(receipt.notes || '');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const { data } = await supabase.from('receipt_items').select('*').eq('receipt_id', receipt.id).order('created_at', { ascending: true });
    if (data) setItems(data as ReceiptItem[]);
    setLoading(false);
  };

  const toggleFavorite = async () => {
    const newVal = !favorited; setFavorited(newVal);
    await supabase.from('receipts').update({ is_favorite: newVal }).eq('id', receipt.id);
  };

  const saveNote = async () => {
    await supabase.from('receipts').update({ notes: note }).eq('id', receipt.id);
    setShowNoteInput(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this receipt? This cannot be undone.')) return;
    await supabase.from('receipts').delete().eq('id', receipt.id);
    onDeleted();
  };

  const handleShare = async () => {
    const text = `${receipt.store_name} - ${formatCurrency(Number(receipt.total_amount))} on ${receipt.receipt_date}`;
    if (navigator.share) { try { await navigator.share({ text }); } catch {} }
    else navigator.clipboard?.writeText(text);
  };

  const icon = CATEGORY_ICONS[receipt.store_category] || CATEGORY_ICONS.Other;
  const color = CATEGORY_COLORS[receipt.store_category] || CATEGORY_COLORS.Other;
  const subtotal = Number(receipt.subtotal_amount) || 0;
  const tax = Number(receipt.tax_amount) || 0;
  const total = Number(receipt.total_amount) || 0;

  return (
    <div className="fixed inset-0 bg-ink-50 dark:bg-ink-950 z-50 overflow-y-auto safe-top safe-bottom">
      <div className="sticky top-0 glass border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <button onClick={toggleFavorite} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center hover:bg-ink-100 transition-colors">
          <Star className={`w-5 h-5 ${favorited ? 'fill-accent-400 text-accent-400' : 'text-ink-400'}`} />
        </button>
      </div>

      <div className="px-6 py-6 pb-32">
        {/* Store header */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 mb-4 border border-ink-100 dark:border-ink-700 shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${color}15` }}>{icon}</div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-ink-900 dark:text-ink-100">{receipt.store_name}</h2>
              <p className="text-ink-400 dark:text-ink-500 text-sm">{new Date(receipt.receipt_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ink-100 dark:border-ink-700">
            <div><p className="text-xs text-ink-400 font-medium mb-0.5">Total</p><p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(total)}</p></div>
            <div><p className="text-xs text-ink-400 font-medium mb-0.5">Items</p><p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{items.length || receipt.item_count}</p></div>
            <div><p className="text-xs text-ink-400 font-medium mb-0.5">Category</p><p className="text-sm font-bold text-ink-900 dark:text-ink-100 pt-1">{receipt.store_category}</p></div>
          </div>
        </div>

        {/* Receipt image */}
        {receipt.receipt_image_url && (
          <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden mb-4">
            <img src={receipt.receipt_image_url} alt="Receipt" className="w-full" />
          </div>
        )}

        {/* Items list */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-700"><h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Items</h3></div>
          {loading ? (
            <div className="px-5 py-8 text-center text-ink-400 text-sm">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="px-5 py-8 text-center text-ink-400 text-sm">No item details available</div>
          ) : (
            <div className="divide-y divide-ink-50 dark:divide-ink-700">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                  <div><p className="text-sm font-medium text-ink-800 dark:text-ink-200">{item.name}</p>{item.quantity > 1 && <p className="text-xs text-ink-400">Qty: {item.quantity}</p>}</div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(Number(item.price))}</p>
                </div>
              ))}
            </div>
          )}
          {/* Summary */}
          {(subtotal > 0 || tax > 0) && (
            <div className="px-5 py-3 border-t border-ink-100 dark:border-ink-700 space-y-1.5">
              {subtotal > 0 && <div className="flex justify-between text-sm"><span className="text-ink-500 dark:text-ink-400">Subtotal</span><span className="font-semibold text-ink-800 dark:text-ink-200">{formatCurrency(subtotal)}</span></div>}
              {tax > 0 && <div className="flex justify-between text-sm"><span className="text-ink-500 dark:text-ink-400">Tax</span><span className="font-semibold text-ink-800 dark:text-ink-200">{formatCurrency(tax)}</span></div>}
              <div className="flex justify-between text-sm pt-1.5 border-t border-ink-100 dark:border-ink-700"><span className="font-bold text-ink-900 dark:text-ink-100">Total</span><span className="font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(total)}</span></div>
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" /></div>
          <div><p className="text-sm text-primary-800 dark:text-primary-300 font-semibold mb-0.5">AI Insight</p><p className="text-sm text-primary-700 dark:text-primary-400">This purchase belongs to your {receipt.store_category.toLowerCase()} category.{total > 100 && ' This was a larger purchase — check if it has a warranty.'}</p></div>
        </div>

        {/* Note */}
        {showNoteInput ? (
          <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft p-4 mb-4">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." autoFocus rows={3}
              className="w-full bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" />
            <div className="flex gap-2 mt-2">
              <button onClick={saveNote} className="flex-1 h-10 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors">Save Note</button>
              <button onClick={() => setShowNoteInput(false)} className="h-10 px-4 rounded-xl bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 font-semibold text-sm hover:bg-ink-200 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          receipt.notes && (
            <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-soft p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><StickyNote className="w-4 h-4 text-ink-400" /><span className="text-xs font-semibold text-ink-500 dark:text-ink-400">Note</span></div>
              <p className="text-sm text-ink-800 dark:text-ink-200">{receipt.notes}</p>
            </div>
          )
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-ink-100 dark:border-ink-800 px-6 py-4 safe-bottom">
        <div className="grid grid-cols-4 gap-3">
          <ActionButton icon={Share2} label="Share" onClick={handleShare} />
          <ActionButton icon={FileText} label="Export" onClick={() => {}} />
          <ActionButton icon={StickyNote} label="Note" onClick={() => setShowNoteInput(true)} />
          <ActionButton icon={Trash2} label="Delete" onClick={handleDelete} danger />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'}`}>
      <Icon className="w-5 h-5" /><span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
