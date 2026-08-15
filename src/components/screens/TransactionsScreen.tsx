import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  Plus,
  SlidersHorizontal,
  IndianRupee,
  X,
  Lock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Account, Category, Group, Member, Transaction, TransactionType } from '../../types';
import { formatCurrency } from '../../services/financeEngine';
import { CategoryIcon } from '../CategoryIcon';

interface TransactionsScreenProps {
  currentGroup: Group;
  currentUser: Member;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenAddExpense: () => void;
  initialCategoryFilter?: string;
  onClearInitialCategoryFilter?: () => void;
}

type FilterTab = 'ALL' | 'EXPENSES' | 'SETTLEMENTS' | 'TRANSFERS';
type SortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST';

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  currentGroup,
  currentUser,
  transactions,
  categories,
  accounts,
  onSelectTransaction,
  onOpenAddExpense,
  initialCategoryFilter,
  onClearInitialCategoryFilter,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryFilter || 'ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [showFilters, setShowFilters] = useState(false);

  // Group accounts map for fast lookup
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const memberMap = useMemo(() => new Map(currentGroup.members.map((m) => [m.id, m])), [currentGroup.members]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Tab filter
      if (filterTab === 'EXPENSES' && tx.type !== 'EXPENSE') return false;
      if (filterTab === 'SETTLEMENTS' && tx.type !== 'SETTLEMENT') return false;
      if (filterTab === 'TRANSFERS' && tx.type !== 'DIRECT_TRANSFER') return false;

      // Category filter
      if (selectedCategoryId !== 'ALL') {
        if (tx.type !== 'EXPENSE' || tx.categoryId !== selectedCategoryId) return false;
      }

      // Member filter
      if (selectedMemberId !== 'ALL') {
        if (tx.type === 'EXPENSE' && tx.paidByMemberId !== selectedMemberId) return false;
        if (tx.type === 'SETTLEMENT' && tx.fromMemberId !== selectedMemberId && tx.toMemberId !== selectedMemberId)
          return false;
        if (tx.type === 'DIRECT_TRANSFER' && tx.fromMemberId !== selectedMemberId && tx.toMemberId !== selectedMemberId)
          return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = tx.type === 'EXPENSE' ? tx.description.toLowerCase() : (tx as any).description?.toLowerCase() || '';
        const catName = tx.type === 'EXPENSE' ? categoryMap.get(tx.categoryId)?.name.toLowerCase() || '' : '';
        const accName = tx.accountId ? accountMap.get(tx.accountId)?.name.toLowerCase() || '' : '';
        if (!desc.includes(q) && !catName.includes(q) && !accName.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'NEWEST') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOption === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOption === 'HIGHEST') return b.amount - a.amount;
      if (sortOption === 'LOWEST') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, filterTab, selectedCategoryId, selectedMemberId, searchQuery, sortOption, categoryMap, accountMap]);

  // Group by date
  const dateGrouped = useMemo(() => {
    const groups: { dateLabel: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const list = map.get(tx.date) || [];
      list.push(tx);
      map.set(tx.date, list);
    });

    map.forEach((items, dateKey) => {
      let label = dateKey;
      if (dateKey === '2026-08-15') label = 'Today, 15 Aug';
      else if (dateKey === '2026-08-14') label = 'Yesterday, 14 Aug';
      else {
        const d = new Date(dateKey + 'T00:00:00Z');
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      groups.push({ dateLabel: label, items });
    });

    return groups;
  }, [filteredTransactions]);

  const totalFilteredAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Search & Filter Top Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, category, account..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-2xl border transition ${
            showFilters || selectedCategoryId !== 'ALL' || selectedMemberId !== 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title="Toggle Filter Panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Drawer / Expanded Options */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-700">
            <span>Filter & Sort Controls</span>
            <button
              onClick={() => {
                setSelectedCategoryId('ALL');
                setSelectedMemberId('ALL');
                setSortOption('NEWEST');
                if (onClearInitialCategoryFilter) onClearInitialCategoryFilter();
              }}
              className="text-[11px] text-indigo-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-1 w-full p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Payer / Member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-1 w-full p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="ALL">All Members</option>
                {currentGroup.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Sort Order</label>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {[
                { id: 'NEWEST' as SortOption, label: 'Newest' },
                { id: 'OLDEST' as SortOption, label: 'Oldest' },
                { id: 'HIGHEST' as SortOption, label: 'Highest' },
                { id: 'LOWEST' as SortOption, label: 'Lowest' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortOption(opt.id)}
                  className={`py-1 text-[11px] rounded-lg font-medium transition ${
                    sortOption === opt.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Type Segmented Filter Chips */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
        {[
          { id: 'ALL' as FilterTab, label: 'All' },
          { id: 'EXPENSES' as FilterTab, label: 'Expenses' },
          { id: 'SETTLEMENTS' as FilterTab, label: 'Settlements' },
          { id: 'TRANSFERS' as FilterTab, label: 'Transfers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`flex-1 py-1.5 rounded-xl transition text-center ${
              filterTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Total Rollup for Current View */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing {filteredTransactions.length} entries ({filterTab.toLowerCase()})
        </span>
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Sum: {formatCurrency(totalFilteredAmount, currentGroup.currency)}
        </span>
      </div>

      {/* Date-Grouped Transaction List */}
      {dateGrouped.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Transactions Found</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try adjusting your search query, filter tabs, or add a new expense.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGrouped.map((group) => (
            <div key={group.dateLabel} className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                {group.dateLabel}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'EXPENSE';
                  const isSettlement = tx.type === 'SETTLEMENT';
                  const isTransfer = tx.type === 'DIRECT_TRANSFER';

                  const category = isExpense ? categoryMap.get(tx.categoryId) : undefined;
                  const account = tx.accountId ? accountMap.get(tx.accountId) : undefined;
                  const payer = memberMap.get(isExpense ? tx.paidByMemberId : tx.fromMemberId);
                  const receiver = isSettlement || isTransfer ? memberMap.get(tx.toMemberId) : undefined;

                  // Compute who owes what on this transaction
                  let splitDesc = '';
                  if (isExpense) {
                    const otherSplit = tx.splits.find((s) => s.memberId !== tx.paidByMemberId);
                    if (otherSplit && otherSplit.amount > 0) {
                      const otherMember = memberMap.get(otherSplit.memberId);
                      splitDesc = `${otherMember?.name} owes ${formatCurrency(otherSplit.amount, tx.currency)}`;
                    } else {
                      splitDesc = 'Single payer / 100%';
                    }
                  } else if (isSettlement) {
                    splitDesc = `${payer?.name} paid ${receiver?.name}`;
                  } else if (isTransfer) {
                    splitDesc = `${receiver?.name} owes ${payer?.name} ${formatCurrency(tx.amount, tx.currency)}`;
                  }

                  const creatorId =
                    tx.createdByMemberId ||
                    (isExpense ? tx.paidByMemberId : tx.fromMemberId);
                  const creator = memberMap.get(creatorId);
                  const isCreatedByMe = creatorId === currentUser.id;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                          style={{
                            backgroundColor: isExpense
                              ? category?.color || '#6366f1'
                              : isSettlement
                              ? '#10b981'
                              : '#3b82f6',
                          }}
                        >
                          {isExpense ? (
                            <CategoryIcon iconName={category?.iconName || 'Tag'} className="w-5 h-5" />
                          ) : isSettlement ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <ArrowRightLeft className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 truncate">
                            <span className="truncate">
                              {isExpense
                                ? tx.description
                                : isSettlement
                                ? 'Settlement Payback'
                                : tx.description || 'Direct Loan / Transfer'}
                            </span>
                            {!isCreatedByMe && (
                              <span
                                title={`Created by ${creator?.name} (Only ${creator?.name} can delete)`}
                                className="shrink-0 text-slate-400 dark:text-slate-500"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1 mt-0.5">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Paid by {payer?.name}
                            </span>
                            {account && (
                              <>
                                <span>•</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-600 dark:text-slate-300">
                                  {account.name}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="text-[9px] text-slate-400">
                              By {creator?.name} {isCreatedByMe ? '(You)' : ''}
                            </span>
                          </div>

                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            {splitDesc}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div
                          className={`text-sm font-black ${
                            isSettlement ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {formatCurrency(tx.amount, tx.currency)}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          {isExpense ? `${tx.splitMethod} split` : tx.type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
