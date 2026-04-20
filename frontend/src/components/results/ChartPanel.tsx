import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TimelineDataPoint } from "../../types/calculator";
import { formatCurrency } from "../../services/formatting";

interface ChartPanelProps {
  data: TimelineDataPoint[];
  title?: string;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({
  data,
  title = "Growth Timeline",
}) => {
  const chartData = data.map((point) => ({
    month: point.month,
    "Ending Balance": point.ending_balance,
    "Total Contributed": data
      .slice(0, point.month)
      .reduce((sum, p) => sum + p.contribution, 0),
  }));

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              label={{ value: "Month", position: "insideBottomRight", offset: -5 }}
              stroke="#94a3b8"
            />
            <YAxis
              label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
              stroke="#94a3b8"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Ending Balance"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Total Contributed"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
