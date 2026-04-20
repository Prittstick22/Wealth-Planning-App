from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List
from decimal import Decimal, ROUND_HALF_UP

@dataclass
class MonthlySnapshot:
    """Represents a single month in the financial timeline."""
    month: int
    date: datetime
    beginning_balance: float
    contribution: float
    interest: float
    withdrawal: float
    ending_balance: float

class FinancialEngine:
    """
    Core financial calculation engine using monthly simulation timeline.
    All calculations are performed on a month-by-month basis internally.
    """

    @staticmethod
    def round_to_cents(value: float) -> float:
        """Round to 2 decimal places using banker's rounding."""
        return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    @staticmethod
    def calculate_monthly_rate(annual_rate: float, compounding_frequency: str) -> float:
        """
        Calculate effective monthly rate based on compounding frequency.
        
        Args:
            annual_rate: Annual interest rate (e.g., 5 for 5%)
            compounding_frequency: "monthly", "quarterly", or "annually"
        
        Returns:
            Effective monthly rate as decimal
        """
        annual_rate_decimal = annual_rate / 100
        
        if compounding_frequency == "monthly":
            # Monthly compounding: (1 + r/12)^1 - 1
            monthly_rate = annual_rate_decimal / 12
        elif compounding_frequency == "quarterly":
            # Quarterly compounding converted to monthly equivalent
            # (1 + r/4)^(1/3) - 1
            quarterly_rate = annual_rate_decimal / 4
            monthly_rate = (1 + quarterly_rate) ** (1/3) - 1
        elif compounding_frequency == "annually":
            # Annual compounding converted to monthly equivalent
            # (1 + r)^(1/12) - 1
            monthly_rate = (1 + annual_rate_decimal) ** (1/12) - 1
        else:
            raise ValueError(f"Unknown compounding frequency: {compounding_frequency}")
        
        return monthly_rate

    @staticmethod
    def get_contribution_months(frequency: str) -> int:
        """
        Determine months between contributions.
        
        Returns:
            Number of months between contributions (1, 3, or 12)
        """
        if frequency == "monthly":
            return 1
        elif frequency == "quarterly":
            return 3
        elif frequency == "annually":
            return 12
        else:
            raise ValueError(f"Unknown contribution frequency: {frequency}")

    @staticmethod
    def calculate_growth(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        contribution_amount: float,
        contribution_frequency: str,
        years: int,
        months: int,
    ) -> tuple[List[MonthlySnapshot], float, float, float]:
        """
        Calculate compound growth over time with contributions.
        
        Returns:
            (timeline: List of monthly snapshots, final_balance, total_contributions, total_interest)
        """
        monthly_rate = FinancialEngine.calculate_monthly_rate(annual_rate, compounding_frequency)
        contribution_interval = FinancialEngine.get_contribution_months(contribution_frequency)
        
        total_months = years * 12 + months
        balance = starting_amount
        total_contributions = 0.0
        timeline: List[MonthlySnapshot] = []
        
        start_date = datetime.now()
        
        for month in range(1, total_months + 1):
            current_date = start_date + timedelta(days=30 * (month - 1))
            beginning_balance = FinancialEngine.round_to_cents(balance)
            
            # Apply contribution if due (at beginning of month)
            contribution = 0.0
            if month % contribution_interval == 0:
                contribution = contribution_amount
                balance += contribution
                total_contributions += contribution
            
            # Calculate interest on updated balance (includes contribution)
            interest = balance * monthly_rate
            interest = FinancialEngine.round_to_cents(interest)
            balance += interest
            
            # Apply withdrawal (used in withdrawal calculator)
            withdrawal = 0.0
            
            ending_balance = FinancialEngine.round_to_cents(balance)
            
            snapshot = MonthlySnapshot(
                month=month,
                date=current_date,
                beginning_balance=beginning_balance,
                contribution=contribution,
                interest=interest,
                withdrawal=withdrawal,
                ending_balance=ending_balance
            )
            timeline.append(snapshot)
        
        total_interest = ending_balance - starting_amount - total_contributions
        total_interest = FinancialEngine.round_to_cents(total_interest)
        
        return timeline, ending_balance, total_contributions, total_interest

    @staticmethod
    def calculate_withdrawal(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        withdrawal_amount: float,
        withdrawal_frequency: str,
    ) -> tuple[List[MonthlySnapshot], float, int, int, bool]:
        """
        Calculate when funds run out with periodic withdrawals.
        
        Returns:
            (timeline: List of monthly snapshots, total_withdrawn, runout_years, runout_months, is_infinite)
        """
        monthly_rate = FinancialEngine.calculate_monthly_rate(annual_rate, compounding_frequency)
        withdrawal_interval = FinancialEngine.get_contribution_months(withdrawal_frequency)
        
        balance = starting_amount
        total_withdrawn = 0.0
        timeline: List[MonthlySnapshot] = []
        
        start_date = datetime.now()
        month = 0
        
        # Safety limit to prevent infinite loops
        max_months = 600  # 50 years
        
        while balance > 0 and month < max_months:
            month += 1
            current_date = start_date + timedelta(days=30 * (month - 1))
            beginning_balance = FinancialEngine.round_to_cents(balance)
            
            # Calculate interest
            interest = balance * monthly_rate
            interest = FinancialEngine.round_to_cents(interest)
            balance += interest
            
            # Apply withdrawal if due
            withdrawal = 0.0
            if month % withdrawal_interval == 0:
                withdrawal = min(withdrawal_amount, balance)
                balance -= withdrawal
                total_withdrawn += withdrawal
            
            ending_balance = FinancialEngine.round_to_cents(balance)
            
            snapshot = MonthlySnapshot(
                month=month,
                date=current_date,
                beginning_balance=beginning_balance,
                contribution=0.0,
                interest=interest,
                withdrawal=withdrawal,
                ending_balance=ending_balance
            )
            timeline.append(snapshot)
            
            if ending_balance <= 0:
                break
        
        # Check if money never runs out (hit max_months with positive balance)
        is_infinite = balance > 0 and month == max_months
        
        runout_years = month // 12
        runout_months = month % 12
        
        return timeline, total_withdrawn, runout_years, runout_months, is_infinite

    @staticmethod
    def calculate_time_to_target(
        starting_amount: float,
        annual_rate: float,
        compounding_frequency: str,
        contribution_amount: float,
        contribution_frequency: str,
        desired_monthly_withdrawal: float,
    ) -> tuple[List[MonthlySnapshot], float, float, int, int]:
        """
        Calculate time needed to reach a target portfolio using the 4% rule.
        
        The 4% rule states that you can safely withdraw 4% of your portfolio annually.
        Required portfolio = (desired_monthly_withdrawal * 12) / 0.04
        
        Returns:
            (timeline: List of monthly snapshots, required_portfolio, withdrawal_rule_percent, years_needed, months_needed)
        """
        withdrawal_rule_percent = 4.0
        required_portfolio = (desired_monthly_withdrawal * 12) / (withdrawal_rule_percent / 100)
        
        monthly_rate = FinancialEngine.calculate_monthly_rate(annual_rate, compounding_frequency)
        contribution_interval = FinancialEngine.get_contribution_months(contribution_frequency)
        
        balance = starting_amount
        timeline: List[MonthlySnapshot] = []
        
        start_date = datetime.now()
        month = 0
        
        # Safety limit
        max_months = 600
        
        while balance < required_portfolio and month < max_months:
            month += 1
            current_date = start_date + timedelta(days=30 * (month - 1))
            beginning_balance = FinancialEngine.round_to_cents(balance)
            
            # Calculate interest
            interest = balance * monthly_rate
            interest = FinancialEngine.round_to_cents(interest)
            balance += interest
            
            # Apply contribution if due
            contribution = 0.0
            if month % contribution_interval == 0:
                contribution = contribution_amount
                balance += contribution
            
            ending_balance = FinancialEngine.round_to_cents(balance)
            
            snapshot = MonthlySnapshot(
                month=month,
                date=current_date,
                beginning_balance=beginning_balance,
                contribution=contribution,
                interest=interest,
                withdrawal=0.0,
                ending_balance=ending_balance
            )
            timeline.append(snapshot)
        
        years_needed = month // 12
        months_needed = month % 12
        
        return timeline, required_portfolio, withdrawal_rule_percent, years_needed, months_needed
