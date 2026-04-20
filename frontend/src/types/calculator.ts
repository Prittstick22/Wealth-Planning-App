export interface GrowthRequest {
  starting_amount: number | string;
  annual_rate: number | string;
  compounding_frequency: "monthly" | "quarterly" | "annually";
  contribution_amount: number | string;
  contribution_frequency: "monthly" | "quarterly" | "annually";
  years: number | string;
  months: number | string;
  include_breakdown?: boolean;
}

export interface WithdrawalRequest {
  starting_amount: number | string;
  annual_rate: number | string;
  compounding_frequency: "monthly" | "quarterly" | "annually";
  withdrawal_amount: number | string;
  withdrawal_frequency: "monthly" | "quarterly" | "annually";
}

export interface TimeToTargetRequest {
  starting_amount: number | string;
  annual_rate: number | string;
  compounding_frequency: "monthly" | "quarterly" | "annually";
  contribution_amount: number | string;
  contribution_frequency: "monthly" | "quarterly" | "annually";
  desired_monthly_withdrawal: number | string;
}

export interface TimelineDataPoint {
  month: number;
  date: string;
  beginning_balance: number;
  contribution: number;
  interest: number;
  withdrawal: number;
  ending_balance: number;
}

export interface GrowthResponse {
  summary: {
    final_balance: number;
    total_contributions: number;
    total_interest: number;
    duration_years: number;
    duration_months: number;
  };
  chart_data: TimelineDataPoint[];
  breakdown?: Array<{
    year: number;
    total_contributions: number;
    total_interest: number;
    ending_balance: number;
  }>;
}

export interface WithdrawalResponse {
  summary: {
    starting_amount: number;
    total_withdrawn: number;
    runout_years: number | string;
    runout_months: number | string;
    runout_date: string | null;
    is_infinite: boolean;
  };
  chart_data: TimelineDataPoint[];
}

export interface TimeToTargetResponse {
  summary: {
    required_portfolio_amount: number;
    current_amount: number;
    shortfall: number;
    years_to_target: number;
    months_to_target: number;
    desired_monthly_withdrawal: number;
    withdrawal_rule_percent: number;
  };
  chart_data: TimelineDataPoint[];
}
