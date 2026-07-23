import { useState } from 'react';
import { Check, Edit3, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ExtractedReceipt, ReceiptItem, CATEGORY_ICONS, CATEGORY_COLORS, formatCurrency } from '../lib/types';

interface ConfirmProps {
  receipt: ExtractedReceipt;
  imageBase64: string;
  onDone: () => void;
}

export function ConfirmReceipt({ receipt, imageBase64, onDone }: ConfirmProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState(receipt.store_name);
  const [category, setCategory] = useState(receipt.store_category);
  const [date, setDate] = useState(receipt.receipt_date);
  const [total] = useState(receipt.total_amount);
  const [items, setItems] = useState<ReceiptItem[]>(receipt.items);

  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      let imageUrl: string | null = null;
      try {
        const fileName = `receipt-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('receipts').upload(fileName, dataURItoBlob(imageBase64), { contentType: 'image/jpeg' });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      } catch { /* Image upload is optional */ }

      const { data: receiptData, error: receiptError } = await supabase.from('receipts').insert({
        store_name: storeName, store_category: category, receipt_date: date,
        total_amount: total, subtotal_amount: receipt.subtotal_amount, tax_amount: receipt.tax_amount,
        item_count: items.length, receipt_image_url: imageUrl,
      }).select('id').single();
      if (receiptError) throw receiptError;

      if (receiptData && items.length > 0) {
        const { error: itemsError } = await supabase.from('receipt_items').insert(items.map((item) => ({ receipt_id: receiptData.id, name: item.name, quantity: item.quantity, price: item.price })));
        if (itemsError) throw itemsError;
      }
      onDone();
    } catch (err: any) { setError(err.message || 'Failed to save receipt'); }
    finally { setSaving(false); }
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'price') (newItems[index] as any)[field] = parseFloat(value) || 0;
    else (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="fixed inset-0 bg-ink-50 dark:bg-ink-950 z-50 overflow-y-auto safe-top safe-bottom">
      <div className="sticky top-0 glass border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center justify-between z-10">
        <button onClick={onDone} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-100 transition-colors"><X className="w-5 h-5" /></button>
        <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm">{editing ? 'Edit Receipt' : 'Receipt Found'}</p>
        <button onClick={() => setEditing(!editing)} className="w-10 h-10 rounded-xl bg-white dark:bg-ink-800 shadow-soft flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 transition-colors">{editing ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}</button>
      </div>

      <div className="px-6 py-6 pb-32">
        {/* Store card */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 mb-4 border border-ink-100 dark:border-ink-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15` }}>{icon}</div>
            <div className="flex-1">
              {editing ? (
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="text-lg font-bold text-ink-900 dark:text-ink-100 bg-ink-50 dark:bg-ink-700 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              ) : (<h2 className="text-lg font-bold text-ink-900 dark:text-ink-100">{storeName}</h2>)}
              <p className="text-ink-400 dark:text-ink-500 text-sm">{items.length} items</p>
            </div>
            <p className="text-2xl font-extrabold text-ink-900 dark:text-ink-100">{formatCurrency(total)}</p>
          </div>
          {editing && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-medium text-ink-400 mb-1 block">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 rounded-xl bg-ink-50 dark:bg-ink-700 px-3 text-sm font-medium text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  {Object.keys(CATEGORY_ICONS).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select></div>
              <div><label className="text-xs font-medium text-ink-400 mb-1 block">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-xl bg-ink-50 dark:bg-ink-700 px-3 text-sm font-medium text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
            </div>
          )}
          {!editing && (
            <div className="flex items-center gap-4 text-sm text-ink-500 dark:text-ink-400 pt-2 border-t border-ink-100 dark:border-ink-700">
              <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span><span className="text-ink-300 dark:text-ink-600">·</span><span>{category}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-700"><h3 className="font-semibold text-ink-900 dark:text-ink-100 text-sm">Items</h3></div>
          <div className="divide-y divide-ink-50 dark:divide-ink-700">
            {items.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                {editing ? (<>
                  <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} placeholder="Item name" className="flex-1 bg-ink-50 dark:bg-ink-700 rounded-lg px-3 py-2 text-sm font-medium text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className="w-20 bg-ink-50 dark:bg-ink-700 rounded-lg px-3 py-2 text-sm font-semibold text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </>) : (<>
                  <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-200">{item.name}</span>
                  {item.quantity > 1 && <span className="text-xs text-ink-400">x{item.quantity}</span>}
                  <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(item.price)}</span>
                </>)}
              </div>
            ))}
          </div>
          {editing && (
            <button onClick={addItem} className="w-full px-5 py-3 flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Plus className="w-4 h-4" />Add Item</button>
          )}
        </div>

        {/* AI insight */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0"><span className="text-sm">✨</span></div>
          <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">This purchase belongs to your {category.toLowerCase()} category.</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl mb-4">{error}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-ink-100 dark:border-ink-800 px-6 py-4 safe-bottom">
        <button onClick={handleSave} disabled={saving}
          className="w-full h-14 rounded-2xl bg-primary-600 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}{saving ? 'Saving...' : 'Save Receipt'}
        </button>
      </div>
    </div>
  );
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/jpeg' });
}
