import React from "react";
import { useCurrency, Currency, CURRENCY_SYMBOLS } from "../../context/CurrencyContext";

export const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const currencies: Currency[] = ["USD", "GBP", "EUR", "JPY", "CAD", "AUD", "INR", "CHF"];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Currency:</span>
      <div className="flex gap-1 flex-wrap">
        {currencies.map((currency) => (
          <button
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              selectedCurrency === currency
                ? "bg-accent text-white shadow-lg shadow-accent/30"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
            }`}
            title={currency}
          >
            {CURRENCY_SYMBOLS[currency]}
          </button>
        ))}
      </div>
    </div>
  );
};
