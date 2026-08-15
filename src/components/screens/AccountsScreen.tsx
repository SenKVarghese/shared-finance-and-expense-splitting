import React, { useState } from 'react';
import { Plus, CreditCard, Building2, Smartphone, Banknote, Wallet, Check, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Account, AccountType, Group, Member, Transaction } from '../../types';
import { formatCurrency } from '../../services/financeEngine';

interface AccountsScreenProps {
  currentGroup: Group;
  currentUser: Member;
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onToggleAccountStatus: (accountId: string) => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  currentGroup,
  currentUser,
  accounts,
  transactions,
  onAddAccount,
  onToggleAccountStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('CREDIT_CARD');
  const [newAccOwner, setNewAccOwner] = useState<string>(currentUser.id);
  const [newBankName, setNewBankName] = useState('');
  const [newLastDigits, setNewLastDigits] = useState('');

  // Calculate spending per account (Section 25)
  const accountSpendMap = new Map<string, number>();
  transactions.forEach((tx) => {
    if (tx.accountId) {
      accountSpendMap.set(tx.accountId, (accountSpendMap.get(tx.accountId) || 0) + tx.amount);
    }
  });

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    onAddAccount({
      groupId: currentGroup.id,
      name: newAccName.trim(),
      type: newAccType,
      ownerMemberId: newAccOwner,
      currency: currentGroup.currency,
      isActive: true,
      bankName: newBankName.trim() || undefined,
      lastFourDigits: newLastDigits.trim() || undefined,
    });

    setNewAccName('');
    setNewBankName('');
    setNewLastDigits('');
    setShowAddModal(false);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'CREDIT_CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'BANK_ACCOUNT':
        return <Building2 className="w-4 h-4" />;
      case 'UPI':
        return <Smartphone className="w-4 h-4" />;
      case 'CASH':
        return <Banknote className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Payment Accounts</h2>
          <p className="text-xs text-slate-500">Track payment sources & card balances</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Account</span>
        </button>
      </div>

      {/* Account Groups per Member */}
      {currentGroup.members.map((member) => {
        const memberAccounts = accounts.filter((a) => a.ownerMemberId === member.id);
        const totalMemberAccountSpend = memberAccounts.reduce(
          (acc, a) => acc + (accountSpendMap.get(a.id) || 0),
          0
        );

        return (
          <div key={member.id} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {member.name}'s Accounts
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Total spent: {formatCurrency(totalMemberAccountSpend, currentGroup.currency)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
              {memberAccounts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No accounts configured yet</div>
              ) : (
                memberAccounts.map((acc) => {
                  const spend = accountSpendMap.get(acc.id) || 0;
                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs shrink-0 ${
                            !acc.isActive ? 'opacity-40' : ''
                          }`}
                        >
                          {getAccountIcon(acc.type)}
                        </div>

                        <div>
                          <div
                            className={`font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 ${
                              !acc.isActive ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            <span>{acc.name}</span>
                            {acc.lastFourDigits && (
                              <span className="text-[10px] font-mono text-slate-400">••••{acc.lastFourDigits}</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {acc.type.replace('_', ' ').toLowerCase()} {acc.bankName ? `· ${acc.bankName}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(spend, currentGroup.currency)}
                          </div>
                          <div className="text-[9px] text-slate-400 uppercase">Tracked</div>
                        </div>

                        <button
                          onClick={() => onToggleAccountStatus(acc.id)}
                          className="text-slate-400 hover:text-indigo-600 transition"
                          title={acc.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {acc.isActive ? (
                            <ToggleRight className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Payment Account</h3>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Account Owner</label>
                <select
                  value={newAccOwner}
                  onChange={(e) => setNewAccOwner(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  {currentGroup.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Regalia, GPay, ICICI Bank..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    className="mt-1 w-full p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_ACCOUNT">Bank Account</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 8912"
                    value={newLastDigits}
                    onChange={(e) => setNewLastDigits(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
