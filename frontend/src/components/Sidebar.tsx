"use client";

import { Workflow } from 'lucide-react';

export type AppTab = 'models';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'models' as const, label: 'Queueing Models', icon: Workflow },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex flex-col z-50
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* App Title & Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-white">Queueing Models</p>
            <p className="text-[11px] text-slate-400">Analysis workspace</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
               <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-300 font-semibold text-sm group relative overflow-hidden
                  ${
                    isActive
                  ? 'text-cyan-700 dark:text-cyan-300 shadow-sm bg-cyan-50 dark:bg-cyan-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="h-1.5 w-full rounded-full bg-white/5">
            <div className="h-1.5 w-16 rounded-full bg-cyan-400/80" />
          </div>
        </div>
      </aside>
    </>
  );
}
