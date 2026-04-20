import React from "react";

interface Tab {
  id: string;
  label: string;
}

interface SidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 hidden md:block">
      <div className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
              activeTab === tab.id
                ? "bg-accent text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="md:hidden bg-slate-800 border-b border-slate-700 p-2 flex gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-accent text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
