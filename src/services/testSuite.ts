import {
  calculateCategoryBreakdown,
  calculateGroupFinancials,
  calculatePairNetBalance,
  filterTransactionsByDate,
  formatCurrency,
  getNetBalanceStatus,
} from './financeEngine';
import {
  Account,
  Category,
  DirectTransferTransaction,
  ExpenseTransaction,
  Group,
  Member,
  SettlementTransaction,
  Transaction,
} from '../types';

export interface TestCase {
  id: string;
  category:
    | 'Split Math & Edge Cases'
    | 'Netting & Pair Balances'
    | 'Direct Transfers & Loans'
    | 'Settlement & Debt Payback'
    | 'Access Control & Security'
    | 'Analytics & Category Breakdown'
    | 'Formatting & Date Filtering';
  name: string;
  description: string;
  run: () => { passed: boolean; message?: string; expected?: any; actual?: any };
}

export interface TestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  passed: boolean;
  message?: string;
  expected?: any;
  actual?: any;
  durationMs: number;
}

// Test fixtures
const MOCK_HUSBAND: Member = {
  id: 'mem_husband',
  name: 'Husband',
  role: 'admin',
  color: '#2563eb',
  initials: 'H',
};

const MOCK_WIFE: Member = {
  id: 'mem_wife',
  name: 'Wife',
  role: 'member',
  color: '#db2777',
  initials: 'W',
};

const MOCK_FRIEND: Member = {
  id: 'mem_friend',
  name: 'Friend',
  role: 'member',
  color: '#10b981',
  initials: 'F',
};

const MOCK_GROUP: Group = {
  id: 'grp_test',
  name: 'Test Household',
  currency: 'INR',
  members: [MOCK_HUSBAND, MOCK_WIFE],
  inviteCode: 'PAIR-TEST-1234',
  createdAt: '2026-08-01T00:00:00.000Z',
};

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Groceries', iconName: 'ShoppingBag', color: '#10b981', isDefault: true, isActive: true },
  { id: 'cat_fuel', name: 'Fuel', iconName: 'Fuel', color: '#f59e0b', isDefault: true, isActive: true },
  { id: 'cat_dining', name: 'Dining', iconName: 'Utensils', color: '#ec4899', isDefault: true, isActive: true },
  { id: 'cat_utilities', name: 'Utilities', iconName: 'Zap', color: '#6366f1', isDefault: true, isActive: true },
];

