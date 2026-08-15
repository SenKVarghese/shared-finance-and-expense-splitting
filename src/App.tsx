import React, { useState } from 'react';
import {
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Plus,
  RefreshCw,
  Info,
  CheckCircle2,
  ListOrdered,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import {
  Account,
  BottomNavTab,
  Category,
  DirectTransferTransaction,
  ExpenseTransaction,
  Group,
  Member,
  SettlementTransaction,
  Transaction,
} from './types';
import {
  DEFAULT_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_GROUPS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
} from './mockData';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { AddExpenseScreen } from './components/screens/AddExpenseScreen';
import { AddTransferScreen } from './components/screens/AddTransferScreen';
import { SettleScreen } from './components/screens/SettleScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { CategoriesScreen } from './components/screens/CategoriesScreen';
import { GroupMembersScreen } from './components/screens/GroupMembersScreen';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { AndroidGalleryView } from './components/AndroidGalleryView';
import { TwoDeviceSimulatorView } from './components/TwoDeviceSimulatorView';
import { TestSuiteScreen } from './components/screens/TestSuiteScreen';

type AppViewMode = 'PHONE_APP' | 'SCREEN_GALLERY' | 'DUAL_DEVICE_SYNC' | 'TEST_SUITE';
type SubScreenMode = 'NONE' | 'ADD_EXPENSE' | 'EDIT_EXPENSE' | 'ADD_TRANSFER' | 'SETTLE';

export default function App() {
  // Global Data State
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [currentGroup, setCurrentGroup] = useState<Group>(INITIAL_GROUPS[0]);
  const [members] = useState<Member[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<Member>(INITIAL_MEMBERS[0]); // Default: Sen
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<AppViewMode>('PHONE_APP');
  const [bottomNavTab, setBottomNavTab] = useState<BottomNavTab>('dashboard');
  const [subScreenMode, setSubScreenMode] = useState<SubScreenMode>('NONE');
  const [activeEditingTx, setActiveEditingTx] = useState<ExpenseTransaction | null>(null);
  const [activeEditingTransfer, setActiveEditingTransfer] = useState<DirectTransferTransaction | null>(null);
  const [activeEditingSettlement, setActiveEditingSettlement] = useState<SettlementTransaction | null>(null);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group-specific transactions
  const groupTransactions = transactions.filter((t) => t.groupId === currentGroup.id);
  const groupAccounts = accounts.filter((a) => a.groupId === currentGroup.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Transaction Handlers
  const handleSaveExpense = (
    expenseDraft: Omit<ExpenseTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...expenseDraft, id: existingId, createdAt: t.createdAt } : t))
      );
      showToast('Expense updated & net balances recalculated');
    } else {
      const newTx: ExpenseTransaction = {
        ...expenseDraft,
        id: `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdByMemberId: currentUser.id,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Added ₹${expenseDraft.amount} expense paid by ${currentUser.name}`);
    }
    setSubScreenMode('NONE');
    setActiveEditingTx(null);
  };

  const handleSaveTransfer = (
    transferDraft: Omit<DirectTransferTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...transferDraft, id: existingId, createdAt: t.createdAt } : t))
      );
      showToast('Transfer updated & net balance recalculated');
    } else {
      const newTx: DirectTransferTransaction = {
        ...transferDraft,
        id: `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdByMemberId: currentUser.id,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Recorded direct transfer of ₹${transferDraft.amount}`);
    }
    setSubScreenMode('NONE');
    setActiveEditingTransfer(null);
  };

  const handleConfirmSettlement = (
    settlementDraft: Omit<SettlementTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...settlementDraft, id: existingId, createdAt: t.createdAt } : t))
      );
      showToast('Settlement record updated & balance refreshed');
    } else {
      const newTx: SettlementTransaction = {
        ...settlementDraft,
        id: `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdByMemberId: currentUser.id,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Settled ₹${settlementDraft.amount}! Balance updated`);
    }
    setSubScreenMode('NONE');
    setActiveEditingSettlement(null);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setSelectedTxForDetail(null);
    if (tx.type === 'EXPENSE') {
      setActiveEditingTx(tx as ExpenseTransaction);
      setActiveEditingTransfer(null);
      setActiveEditingSettlement(null);
      setSubScreenMode('ADD_EXPENSE');
    } else if (tx.type === 'DIRECT_TRANSFER') {
      setActiveEditingTransfer(tx as DirectTransferTransaction);
      setActiveEditingTx(null);
      setActiveEditingSettlement(null);
      setSubScreenMode('ADD_TRANSFER');
    } else if (tx.type === 'SETTLEMENT') {
      setActiveEditingSettlement(tx as SettlementTransaction);
      setActiveEditingTx(null);
      setActiveEditingTransfer(null);
      setSubScreenMode('SETTLE');
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    // Strict Ownership Enforcement: Only creator can delete
    const creatorId =
      tx.createdByMemberId ||
      (tx.type === 'EXPENSE' ? tx.paidByMemberId : tx.fromMemberId);

    if (creatorId !== currentUser.id) {
      const creator = members.find((m) => m.id === creatorId);
      showToast(
        `Permission Denied: Only ${creator?.name || 'the creator'} can delete this transaction.`
      );
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    showToast('Transaction deleted & balance recalculated');
    setSelectedTxForDetail(null);
  };

  const handleAddAccount = (accDraft: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accDraft,
      id: `acc_${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Account "${newAcc.name}" created`);
  };

  const handleToggleAccountStatus = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleAddCategory = (catDraft: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catDraft,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" added`);
    return newCat;
  };

  const handleToggleCategoryStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Preset quick simulator actions
  const handleAddPresetTransaction = (type: 'groceries' | 'fuel' | 'loan' | 'settlement') => {
    const dateStr = '2026-08-15';
    if (type === 'groceries') {
      const tx: ExpenseTransaction = {
        id: `tx_${Date.now()}`,
        groupId: currentGroup.id,
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: dateStr,
        createdAt: new Date().toISOString(),
        createdByMemberId: 'mem_husband',
        description: 'Organic Groceries (50/50)',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        accountId: 'acc_husband_hdfc_cc',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500, percentage: 50 },
          { memberId: 'mem_wife', amount: 500, percentage: 50 },
        ],
      };
      setTransactions((prev) => [tx, ...prev]);
      showToast('Husband recorded ₹1,000 Groceries (Wife owes ₹500)');
    } else if (type === 'fuel') {
      const tx: ExpenseTransaction = {
        id: `tx_${Date.now()}`,
        groupId: currentGroup.id,
        type: 'EXPENSE',
        amount: 2000,
        currency: 'INR',
        date: dateStr,
        createdAt: new Date().toISOString(),
        createdByMemberId: 'mem_wife',
        description: 'Full Tank Petrol (50/50)',
        categoryId: 'cat_fuel',
        paidByMemberId: 'mem_wife',
        accountId: 'acc_wife_icici',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 1000, percentage: 50 },
          { memberId: 'mem_wife', amount: 1000, percentage: 50 },
        ],
      };
      setTransactions((prev) => [tx, ...prev]);
      showToast('Wife recorded ₹2,000 Fuel (Husband owes ₹1,000)');
    } else if (type === 'loan') {
      const tx: DirectTransferTransaction = {
        id: `tx_${Date.now()}`,
        groupId: currentGroup.id,
        type: 'DIRECT_TRANSFER',
        amount: 5000,
        currency: 'INR',
        date: dateStr,
        createdAt: new Date().toISOString(),
        createdByMemberId: 'mem_husband',
        description: 'Cash advance loan',
        fromMemberId: 'mem_husband',
        toMemberId: 'mem_wife',
        accountId: 'acc_husband_sbi_savings',
      };
      setTransactions((prev) => [tx, ...prev]);
      showToast('Husband gave Wife ₹5,000 Direct Loan');
    } else if (type === 'settlement') {
      const tx: SettlementTransaction = {
        id: `tx_${Date.now()}`,
        groupId: currentGroup.id,
        type: 'SETTLEMENT',
        amount: 1000,
        currency: 'INR',
        date: dateStr,
        createdAt: new Date().toISOString(),
        createdByMemberId: 'mem_wife',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
        accountId: 'acc_wife_upi',
        notes: 'GPay UPI settlement payment',
      };
      setTransactions((prev) => [tx, ...prev]);
      showToast('Wife transferred ₹1,000 settlement to Husband');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Top Header & View Mode Switcher */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
              ₹
            </div>
            <div>
              <div className="font-black text-sm text-slate-900 dark:text-slate-100 leading-tight">
                Shared Finance & Expense Splitting
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Two-person Netting Engine · MVP Spec 1.0 · Android Blueprint
              </div>
            </div>
          </div>

          {/* Three View Modes: Mobile Phone / Screen Blueprint Specs / Dual Sync */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                setViewMode('PHONE_APP');
                setSubScreenMode('NONE');
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'PHONE_APP'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Mobile Preview</span>
            </button>

            <button
              onClick={() => setViewMode('SCREEN_GALLERY')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'SCREEN_GALLERY'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Android Screen Samples & Specs (19)</span>
            </button>

            <button
              onClick={() => setViewMode('DUAL_DEVICE_SYNC')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'DUAL_DEVICE_SYNC'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Dual-Phone Live Sync</span>
            </button>

            <button
              onClick={() => setViewMode('TEST_SUITE')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'TEST_SUITE'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Test Suite & Scenarios (29)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* VIEW MODE 1: Interactive Android Mobile App Container */}
        {viewMode === 'PHONE_APP' && (
          <div className="flex flex-col items-center justify-center">
            {/* Quick Helper Subtitle */}
            <div className="text-center mb-4 space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pixel 9 Pro · Material 3 Mobile Layout</span>
              </div>
              <p className="text-xs text-slate-500">
                Tap anywhere on the Android phone below to explore the live dashboard, add expenses, custom splits, and settlements.
              </p>
            </div>

            {/* Android Phone Device Frame */}
            <AndroidFrame activeTab={bottomNavTab} onTabChange={setBottomNavTab}>
              <AndroidTopBar
                currentGroup={currentGroup}
                allGroups={groups}
                onSelectGroup={(grp) => setCurrentGroup(grp)}
                currentUser={currentUser}
                allMembers={members}
                onSwitchUser={(mem) => setCurrentUser(mem)}
              />

              {/* Dynamic Screen Content */}
              <div className="flex-1 overflow-y-auto">
                {subScreenMode === 'ADD_EXPENSE' ? (
                  <AddExpenseScreen
                    currentGroup={currentGroup}
                    currentUser={currentUser}
                    categories={categories}
                    accounts={groupAccounts}
                    existingExpense={activeEditingTx}
                    onSaveExpense={handleSaveExpense}
                    onAddCategory={handleAddCategory}
                    onCancel={() => {
                      setSubScreenMode('NONE');
                      setActiveEditingTx(null);
                    }}
                  />
                ) : subScreenMode === 'ADD_TRANSFER' ? (
                  <AddTransferScreen
                    currentGroup={currentGroup}
                    currentUser={currentUser}
                    accounts={groupAccounts}
                    existingTransfer={activeEditingTransfer}
                    onSaveTransfer={handleSaveTransfer}
                    onCancel={() => {
                      setSubScreenMode('NONE');
                      setActiveEditingTransfer(null);
                    }}
                  />
                ) : subScreenMode === 'SETTLE' ? (
                  <SettleScreen
                    currentGroup={currentGroup}
                    currentUser={currentUser}
                    transactions={groupTransactions}
                    accounts={groupAccounts}
                    existingSettlement={activeEditingSettlement}
                    onConfirmSettlement={handleConfirmSettlement}
                    onCancel={() => {
                      setSubScreenMode('NONE');
                      setActiveEditingSettlement(null);
                    }}
                  />
                ) : (
                  <>
                    {bottomNavTab === 'dashboard' && (
                      <DashboardScreen
                        currentGroup={currentGroup}
                        currentUser={currentUser}
                        transactions={groupTransactions}
                        categories={categories}
                        onOpenAddExpense={() => setSubScreenMode('ADD_EXPENSE')}
                        onOpenAddTransfer={() => setSubScreenMode('ADD_TRANSFER')}
                        onOpenSettle={() => setSubScreenMode('SETTLE')}
                        onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
                        onNavigateToTransactions={(catId) => {
                          setActiveCategoryFilter(catId);
                          setBottomNavTab('transactions');
                        }}
                      />
                    )}

                    {bottomNavTab === 'transactions' && (
                      <TransactionsScreen
                        currentGroup={currentGroup}
                        currentUser={currentUser}
                        transactions={groupTransactions}
                        categories={categories}
                        accounts={groupAccounts}
                        onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
                        onOpenAddExpense={() => setSubScreenMode('ADD_EXPENSE')}
                        initialCategoryFilter={activeCategoryFilter}
                        onClearInitialCategoryFilter={() => setActiveCategoryFilter(undefined)}
                      />
                    )}

                    {bottomNavTab === 'accounts' && (
                      <AccountsScreen
                        currentGroup={currentGroup}
                        currentUser={currentUser}
                        accounts={groupAccounts}
                        transactions={groupTransactions}
                        onAddAccount={handleAddAccount}
                        onToggleAccountStatus={handleToggleAccountStatus}
                      />
                    )}

                    {bottomNavTab === 'group' && (
                      <GroupMembersScreen
                        currentGroup={currentGroup}
                        currentUser={currentUser}
                        onOpenTwoDeviceSimulator={() => setViewMode('DUAL_DEVICE_SYNC')}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Bottom Nav Bar (hidden during full sub-screens) */}
              {subScreenMode === 'NONE' && (
                <AndroidBottomNav
                  activeTab={bottomNavTab}
                  onTabChange={(tab) => {
                    if (tab === 'add') {
                      setSubScreenMode('ADD_EXPENSE');
                    } else {
                      setBottomNavTab(tab);
                    }
                  }}
                  onOpenQuickAdd={() => setSubScreenMode('ADD_EXPENSE')}
                />
              )}
            </AndroidFrame>
          </div>
        )}

        {/* VIEW MODE 2: Android Screen Samples Blueprint Catalog & Specs */}
        {viewMode === 'SCREEN_GALLERY' && (
          <AndroidGalleryView
            onLaunchScreenInPhone={(tab, extraAction) => {
              setViewMode('PHONE_APP');
              setBottomNavTab(tab);
              if (extraAction === 'expense') setSubScreenMode('ADD_EXPENSE');
              else if (extraAction === 'transfer') setSubScreenMode('ADD_TRANSFER');
              else if (extraAction === 'settle') setSubScreenMode('SETTLE');
              else setSubScreenMode('NONE');
            }}
          />
        )}

        {/* VIEW MODE 3: Dual-Phone Live Synchronization Simulator */}
        {viewMode === 'DUAL_DEVICE_SYNC' && (
          <TwoDeviceSimulatorView
            currentGroup={currentGroup}
            allGroups={groups}
            allMembers={members}
            transactions={groupTransactions}
            categories={categories}
            accounts={groupAccounts}
            onAddPresetTransaction={handleAddPresetTransaction}
            onOpenAddExpenseForUser={(user) => {
              setCurrentUser(user);
              setViewMode('PHONE_APP');
              setSubScreenMode('ADD_EXPENSE');
            }}
            onSelectTransaction={(tx, user) => {
              setCurrentUser(user);
              setSelectedTxForDetail(tx);
            }}
          />
        )}

        {/* VIEW MODE 4: Automated Verification & Test Suite Runner */}
        {viewMode === 'TEST_SUITE' && <TestSuiteScreen />}
      </main>

      {/* Transaction Detail Modal / Bottom Sheet */}
      {selectedTxForDetail && (
        <TransactionDetailModal
          transaction={selectedTxForDetail}
          currentGroup={currentGroup}
          currentUser={currentUser}
          categories={categories}
          accounts={groupAccounts}
          onClose={() => setSelectedTxForDetail(null)}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}
