import { Home, Camera, Search, BarChart3, User } from 'lucide-react';

export type Tab = 'home' | 'scan' | 'search' | 'insights' | 'profile';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onScan: () => void;
}

const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'scan', icon: Camera, label: 'Scan' },
  { id: 'insights', icon: BarChart3, label: 'Insights' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ active, onChange, onScan }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-ink-100 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const isScan = tab.id === 'scan';

          if (isScan) {
            return (
              <button
                key={tab.id}
                onClick={onScan}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 active:scale-90 transition-transform -mt-4">
                  <tab.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-primary-600">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 active:scale-95 transition-transform"
            >
              <tab.icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-ink-400'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-primary-600' : 'text-ink-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
