import React, { useState } from 'react';
import { Plus, Tag, Check, Sparkles } from 'lucide-react';
import { Category, Group, Transaction } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { formatCurrency } from '../../services/financeEngine';

interface CategoriesScreenProps {
  currentGroup: Group;
  categories: Category[];
  transactions: Transaction[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onToggleCategoryStatus: (categoryId: string) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  currentGroup,
  categories,
  transactions,
  onAddCategory,
  onToggleCategoryStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [iconName, setIconName] = useState('Tag');

  // Compute spend per category
  const categorySpendMap = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.type === 'EXPENSE') {
      categorySpendMap.set(t.categoryId, (categorySpendMap.get(t.categoryId) || 0) + t.amount);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      color,
      iconName,
      isDefault: false,
      isActive: true,
    });

    setName('');
    setShowAddModal(false);
  };

  const availableIcons = [
    'ShoppingBag',
    'Fuel',
    'Utensils',
    'Shirt',
    'Home',
    'Zap',
    'Plane',
    'Film',
    'HeartPulse',
    'PawPrint',
    'Tag',
  ];

  const presetColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f97316'];

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Expense Categories</h2>
          <p className="text-xs text-slate-500">Default and custom household categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const spend = categorySpendMap.get(cat.id) || 0;
          return (
            <div
              key={cat.id}
              className={`p-3.5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3 transition hover:border-indigo-400 ${
                !cat.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                </div>
                {!cat.isDefault && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                    Custom
                  </span>
                )}
              </div>

              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{cat.name}</div>
                <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-0.5">
                  {formatCurrency(spend, currentGroup.currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Custom Category</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Vacation, Fitness..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2 mt-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        iconName === ic
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CategoryIcon iconName={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Accent Color</label>
                <div className="flex space-x-2 mt-1.5">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                        color === c ? 'ring-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
