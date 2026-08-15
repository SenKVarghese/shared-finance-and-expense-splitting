import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  User,
  Tag,
  CheckCircle2,
  ArrowRightLeft,
  IndianRupee,
  FileText,
  AlertTriangle,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Account, Category, Group, Member, Transaction } from '../types';
import { formatCurrency } from '../services/financeEngine';
import { CategoryIcon } from './CategoryIcon';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  currentGroup: Group;
  currentUser: Member;
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  currentGroup,
  currentUser,
  categories,
  accounts,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!transaction) return null;

  const isExpense = transaction.type === 'EXPENSE';
  const isSettlement = transaction.type === 'SETTLEMENT';
  const isTransfer = transaction.type === 'DIRECT_TRANSFER';

  const category = isExpense ? categories.find((c) => c.id === transaction.categoryId) : undefined;
  const account = transaction.accountId ? accounts.find((a) => a.id === transaction.accountId) : undefined;
  const payer = currentGroup.members.find(
    (m) => m.id === (isExpense ? transaction.paidByMemberId : transaction.fromMemberId)
  );
  const receiver =
    isSettlement || isTransfer ? currentGroup.members.find((m) => m.id === transaction.toMemberId) : undefined;

  // Creator & Ownership Access Control
  const creatorId =
    transaction.createdByMemberId ||
    (isExpense ? transaction.paidByMemberId : transaction.fromMemberId);
  const creator = currentGroup.members.find((m) => m.id === creatorId);
  const isCreatedByMe = creatorId === currentUser.id;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-t-[36px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header with Close & Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{
                backgroundColor: isExpense
                  ? category?.color || '#6366f1'
                  : isSettlement
                  ? '#10b981'
                  : '#3b82f6',
              }}
            >
              {isExpense ? (
                <CategoryIcon iconName={category?.iconName || 'Tag'} className="w-4 h-4" />
              ) : isSettlement ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isExpense ? `${category?.name || 'Expense'}` : transaction.type.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Amount & Title */}
        <div className="text-center space-y-1">
          <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            {isExpense
              ? transaction.description
              : isSettlement
              ? 'Settlement Payback'
              : transaction.description || 'Direct Loan / Transfer'}
          </h3>
          <div className="text-[11px] text-slate-400">{transaction.date}</div>
        </div>

        {/* Metadata Grid */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Paid by</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{payer?.name}</span>
          </div>

          {(isSettlement || isTransfer) && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Received by</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{receiver?.name}</span>
            </div>
          )}

          {account && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Payment Account</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{account.name}</span>
            </div>
          )}

          {/* Created by attribution */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Created by</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
                style={{ backgroundColor: creator?.color || '#6366f1' }}
              >
                {creator?.initials || 'U'}
              </span>
              <span>
                {creator?.name} {isCreatedByMe ? '(You)' : ''}
              </span>
            </div>
          </div>

          {(transaction as any).notes && (
            <div className="flex items-start justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Notes</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[200px]">
                {(transaction as any).notes}
              </span>
            </div>
          )}
        </div>

        {/* Split Math Breakdown for Expense */}
        {isExpense && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>Split Proportions ({transaction.splitMethod})</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 divide-y divide-slate-200/50 dark:divide-slate-800 text-xs">
              {transaction.splits.map((s) => {
                const mem = currentGroup.members.find((m) => m.id === s.memberId);
                return (
                  <div key={s.memberId} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {mem?.name} {s.percentage ? `(${s.percentage}%)` : ''}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {formatCurrency(s.amount, transaction.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ownership Policy Alert when not creator */}
        {!isCreatedByMe && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Protected Transaction: </span>
              <span>
                Created by <strong>{creator?.name}</strong>. Only the author who recorded this transaction can delete or modify it.
              </span>
            </div>
          </div>
        )}

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-2 text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Delete this transaction?</span>
            </div>
            <p className="text-[11px]">
              This will remove this record and immediately recalculate the group's net financial balances.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(transaction.id);
                  onClose();
                }}
                className="flex-1 py-1.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:scale-95 transition shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons: Edit and Delete */
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => {
                if (isCreatedByMe) {
                  onEdit(transaction);
                  onClose();
                }
              }}
              disabled={!isCreatedByMe}
              className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                isCreatedByMe
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Transaction</span>
            </button>

            <button
              onClick={() => {
                if (isCreatedByMe) {
                  setShowDeleteConfirm(true);
                }
              }}
              disabled={!isCreatedByMe}
              title={
                isCreatedByMe
                  ? 'Delete transaction'
                  : `Only ${creator?.name} (who created this) can delete it`
              }
              className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                isCreatedByMe
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {isCreatedByMe ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isCreatedByMe ? 'Delete' : 'Locked'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
