import React from 'react';
import { LayoutDashboard, ReceiptText, PlusCircle, CreditCard, Users2 } from 'lucide-react';
import { BottomNavTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  onOpenQuickAdd?: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  const tabs = [
    { id: 'dashboard' as BottomNavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as BottomNavTab, label: 'Ledger', icon: ReceiptText },
    { id: 'add' as BottomNavTab, label: 'Add', icon: PlusCircle, isPrimary: true },
    { id: 'accounts' as BottomNavTab, label: 'Accounts', icon: CreditCard },
    { id: 'group' as BottomNavTab, label: 'Group', icon: Users2 },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shrink-0 z-20 shadow-md">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isPrimary) {
          return (
            <button
              key={tab.id}
              onClick={() => (onOpenQuickAdd ? onOpenQuickAdd() : onTabChange('add'))}
              className="group relative -top-3 flex flex-col items-center focus:outline-none"
              title="Add Transaction"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-95">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1">Add</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <div
              className={`px-3 py-0.5 rounded-full transition-all ${
                isActive ? 'bg-indigo-100 dark:bg-indigo-950/60 font-semibold' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
