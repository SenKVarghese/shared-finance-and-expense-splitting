import React, { useState } from 'react';
import {
  Smartphone,
  Code2,
  Copy,
  Check,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  Tablet,
  Layout,
  ExternalLink,
} from 'lucide-react';
import { ANDROID_SCREEN_SPECS } from '../data/androidScreenSpecs';
import { AndroidScreenSpec, BottomNavTab } from '../types';

interface AndroidGalleryViewProps {
  onLaunchScreenInPhone: (tab: BottomNavTab, extraAction?: string) => void;
}

export const AndroidGalleryView: React.FC<AndroidGalleryViewProps> = ({ onLaunchScreenInPhone }) => {
  const [selectedSpec, setSelectedSpec] = useState<AndroidScreenSpec>(ANDROID_SCREEN_SPECS[0]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Core', 'Transactions', 'Management', 'Architecture'];

  const filteredSpecs = ANDROID_SCREEN_SPECS.filter(
    (s) => filterCategory === 'ALL' || s.category === filterCategory
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedSpec.composeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchTarget = (spec: AndroidScreenSpec) => {
    switch (spec.id) {
      case 'screen_1':
      case 'screen_13':
        onLaunchScreenInPhone('group');
        break;
      case 'screen_2':
      case 'screen_3':
      case 'screen_4':
      case 'screen_5':
        onLaunchScreenInPhone('dashboard');
        break;
      case 'screen_6':
      case 'screen_7':
        onLaunchScreenInPhone('transactions');
        break;
      case 'screen_8':
        onLaunchScreenInPhone('add', 'expense');
        break;
      case 'screen_9':
        onLaunchScreenInPhone('dashboard', 'settle');
        break;
      case 'screen_10':
        onLaunchScreenInPhone('add', 'transfer');
        break;
      case 'screen_11':
        onLaunchScreenInPhone('accounts');
        break;
      case 'screen_12':
        onLaunchScreenInPhone('accounts');
        break;
      default:
        onLaunchScreenInPhone('dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Guide Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Smartphone className="w-4 h-4" />
              <span>Android Material 3 Architecture & Screen Blueprints</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Screen Samples & Implementation Guide
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Complete Jetpack Compose blueprints, UI hierarchy, and calculation algorithms adhering to all 49 functional requirements for the two-person Shared Finance application.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
              Jetpack Compose 1.7 + Material 3
            </span>
          </div>
        </div>
      </div>

      {/* Screen Selector Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-2xl font-bold transition ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat} Screens
          </button>
        ))}
      </div>

      {/* Main Spec & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Screen Samples List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredSpecs.map((spec) => {
            const isSelected = selectedSpec.id === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedSpec(spec)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                      {spec.screenNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{spec.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {spec.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{spec.subtitle}</p>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {spec.materialTokens.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchTarget(spec);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center hover:underline"
                  >
                    <span>Test Live</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Spec Inspector & Jetpack Compose Blueprint (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Screen #{selectedSpec.screenNumber} · {selectedSpec.category}
                </span>
                <span className="text-xs text-slate-400">Android MVP Blueprint</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">{selectedSpec.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedSpec.description}</p>
            </div>

            <button
              onClick={() => handleLaunchTarget(selectedSpec)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch on Mobile</span>
            </button>
          </div>

          {/* Key Functional Capabilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Screen Capabilities & Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedSpec.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material 3 Design Tokens */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Material 3 UI Tokens</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedSpec.materialTokens.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Jetpack Compose Kotlin Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span>Jetpack Compose Kotlin Code</span>
              </h4>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
              <pre>{selectedSpec.composeSnippet}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Android Architectural Stack Blueprint */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Recommended Android Architecture (Kotlin + Jetpack)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">1. UI Layer (Compose)</div>
            <p className="text-slate-500 text-[11px]">
              Single-Activity architecture with Jetpack Navigation Compose, Material 3 Scaffold, BottomNavigation & BottomSheetScaffold.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">2. State & Netting Engine</div>
            <p className="text-slate-500 text-[11px]">
              FinanceViewModel exposing reactive StateFlow of FinancialSummary using Kotlin Coroutines for immediate recalculation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">3. Local Database (Room)</div>
            <p className="text-slate-500 text-[11px]">
              Entities: `ExpenseEntity`, `SplitShareEntity`, `SettlementEntity`, `DirectTransferEntity`, `AccountEntity`.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">4. Partner Sync Engine</div>
            <p className="text-slate-500 text-[11px]">
              Cloud Firestore / Kotlin Multiplatform WebSocket layer syncing transaction events between Device A & Device B.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
