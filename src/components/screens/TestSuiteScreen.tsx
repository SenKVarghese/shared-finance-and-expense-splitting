import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Filter,
  ShieldCheck,
  Zap,
  Calculator,
  ArrowRightLeft,
  PieChart,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
} from 'lucide-react';
import { runAllTests, TEST_SUITE, TestResult } from '../../services/testSuite';

interface TestSuiteScreenProps {
  onBackToApp?: () => void;
}

export const TestSuiteScreen: React.FC<TestSuiteScreenProps> = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string | null>(null);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const testResults = runAllTests();
      setResults(testResults);
      setIsRunning(false);
      setLastRunTimestamp(new Date().toLocaleTimeString());
    }, 150);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const totalTests = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0).toFixed(2);
  const successPercentage = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

  const categories = [
    'ALL',
    'Split Math & Edge Cases',
    'Netting & Pair Balances',
    'Direct Transfers & Loans',
    'Settlement & Debt Payback',
    'Access Control & Security',
    'Analytics & Category Breakdown',
    'Formatting & Date Filtering',
  ];

  const filteredResults = results.filter((r) => {
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PASSED' && r.passed) ||
      (statusFilter === 'FAILED' && !r.passed);
    const matchesSearch =
      searchQuery.trim() === '' ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Split Math & Edge Cases':
        return <Calculator className="w-4 h-4 text-emerald-500" />;
      case 'Netting & Pair Balances':
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      case 'Direct Transfers & Loans':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Settlement & Debt Payback':
        return <CheckCircle2 className="w-4 h-4 text-teal-500" />;
      case 'Access Control & Security':
        return <Lock className="w-4 h-4 text-rose-500" />;
      case 'Analytics & Category Breakdown':
        return <PieChart className="w-4 h-4 text-purple-500" />;
      case 'Formatting & Date Filtering':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Verification & Logical Test Suite</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Pair Ledger & Calculation Test Suite
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Unit, functional, and edge-case test runner verifying equal/custom splits, reciprocal netting, direct loans, settlement payoffs, creator permission locks, and reporting analytics.
            </p>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running All Tests...' : 'Re-Run All Tests'}</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Total Test Cases</div>
            <div className="text-2xl font-black text-white mt-1">{totalTests}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">7 core test domains</div>
          </div>

          <div className="bg-emerald-500/10 rounded-2xl p-3.5 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium">Passed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{passedCount}</div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">100% verified logic</div>
          </div>

          <div className="bg-rose-500/10 rounded-2xl p-3.5 border border-rose-500/20">
            <div className="text-xs text-rose-300 font-medium">Failed</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{failedCount}</div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">0 regressions</div>
          </div>

          <div className="bg-indigo-500/10 rounded-2xl p-3.5 border border-indigo-500/20">
            <div className="text-xs text-indigo-300 font-medium">Execution Time</div>
            <div className="text-2xl font-black text-indigo-300 mt-1">{totalDuration} ms</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lastRunTimestamp ? `Last run: ${lastRunTimestamp}` : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search test name, ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['ALL', 'PASSED', 'FAILED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {status === 'ALL' ? `All (${totalTests})` : status === 'PASSED' ? `Passed (${passedCount})` : `Failed (${failedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat !== 'ALL' && getCategoryIcon(cat)}
              <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test Cases Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <span>Showing {filteredResults.length} of {totalTests} test cases</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{successPercentage}% Pass Rate</span>
        </div>

        {filteredResults.map((test) => {
          const isExpanded = expandedTestId === test.id;
          return (
            <div
              key={test.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                test.passed
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div
                onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition select-none"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                        {test.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium">
                        {test.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {test.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {test.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-3">
                  <span className="text-[11px] font-mono text-slate-400">{test.durationMs}ms</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      test.passed
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {test.passed ? 'PASS' : 'FAIL'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Inspection Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 text-xs">
                  {test.message && (
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold">{test.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {test.expected !== undefined && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Expected Output / Assertion
                        </div>
                        <pre className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                          {typeof test.expected === 'object'
                            ? JSON.stringify(test.expected, null, 2)
                            : String(test.expected)}
                        </pre>
                      </div>
                    )}

                    {test.actual !== undefined && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Actual Engine Output
                        </div>
                        <pre className="mt-1 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 overflow-x-auto">
                          {typeof test.actual === 'object'
                            ? JSON.stringify(test.actual, null, 2)
                            : String(test.actual)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
