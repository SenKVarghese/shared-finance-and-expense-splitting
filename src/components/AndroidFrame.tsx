import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  showBottomNav?: boolean;
  activeUserName?: string;
  themeColor?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange,
  showBottomNav = true,
  activeUserName = 'Sen',
}) => {
  return (
    <div className="relative mx-auto w-full max-w-[412px] h-[860px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 flex flex-col justify-between select-none overflow-hidden transition-all duration-300">
      {/* Outer Phone Bezel Border Highlights */}
      <div className="absolute inset-0 rounded-[44px] pointer-events-none border border-slate-700/40 shadow-inner" />

      {/* Screen Container */}
      <div className="relative w-full h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[36px] overflow-hidden flex flex-col justify-between shadow-sm">
        {/* Android Status Bar */}
        <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 bg-inherit z-30 shrink-0">
          <span className="font-mono tracking-tight">09:41</span>

          {/* Android Punch Hole Camera */}
          <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-slate-800/60 shadow-sm" />

          <div className="flex items-center space-x-1.5 opacity-90">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Android Screen Body Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
          {children}
        </div>

        {/* Android Gesture Navigation Pill Bar */}
        <div className="h-4 w-full bg-inherit flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
