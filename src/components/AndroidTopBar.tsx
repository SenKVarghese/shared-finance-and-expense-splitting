import React, { useState } from 'react';
import { ChevronDown, RefreshCw, UserCheck, Check, Sparkles, Smartphone } from 'lucide-react';
import { Group, Member } from '../types';

interface AndroidTopBarProps {
  currentGroup: Group;
  allGroups: Group[];
  onSelectGroup: (group: Group) => void;
  currentUser: Member;
  allMembers: Member[];
  onSwitchUser: (member: Member) => void;
  onOpenSettleModal?: () => void;
  isSynced?: boolean;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  currentGroup,
  allGroups,
  onSelectGroup,
  currentUser,
  allMembers,
  onSwitchUser,
  isSynced = true,
}) => {
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Group Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowGroupMenu(!showGroupMenu);
            setShowUserMenu(false);
          }}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-left"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 max-w-[130px] truncate">
            {currentGroup.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {showGroupMenu && (
          <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Group Ledger
            </div>
            {allGroups.map((grp) => (
              <button
                key={grp.id}
                onClick={() => {
                  onSelectGroup(grp);
                  setShowGroupMenu(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  grp.id === currentGroup.id ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs">{grp.name}</div>
                  <div className="text-[10px] text-slate-400">{grp.members.length} members · {grp.currency}</div>
                </div>
                {grp.id === currentGroup.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Device/User Switcher & Sync */}
      <div className="flex items-center space-x-2">
        {/* Device Switcher (Sen vs Wife perspective) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowGroupMenu(false);
            }}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-400 shadow-xs"
            title="Switch Viewing Perspective (Phone User)"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.initials}
            </div>
            <span className="font-medium text-xs hidden sm:inline">{currentUser.name}</span>
            <Smartphone className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 animate-in fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Viewing Device As
              </div>
              {allMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    onSwitchUser(member);
                    setShowUserMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    member.id === currentUser.id ? 'font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{member.name}'s Android Phone</div>
                      <div className="text-[10px] text-slate-400">{member.role === 'admin' ? 'Owner' : 'Partner'}</div>
                    </div>
                  </div>
                  {member.id === currentUser.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
