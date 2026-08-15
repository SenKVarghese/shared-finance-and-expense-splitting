import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, IndianRupee, Sparkles, AlertCircle, Wallet } from 'lucide-react';
import { Account, Group, Member, SettlementTransaction, Transaction } from '../../types';
import { calculatePairNetBalance, formatCurrency, getNetBalanceStatus } from '../../services/financeEngine';
import confetti from 'canvas-confetti';

interface SettleScreenProps {
  currentGroup: Group;
  currentUser: Member;
  transactions: Transaction[];
  accounts: Account[];
  existingSettlement?: SettlementTransaction | null;
  onConfirmSettlement: (
    settlement: Omit<SettlementTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
  onCancel: () => void;
}

export const SettleScreen: React.FC<SettleScreenProps> = ({
  currentGroup,
  currentUser,
  transactions,
  accounts,
  existingSettlement,
  onConfirmSettlement,
  onCancel,
}) => {
  const otherMember = currentGroup.members.find((m) => m.id !== currentUser.id) || currentGroup.members[1];
  const { netOwedToA } = calculatePairNetBalance(currentUser.id, otherMember.id, transactions);

  // Determine who is paying who based on outstanding balance or existing settlement
  const absDebt = Math.abs(netOwedToA);
  const debtor = existingSettlement
    ? currentGroup.members.find((m) => m.id === existingSettlement.fromMemberId) || currentUser
    : netOwedToA < 0
    ? currentUser
    : otherMember;
  const creditor = existingSettlement
    ? currentGroup.members.find((m) => m.id === existingSettlement.toMemberId) || otherMember
    : netOwedToA < 0
    ? otherMember
    : currentUser;

  const [settleAmount, setSettleAmount] = useState<number>(
    existingSettlement ? existingSettlement.amount : absDebt
  );
  const [accountId, setAccountId] = useState<string>(existingSettlement?.accountId || '');
  const [date, setDate] = useState<string>(
    existingSettlement ? existingSettlement.date : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(
    existingSettlement?.notes || 'Settled via GPay / UPI'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debtorAccounts = accounts.filter((a) => a.ownerMemberId === debtor.id && a.isActive);
  const remainingDebt = Math.max(0, absDebt - settleAmount);

  const handleSettle = () => {
    setErrorMessage(null);
    if (settleAmount <= 0) {
      setErrorMessage('Settlement amount must be greater than 0');
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    onConfirmSettlement(
      {
        groupId: currentGroup.id,
        type: 'SETTLEMENT',
        amount: settleAmount,
        currency: currentGroup.currency,
        date,
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
        createdByMemberId: existingSettlement?.createdByMemberId || currentUser.id,
      },
      existingSettlement?.id
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
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Settle Up Balance</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4 pb-12">
        {/* Core Debt Status Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 rounded-3xl p-5 border border-emerald-300 dark:border-emerald-800/60 shadow-xs text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Outstanding Balance</span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(absDebt, currentGroup.currency)}
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100">{debtor.name}</span> pays{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{creditor.name}</span>
          </p>

          <div className="text-[10px] text-slate-400 pt-1">
            Rules FR-023 to FR-028: Settlements reduce debt without modifying original expenses
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Settlement Amount & Slider (Partial Settle support - Section 19 & 20) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Amount to Settle
            </label>
            <button
              onClick={() => setSettleAmount(absDebt)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Amount ({formatCurrency(absDebt, currentGroup.currency)})
            </button>
          </div>

          <div className="flex items-center justify-center space-x-1 text-2xl font-black text-slate-900 dark:text-slate-100">
            <span className="text-emerald-600">₹</span>
            <input
              type="number"
              value={settleAmount || ''}
              max={absDebt}
              onChange={(e) => setSettleAmount(Math.min(absDebt, parseFloat(e.target.value) || 0))}
              className="w-40 text-center bg-transparent border-b-2 border-emerald-500 focus:outline-none py-1 font-mono font-black text-2xl"
            />
          </div>

          {/* Interactive Range Slider for partial settlement */}
          {absDebt > 0 && (
            <div className="space-y-1">
              <input
                type="range"
                min="1"
                max={absDebt}
                step="50"
                value={settleAmount}
                onChange={(e) => setSettleAmount(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹0</span>
                <span>{formatCurrency(absDebt / 2, currentGroup.currency)} (50%)</span>
                <span>{formatCurrency(absDebt, currentGroup.currency)} (Full)</span>
              </div>
            </div>
          )}

          {/* Remaining Balance Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Remaining Balance After Settlement:</span>
            <span
              className={`font-black font-mono ${
                remainingDebt === 0 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {remainingDebt === 0 ? '₹0 (All Settled!)' : formatCurrency(remainingDebt, currentGroup.currency)}
            </span>
          </div>
        </div>

        {/* Payment Account Source & Notes */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Payment Source (Optional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">UPI / Direct Bank Transfer</option>
              {debtorAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.replace('_', ' ')})
                </option>
              ))}
            </select>
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Note / Reference</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="UPI ref / note"
                className="mt-1 w-full p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSettle}
          disabled={absDebt <= 0}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm Settlement of {formatCurrency(settleAmount, currentGroup.currency)}</span>
        </button>
      </div>
    </div>
  );
};
