import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRightLeft, AlertCircle, IndianRupee, HelpCircle } from 'lucide-react';
import { Account, DirectTransferTransaction, Group, Member } from '../../types';
import { formatCurrency } from '../../services/financeEngine';

interface AddTransferScreenProps {
  currentGroup: Group;
  currentUser: Member;
  accounts: Account[];
  existingTransfer?: DirectTransferTransaction | null;
  onSaveTransfer: (
    transfer: Omit<DirectTransferTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
  onCancel: () => void;
}

export const AddTransferScreen: React.FC<AddTransferScreenProps> = ({
  currentGroup,
  currentUser,
  accounts,
  existingTransfer,
  onSaveTransfer,
  onCancel,
}) => {
  const otherMember = currentGroup.members.find((m) => m.id !== currentUser.id) || currentGroup.members[1];
  const [fromMemberId, setFromMemberId] = useState<string>(
    existingTransfer ? existingTransfer.fromMemberId : currentUser.id
  );
  const [toMemberId, setToMemberId] = useState<string>(
    existingTransfer ? existingTransfer.toMemberId : otherMember?.id || currentGroup.members[1]?.id
  );
  const [amountStr, setAmountStr] = useState<string>(
    existingTransfer ? existingTransfer.amount.toString() : ''
  );
  const [description, setDescription] = useState<string>(
    existingTransfer ? existingTransfer.description : 'Personal Loan / Transfer'
  );
  const [accountId, setAccountId] = useState<string>(existingTransfer?.accountId || '');
  const [date, setDate] = useState<string>(
    existingTransfer ? existingTransfer.date : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(existingTransfer?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numAmount = parseFloat(amountStr) || 0;
  const senderAccounts = accounts.filter((a) => a.ownerMemberId === fromMemberId && a.isActive);

  const handleSwap = () => {
    const temp = fromMemberId;
    setFromMemberId(toMemberId);
    setToMemberId(temp);
  };

  const handleSave = () => {
    setErrorMessage(null);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount greater than 0');
      return;
    }
    if (fromMemberId === toMemberId) {
      setErrorMessage('Sender and receiver must be different members');
      return;
    }

    onSaveTransfer(
      {
        groupId: currentGroup.id,
        type: 'DIRECT_TRANSFER',
        amount: numAmount,
        currency: currentGroup.currency,
        date,
        description: description.trim() || 'Direct Transfer',
        fromMemberId,
        toMemberId,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
        createdByMemberId: existingTransfer?.createdByMemberId || currentUser.id,
      },
      existingTransfer?.id
    );
  };

  const senderMember = currentGroup.members.find((m) => m.id === fromMemberId);
  const receiverMember = currentGroup.members.find((m) => m.id === toMemberId);

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Direct Transfer / Loan</h2>
        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      <div className="p-4 space-y-4 pb-12">
        {/* Info Note on Direct Transfer Concept (Section 2.5 & 22) */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-start space-x-2 text-xs text-blue-800 dark:text-blue-200">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Not an expense split:</span> This records direct money lent or transferred
            between members. It directly increases recipient's debt without distorting category expenses.
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Big Amount Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs text-center space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Transfer Amount</label>
          <div className="flex items-center justify-center space-x-1 text-3xl font-black text-slate-900 dark:text-slate-100">
            <span className="text-blue-600">₹</span>
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-48 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 py-1 font-mono font-black"
            />
          </div>
          <span className="text-[10px] text-slate-400 block">Currency: {currentGroup.currency}</span>
        </div>

        {/* Sender and Receiver Switcher */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transfer Direction</label>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: senderMember?.color }}
              >
                {senderMember?.initials}
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">From (Lender)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{senderMember?.name}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:scale-110 active:scale-95 transition"
              title="Swap Sender and Receiver"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">To (Receiver)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{receiverMember?.name}</span>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: receiverMember?.color }}
              >
                {receiverMember?.initials}
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">
            Result: {receiverMember?.name} will owe {senderMember?.name}{' '}
            {numAmount > 0 ? formatCurrency(numAmount, currentGroup.currency) : '₹0'}
          </div>
        </div>

        {/* Reason, Date, Account */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transfer Reason</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Course fee loan, emergency cash..."
              className="mt-1 w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">None / Direct</option>
                {senderAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
