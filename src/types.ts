export type Currency = 'INR' | 'USD' | 'EUR';

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  color: string;
  initials: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  members: Member[];
  inviteCode: string;
  createdAt: string;
}

export type SplitMethod = 'EQUAL' | 'PERCENTAGE' | 'AMOUNT';

export interface SplitShare {
  memberId: string;
  amount: number;
  percentage?: number;
}

export type TransactionType = 'EXPENSE' | 'SETTLEMENT' | 'DIRECT_TRANSFER';

export interface BaseTransaction {
  id: string;
  groupId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  createdByMemberId?: string; // Creator ID for ownership and deletion access control
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'EXPENSE';
  description: string;
  categoryId: string;
  paidByMemberId: string;
  accountId?: string;
  splitMethod: SplitMethod;
  splits: SplitShare[];
  notes?: string;
}

export interface SettlementTransaction extends BaseTransaction {
  type: 'SETTLEMENT';
  fromMemberId: string;
  toMemberId: string;
  accountId?: string;
  notes?: string;
}

export interface DirectTransferTransaction extends BaseTransaction {
  type: 'DIRECT_TRANSFER';
  fromMemberId: string;
  toMemberId: string;
  description: string;
  accountId?: string;
  notes?: string;
}

export type Transaction = ExpenseTransaction | SettlementTransaction | DirectTransferTransaction;

export type AccountType = 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'CASH' | 'UPI' | 'WALLET' | 'OTHER';

export interface Account {
  id: string;
  groupId: string;
  name: string;
  type: AccountType;
  ownerMemberId: string;
  currency: Currency;
  isActive: boolean;
  bankName?: string;
  lastFourDigits?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

export type TimeRange = 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'ALL_TIME' | 'CUSTOM';

export type DashboardTab = 'overview' | 'people' | 'categories' | 'trends';

export type BottomNavTab = 'dashboard' | 'transactions' | 'add' | 'accounts' | 'group';

export interface NetBalance {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  displayText: string; // e.g. "Wife owes Sen ₹3,750" or "Sen owes Wife ₹500" or "All Settled up"
  status: 'OWED_TO_ME' | 'I_OWE' | 'SETTLED';
}

export interface PersonSummary {
  member: Member;
  totalPaid: number;
  personalShare: number;
  transfersSent: number;
  transfersReceived: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netPosition: number; // positive = net creditor, negative = net debtor
}

export interface AndroidScreenSpec {
  id: string;
  screenNumber: number;
  title: string;
  subtitle: string;
  category: 'Core' | 'Transactions' | 'Management' | 'Architecture';
  description: string;
  materialTokens: string[];
  composeSnippet: string;
  keyFeatures: string[];
}
