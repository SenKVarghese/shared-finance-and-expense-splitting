import { Category, Group, Member, NetBalance, PersonSummary, TimeRange, Transaction } from '../types';

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const rounded = Math.round(amount * 100) / 100;
  if (currency === 'INR') {
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
  if (currency === 'USD') {
    return `$${rounded.toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${rounded.toLocaleString('de-DE')}`;
  }
  return `${currency} ${rounded.toLocaleString()}`;
}

export function filterTransactionsByDate(
  transactions: Transaction[],
  timeRange: TimeRange,
  customStart?: string,
  customEnd?: string
): Transaction[] {
  if (timeRange === 'ALL_TIME') return transactions;

  const now = new Date('2026-08-15T00:00:00Z');
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date + 'T00:00:00Z');

    switch (timeRange) {
      case 'THIS_WEEK': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return txDate >= startOfWeek && txDate <= now;
      }
      case 'THIS_MONTH': {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }
      case 'LAST_MONTH': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return txDate.getFullYear() === lastMonthYear && txDate.getMonth() === lastMonth;
      }
      case 'THIS_YEAR': {
        return txDate.getFullYear() === currentYear;
      }
      case 'CUSTOM': {
        if (!customStart || !customEnd) return true;
        const start = new Date(customStart + 'T00:00:00Z');
        const end = new Date(customEnd + 'T23:59:59Z');
        return txDate >= start && txDate <= end;
      }
      default:
        return true;
    }
  });
}

/**
 * Calculates net balance between two primary members.
 * Positive returned value means memberB owes memberA.
 * Negative means memberA owes memberB.
 */
export function calculatePairNetBalance(
  memberAId: string,
  memberBId: string,
  transactions: Transaction[]
): { netOwedToA: number; bOwesA: number; aOwesB: number } {
  let bOwesA = 0; // Total raw amount B should pay A
  let aOwesB = 0; // Total raw amount A should pay B

  for (const tx of transactions) {
    if (tx.type === 'EXPENSE') {
      if (tx.paidByMemberId === memberAId) {
        const bSplit = tx.splits.find((s) => s.memberId === memberBId);
        if (bSplit) bOwesA += bSplit.amount;
      } else if (tx.paidByMemberId === memberBId) {
        const aSplit = tx.splits.find((s) => s.memberId === memberAId);
        if (aSplit) aOwesB += aSplit.amount;
      }
    } else if (tx.type === 'DIRECT_TRANSFER') {
      if (tx.fromMemberId === memberAId && tx.toMemberId === memberBId) {
        bOwesA += tx.amount;
      } else if (tx.fromMemberId === memberBId && tx.toMemberId === memberAId) {
        aOwesB += tx.amount;
      }
    } else if (tx.type === 'SETTLEMENT') {
      // If B settles with A, it reduces B's debt to A
      if (tx.fromMemberId === memberBId && tx.toMemberId === memberAId) {
        bOwesA -= tx.amount;
      }
      // If A settles with B, it reduces A's debt to B
      else if (tx.fromMemberId === memberAId && tx.toMemberId === memberBId) {
        aOwesB -= tx.amount;
      }
    }
  }

  const netOwedToA = bOwesA - aOwesB;
  return { netOwedToA, bOwesA, aOwesB };
}

/**
 * Generates formatted NetBalance object from active user perspective.
 */
export function getNetBalanceStatus(
  currentUserId: string,
  group: Group,
  transactions: Transaction[]
): NetBalance {
  const otherMember = group.members.find((m) => m.id !== currentUserId) || group.members[1] || group.members[0];
  const currentUser = group.members.find((m) => m.id === currentUserId) || group.members[0];

  if (!otherMember || otherMember.id === currentUser.id) {
    return {
      fromMemberId: currentUser.id,
      toMemberId: currentUser.id,
      amount: 0,
      displayText: 'All Settled up',
      status: 'SETTLED',
    };
  }

  const { netOwedToA } = calculatePairNetBalance(currentUser.id, otherMember.id, transactions);

  if (Math.abs(netOwedToA) < 0.01) {
    return {
      fromMemberId: otherMember.id,
      toMemberId: currentUser.id,
      amount: 0,
      displayText: 'All Settled up',
      status: 'SETTLED',
    };
  }

  if (netOwedToA > 0) {
    return {
      fromMemberId: otherMember.id,
      toMemberId: currentUser.id,
      amount: netOwedToA,
      displayText: `${otherMember.name} owes ${currentUser.name} ${formatCurrency(netOwedToA, group.currency)}`,
      status: 'OWED_TO_ME',
    };
  }

  const absAmount = Math.abs(netOwedToA);
  return {
    fromMemberId: currentUser.id,
    toMemberId: otherMember.id,
    amount: absAmount,
    displayText: `${currentUser.name} owes ${otherMember.name} ${formatCurrency(absAmount, group.currency)}`,
    status: 'I_OWE',
  };
}

export function calculateGroupFinancials(
  group: Group,
  transactions: Transaction[]
) {
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const memberSummaries: PersonSummary[] = group.members.map((member) => {
    let totalPaid = 0;
    let personalShare = 0;
    let transfersSent = 0;
    let transfersReceived = 0;
    let settlementsPaid = 0;
    let settlementsReceived = 0;

    for (const tx of transactions) {
      if (tx.type === 'EXPENSE') {
        if (tx.paidByMemberId === member.id) {
          totalPaid += tx.amount;
        }
        const split = tx.splits.find((s) => s.memberId === member.id);
        if (split) {
          personalShare += split.amount;
        }
      } else if (tx.type === 'DIRECT_TRANSFER') {
        if (tx.fromMemberId === member.id) transfersSent += tx.amount;
        if (tx.toMemberId === member.id) transfersReceived += tx.amount;
      } else if (tx.type === 'SETTLEMENT') {
        if (tx.fromMemberId === member.id) settlementsPaid += tx.amount;
        if (tx.toMemberId === member.id) settlementsReceived += tx.amount;
      }
    }

    // Net position: paid + sent + received settlements - personal share - received transfers - paid settlements
    const netPosition =
      totalPaid -
      personalShare +
      transfersSent -
      transfersReceived +
      settlementsReceived -
      settlementsPaid;

    return {
      member,
      totalPaid,
      personalShare,
      transfersSent,
      transfersReceived,
      settlementsPaid,
      settlementsReceived,
      netPosition,
    };
  });

  return {
    totalExpenses,
    memberSummaries,
    expenseCount: expenseTransactions.length,
    settlementCount: transactions.filter((t) => t.type === 'SETTLEMENT').length,
    transferCount: transactions.filter((t) => t.type === 'DIRECT_TRANSFER').length,
  };
}

export function calculateCategoryBreakdown(
  categories: Category[],
  transactions: Transaction[],
  members: Member[]
) {
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryMap = new Map<
    string,
    {
      category: Category;
      totalAmount: number;
      memberPayments: Record<string, number>;
      transactionCount: number;
    }
  >();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      category: cat,
      totalAmount: 0,
      memberPayments: members.reduce((acc, m) => ({ ...acc, [m.id]: 0 }), {}),
      transactionCount: 0,
    });
  });

  expenseTransactions.forEach((tx) => {
    const entry = categoryMap.get(tx.categoryId);
    if (entry) {
      entry.totalAmount += tx.amount;
      entry.transactionCount += 1;
      if (entry.memberPayments[tx.paidByMemberId] !== undefined) {
        entry.memberPayments[tx.paidByMemberId] += tx.amount;
      }
    }
  });

  return Array.from(categoryMap.values())
    .filter((c) => c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}
