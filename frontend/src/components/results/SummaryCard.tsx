import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { convertAndFormatCurrency } from "../../services/currency";

interface SummaryCardProps {
  label: string;
  value: string | number;
  isCurrency?: boolean;
  subtext?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  isCurrency = true,
  subtext,
}) => {
  const { selectedCurrency } = useCurrency();

  const displayValue =
    isCurrency && typeof value === "number"
      ? convertAndFormatCurrency(value, selectedCurrency)
      : value;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition">
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-white break-words">{displayValue}</p>
      {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
    </div>
  );
};
