import { AndroidScreenSpec } from '../types';

export const ANDROID_SCREEN_SPECS: AndroidScreenSpec[] = [
  {
    id: 'screen_1',
    screenNumber: 1,
    title: 'Group Selection & Switcher',
    subtitle: 'Manage and toggle between Family, Trips, and Shared Circles',
    category: 'Core',
    description: 'Allows seamless switching between active group ledgers (e.g. Family, Goa Trip) with instant net balance badges and pairing code status.',
    materialTokens: ['TopAppBar', 'ElevatedCard', 'FilterChip', 'ModalBottomSheet', 'SurfaceContainerHigh'],
    composeSnippet: `@Composable
fun GroupSelectionScreen(
    groups: List<Group>,
    activeGroup: Group,
    onSelectGroup: (Group) -> Unit,
    onCreateGroup: () -> Unit
) {
    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("Select Group", style = MaterialTheme.typography.titleLarge) }) }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(groups) { group ->
                GroupCard(group = group, isSelected = group.id == activeGroup.id, onClick = { onSelectGroup(group) })
            }
        }
    }
}`,
    keyFeatures: [
      'Visual badge showing outstanding net balance per group',
      'One-tap switch with animated layout transition',
      'QR / Pairing code generator button for partner sync',
    ],
  },
  {
    id: 'screen_2',
    screenNumber: 2,
    title: 'Dashboard — Overview Tab',
    subtitle: 'Primary financial hub with Total Group Spend & Net Balance',
    category: 'Core',
    description: 'The executive view displaying the single reciprocal net balance (e.g., "Wife owes Husband ₹3,750"), total group spend, individual contributions, and quick action chips.',
    materialTokens: ['FilledTonalCard', 'PrimaryTabRow', 'AssistChip', 'ExtendedFloatingActionButton'],
    composeSnippet: `@Composable
fun DashboardOverviewTab(
    summary: GroupFinancialSummary,
    netBalance: NetBalance,
    onSettleUp: () -> Unit,
    onAddExpense: () -> Unit
) {
    Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
        // High-contrast Net Balance Banner
        NetBalanceBanner(netBalance = netBalance, onSettleClick = onSettleUp)
        
        // Total Group Spend Card with Progress indicator
        TotalSpendMetricCard(total = summary.totalExpenses, currency = "INR")
        
        // Contribution split bars for Husband and Wife
        MemberContributionBars(members = summary.memberSummaries)
    }
}`,
    keyFeatures: [
      'Single reciprocal Net Balance pill (Never shows confusing double balances)',
      'Quick "Settle Up" action trigger when balance > 0',
      'Time period chip switcher (This Month, Last Month, This Year)',
    ],
  },
  {
    id: 'screen_3',
    screenNumber: 3,
    title: 'Dashboard — People View',
    subtitle: 'Person-wise breakdown of amounts paid, shares, and positions',
    category: 'Core',
    description: 'Displays deep breakdown per partner: Total Paid, Personal Share, Direct Loans sent/received, and net creditor/debtor standing.',
    materialTokens: ['OutlinedCard', 'LinearProgressIndicator', 'Badge', 'ListItem'],
    composeSnippet: `@Composable
fun DashboardPeopleTab(memberSummaries: List<PersonSummary>) {
    LazyColumn(modifier = Modifier.fillMaxSize()) {
        items(memberSummaries) { person ->
            PersonFinancialCard(
                name = person.member.name,
                totalPaid = person.totalPaid,
                share = person.personalShare,
                netPosition = person.netPosition
            )
        }
    }
}`,
    keyFeatures: [
      'Side-by-side comparison of Paid vs Fair Share',
      'Payment source distribution per member',
      'Direct transfer & loan audit trail',
    ],
  },
  {
    id: 'screen_4',
    screenNumber: 4,
    title: 'Dashboard — Categories View',
    subtitle: 'Visual categorization of shared household expenses',
    category: 'Core',
    description: 'Category hierarchy ranking Groceries, Fuel, Dining, Rent, and Utilities with percentage rollups and drill-down into category transactions.',
    materialTokens: ['SegmentedButton', 'FilledCard', 'Icon', 'ProgressIndicator'],
    composeSnippet: `@Composable
fun DashboardCategoriesTab(categories: List<CategorySpend>) {
    LazyColumn {
        items(categories) { item ->
            CategoryProgressRow(
                category = item.category,
                amount = item.totalAmount,
                husbandPaid = item.husbandPaid,
                wifePaid = item.wifePaid
            )
        }
    }
}`,
    keyFeatures: [
      'Visual color-coded spending distribution',
      'Payer breakdown within each category (e.g. Husband paid ₹7,500, Wife paid ₹5,000)',
      'Tap to filter transactions screen by selected category',
    ],
  },
  {
    id: 'screen_5',
    screenNumber: 5,
    title: 'Dashboard — Trends & Time View',
    subtitle: 'Monthly comparison and temporal financial trajectory',
    category: 'Core',
    description: 'Compare spending across This Week, This Month, Last Month, and Year-to-Date with interactive bar distribution.',
    materialTokens: ['DateRangePicker', 'Canvas', 'FilledTonalButton'],
    composeSnippet: `@Composable
fun DashboardTrendsTab(monthlyTrends: List<MonthlySpend>) {
    Column {
        TimeRangeSelectorRow(selected = TimeRange.THIS_MONTH)
        SpendingBarChart(data = monthlyTrends)
        SummaryComparisonRow(currentMonth = 42500, previousMonth = 38200)
    }
}`,
    keyFeatures: [
      'Time period selector with custom range date picker',
      'Month-over-month change percentage indicator',
      'Average daily burn rate calculation',
    ],
  },
  {
    id: 'screen_6',
    screenNumber: 6,
    title: 'Transactions Feed & Filter',
    subtitle: 'Unified ledger for Expenses, Settlements, and Transfers',
    category: 'Transactions',
    description: 'Complete searchable and filterable transaction list with tabs for All, Expenses, Settlements, and Direct Transfers.',
    materialTokens: ['SearchBar', 'FilterChipGroup', 'SwipeToDismissBox', 'StickyHeader'],
    composeSnippet: `@Composable
fun TransactionsScreen(
    transactions: List<Transaction>,
    selectedTab: TransactionFilterTab,
    onSearch: (String) -> Unit
) {
    Scaffold {
        Column {
            AndroidSearchBar(query = searchQuery, onQueryChange = onSearch)
            FilterChips(types = listOf("All", "Expenses", "Settlements", "Transfers"))
            TransactionGroupedList(transactions = transactions)
        }
    }
}`,
    keyFeatures: [
      'Instant search by description, category, or payment account',
      'Date grouped ledger (Today, Yesterday, Aug 10...)',
      'Swipe actions for quick edit or delete',
    ],
  },
  {
    id: 'screen_7',
    screenNumber: 7,
    title: 'Transaction Details Sheet',
    subtitle: 'Full metadata, split math, account used, and edit/delete actions',
    category: 'Transactions',
    description: 'Detailed inspection sheet showing exact payer, payment account (e.g. HDFC Credit Card), exact split proportions, notes, and deletion with confirmation dialog.',
    materialTokens: ['ModalBottomSheet', 'AlertDialog', 'IconButton', 'HorizontalDivider'],
    composeSnippet: `@Composable
fun TransactionDetailSheet(
    tx: Transaction,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    ModalBottomSheet {
        TransactionHeader(amount = tx.amount, title = tx.description)
        PayerAccountSection(payer = tx.paidBy, account = tx.account)
        SplitCalculationBreakdown(splits = tx.splits)
        ActionButtonsRow(onEdit = onEdit, onDelete = onDelete)
    }
}`,
    keyFeatures: [
      'Clear split math breakdown (50/50, 60/40, or exact amounts)',
      'Account source tag (HDFC, ICICI, SBI, UPI, Cash)',
      'Safe deletion with confirmation modal recalculating net balance',
    ],
  },
  {
    id: 'screen_8',
    screenNumber: 8,
    title: 'Add / Edit Expense Screen',
    subtitle: 'Intuitive split selector with Equal, %, and Exact Amount engines',
    category: 'Transactions',
    description: 'The core transaction creator. Enter amount in INR, select payer, choose optional payment account, pick category, and select split method with live validation.',
    materialTokens: ['OutlinedTextField', 'RadioButtonGroup', 'SegmentedButton', 'ExposedDropdownMenu'],
    composeSnippet: `@Composable
fun AddExpenseScreen(
    group: Group,
    onSaveExpense: (ExpenseDraft) -> Unit
) {
    var amount by remember { mutableStateOf("") }
    var splitMethod by remember { mutableStateOf(SplitMethod.EQUAL) }
    
    Column(modifier = Modifier.padding(16.dp)) {
        AmountInputField(value = amount, currency = "₹")
        DescriptionAndCategoryRow()
        PayerSelectionRow(members = group.members)
        AccountDropdownSelector()
        SplitMethodSegmentedTabs(selected = splitMethod)
        SplitAdjustmentEngine(method = splitMethod, amount = amount.toDoubleOrNull() ?: 0.0)
    }
}`,
    keyFeatures: [
      'Big numeric keypad friendly amount input',
      'Equal split auto-halves the amount',
      'Percentage split ensures exact 100% sum validation',
      'Exact amount split enforces shares equal total expense',
    ],
  },
  {
    id: 'screen_9',
    screenNumber: 9,
    title: 'Settlement & Partial Settle Screen',
    subtitle: 'Clear debt without modifying historical expense records',
    category: 'Transactions',
    description: 'Settlement screen showing current net debt, customizable settlement amount slider/input, remaining balance preview, and one-tap full settlement.',
    materialTokens: ['Slider', 'FilledButton', 'Card', 'Badge'],
    composeSnippet: `@Composable
fun SettleUpScreen(
    currentDebt: Double,
    debtorName: String,
    creditorName: String,
    onConfirmSettlement: (Double, Account?) -> Unit
) {
    var settleAmount by remember { mutableStateOf(currentDebt) }
    
    Column {
        DebtSummaryHeader(debtor = debtorName, creditor = creditorName, total = currentDebt)
        SettlementAmountSlider(value = settleAmount, max = currentDebt, onValueChange = { settleAmount = it })
        RemainingBalancePreview(remaining = currentDebt - settleAmount)
        ConfirmSettlementButton(onClick = { onConfirmSettlement(settleAmount, selectedAccount) })
    }
}`,
    keyFeatures: [
      'Enforces max settlement cannot exceed outstanding debt',
      'Partial settlement slider with real-time remaining balance preview',
      'Records a permanent settlement entry in ledger without mutating historical expenses',
    ],
  },
  {
    id: 'screen_10',
    screenNumber: 10,
    title: 'Add Direct Transfer / Loan',
    subtitle: 'Direct member-to-member money lending separate from expense splits',
    category: 'Transactions',
    description: 'Record non-expense transfers (e.g. Husband gives Wife ₹10,000 loan) that adjust net balance directly without skewing grocery/dining statistics.',
    materialTokens: ['ElevatedCard', 'DropdownMenu', 'OutlinedTextField', 'FilledTonalButton'],
    composeSnippet: `@Composable
fun AddDirectTransferScreen(
    members: List<Member>,
    onSaveTransfer: (TransferDraft) -> Unit
) {
    Column {
        TransferDirectionSelector(from = sender, to = receiver)
        AmountInputField(value = amount)
        TransferPurposeField(label = "Loan / Transfer Reason")
        AccountSelectorField()
        SubmitButton(label = "Record Transfer")
    }
}`,
    keyFeatures: [
      'Clear directional indicator (Husband ➔ Wife or Wife ➔ Husband)',
      'Tagged as direct transfer so it does not inflate shared living expenses',
      'Eligible for direct or partial settlement later',
    ],
  },
  {
    id: 'screen_11',
    screenNumber: 11,
    title: 'Payment Accounts Manager',
    subtitle: 'Personal credit cards, bank accounts, UPI IDs, and cash wallets',
    category: 'Management',
    description: 'Manage payment instruments per member (HDFC CC, SBI Bank, ICICI Bank, UPI, Cash) to track payment origins without altering split balances.',
    materialTokens: ['ElevatedCard', 'IconToggleButton', 'FloatingActionButton', 'ListItem'],
    composeSnippet: `@Composable
fun AccountsScreen(
    accounts: List<Account>,
    members: List<Member>,
    onAddAccount: () -> Unit
) {
    LazyColumn {
        members.forEach { member ->
            item { MemberAccountSectionHeader(member = member) }
            items(accounts.filter { it.ownerMemberId == member.id }) { acc ->
                AccountCard(account = acc)
            }
        }
    }
}`,
    keyFeatures: [
      'Grouped by member (Husband’s accounts vs Wife’s accounts)',
      'Account types: Credit Card, Bank Account, UPI, Cash, Wallet',
      'Toggle active/inactive status without breaking past transactions',
    ],
  },
  {
    id: 'screen_12',
    screenNumber: 12,
    title: 'Categories & Custom Tags',
    subtitle: 'Manage default categories and create custom expense buckets',
    category: 'Management',
    description: 'Configure household categories with Material icons and colors. Add custom categories like "Pet Expenses", "Vacation", or "Home Renovation".',
    materialTokens: ['FlowRow', 'AssistChip', 'ColorPicker', 'AlertDialog'],
    composeSnippet: `@Composable
fun CategoriesScreen(
    categories: List<Category>,
    onAddCustomCategory: (String, String, Color) -> Unit
) {
    LazyVerticalGrid(columns = GridCells.Fixed(2)) {
        items(categories) { cat ->
            CategoryCard(category = cat)
        }
    }
}`,
    keyFeatures: [
      'Default categories pre-loaded (Groceries, Fuel, Dining, Rent, Utilities)',
      'Custom category creation with color and icon picker',
      'Real-time spending counter next to each category',
    ],
  },
  {
    id: 'screen_13',
    screenNumber: 13,
    title: 'Group Settings & Member Pairing',
    subtitle: 'Two-device synchronization code & multi-member foundation',
    category: 'Architecture',
    description: 'View group details, member roles, invite pairing code ("PAIR-7729-COUPLE"), and simulated two-device live synchronization.',
    materialTokens: ['Card', 'QrCodeImage', 'OutlinedButton', 'Badge'],
    composeSnippet: `@Composable
fun GroupMembersScreen(
    group: Group,
    onShareInviteCode: (String) -> Unit
) {
    Column {
        GroupHeaderCard(name = group.name, memberCount = group.members.size)
        MemberList(members = group.members)
        PairingCodeSection(code = group.inviteCode, onShare = onShareInviteCode)
        TwoDeviceSyncSimulationBanner()
    }
}`,
    keyFeatures: [
      'Unique pairing code for connecting Partner’s Android phone',
      'Extensible data structure ready for multi-member groups (Phase 2)',
      'Device sync status indicator (Connected & Synced)',
    ],
  },
];