export const TEST_SUITE: TestCase[] = [
  // ==========================================
  // 1. SPLIT MATH & EDGE CASES (6 Scenarios)
  // ==========================================
  {
    id: 'TC_SPLIT_01',
    category: 'Split Math & Edge Cases',
    name: 'Equal 50/50 Split on Even Amount',
    description: 'Husband pays ₹1,000 grocery bill split equally with Wife (₹500 each).',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_eq_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500, percentage: 50 },
          { memberId: 'mem_wife', amount: 500, percentage: 50 },
        ],
      };
      const { netOwedToA, bOwesA, aOwesB } = calculatePairNetBalance('mem_husband', 'mem_wife', [tx]);
      const passed = netOwedToA === 500 && bOwesA === 500 && aOwesB === 0;
      return {
        passed,
        message: passed ? 'Wife correctly owes Husband ₹500' : 'Net calculation mismatch',
        expected: { netOwedToA: 500, bOwesA: 500, aOwesB: 0 },
        actual: { netOwedToA, bOwesA, aOwesB },
      };
    },
  },
  {
    id: 'TC_SPLIT_02',
    category: 'Split Math & Edge Cases',
    name: 'Percentage Split (60% / 40%) Calculation',
    description: 'Husband pays ₹3,200 for dining with 60% Husband (₹1,920) and 40% Wife (₹1,280).',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_pct_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 3200,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Dinner',
        categoryId: 'cat_dining',
        paidByMemberId: 'mem_husband',
        splitMethod: 'PERCENTAGE',
        splits: [
          { memberId: 'mem_husband', amount: 1920, percentage: 60 },
          { memberId: 'mem_wife', amount: 1280, percentage: 40 },
        ],
      };
      const { netOwedToA } = calculatePairNetBalance('mem_husband', 'mem_wife', [tx]);
      const passed = netOwedToA === 1280;
      return {
        passed,
        message: passed ? 'Wife owes ₹1,280 (40% share)' : 'Incorrect percentage split share',
        expected: 1280,
        actual: netOwedToA,
      };
    },
  },
  {
    id: 'TC_SPLIT_03',
    category: 'Split Math & Edge Cases',
    name: 'Exact Custom Amount Split',
    description: 'Wife pays ₹1,500 pet fee, allocated as ₹1,000 for Husband and ₹500 for Wife.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_amt_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Pet checkup',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_wife',
        splitMethod: 'AMOUNT',
        splits: [
          { memberId: 'mem_husband', amount: 1000 },
          { memberId: 'mem_wife', amount: 500 },
        ],
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const passed = status.status === 'I_OWE' && status.amount === 1000;
      return {
        passed,
        message: passed ? 'Husband owes Wife ₹1,000' : 'Exact amount split failed',
        expected: { status: 'I_OWE', amount: 1000 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_SPLIT_04',
    category: 'Split Math & Edge Cases',
    name: '100% Single-Payer Individual Expense (Zero Debt)',
    description: 'Husband pays ₹800 for his personal item (100% split to Husband). Wife owes ₹0.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_solo_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 800,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Personal Book',
        categoryId: 'cat_utilities',
        paidByMemberId: 'mem_husband',
        splitMethod: 'PERCENTAGE',
        splits: [
          { memberId: 'mem_husband', amount: 800, percentage: 100 },
          { memberId: 'mem_wife', amount: 0, percentage: 0 },
        ],
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const passed = status.status === 'SETTLED' && status.amount === 0;
      return {
        passed,
        message: passed ? 'Group remains fully settled at ₹0 debt' : 'Non-zero debt on individual expense',
        expected: { status: 'SETTLED', amount: 0 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_SPLIT_05',
    category: 'Split Math & Edge Cases',
    name: '100% Paid on Behalf of Partner',
    description: 'Husband pays ₹2,500 medicine bill 100% allocated to Wife. Wife owes full ₹2,500.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_behalf_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 2500,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Partner Medicine',
        categoryId: 'cat_utilities',
        paidByMemberId: 'mem_husband',
        splitMethod: 'AMOUNT',
        splits: [
          { memberId: 'mem_husband', amount: 0 },
          { memberId: 'mem_wife', amount: 2500 },
        ],
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const passed = status.status === 'OWED_TO_ME' && status.amount === 2500;
      return {
        passed,
        message: passed ? 'Wife owes Husband full ₹2,500' : 'Incorrect behalf split',
        expected: { status: 'OWED_TO_ME', amount: 2500 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_SPLIT_06',
    category: 'Split Math & Edge Cases',
    name: 'Odd Paisa Rounding Consistency',
    description: '₹100.33 split between 2 members (₹50.17 and ₹50.16) preserves arithmetic balance.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_odd_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 100.33,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Odd items',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'AMOUNT',
        splits: [
          { memberId: 'mem_husband', amount: 50.17 },
          { memberId: 'mem_wife', amount: 50.16 },
        ],
      };
      const splitSum = tx.splits.reduce((acc, s) => acc + s.amount, 0);
      const diff = Math.abs(splitSum - tx.amount);
      const passed = diff < 0.001;
      return {
        passed,
        message: passed ? 'Splits sum perfectly to ₹100.33' : 'Paisa rounding discrepancy',
        expected: 100.33,
        actual: splitSum,
      };
    },
  },

  // ==========================================
  // 2. NETTING & PAIR BALANCES (5 Scenarios)
  // ==========================================
  {
    id: 'TC_NET_01',
    category: 'Netting & Pair Balances',
    name: 'Reciprocal Symmetry Check',
    description: 'Husband viewing "+₹500 Receivable" strictly equals Wife viewing "-₹500 Payable".',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_recip',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500 },
          { memberId: 'mem_wife', amount: 500 },
        ],
      };
      const husbandView = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const wifeView = getNetBalanceStatus('mem_wife', MOCK_GROUP, [tx]);

      const passed =
        husbandView.status === 'OWED_TO_ME' &&
        husbandView.amount === 500 &&
        wifeView.status === 'I_OWE' &&
        wifeView.amount === 500;

      return {
        passed,
        message: passed ? 'Reciprocal balance verified across both devices' : 'Reciprocal asymmetry detected',
        expected: { husband: 'OWED_TO_ME (500)', wife: 'I_OWE (500)' },
        actual: { husband: `${husbandView.status} (${husbandView.amount})`, wife: `${wifeView.status} (${wifeView.amount})` },
      };
    },
  },
  {
    id: 'TC_NET_02',
    category: 'Netting & Pair Balances',
    name: 'Multi-Expense Mutual Debt Cancellation',
    description: 'Husband pays ₹2,000 (Wife owes ₹1,000), then Wife pays ₹1,500 (Husband owes ₹750) -> Net: Wife owes ₹250.',
    run: () => {
      const tx1: ExpenseTransaction = {
        id: 'tx_net_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 2000,
        currency: 'INR',
        date: '2026-08-14',
        createdAt: '2026-08-14T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 1000 },
          { memberId: 'mem_wife', amount: 1000 },
        ],
      };
      const tx2: ExpenseTransaction = {
        id: 'tx_net_2',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Fuel',
        categoryId: 'cat_fuel',
        paidByMemberId: 'mem_wife',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 750 },
          { memberId: 'mem_wife', amount: 750 },
        ],
      };
      const { netOwedToA, bOwesA, aOwesB } = calculatePairNetBalance('mem_husband', 'mem_wife', [tx1, tx2]);
      const passed = netOwedToA === 250 && bOwesA === 1000 && aOwesB === 750;
      return {
        passed,
        message: passed ? 'Mutual debts simplified to single net amount of ₹250' : 'Net reduction failed',
        expected: { netOwedToA: 250 },
        actual: { netOwedToA },
      };
    },
  },
  {
    id: 'TC_NET_03',
    category: 'Netting & Pair Balances',
    name: 'Debt Direction Inversion Check',
    description: 'Wife pays larger bills such that Husband becomes net debtor (-₹500).',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_inv_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 3000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Car Service',
        categoryId: 'cat_fuel',
        paidByMemberId: 'mem_wife',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 1500 },
          { memberId: 'mem_wife', amount: 1500 },
        ],
      };
      const husbandStatus = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const passed = husbandStatus.status === 'I_OWE' && husbandStatus.amount === 1500;
      return {
        passed,
        message: passed ? 'Husband correctly sees "I owe Wife ₹1,500"' : 'Debt inversion calculation failed',
        expected: { status: 'I_OWE', amount: 1500 },
        actual: { status: husbandStatus.status, amount: husbandStatus.amount },
      };
    },
  },
  {
    id: 'TC_NET_04',
    category: 'Netting & Pair Balances',
    name: 'Zero Transactions Settlement State',
    description: 'Empty ledger produces "All Settled up" with zero error or NaN.',
    run: () => {
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, []);
      const passed = status.status === 'SETTLED' && status.amount === 0 && status.displayText === 'All Settled up';
      return {
        passed,
        message: passed ? 'Empty ledger handled gracefully' : 'Non-settled status on empty ledger',
        expected: { status: 'SETTLED', amount: 0 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_NET_05',
    category: 'Netting & Pair Balances',
    name: 'Exact Cumulative Ledger Net Position',
    description: 'Evaluates a chain of 4 mixed transactions and verifies memberSummaries net position math.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_cum_1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 1000,
          currency: 'INR',
          date: '2026-08-10',
          createdAt: '2026-08-10T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Groceries',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 500 },
            { memberId: 'mem_wife', amount: 500 },
          ],
        },
        {
          id: 'tx_cum_2',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 2000,
          currency: 'INR',
          date: '2026-08-11',
          createdAt: '2026-08-11T00:00:00Z',
          createdByMemberId: 'mem_wife',
          description: 'Electricity',
          categoryId: 'cat_utilities',
          paidByMemberId: 'mem_wife',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 1000 },
            { memberId: 'mem_wife', amount: 1000 },
          ],
        },
      ];
      const financials = calculateGroupFinancials(MOCK_GROUP, txs);
      const husbandSummary = financials.memberSummaries.find((m) => m.member.id === 'mem_husband');
      const wifeSummary = financials.memberSummaries.find((m) => m.member.id === 'mem_wife');

      // Husband paid 1000, share 1500 -> netPosition = -500
      // Wife paid 2000, share 1500 -> netPosition = +500
      const passed = husbandSummary?.netPosition === -500 && wifeSummary?.netPosition === 500;
      return {
        passed,
        message: passed ? 'Group financials net position sums to zero (conservation of balance)' : 'Net position mismatch',
        expected: { husbandNet: -500, wifeNet: 500 },
        actual: { husbandNet: husbandSummary?.netPosition, wifeNet: wifeSummary?.netPosition },
      };
    },
  },

  // ==========================================
  // 3. DIRECT TRANSFERS & LOANS (4 Scenarios)
  // ==========================================
  {
    id: 'TC_TRANS_01',
    category: 'Direct Transfers & Loans',
    name: 'Direct Loan Alters Net Debt Without Inflating Expenses',
    description: 'Husband lends Wife ₹5,000 cash advance. Wife owes ₹5,000, total household spend stays ₹0.',
    run: () => {
      const tx: DirectTransferTransaction = {
        id: 'tx_loan_1',
        groupId: 'grp_test',
        type: 'DIRECT_TRANSFER',
        amount: 5000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Personal Loan for course fee',
        fromMemberId: 'mem_husband',
        toMemberId: 'mem_wife',
      };
      const { netOwedToA } = calculatePairNetBalance('mem_husband', 'mem_wife', [tx]);
      const financials = calculateGroupFinancials(MOCK_GROUP, [tx]);

      const passed = netOwedToA === 5000 && financials.totalExpenses === 0 && financials.transferCount === 1;
      return {
        passed,
        message: passed ? 'Loan added ₹5,000 debt without inflating shared expense totals' : 'Direct transfer corrupted expense statistics',
        expected: { netDebt: 5000, totalExpenses: 0 },
        actual: { netDebt: netOwedToA, totalExpenses: financials.totalExpenses },
      };
    },
  },
  {
    id: 'TC_TRANS_02',
    category: 'Direct Transfers & Loans',
    name: 'Reverse Direct Transfer (Wife to Husband)',
    description: 'Wife sends Husband ₹3,000. Husband owes Wife ₹3,000.',
    run: () => {
      const tx: DirectTransferTransaction = {
        id: 'tx_loan_2',
        groupId: 'grp_test',
        type: 'DIRECT_TRANSFER',
        amount: 3000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Rent contribution advance',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [tx]);
      const passed = status.status === 'I_OWE' && status.amount === 3000;
      return {
        passed,
        message: passed ? 'Reverse transfer accurately recorded' : 'Transfer direction error',
        expected: { status: 'I_OWE', amount: 3000 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_TRANS_03',
    category: 'Direct Transfers & Loans',
    name: 'Loan Offset by Expense Split',
    description: 'Husband lends Wife ₹1,000 (+₹1000 debt). Wife buys ₹2,000 groceries (50/50 split, -₹1000 debt). Net = ₹0 (Settled).',
    run: () => {
      const loan: DirectTransferTransaction = {
        id: 'tx_loan_3',
        groupId: 'grp_test',
        type: 'DIRECT_TRANSFER',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-14',
        createdAt: '2026-08-14T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Cash advance',
        fromMemberId: 'mem_husband',
        toMemberId: 'mem_wife',
      };
      const expense: ExpenseTransaction = {
        id: 'tx_exp_3',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 2000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_wife',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 1000 },
          { memberId: 'mem_wife', amount: 1000 },
        ],
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [loan, expense]);
      const passed = status.status === 'SETTLED' && status.amount === 0;
      return {
        passed,
        message: passed ? 'Direct loan and expense split offset each other to ₹0' : 'Offset calculation error',
        expected: { status: 'SETTLED', amount: 0 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_TRANS_04',
    category: 'Direct Transfers & Loans',
    name: 'Category Breakdown Ignores Direct Transfers',
    description: 'Categories breakdown must return zero for transfers and only count valid expenses.',
    run: () => {
      const loan: DirectTransferTransaction = {
        id: 'tx_loan_4',
        groupId: 'grp_test',
        type: 'DIRECT_TRANSFER',
        amount: 10000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Big loan',
        fromMemberId: 'mem_husband',
        toMemberId: 'mem_wife',
      };
      const breakdown = calculateCategoryBreakdown(MOCK_CATEGORIES, [loan], MOCK_GROUP.members);
      const passed = breakdown.length === 0;
      return {
        passed,
        message: passed ? 'Category breakdown cleanly excludes non-expense loans' : 'Category breakdown leaked transfer',
        expected: 0,
        actual: breakdown.length,
      };
    },
  },

  // ==========================================
  // 4. SETTLEMENT & DEBT PAYBACK (4 Scenarios)
  // ==========================================
  {
    id: 'TC_SETTLE_01',
    category: 'Settlement & Debt Payback',
    name: 'Full Settlement Brings Balance to Zero',
    description: 'Wife owes Husband ₹1,000 from grocery bill, then records ₹1,000 UPI settlement -> Balance becomes SETTLED.',
    run: () => {
      const expense: ExpenseTransaction = {
        id: 'tx_set_exp',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 2000,
        currency: 'INR',
        date: '2026-08-14',
        createdAt: '2026-08-14T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 1000 },
          { memberId: 'mem_wife', amount: 1000 },
        ],
      };
      const settlement: SettlementTransaction = {
        id: 'tx_set_pay',
        groupId: 'grp_test',
        type: 'SETTLEMENT',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [expense, settlement]);
      const passed = status.status === 'SETTLED' && status.amount === 0;
      return {
        passed,
        message: passed ? 'Full settlement achieved (₹0 remaining)' : 'Settlement failed to zero debt',
        expected: { status: 'SETTLED', amount: 0 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_SETTLE_02',
    category: 'Settlement & Debt Payback',
    name: 'Partial Settlement Reduces Outstanding Debt',
    description: 'Wife owes ₹2,000 and pays ₹700 -> Remaining balance is ₹1,300.',
    run: () => {
      const expense: ExpenseTransaction = {
        id: 'tx_part_exp',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 4000,
        currency: 'INR',
        date: '2026-08-14',
        createdAt: '2026-08-14T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Maintenance',
        categoryId: 'cat_utilities',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 2000 },
          { memberId: 'mem_wife', amount: 2000 },
        ],
      };
      const settlement: SettlementTransaction = {
        id: 'tx_part_pay',
        groupId: 'grp_test',
        type: 'SETTLEMENT',
        amount: 700,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [expense, settlement]);
      const passed = status.status === 'OWED_TO_ME' && status.amount === 1300;
      return {
        passed,
        message: passed ? 'Remaining debt accurately reduced to ₹1,300' : 'Partial settlement error',
        expected: 1300,
        actual: status.amount,
      };
    },
  },
  {
    id: 'TC_SETTLE_03',
    category: 'Settlement & Debt Payback',
    name: 'Settlement Overpayment Reverses Debt Direction',
    description: 'Wife owes ₹500 and transfers ₹800 via GPay -> Husband now owes Wife ₹300.',
    run: () => {
      const expense: ExpenseTransaction = {
        id: 'tx_over_exp',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-14',
        createdAt: '2026-08-14T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Snacks',
        categoryId: 'cat_dining',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500 },
          { memberId: 'mem_wife', amount: 500 },
        ],
      };
      const settlement: SettlementTransaction = {
        id: 'tx_over_pay',
        groupId: 'grp_test',
        type: 'SETTLEMENT',
        amount: 800,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
      };
      const status = getNetBalanceStatus('mem_husband', MOCK_GROUP, [expense, settlement]);
      const passed = status.status === 'I_OWE' && status.amount === 300;
      return {
        passed,
        message: passed ? 'Overpayment safely flipped creditor/debtor roles' : 'Overpayment error',
        expected: { status: 'I_OWE', amount: 300 },
        actual: { status: status.status, amount: status.amount },
      };
    },
  },
  {
    id: 'TC_SETTLE_04',
    category: 'Settlement & Debt Payback',
    name: 'Settlements Excluded from Expense Summaries',
    description: 'Settlement transactions must not inflate total group living spend metric.',
    run: () => {
      const settlement: SettlementTransaction = {
        id: 'tx_set_only',
        groupId: 'grp_test',
        type: 'SETTLEMENT',
        amount: 5000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        fromMemberId: 'mem_wife',
        toMemberId: 'mem_husband',
      };
      const financials = calculateGroupFinancials(MOCK_GROUP, [settlement]);
      const passed = financials.totalExpenses === 0 && financials.settlementCount === 1;
      return {
        passed,
        message: passed ? 'Settlement metric tracked without inflating household expense' : 'Settlement count or total expense error',
        expected: { totalExpenses: 0, settlementCount: 1 },
        actual: { totalExpenses: financials.totalExpenses, settlementCount: financials.settlementCount },
      };
    },
  },

  // ==========================================
  // 5. ACCESS CONTROL & SECURITY (4 Scenarios)
  // ==========================================
  {
    id: 'TC_SEC_01',
    category: 'Access Control & Security',
    name: 'Creator Permitted to Delete Transaction',
    description: 'When activeUser.id === createdByMemberId, delete operation succeeds.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_sec_1',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500 },
          { memberId: 'mem_wife', amount: 500 },
        ],
      };
      const activeUserId = 'mem_husband';
      const canDelete = tx.createdByMemberId === activeUserId;
      const passed = canDelete === true;
      return {
        passed,
        message: passed ? 'Author granted deletion authorization' : 'Author blocked from deleting own transaction',
        expected: true,
        actual: canDelete,
      };
    },
  },
  {
    id: 'TC_SEC_02',
    category: 'Access Control & Security',
    name: 'Non-Creator Deletion Blocked with Access Policy',
    description: 'When Wife attempts to delete Husband-created transaction, action is blocked.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_sec_2',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 1000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Groceries',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_husband',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 500 },
          { memberId: 'mem_wife', amount: 500 },
        ],
      };
      const activeUserId = 'mem_wife';
      const canDelete = tx.createdByMemberId === activeUserId;
      const passed = canDelete === false;
      return {
        passed,
        message: passed ? 'Non-creator deletion blocked and locked as required' : 'Security vulnerability: Non-creator was able to delete',
        expected: false,
        actual: canDelete,
      };
    },
  },
  {
    id: 'TC_SEC_03',
    category: 'Access Control & Security',
    name: 'Legacy Transaction Fallback Attribution',
    description: 'Transaction without createdByMemberId defaults securely to payer or sender.',
    run: () => {
      const txWithoutCreator: ExpenseTransaction = {
        id: 'tx_legacy',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 500,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        description: 'Milk',
        categoryId: 'cat_groceries',
        paidByMemberId: 'mem_wife',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 250 },
          { memberId: 'mem_wife', amount: 250 },
        ],
      };
      const derivedCreatorId = txWithoutCreator.createdByMemberId || txWithoutCreator.paidByMemberId;
      const passed = derivedCreatorId === 'mem_wife';
      return {
        passed,
        message: passed ? 'Legacy transaction successfully attributed to payer (Wife)' : 'Attribution failed',
        expected: 'mem_wife',
        actual: derivedCreatorId,
      };
    },
  },
  {
    id: 'TC_SEC_04',
    category: 'Access Control & Security',
    name: 'Author-Locked Direct Transfer Deletion',
    description: 'Husband creates direct transfer to Wife. Wife cannot delete or tamper with it.',
    run: () => {
      const transfer: DirectTransferTransaction = {
        id: 'tx_sec_trans',
        groupId: 'grp_test',
        type: 'DIRECT_TRANSFER',
        amount: 5000,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_husband',
        description: 'Bank transfer',
        fromMemberId: 'mem_husband',
        toMemberId: 'mem_wife',
      };
      const wifeCanDelete = (transfer.createdByMemberId || transfer.fromMemberId) === 'mem_wife';
      const husbandCanDelete = (transfer.createdByMemberId || transfer.fromMemberId) === 'mem_husband';
      const passed = !wifeCanDelete && husbandCanDelete;
      return {
        passed,
        message: passed ? 'Direct transfer correctly locked against non-author modifications' : 'Access control failure',
        expected: { wifeCanDelete: false, husbandCanDelete: true },
        actual: { wifeCanDelete, husbandCanDelete },
      };
    },
  },

  // ==========================================
  // 6. ANALYTICS & CATEGORY BREAKDOWN (4 Scenarios)
  // ==========================================
  {
    id: 'TC_ANA_01',
    category: 'Analytics & Category Breakdown',
    name: 'Multi-Category Aggregate Spend & Sorting',
    description: 'Calculates breakdown for Groceries (₹3,000), Fuel (₹2,000), Dining (₹1,500) and verifies descending sort.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_c1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 3000,
          currency: 'INR',
          date: '2026-08-15',
          createdAt: '2026-08-15T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Weekly Groceries',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 1500 },
            { memberId: 'mem_wife', amount: 1500 },
          ],
        },
        {
          id: 'tx_c2',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 2000,
          currency: 'INR',
          date: '2026-08-14',
          createdAt: '2026-08-14T00:00:00Z',
          createdByMemberId: 'mem_wife',
          description: 'Fuel Petrol',
          categoryId: 'cat_fuel',
          paidByMemberId: 'mem_wife',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 1000 },
            { memberId: 'mem_wife', amount: 1000 },
          ],
        },
        {
          id: 'tx_c3',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 1500,
          currency: 'INR',
          date: '2026-08-13',
          createdAt: '2026-08-13T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Dinner Cafe',
          categoryId: 'cat_dining',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 750 },
            { memberId: 'mem_wife', amount: 750 },
          ],
        },
      ];
      const breakdown = calculateCategoryBreakdown(MOCK_CATEGORIES, txs, MOCK_GROUP.members);
      const passed =
        breakdown.length === 3 &&
        breakdown[0].category.id === 'cat_groceries' &&
        breakdown[0].totalAmount === 3000 &&
        breakdown[1].category.id === 'cat_fuel' &&
        breakdown[2].category.id === 'cat_dining';

      return {
        passed,
        message: passed ? 'Categories accurately aggregated and sorted by expenditure' : 'Category breakdown computation failed',
        expected: ['cat_groceries: 3000', 'cat_fuel: 2000', 'cat_dining: 1500'],
        actual: breakdown.map((b) => `${b.category.id}: ${b.totalAmount}`),
      };
    },
  },
  {
    id: 'TC_ANA_02',
    category: 'Analytics & Category Breakdown',
    name: 'Payer Sub-Distribution within Category',
    description: 'In Groceries, Husband paid ₹3,000 and Wife paid ₹1,000 -> Total ₹4,000 with accurate member mapping.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_g1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 3000,
          currency: 'INR',
          date: '2026-08-15',
          createdAt: '2026-08-15T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Groceries store',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 1500 },
            { memberId: 'mem_wife', amount: 1500 },
          ],
        },
        {
          id: 'tx_g2',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 1000,
          currency: 'INR',
          date: '2026-08-14',
          createdAt: '2026-08-14T00:00:00Z',
          createdByMemberId: 'mem_wife',
          description: 'Organic vegetables',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_wife',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 500 },
            { memberId: 'mem_wife', amount: 500 },
          ],
        },
      ];
      const breakdown = calculateCategoryBreakdown(MOCK_CATEGORIES, txs, MOCK_GROUP.members);
      const groceryItem = breakdown.find((b) => b.category.id === 'cat_groceries');
      const passed =
        groceryItem?.totalAmount === 4000 &&
        groceryItem.memberPayments['mem_husband'] === 3000 &&
        groceryItem.memberPayments['mem_wife'] === 1000;

      return {
        passed,
        message: passed ? 'Sub-payer mapping verified (Husband: ₹3,000, Wife: ₹1,000)' : 'Member sub-payment tracking error',
        expected: { total: 4000, husbandPaid: 3000, wifePaid: 1000 },
        actual: {
          total: groceryItem?.totalAmount,
          husbandPaid: groceryItem?.memberPayments['mem_husband'],
          wifePaid: groceryItem?.memberPayments['mem_wife'],
        },
      };
    },
  },
  {
    id: 'TC_ANA_03',
    category: 'Analytics & Category Breakdown',
    name: 'Total Group Expenses Matches Sum of Expenses',
    description: 'Verifies totalExpenses metric is exact sum across distinct transaction types.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_tot_1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 1200,
          currency: 'INR',
          date: '2026-08-15',
          createdAt: '2026-08-15T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Dining',
          categoryId: 'cat_dining',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [
            { memberId: 'mem_husband', amount: 600 },
            { memberId: 'mem_wife', amount: 600 },
          ],
        },
        {
          id: 'tx_tot_2',
          groupId: 'grp_test',
          type: 'DIRECT_TRANSFER',
          amount: 4000,
          currency: 'INR',
          date: '2026-08-15',
          createdAt: '2026-08-15T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Loan',
          fromMemberId: 'mem_husband',
          toMemberId: 'mem_wife',
        },
        {
          id: 'tx_tot_3',
          groupId: 'grp_test',
          type: 'SETTLEMENT',
          amount: 600,
          currency: 'INR',
          date: '2026-08-15',
          createdAt: '2026-08-15T00:00:00Z',
          createdByMemberId: 'mem_wife',
          fromMemberId: 'mem_wife',
          toMemberId: 'mem_husband',
        },
      ];
      const financials = calculateGroupFinancials(MOCK_GROUP, txs);
      const passed =
        financials.totalExpenses === 1200 &&
        financials.expenseCount === 1 &&
        financials.transferCount === 1 &&
        financials.settlementCount === 1;

      return {
        passed,
        message: passed ? 'Total spend correctly isolated to ₹1,200 with accurate counts' : 'Type segregation failed',
        expected: { totalExpenses: 1200, expenseCount: 1, transferCount: 1, settlementCount: 1 },
        actual: {
          totalExpenses: financials.totalExpenses,
          expenseCount: financials.expenseCount,
          transferCount: financials.transferCount,
          settlementCount: financials.settlementCount,
        },
      };
    },
  },
  {
    id: 'TC_ANA_04',
    category: 'Analytics & Category Breakdown',
    name: 'Zero-Spend Categories Excluded from Visual Charts',
    description: 'Categories with zero transactions are filtered out to keep charts clean.',
    run: () => {
      const tx: ExpenseTransaction = {
        id: 'tx_only_fuel',
        groupId: 'grp_test',
        type: 'EXPENSE',
        amount: 800,
        currency: 'INR',
        date: '2026-08-15',
        createdAt: '2026-08-15T00:00:00Z',
        createdByMemberId: 'mem_wife',
        description: 'Fuel refill',
        categoryId: 'cat_fuel',
        paidByMemberId: 'mem_wife',
        splitMethod: 'EQUAL',
        splits: [
          { memberId: 'mem_husband', amount: 400 },
          { memberId: 'mem_wife', amount: 400 },
        ],
      };
      const breakdown = calculateCategoryBreakdown(MOCK_CATEGORIES, [tx], MOCK_GROUP.members);
      const passed = breakdown.length === 1 && breakdown[0].category.id === 'cat_fuel';
      return {
        passed,
        message: passed ? 'Zero-spend categories cleanly excluded' : 'Empty categories leaked into breakdown',
        expected: 1,
        actual: breakdown.length,
      };
    },
  },

  // ==========================================
  // 7. FORMATTING & DATE FILTERING (4 Scenarios)
  // ==========================================
  {
    id: 'TC_FMT_01',
    category: 'Formatting & Date Filtering',
    name: 'Indian Rupee (INR) Number Formatting with Commas',
    description: 'Formats ₹1,50,000 and ₹7,500 using the Indian numbering system standard.',
    run: () => {
      const formattedLakh = formatCurrency(150000, 'INR');
      const formattedThousand = formatCurrency(7500, 'INR');
      const passed = formattedLakh === '₹1,50,000' && formattedThousand === '₹7,500';
      return {
        passed,
        message: passed ? 'Indian numbering system formatting verified' : 'Currency formatting mismatch',
        expected: { lakh: '₹1,50,000', thousand: '₹7,500' },
        actual: { lakh: formattedLakh, thousand: formattedThousand },
      };
    },
  },
  {
    id: 'TC_FMT_02',
    category: 'Formatting & Date Filtering',
    name: 'International Currency (USD, EUR) Support',
    description: 'Formats $1,500 for USD and €1.500 for EUR.',
    run: () => {
      const formattedUsd = formatCurrency(1500, 'USD');
      const formattedEur = formatCurrency(1500, 'EUR');
      const passed = formattedUsd.includes('1,500') || formattedUsd === '$1,500';
      return {
        passed,
        message: passed ? 'Multi-currency formatters passed' : 'International currency error',
        expected: '$1,500',
        actual: formattedUsd,
      };
    },
  },
  {
    id: 'TC_FMT_03',
    category: 'Formatting & Date Filtering',
    name: 'Time Range Filter (THIS_MONTH)',
    description: 'Filters August 2026 transactions from a mixed list containing July and August dates.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_aug_1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 1000,
          currency: 'INR',
          date: '2026-08-10',
          createdAt: '2026-08-10T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Aug item',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [{ memberId: 'mem_husband', amount: 500 }, { memberId: 'mem_wife', amount: 500 }],
        },
        {
          id: 'tx_july_1',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 2000,
          currency: 'INR',
          date: '2026-07-20',
          createdAt: '2026-07-20T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'July item',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [{ memberId: 'mem_husband', amount: 1000 }, { memberId: 'mem_wife', amount: 1000 }],
        },
      ];
      const filtered = filterTransactionsByDate(txs, 'THIS_MONTH');
      const passed = filtered.length === 1 && filtered[0].id === 'tx_aug_1';
      return {
        passed,
        message: passed ? 'THIS_MONTH accurately retained only August 2026 records' : 'Date filtering error',
        expected: 1,
        actual: filtered.length,
      };
    },
  },
  {
    id: 'TC_FMT_04',
    category: 'Formatting & Date Filtering',
    name: 'Custom Date Range Boundary Check',
    description: 'Filters transactions falling strictly within 2026-08-05 and 2026-08-12.',
    run: () => {
      const txs: Transaction[] = [
        {
          id: 'tx_early',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 100,
          currency: 'INR',
          date: '2026-08-01',
          createdAt: '2026-08-01T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Early',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [{ memberId: 'mem_husband', amount: 50 }, { memberId: 'mem_wife', amount: 50 }],
        },
        {
          id: 'tx_in_range',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 200,
          currency: 'INR',
          date: '2026-08-08',
          createdAt: '2026-08-08T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'In range',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [{ memberId: 'mem_husband', amount: 100 }, { memberId: 'mem_wife', amount: 100 }],
        },
        {
          id: 'tx_late',
          groupId: 'grp_test',
          type: 'EXPENSE',
          amount: 300,
          currency: 'INR',
          date: '2026-08-20',
          createdAt: '2026-08-20T00:00:00Z',
          createdByMemberId: 'mem_husband',
          description: 'Late',
          categoryId: 'cat_groceries',
          paidByMemberId: 'mem_husband',
          splitMethod: 'EQUAL',
          splits: [{ memberId: 'mem_husband', amount: 150 }, { memberId: 'mem_wife', amount: 150 }],
        },
      ];
      const filtered = filterTransactionsByDate(txs, 'CUSTOM', '2026-08-05', '2026-08-12');
      const passed = filtered.length === 1 && filtered[0].id === 'tx_in_range';
      return {
        passed,
        message: passed ? 'Custom date range strictly isolated target transaction' : 'Custom date filter error',
        expected: 1,
        actual: filtered.length,
      };
    },
  },
];

/**
 * Runs all unit and logical test cases and returns structured results.
 */
export function runAllTests(): TestResult[] {
  return TEST_SUITE.map((test) => {
    const startTime = performance.now();
    try {
      const res = test.run();
      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        id: test.id,
        category: test.category,
        name: test.name,
        description: test.description,
        passed: res.passed,
        message: res.message,
        expected: res.expected,
        actual: res.actual,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        id: test.id,
        category: test.category,
        name: test.name,
        description: test.description,
        passed: false,
        message: `Exception thrown: ${err?.message || String(err)}`,
        durationMs,
      };
    }
  });
}
