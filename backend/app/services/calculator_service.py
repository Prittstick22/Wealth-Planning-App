from typing import Any, Dict, List
from .financial_engine import FinancialEngine, MonthlySnapshot

class CalculatorService:
    """Business logic layer for calculator operations."""

    @staticmethod
    def format_timeline_for_response(snapshots: List[MonthlySnapshot]) -> List[Dict[str, Any]]:
        """Convert MonthlySnapshot objects to JSON-serializable dictionaries."""
        return [
            {
                "month": s.month,
                "date": s.date.isoformat(),
                "beginning_balance": round(s.beginning_balance, 2),
                "contribution": round(s.contribution, 2),
                "interest": round(s.interest, 2),
                "withdrawal": round(s.withdrawal, 2),
                "ending_balance": round(s.ending_balance, 2),
            }
            for s in snapshots
        ]

    @staticmethod
    def calculate_growth_plan(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        contribution_amount: float,
        contribution_frequency: str,
        years: int,
        months: int,
        include_breakdown: bool = False,
    ) -> Dict[str, Any]:
        """Calculate and format growth plan response."""
        timeline, final_balance, total_contributions, total_interest = FinancialEngine.calculate_growth(
            starting_amount=starting_amount,
            annual_rate=annual_rate,
            compounding_frequency=compounding_frequency,
            contribution_amount=contribution_amount,
            contribution_frequency=contribution_frequency,
            years=years,
            months=months,
        )

        # Prepare chart data (monthly intervals)
        chart_data = CalculatorService.format_timeline_for_response(timeline)

        # If breakdown requested, include yearly summary
        breakdown_data = []
        if include_breakdown:
            breakdown_data = CalculatorService.generate_yearly_breakdown(timeline)

        return {
            "summary": {
                "final_balance": round(final_balance, 2),
                "total_contributions": round(total_contributions, 2),
                "total_interest": round(total_interest, 2),
                "duration_years": years,
                "duration_months": months,
            },
            "chart_data": chart_data,
            "breakdown": breakdown_data if include_breakdown else None,
        }

    @staticmethod
    def calculate_withdrawal_plan(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        withdrawal_amount: float,
        withdrawal_frequency: str,
    ) -> Dict[str, Any]:
        """Calculate and format withdrawal plan response."""
        timeline, total_withdrawn, runout_years, runout_months, is_infinite = FinancialEngine.calculate_withdrawal(
            starting_amount=starting_amount,
            annual_rate=annual_rate,
            compounding_frequency=compounding_frequency,
            withdrawal_amount=withdrawal_amount,
            withdrawal_frequency=withdrawal_frequency,
        )

        chart_data = CalculatorService.format_timeline_for_response(timeline)

        return {
            "summary": {
                "starting_amount": round(starting_amount, 2),
                "total_withdrawn": round(total_withdrawn, 2),
                "runout_years": "Infinite" if is_infinite else runout_years,
                "runout_months": "Infinite" if is_infinite else runout_months,
                "runout_date": "Never" if is_infinite else (chart_data[-1]["date"] if chart_data else None),
                "is_infinite": is_infinite,
            },
            "chart_data": chart_data,
        }

    @staticmethod
    def calculate_time_to_target_plan(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        contribution_amount: float,
        contribution_frequency: str,
        desired_monthly_withdrawal: float,
    ) -> Dict[str, Any]:
        """Calculate and format time-to-target plan response."""
        timeline, required_portfolio, withdrawal_rule_percent, years_needed, months_needed = FinancialEngine.calculate_time_to_target(
            starting_amount=starting_amount,
            annual_rate=annual_rate,
            compounding_frequency=compounding_frequency,
            contribution_amount=contribution_amount,
            contribution_frequency=contribution_frequency,
            desired_monthly_withdrawal=desired_monthly_withdrawal,
        )

        chart_data = CalculatorService.format_timeline_for_response(timeline)

        return {
            "summary": {
                "required_portfolio_amount": round(required_portfolio, 2),
                "current_amount": round(starting_amount, 2),
                "shortfall": round(max(0, required_portfolio - starting_amount), 2),
                "years_to_target": years_needed,
                "months_to_target": months_needed,
                "desired_monthly_withdrawal": round(desired_monthly_withdrawal, 2),
                "withdrawal_rule_percent": withdrawal_rule_percent,
            },
            "chart_data": chart_data,
        }

    @staticmethod
    def generate_yearly_breakdown(snapshots: List[MonthlySnapshot]) -> List[Dict[str, Any]]:
        """Generate yearly summary from monthly timeline."""
        yearly_data = {}

        for snapshot in snapshots:
            year = (snapshot.month - 1) // 12 + 1

            if year not in yearly_data:
                yearly_data[year] = {
                    "year": year,
                    "total_contributions": 0.0,
                    "total_interest": 0.0,
                    "ending_balance": 0.0,
                }

            yearly_data[year]["total_contributions"] += snapshot.contribution
            yearly_data[year]["total_interest"] += snapshot.interest
            yearly_data[year]["ending_balance"] = snapshot.ending_balance

        return [
            {
                **data,
                "total_contributions": round(data["total_contributions"], 2),
                "total_interest": round(data["total_interest"], 2),
                "ending_balance": round(data["ending_balance"], 2),
            }
            for data in yearly_data.values()
        ]
