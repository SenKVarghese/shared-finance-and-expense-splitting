import React, { useState } from 'react';
import {
  Smartphone,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Play,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { Account, Category, Group, Member, Transaction } from '../types';
import { formatCurrency, getNetBalanceStatus } from '../services/financeEngine';
import { AndroidFrame } from './AndroidFrame';
import { AndroidTopBar } from './AndroidTopBar';
import { AndroidBottomNav } from './AndroidBottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { AccountsScreen } from './screens/AccountsScreen';
import { GroupMembersScreen } from './screens/GroupMembersScreen';

interface TwoDeviceSimulatorViewProps {
  currentGroup: Group;
  allGroups: Group[];
  allMembers: Member[];
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onAddPresetTransaction: (type: 'groceries' | 'fuel' | 'loan' | 'settlement') => void;
  onOpenAddExpenseForUser: (user: Member) => void;
  onSelectTransaction?: (tx: Transaction, user: Member) => void;
}

export const TwoDeviceSimulatorView: React.FC<TwoDeviceSimulatorViewProps> = ({
  currentGroup,
  allGroups,
  allMembers,
  transactions,
  categories,
  accounts,
  onAddPresetTransaction,
  onOpenAddExpenseForUser,
  onSelectTransaction,
}) => {
  const husbandMember = allMembers.find((m) => m.id === 'mem_husband') || allMembers[0];
  const wifeMember = allMembers.find((m) => m.id === 'mem_wife') || allMembers[1];

  const husbandNetBalance = getNetBalanceStatus(husbandMember.id, currentGroup, transactions);
  const wifeNetBalance = getNetBalanceStatus(wifeMember.id, currentGroup, transactions);

  const [husbandTab, setHusbandTab] = useState<any>('dashboard');
  const [wifeTab, setWifeTab] = useState<any>('dashboard');
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  const handleRunPreset = (type: 'groceries' | 'fuel' | 'loan' | 'settlement') => {
    setIsSimulatingSync(true);
    onAddPresetTransaction(type);
    setTimeout(() => setIsSimulatingSync(false), 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Simulation Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white rounded-3xl p-6 border border-indigo-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Two-Device Real-Time Sync Simulator</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Husband's Android Phone ⇄ Wife's Android Phone
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Experience the dual-device synchronization model. When Husband records a ₹1,000 grocery bill or Wife records fuel, both phones immediately update their mutual net balance in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                isSimulatingSync ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isSimulatingSync ? 'Syncing Packets...' : 'Connected & Synced'}</span>
            </span>
          </div>
        </div>

        {/* Quick Scenario Runner Buttons */}
        <div className="pt-2 border-t border-indigo-800/80 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Simulate Instant Live Actions
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleRunPreset('groceries')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold transition flex items-center space-x-1.5"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Husband Pays ₹1,000 Groceries (50/50)</span>
            </button>

            <button
              onClick={() => handleRunPreset('fuel')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold transition flex items-center space-x-1.5"
            >
              <Play className="w-3 h-3 text-amber-400" />
              <span>Wife Pays ₹2,000 Petrol (50/50)</span>
            </button>

            <button
              onClick={() => handleRunPreset('loan')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold transition flex items-center space-x-1.5"
            >
              <Play className="w-3 h-3 text-blue-400" />
              <span>Husband Gives Wife ₹5,000 Loan</span>
            </button>

            <button
              onClick={() => handleRunPreset('settlement')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Record ₹1,000 Settle Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Phones Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-items-center">
        {/* Device 1: Husband's Android Phone */}
        <div className="w-full max-w-[412px] space-y-2">
          <div className="flex items-center justify-between px-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Device A — Husband's Google Pixel 9</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {husbandNetBalance.status === 'OWED_TO_ME'
                ? `+${formatCurrency(husbandNetBalance.amount)} Receivable`
                : husbandNetBalance.status === 'I_OWE'
                ? `-${formatCurrency(husbandNetBalance.amount)} Payable`
                : 'Settled'}
            </span>
          </div>

          <AndroidFrame activeTab={husbandTab} onTabChange={setHusbandTab}>
            <AndroidTopBar
              currentGroup={currentGroup}
              allGroups={allGroups}
              onSelectGroup={() => {}}
              currentUser={husbandMember}
              allMembers={allMembers}
              onSwitchUser={() => {}}
            />

            <div className="flex-1 overflow-y-auto">
              {husbandTab === 'dashboard' && (
                <DashboardScreen
                  currentGroup={currentGroup}
                  currentUser={husbandMember}
                  transactions={transactions}
                  categories={categories}
                  onOpenAddExpense={() => onOpenAddExpenseForUser(husbandMember)}
                  onOpenAddTransfer={() => {}}
                  onOpenSettle={() => {}}
                  onSelectTransaction={(tx) => onSelectTransaction?.(tx, husbandMember)}
                  onNavigateToTransactions={() => setHusbandTab('transactions')}
                />
              )}
              {husbandTab === 'transactions' && (
                <TransactionsScreen
                  currentGroup={currentGroup}
                  currentUser={husbandMember}
                  transactions={transactions}
                  categories={categories}
                  accounts={accounts}
                  onSelectTransaction={(tx) => onSelectTransaction?.(tx, husbandMember)}
                  onOpenAddExpense={() => onOpenAddExpenseForUser(husbandMember)}
                />
              )}
              {husbandTab === 'accounts' && (
                <AccountsScreen
                  currentGroup={currentGroup}
                  currentUser={husbandMember}
                  accounts={accounts}
                  transactions={transactions}
                  onAddAccount={() => {}}
                  onToggleAccountStatus={() => {}}
                />
              )}
              {husbandTab === 'group' && (
                <GroupMembersScreen
                  currentGroup={currentGroup}
                  currentUser={husbandMember}
                  onOpenTwoDeviceSimulator={() => {}}
                />
              )}
            </div>

            <AndroidBottomNav activeTab={husbandTab} onTabChange={setHusbandTab} onOpenQuickAdd={() => onOpenAddExpenseForUser(husbandMember)} />
          </AndroidFrame>
        </div>

        {/* Device 2: Wife's Android Phone */}
        <div className="w-full max-w-[412px] space-y-2">
          <div className="flex items-center justify-between px-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
              <div className="w-3 h-3 rounded-full bg-pink-600" />
              <span>Device B — Wife's Samsung Galaxy S24</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {wifeNetBalance.status === 'OWED_TO_ME'
                ? `+${formatCurrency(wifeNetBalance.amount)} Receivable`
                : wifeNetBalance.status === 'I_OWE'
                ? `-${formatCurrency(wifeNetBalance.amount)} Payable`
                : 'Settled'}
            </span>
          </div>

          <AndroidFrame activeTab={wifeTab} onTabChange={setWifeTab}>
            <AndroidTopBar
              currentGroup={currentGroup}
              allGroups={allGroups}
              onSelectGroup={() => {}}
              currentUser={wifeMember}
              allMembers={allMembers}
              onSwitchUser={() => {}}
            />

            <div className="flex-1 overflow-y-auto">
              {wifeTab === 'dashboard' && (
                <DashboardScreen
                  currentGroup={currentGroup}
                  currentUser={wifeMember}
                  transactions={transactions}
                  categories={categories}
                  onOpenAddExpense={() => onOpenAddExpenseForUser(wifeMember)}
                  onOpenAddTransfer={() => {}}
                  onOpenSettle={() => {}}
                  onSelectTransaction={(tx) => onSelectTransaction?.(tx, wifeMember)}
                  onNavigateToTransactions={() => setWifeTab('transactions')}
                />
              )}
              {wifeTab === 'transactions' && (
                <TransactionsScreen
                  currentGroup={currentGroup}
                  currentUser={wifeMember}
                  transactions={transactions}
                  categories={categories}
                  accounts={accounts}
                  onSelectTransaction={(tx) => onSelectTransaction?.(tx, wifeMember)}
                  onOpenAddExpense={() => onOpenAddExpenseForUser(wifeMember)}
                />
              )}
              {wifeTab === 'accounts' && (
                <AccountsScreen
                  currentGroup={currentGroup}
                  currentUser={wifeMember}
                  accounts={accounts}
                  transactions={transactions}
                  onAddAccount={() => {}}
                  onToggleAccountStatus={() => {}}
                />
              )}
              {wifeTab === 'group' && (
                <GroupMembersScreen
                  currentGroup={currentGroup}
                  currentUser={wifeMember}
                  onOpenTwoDeviceSimulator={() => {}}
                />
              )}
            </div>

            <AndroidBottomNav activeTab={wifeTab} onTabChange={setWifeTab} onOpenQuickAdd={() => onOpenAddExpenseForUser(wifeMember)} />
          </AndroidFrame>
        </div>
      </div>
    </div>
  );
};
