import React, { useState } from "react";
import { WithdrawalRequest, WithdrawalResponse } from "../../types/calculator";
import { FormInput, FormSelect, FormSection } from "../forms";
import { SummaryCard } from "../results/SummaryCard";
import { ChartPanel } from "../results/ChartPanel";
import { Loading, ErrorMessage, EmptyState } from "../common";
import { calculatorAPI } from "../../services/api";

interface ErrorDetail {
  code?: string;
  message?: string;
  help?: string;
  details?: string;
}

export const WithdrawalCalculator: React.FC = () => {
  const [formData, setFormData] = useState<WithdrawalRequest>({
    starting_amount: 500000,
    annual_rate: 5,
    compounding_frequency: "monthly",
    withdrawal_amount: 2000,
    withdrawal_frequency: "monthly",
  });

  const [result, setResult] = useState<WithdrawalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | ErrorDetail | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

    const numFieldNames = ["starting_amount", "annual_rate", "withdrawal_amount"];
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
        withdrawal_amount: formData.withdrawal_amount === "" ? 0 : formData.withdrawal_amount,
      };
      const response = await calculatorAPI.calculateWithdrawal(sanitizedData);
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
      starting_amount: 500000,
      annual_rate: 5,
      compounding_frequency: "monthly",
      withdrawal_amount: 2000,
      withdrawal_frequency: "monthly",
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-32">
          <h2 className="text-2xl font-bold text-white mb-6">Withdrawal Calculator</h2>

          <FormSection title="Portfolio">
            <FormInput
              label="Starting Amount ($)"
              name="starting_amount"
              type="number"
              value={formData.starting_amount}
              onChange={handleInputChange}
              min={0}
              step={1000}
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

          <FormSection title="Withdrawals">
            <FormInput
              label="Withdrawal Amount ($)"
              name="withdrawal_amount"
              type="number"
              value={formData.withdrawal_amount}
              onChange={handleInputChange}
              min={0}
              step={100}
            />
            <FormSelect
              label="Withdrawal Frequency"
              name="withdrawal_frequency"
              value={formData.withdrawal_frequency}
              onChange={handleInputChange}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
              ]}
            />
          </FormSection>

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
                label="Starting Amount"
                value={result.summary.starting_amount}
                isCurrency
              />
              <SummaryCard
                label="Total Withdrawn"
                value={result.summary.total_withdrawn}
                isCurrency
              />
              <SummaryCard
                label="Runout Date"
                value={
                  result.summary.is_infinite
                    ? "Infinity"
                    : `${result.summary.runout_years}y ${result.summary.runout_months}m`
                }
                isCurrency={false}
              />
              <SummaryCard
                label="Status"
                value="Calculation Complete"
                isCurrency={false}
              />
            </div>

            {/* Chart */}
            <ChartPanel data={result.chart_data} title="Withdrawal Timeline" />
          </>
        )}
      </div>
    </div>
  );
};
