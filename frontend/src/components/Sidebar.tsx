"use client";

import { BarChart3, Building2, FlaskConical } from "lucide-react";

interface SidebarProps {
  activeTab: "models" | "simulator";
  onTabChange: (tab: "models" | "simulator") => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: "models" as const, label: "Queue Models", caption: "Analytical formulas", icon: BarChart3 },
    { id: "simulator" as const, label: "Bank Simulation", caption: "Bank environment flow", icon: Building2 },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-4 top-4 z-50 h-[calc(100vh-2rem)] w-[19rem] transition-transform duration-300 lg:left-6 lg:top-6 lg:h-[calc(100vh-3rem)] ${
          isOpen ? "translate-x-0" : "-translate-x-[125%]"
        } lg:translate-x-0`}
      >
        <div className="shell-card flex h-full flex-col p-4">
          <div>
            <p className="kicker text-[var(--accent)]">Queue OS</p>
            <h2 className="title-main mt-2 text-2xl">Control Deck</h2>
            <p className="muted mt-2 text-sm">Switch between mathematical models and simulator workflows.</p>
          </div>

          <nav className="mt-6 space-y-3">
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
                  className={`nav-btn ${isActive ? "nav-btn-active" : ""}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="rounded-xl border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="muted block text-xs">{item.caption}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto shell-card p-3">
            <p className="kicker text-[var(--muted)]">Toolkit</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <FlaskConical className="h-4 w-4 text-[var(--accent-alt)]" /> Version 3 interface
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
