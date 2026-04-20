import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "USD" | "GBP" | "EUR" | "JPY" | "CAD" | "AUD" | "INR" | "CHF";

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  exchangeRates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to USD (1 USD = X in other currency)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  GBP: 0.79, // 1 USD = 0.79 GBP
  EUR: 0.92, // 1 USD = 0.92 EUR
  JPY: 149.5, // 1 USD = 149.5 JPY
  CAD: 1.36, // 1 USD = 1.36 CAD
  AUD: 1.53, // 1 USD = 1.53 AUD
  INR: 83.12, // 1 USD = 83.12 INR
  CHF: 0.88, // 1 USD = 0.88 CHF
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  CHF: "CHF",
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    // Load from localStorage or default to USD
    const saved = localStorage.getItem("selectedCurrency") as Currency;
    return saved || "USD";
  });

  // Save to localStorage whenever currency changes
  useEffect(() => {
    localStorage.setItem("selectedCurrency", selectedCurrency);
  }, [selectedCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates: EXCHANGE_RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};

export { EXCHANGE_RATES, CURRENCY_SYMBOLS };
