import React, { useState } from 'react';
import {
  Users2,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Share2,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Group, Member } from '../../types';

interface GroupMembersScreenProps {
  currentGroup: Group;
  currentUser: Member;
  onOpenTwoDeviceSimulator: () => void;
}

export const GroupMembersScreen: React.FC<GroupMembersScreenProps> = ({
  currentGroup,
  currentUser,
  onOpenTwoDeviceSimulator,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentGroup.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Group Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
            {currentGroup.name[0]}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{currentGroup.name} Group</h2>
            <p className="text-xs text-slate-400">{currentGroup.description || 'Shared finance ledger'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Base Currency</span>
            <div className="font-bold text-slate-800 dark:text-slate-200">{currentGroup.currency} (₹)</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Active Members</span>
            <div className="font-bold text-slate-800 dark:text-slate-200">{currentGroup.members.length} People</div>
          </div>
        </div>
      </div>

      {/* Member Cards (Section 2.2 & 30) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Group Members</div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
          {currentGroup.members.map((member) => (
            <div key={member.id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs text-sm"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <span>{member.name}</span>
                    {member.id === currentUser.id && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {member.role === 'admin' ? 'Group Admin & Owner' : 'Shared Member'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Synced</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Pairing & Invite Code (Section 31 - Connecting Two Devices) */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl p-5 border border-indigo-200 dark:border-indigo-800/60 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
          <QrCode className="w-4 h-4" />
          <span>Device Pairing Code</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Share this invite code with your partner to connect their Android phone to this shared ledger.
        </p>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
          <span>{currentGroup.inviteCode}</span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 transition flex items-center space-x-1 text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Live Dual-Phone Simulator Trigger */}
        <button
          onClick={onOpenTwoDeviceSimulator}
          className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>Open Dual-Phone Live Sync Preview</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
