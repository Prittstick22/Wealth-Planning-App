import React, { useState } from "react";
import { TimeToTargetRequest, TimeToTargetResponse } from "../../types/calculator";
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

export const TimeToTargetCalculator: React.FC = () => {
  const [formData, setFormData] = useState<TimeToTargetRequest>({
    starting_amount: 50000,
    annual_rate: 6,
    compounding_frequency: "monthly",
    contribution_amount: 1000,
    contribution_frequency: "monthly",
    desired_monthly_withdrawal: 5000,
  });

  const [result, setResult] = useState<TimeToTargetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | ErrorDetail | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

    const numFieldNames = [
      "starting_amount",
      "annual_rate",
      "contribution_amount",
      "desired_monthly_withdrawal",
    ];
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
        contribution_amount: formData.contribution_amount === "" ? 0 : formData.contribution_amount,
        desired_monthly_withdrawal: formData.desired_monthly_withdrawal === "" ? 0 : formData.desired_monthly_withdrawal,
      };
      const response = await calculatorAPI.calculateTimeToTarget(sanitizedData);
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
      starting_amount: 50000,
      annual_rate: 6,
      compounding_frequency: "monthly",
      contribution_amount: 1000,
      contribution_frequency: "monthly",
      desired_monthly_withdrawal: 5000,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-32">
          <h2 className="text-2xl font-bold text-white mb-6">Time to Target</h2>

          <FormSection title="Current Situation">
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

          <FormSection title="Investment Returns">
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
              step={100}
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

          <FormSection title="Retirement Goal">
            <FormInput
              label="Desired Monthly Withdrawal ($)"
              name="desired_monthly_withdrawal"
              type="number"
              value={formData.desired_monthly_withdrawal}
              onChange={handleInputChange}
              min={0}
              step={500}
            />
            <p className="text-xs text-slate-400 mt-2">
              ℹ️ Using the <strong>4% Rule</strong>: We calculate how much portfolio you need to safely withdraw this amount monthly indefinitely.
            </p>
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
                label="Required Portfolio (4% Rule)"
                value={result.summary.required_portfolio_amount}
                isCurrency
              />
              <SummaryCard
                label="Shortfall"
                value={result.summary.shortfall}
                isCurrency
              />
              <SummaryCard
                label="Time to Target"
                value={`${result.summary.years_to_target}y ${result.summary.months_to_target}m`}
                isCurrency={false}
              />
              <SummaryCard
                label="Current Amount"
                value={result.summary.current_amount}
                isCurrency
              />
            </div>

            {/* Explanation */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <strong>4% Rule Explanation:</strong> To safely withdraw <strong>${result.summary.desired_monthly_withdrawal.toLocaleString()}</strong>/month indefinitely, you need a portfolio of <strong>${result.summary.required_portfolio_amount.toLocaleString()}</strong>. This allows 4% annual withdrawals (or {(result.summary.withdrawal_rule_percent)}% of portfolio value per year) without depleting your funds.
              </p>
            </div>

            {/* Chart */}
            <ChartPanel data={result.chart_data} title="Path to Target Portfolio" />
          </>
        )}
      </div>
    </div>
  );
};
