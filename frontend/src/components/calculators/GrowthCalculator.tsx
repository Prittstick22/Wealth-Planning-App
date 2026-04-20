import React, { useState } from "react";
import { GrowthRequest, GrowthResponse } from "../../types/calculator";
import { FormInput, FormSelect, FormSection } from "../forms";
import { SummaryCard } from "../results/SummaryCard";
import { ChartPanel } from "../results/ChartPanel";
import { BreakdownTable } from "../results/BreakdownTable";
import { Loading, ErrorMessage, EmptyState } from "../common";
import { calculatorAPI } from "../../services/api";

interface ErrorDetail {
  code?: string;
  message?: string;
  help?: string;
  details?: string;
}

interface GrowthCalculatorProps {
  onTabChange?: (tabId: string) => void;
}

export const GrowthCalculator: React.FC<GrowthCalculatorProps> = () => {
  const [formData, setFormData] = useState<GrowthRequest>({
    starting_amount: 10000,
    annual_rate: 5,
    compounding_frequency: "monthly",
    contribution_amount: 500,
    contribution_frequency: "monthly",
    years: 10,
    months: 0,
    include_breakdown: false,
  });

  const [result, setResult] = useState<GrowthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | ErrorDetail | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target as HTMLInputElement | HTMLSelectElement;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      const numFieldNames = ["starting_amount", "annual_rate", "contribution_amount", "years", "months"];
      let numValue: any = value;
      
      if (numFieldNames.includes(name)) {
        // Allow empty string, otherwise parse as float
        numValue = value === "" ? "" : parseFloat(value);
        // If parseFloat returns NaN, keep the string as is
        if (isNaN(numValue)) {
          numValue = value;
        } else if (numValue < 0) {
          // Prevent negative values
          numValue = 0;
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError(null);
      // Convert empty strings to 0 for numeric fields
      const sanitizedData = {
        ...formData,
        starting_amount: formData.starting_amount === "" ? 0 : formData.starting_amount,
        annual_rate: formData.annual_rate === "" ? 0 : formData.annual_rate,
        contribution_amount: formData.contribution_amount === "" ? 0 : formData.contribution_amount,
        years: formData.years === "" ? 0 : formData.years,
        months: formData.months === "" ? 0 : formData.months,
      };
      const response = await calculatorAPI.calculateGrowth(sanitizedData);
      setResult(response);
    } catch (err: any) {
      // Handle both error objects and error strings
      setError(err instanceof Error ? { message: err.message } : err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      starting_amount: 10000,
      annual_rate: 5,
      compounding_frequency: "monthly",
      contribution_amount: 500,
      contribution_frequency: "monthly",
      years: 10,
      months: 0,
      include_breakdown: false,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-32">
          <h2 className="text-2xl font-bold text-white mb-6">Growth Calculator</h2>

          <FormSection title="Initial Investment">
            <FormInput
              label="Starting Amount ($)"
              name="starting_amount"
              type="number"
              value={formData.starting_amount}
              onChange={handleInputChange}
              min={0}
              step={100}
            />
          </FormSection>

          <FormSection title="Interest Rate">
            <FormInput
              label="Annual Interest Rate (%)"
              name="annual_rate"
              type="number"
              value={formData.annual_rate}
              onChange={handleInputChange}
              min={0}
              step={0.1}
            />
            <FormSelect
              label="Compounding Frequency"
              name="compounding_frequency"
              value={formData.compounding_frequency}
              onChange={handleInputChange}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
              ]}
            />
          </FormSection>

          <FormSection title="Contributions">
            <FormInput
              label="Contribution Amount ($)"
              name="contribution_amount"
              type="number"
              value={formData.contribution_amount}
              onChange={handleInputChange}
              min={0}
              step={50}
            />
            <FormSelect
              label="Contribution Frequency"
              name="contribution_frequency"
              value={formData.contribution_frequency}
              onChange={handleInputChange}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
              ]}
            />
          </FormSection>

          <FormSection title="Duration">
            <FormInput
              label="Years"
              name="years"
              type="number"
              value={formData.years}
              onChange={handleInputChange}
              min={0}
              step={1}
            />
            <FormInput
              label="Additional Months"
              name="months"
              type="number"
              value={formData.months}
              onChange={handleInputChange}
              min={0}
              max={11}
              step={1}
            />
          </FormSection>

          <label className="flex items-center gap-2 text-slate-300 mb-6">
            <input
              type="checkbox"
              name="include_breakdown"
              checked={formData.include_breakdown}
              onChange={handleInputChange}
              className="w-4 h-4 accent-accent rounded"
            />
            <span>Include Yearly Breakdown</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-6">
        {error && <ErrorMessage message={error} />}
        {loading && <Loading />}
        {!loading && !result && !error && <EmptyState />}

        {result && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <SummaryCard
                label="Final Balance"
                value={result.summary.final_balance}
                isCurrency
              />
              <SummaryCard
                label="Total Contributions"
                value={result.summary.total_contributions}
                isCurrency
              />
              <SummaryCard
                label="Total Interest Earned"
                value={result.summary.total_interest}
                isCurrency
              />
              <SummaryCard
                label="Duration"
                value={`${result.summary.duration_years}y ${result.summary.duration_months}m`}
                isCurrency={false}
              />
            </div>

            {/* Chart */}
            <ChartPanel data={result.chart_data} title="Growth Timeline" />

            {/* Breakdown Table */}
            {result.breakdown && result.breakdown.length > 0 && (
              <BreakdownTable data={result.breakdown} title="Yearly Breakdown" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
