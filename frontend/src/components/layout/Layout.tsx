import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar, MobileTabs } from "./Sidebar";

interface Tab {
  id: string;
  label: string;
}

interface LayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <Navbar />
      <MobileTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex flex-1">
        <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
