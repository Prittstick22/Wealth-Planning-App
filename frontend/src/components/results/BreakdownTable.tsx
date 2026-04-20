import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { convertAndFormatCurrency } from "../../services/currency";

interface BreakdownTableProps {
  data: Array<Record<string, string | number>>;
  title?: string;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({
  data,
  title = "Breakdown",
}) => {
  const { selectedCurrency } = useCurrency();
  
  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);
  
  // Columns that should NOT be formatted as currency
  const nonCurrencyColumns = ["year", "month", "years", "months", "runout_years", "runout_months"];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-semibold text-slate-300 bg-slate-900/50"
              >
                {col.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-700 hover:bg-slate-700/30 transition"
            >
              {columns.map((col) => (
                <td key={`${idx}-${col}`} className="px-4 py-3 text-slate-300">
                  {typeof row[col] === "number"
                    ? nonCurrencyColumns.includes(col.toLowerCase())
                      ? row[col].toLocaleString("en-US")
                      : convertAndFormatCurrency(row[col], selectedCurrency)
                    : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
