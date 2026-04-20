import React from "react";
import { CurrencySelector } from "./CurrencySelector";

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">$</span>
            </div>
            <h1 className="text-xl font-bold text-white">Wealth Planning</h1>
          </div>
          <div className="flex items-center gap-6">
            <CurrencySelector />
            <div className="text-slate-400 text-sm whitespace-nowrap">Financial Calculator</div>
          </div>
        </div>
      </div>
    </nav>
  );
};
