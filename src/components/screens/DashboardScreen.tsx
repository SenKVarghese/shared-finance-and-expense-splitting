import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ArrowRightLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  PieChart,
  Users,
  Layers,
  IndianRupee,
} from 'lucide-react';
import {
  Category,
  DashboardTab,
  Group,
  Member,
  NetBalance,
  PersonSummary,
  TimeRange,
  Transaction,
} from '../../types';
import {
  calculateCategoryBreakdown,
  calculateGroupFinancials,
  filterTransactionsByDate,
  formatCurrency,
  getNetBalanceStatus,
} from '../../services/financeEngine';
import { CategoryIcon } from '../CategoryIcon';

interface DashboardScreenProps {
  currentGroup: Group;
  currentUser: Member;
  transactions: Transaction[];
  categories: Category[];
  onOpenAddExpense: () => void;
  onOpenAddTransfer: () => void;
  onOpenSettle: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToTransactions: (filterCategoryId?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentGroup,
  currentUser,
  transactions,
  categories,
  onOpenAddExpense,
  onOpenAddTransfer,
  onOpenSettle,
  onSelectTransaction,
  onNavigateToTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('THIS_MONTH');

  // Filter transactions according to time range
  const filteredTransactions = filterTransactionsByDate(transactions, timeRange);
  const financials = calculateGroupFinancials(currentGroup, filteredTransactions);
  const netBalance = getNetBalanceStatus(currentUser.id, currentGroup, transactions); // All-time net obligation
  const categoryBreakdown = calculateCategoryBreakdown(categories, filteredTransactions, currentGroup.members);

  const otherMember = currentGroup.members.find((m) => m.id !== currentUser.id) || currentGroup.members[1];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Time Period Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {[
          { id: 'THIS_MONTH' as TimeRange, label: 'August 2026' },
          { id: 'LAST_MONTH' as TimeRange, label: 'July 2026' },
          { id: 'THIS_YEAR' as TimeRange, label: 'This Year' },
          { id: 'ALL_TIME' as TimeRange, label: 'All History' },
        ].map((period) => (
          <button
            key={period.id}
            onClick={() => setTimeRange(period.id)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              timeRange === period.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Primary Net Balance Card (Android Material 3 Elevated Banner) */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 border transition-all ${
          netBalance.status === 'OWED_TO_ME'
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-300 dark:border-emerald-800/60'
            : netBalance.status === 'I_OWE'
            ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-orange-500/10 border-rose-300 dark:border-rose-800/60'
            : 'bg-gradient-to-br from-indigo-500/10 via-slate-500/5 to-blue-500/10 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Current Net Balance</span>
            </div>

            <div className="mt-2 flex items-baseline space-x-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {netBalance.status === 'SETTLED'
                  ? 'All Settled Up'
                  : formatCurrency(netBalance.amount, currentGroup.currency)}
              </h2>
              {netBalance.status !== 'SETTLED' && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    netBalance.status === 'OWED_TO_ME'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {netBalance.status === 'OWED_TO_ME' ? `+ Receivable` : `- Payable`}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              {netBalance.status === 'SETTLED'
                ? `Neither you nor ${otherMember?.name || 'Partner'} owe anything.`
                : netBalance.displayText}
            </p>
          </div>

          {netBalance.status !== 'SETTLED' && (
            <button
              onClick={onOpenSettle}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1 transition"
            >
              <span>Settle Up</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick helper note explaining netting model */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Net calculation includes expenses, direct loans & settlements</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rule FR-020</span>
        </div>
      </div>

      {/* Quick Action Bar (Add Expense, Direct Transfer, Settle) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-400 transition group active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">+ Expense</span>
        </button>

        <button
          onClick={onOpenAddTransfer}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-400 transition group active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Transfer / Loan</span>
        </button>

        <button
          onClick={onOpenSettle}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-emerald-400 transition group active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Settle Balance</span>
        </button>
      </div>

      {/* Dashboard Sub-Tabs (Overview | People | Categories | Trends) */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
        {[
          { id: 'overview' as DashboardTab, label: 'Overview', icon: Layers },
          { id: 'people' as DashboardTab, label: 'People', icon: Users },
          { id: 'categories' as DashboardTab, label: 'Categories', icon: PieChart },
          { id: 'trends' as DashboardTab, label: 'Trends', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Total Group Expenses Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Total Group Expenses</span>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-mono">
                {financials.expenseCount} records
              </span>
            </div>

            <div className="mt-2">
              <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(financials.totalExpenses, currentGroup.currency)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Shared living spending for the selected period</p>
            </div>

            {/* Individual Contributions Comparison Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span>
                    {currentGroup.members[0]?.name}:{' '}
                    {formatCurrency(financials.memberSummaries[0]?.totalPaid || 0, currentGroup.currency)}
                  </span>
                </span>
                <span className="text-pink-600 dark:text-pink-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-pink-600 inline-block" />
                  <span>
                    {currentGroup.members[1]?.name}:{' '}
                    {formatCurrency(financials.memberSummaries[1]?.totalPaid || 0, currentGroup.currency)}
                  </span>
                </span>
              </div>

              {/* Proportional Progress Bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${
                      financials.totalExpenses > 0
                        ? ((financials.memberSummaries[0]?.totalPaid || 0) / financials.totalExpenses) * 100
                        : 50
                    }%`,
                  }}
                  className="bg-blue-600 h-full transition-all duration-500"
                />
                <div
                  style={{
                    width: `${
                      financials.totalExpenses > 0
                        ? ((financials.memberSummaries[1]?.totalPaid || 0) / financials.totalExpenses) * 100
                        : 50
                    }%`,
                  }}
                  className="bg-pink-600 h-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Top Spending Categories Quick Peek */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Top Categories</h3>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center hover:underline"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {categoryBreakdown.slice(0, 3).map((item) => (
                <div key={item.category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: item.category.color }}
                    >
                      <CategoryIcon iconName={item.category.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.category.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.transactionCount} transactions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalAmount, currentGroup.currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {Math.round((item.totalAmount / (financials.totalExpenses || 1)) * 100)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Recent Activity</h3>
              <button
                onClick={() => onNavigateToTransactions()}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center hover:underline"
              >
                <span>All ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentTransactions.map((tx) => {
                const isExpense = tx.type === 'EXPENSE';
                const isSettlement = tx.type === 'SETTLEMENT';
                const isTransfer = tx.type === 'DIRECT_TRANSFER';
                const payer = currentGroup.members.find(
                  (m) => m.id === (isExpense ? tx.paidByMemberId : tx.fromMemberId)
                );

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl px-2 transition -mx-2"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSettlement
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : isTransfer
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {isSettlement ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isTransfer ? (
                          <ArrowRightLeft className="w-4 h-4" />
                        ) : (
                          <IndianRupee className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {isExpense
                            ? tx.description
                            : isSettlement
                            ? 'Settlement Payment'
                            : tx.description || 'Direct Loan / Transfer'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>Paid by {payer?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          isSettlement ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {formatCurrency(tx.amount, currentGroup.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {isExpense ? `${tx.splitMethod}` : tx.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: PEOPLE VIEW (Section 6.2) */}
      {activeTab === 'people' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Person-wise spending, fair shares, and net debtor/creditor ledger</span>
          </div>

          {financials.memberSummaries.map((summary) => (
            <div
              key={summary.member.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs text-sm"
                    style={{ backgroundColor: summary.member.color }}
                  >
                    {summary.member.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {summary.member.name} {summary.member.id === currentUser.id ? '(You)' : ''}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">{summary.member.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Position</div>
                  <div
                    className={`text-sm font-black ${
                      summary.netPosition > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : summary.netPosition < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {summary.netPosition > 0
                      ? `+${formatCurrency(summary.netPosition, currentGroup.currency)}`
                      : summary.netPosition < 0
                      ? `-${formatCurrency(Math.abs(summary.netPosition), currentGroup.currency)}`
                      : 'Settled'}
                  </div>
                </div>
              </div>

              {/* Financial Matrix for this person */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Paid Out</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatCurrency(summary.totalPaid, currentGroup.currency)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Personal Share</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatCurrency(summary.personalShare, currentGroup.currency)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Transfers Given</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatCurrency(summary.transfersSent, currentGroup.currency)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Settlements Cleared</span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(summary.settlementsPaid, currentGroup.currency)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: CATEGORIES VIEW (Section 6.3 & 27) */}
      {activeTab === 'categories' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Category Spending Breakdown</span>
            <span>Total: {formatCurrency(financials.totalExpenses, currentGroup.currency)}</span>
          </div>

          {categoryBreakdown.map((item) => {
            const pct = Math.round((item.totalAmount / (financials.totalExpenses || 1)) * 100);
            const senPaid = item.memberPayments['mem_sen'] || 0;
            const wifePaid = item.memberPayments['mem_wife'] || 0;

            return (
              <div
                key={item.category.id}
                onClick={() => onNavigateToTransactions(item.category.id)}
                className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs cursor-pointer hover:border-indigo-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: item.category.color }}
                    >
                      <CategoryIcon iconName={item.category.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                        <span>{item.category.name}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.transactionCount} transactions · {pct}% of group spend
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalAmount, currentGroup.currency)}
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-end">
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.category.color,
                    }}
                  />
                </div>

                {/* Payer breakdown (Sen paid vs Wife paid) */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Sen paid: {formatCurrency(senPaid, currentGroup.currency)}</span>
                  <span>Wife paid: {formatCurrency(wifePaid, currentGroup.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 4: TRENDS / TIME VIEW (Section 6.4) */}
      {activeTab === 'trends' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Monthly Spending Trajectory</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                +11.2% vs July
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between pt-6 px-2 gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              {[
                { month: 'Apr', amount: 28400, height: '50%' },
                { month: 'May', amount: 34100, height: '62%' },
                { month: 'Jun', amount: 31200, height: '56%' },
                { month: 'Jul', amount: 38200, height: '78%' },
                { month: 'Aug', amount: 42500, height: '90%', active: true },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center group">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                    ₹{(bar.amount / 1000).toFixed(1)}k
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl h-32 flex items-end p-1">
                    <div
                      style={{ height: bar.height }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        bar.active ? 'bg-indigo-600 dark:bg-indigo-500 shadow-md shadow-indigo-500/30' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] mt-1.5 font-bold ${bar.active ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-400">Daily Average Spend</span>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">₹2,833 / day</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-400">Projected Month End</span>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">₹54,000</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
