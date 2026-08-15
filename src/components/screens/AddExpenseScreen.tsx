import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Calendar,
  AlertCircle,
  IndianRupee,
  Sparkles,
  Percent,
  Sliders,
  Divide,
  Tag,
  Plus,
  X,
} from 'lucide-react';
import { Account, Category, ExpenseTransaction, Group, Member, SplitMethod, SplitShare } from '../../types';
import { formatCurrency } from '../../services/financeEngine';
import { CategoryIcon } from '../CategoryIcon';

interface AddExpenseScreenProps {
  currentGroup: Group;
  currentUser: Member;
  categories: Category[];
  accounts: Account[];
  existingExpense?: ExpenseTransaction | null;
  onSaveExpense: (expense: Omit<ExpenseTransaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onAddCategory?: (category: Omit<Category, 'id'>) => Category;
  onCancel: () => void;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  currentGroup,
  currentUser,
  categories,
  accounts,
  existingExpense,
  onSaveExpense,
  onAddCategory,
  onCancel,
}) => {
  const [amountStr, setAmountStr] = useState<string>(existingExpense ? existingExpense.amount.toString() : '');
  const [description, setDescription] = useState<string>(existingExpense ? existingExpense.description : '');
  const [categoryId, setCategoryId] = useState<string>(
    existingExpense ? existingExpense.categoryId : categories[0]?.id || 'cat_groceries'
  );
  const [paidByMemberId, setPaidByMemberId] = useState<string>(
    existingExpense ? existingExpense.paidByMemberId : currentUser.id
  );
  const [accountId, setAccountId] = useState<string>(existingExpense?.accountId || '');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(existingExpense ? existingExpense.splitMethod : 'EQUAL');
  const [date, setDate] = useState<string>(
    existingExpense ? existingExpense.date : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(existingExpense?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Add Category Modal State
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');

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
    'Sparkles',
    'Gift',
  ];

  const presetColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f97316'];

  const handleCreateQuickCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (onAddCategory) {
      const created = onAddCategory({
        name: newCatName.trim(),
        color: newCatColor,
        iconName: newCatIcon,
        isDefault: false,
        isActive: true,
      });
      if (created) {
        setCategoryId(created.id);
      }
    }

    setNewCatName('');
    setShowQuickCategoryModal(false);
  };

  // Custom split values
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>(() => {
    if (existingExpense && existingExpense.splitMethod === 'PERCENTAGE') {
      const map: Record<string, number> = {};
      existingExpense.splits.forEach((s) => (map[s.memberId] = s.percentage || 50));
      return map;
    }
    return {
      [currentGroup.members[0]?.id || 'mem_sen']: 50,
      [currentGroup.members[1]?.id || 'mem_wife']: 50,
    };
  });

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() => {
    if (existingExpense && existingExpense.splitMethod === 'AMOUNT') {
      const map: Record<string, string> = {};
      existingExpense.splits.forEach((s) => (map[s.memberId] = s.amount.toString()));
      return map;
    }
    return {
      [currentGroup.members[0]?.id || 'mem_sen']: '',
      [currentGroup.members[1]?.id || 'mem_wife']: '',
    };
  });

  // Filter accounts for currently selected payer
  const payerAccounts = accounts.filter((a) => a.ownerMemberId === paidByMemberId && a.isActive);

  // If payer changes and current account doesn't belong to payer, reset account
  useEffect(() => {
    if (accountId) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc && acc.ownerMemberId !== paidByMemberId) {
        setAccountId('');
      }
    }
  }, [paidByMemberId, accountId, accounts]);

  const numAmount = parseFloat(amountStr) || 0;

  // Compute splits dynamically based on method
  const computedSplits: SplitShare[] = currentGroup.members.map((member) => {
    if (splitMethod === 'EQUAL') {
      const share = Math.round((numAmount / currentGroup.members.length) * 100) / 100;
      return {
        memberId: member.id,
        amount: share,
        percentage: 50,
      };
    }
    if (splitMethod === 'PERCENTAGE') {
      const pct = customPercentages[member.id] || 0;
      const share = Math.round(((numAmount * pct) / 100) * 100) / 100;
      return {
        memberId: member.id,
        amount: share,
        percentage: pct,
      };
    }
    // AMOUNT
    const exact = parseFloat(customAmounts[member.id] || '0') || 0;
    return {
      memberId: member.id,
      amount: exact,
    };
  });

  // Validation
  const handleSave = () => {
    setErrorMessage(null);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter an expense description');
      return;
    }
    if (splitMethod === 'PERCENTAGE') {
      const totalPct = (Object.values(customPercentages) as number[]).reduce((a, b) => a + b, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        setErrorMessage(`Total percentages must sum to exactly 100% (currently ${totalPct}%)`);
        return;
      }
    }
    if (splitMethod === 'AMOUNT') {
      const totalCustom = (Object.values(customAmounts) as string[]).reduce((a, b) => a + (parseFloat(b) || 0), 0);
      if (Math.abs(totalCustom - numAmount) > 0.01) {
        setErrorMessage(
          `Sum of split amounts (${formatCurrency(totalCustom)}) must equal total expense (${formatCurrency(
            numAmount
          )})`
        );
        return;
      }
    }

    onSaveExpense(
      {
        groupId: currentGroup.id,
        type: 'EXPENSE',
        amount: numAmount,
        currency: currentGroup.currency,
        date,
        description: description.trim(),
        categoryId,
        paidByMemberId,
        accountId: accountId || undefined,
        splitMethod,
        splits: computedSplits,
        notes: notes.trim() || undefined,
        createdByMemberId: existingExpense?.createdByMemberId || currentUser.id,
      },
      existingExpense?.id
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
          {existingExpense ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      <div className="p-4 space-y-4 pb-12">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Big Amount Input Field (Material 3 style) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs text-center space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expense Amount</label>
          <div className="flex items-center justify-center space-x-1 text-3xl font-black text-slate-900 dark:text-slate-100">
            <span className="text-indigo-600">₹</span>
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0"
              autoFocus={!existingExpense}
              className="w-48 text-center bg-transparent border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600 py-1 font-mono font-black"
            />
          </div>
          <span className="text-[10px] text-slate-400 block">Currency: {currentGroup.currency} (INR)</span>
        </div>

        {/* Description & Date */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly Groceries, Petrol, Dinner..."
              className="mt-1 w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Memo / bill #"
                className="mt-1 w-full p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Selector Chips */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Category</label>
            <button
              type="button"
              onClick={() => setShowQuickCategoryModal(true)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2 rounded-2xl flex flex-col items-center justify-center text-center transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-2 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white mb-1 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] truncate max-w-full">{cat.name}</span>
                </button>
              );
            })}

            {/* Quick Add Custom Category Tile */}
            <button
              type="button"
              onClick={() => setShowQuickCategoryModal(true)}
              className="p-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700/80 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center text-center transition hover:bg-indigo-50"
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mb-1">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">+ Custom</span>
            </button>
          </div>
        </div>

        {/* Paid By Selection & Account Source (Section 8, 24, 25) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid By *</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {currentGroup.members.map((member) => {
                const isSelected = paidByMemberId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidByMemberId(member.id)}
                    className={`p-3 rounded-2xl flex items-center space-x-2.5 transition border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div className="text-left text-xs font-bold">{member.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Payment Account Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Payment Account (Optional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">None / Cash</option>
              {payerAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Method Engine (Section 9, 10, 11) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Split Method</label>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {splitMethod === 'EQUAL' ? '50 / 50 Split' : splitMethod === 'PERCENTAGE' ? '% Percentage' : 'Exact Amount'}
            </span>
          </div>

          {/* Split Mode Tabs */}
          <div className="flex bg-slate-200/70 dark:bg-slate-900 p-1 rounded-2xl text-xs font-semibold">
            {[
              { id: 'EQUAL' as SplitMethod, label: 'Equal (50/50)', icon: Divide },
              { id: 'PERCENTAGE' as SplitMethod, label: 'Percentage %', icon: Percent },
              { id: 'AMOUNT' as SplitMethod, label: 'Exact ₹', icon: Sliders },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = splitMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSplitMethod(m.id)}
                  className={`flex-1 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition text-center ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Split Breakdown based on method */}
          <div className="space-y-2 pt-1">
            {currentGroup.members.map((member) => {
              const isPayer = member.id === paidByMemberId;
              const calculatedShare = computedSplits.find((s) => s.memberId === member.id)?.amount || 0;

              return (
                <div
                  key={member.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {member.name} {isPayer ? '(Paid)' : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Calculated share: {formatCurrency(calculatedShare, currentGroup.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Right Input for % or Exact ₹ */}
                  {splitMethod === 'PERCENTAGE' && (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={customPercentages[member.id] ?? 50}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const otherMemberId = currentGroup.members.find((m) => m.id !== member.id)?.id;
                          if (otherMemberId) {
                            setCustomPercentages({
                              [member.id]: val,
                              [otherMemberId]: Math.max(0, 100 - val),
                            });
                          }
                        }}
                        className="w-14 p-1.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  )}

                  {splitMethod === 'AMOUNT' && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-indigo-600">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={customAmounts[member.id] ?? ''}
                        onChange={(e) =>
                          setCustomAmounts({
                            ...customAmounts,
                            [member.id]: e.target.value,
                          })
                        }
                        className="w-20 p-1.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {splitMethod === 'EQUAL' && (
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      50% ({formatCurrency(calculatedShare, currentGroup.currency)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Add Category Modal (from Add / Edit Transaction itself) */}
      {showQuickCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>New Expense Category</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Vacation, Fitness, Salon..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  className="mt-1 w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Icon</label>
                <div className="grid grid-cols-6 gap-2 mt-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewCatIcon(ic)}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        newCatIcon === ic
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
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                        newCatColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {newCatColor === c && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowQuickCategoryModal(false)}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
