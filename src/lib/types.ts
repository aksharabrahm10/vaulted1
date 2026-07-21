export interface ReceiptItem {
  id?: string;
  receipt_id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  user_id: string;
  store_name: string;
  store_category: string;
  receipt_date: string;
  total_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  item_count: number;
  receipt_image_url: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  receipt_items?: ReceiptItem[];
}

export interface ExtractedReceipt {
  store_name: string;
  store_category: string;
  receipt_date: string;
  total_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  item_count: number;
  items: ReceiptItem[];
}

export const CATEGORY_ICONS: Record<string, string> = {
  Grocery: '🛒',
  Electronics: '📦',
  Clothing: '👕',
  Coffee: '☕',
  Restaurant: '🍽',
  Gas: '⛽',
  Pharmacy: '💊',
  Home: '🏠',
  Sporting: '⚽',
  Books: '📚',
  Other: '🧾',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Grocery: '#0d9488',
  Electronics: '#6366f1',
  Clothing: '#ec4899',
  Coffee: '#a16207',
  Restaurant: '#f97316',
  Gas: '#3b82f6',
  Pharmacy: '#10b981',
  Home: '#8b5cf6',
  Sporting: '#f43f5e',
  Books: '#0891b2',
  Other: '#64748b',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
