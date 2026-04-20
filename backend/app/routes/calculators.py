from fastapi import APIRouter, HTTPException
from ..schemas.growth import GrowthRequest, GrowthResponse
from ..schemas.withdrawal import WithdrawalRequest, WithdrawalResponse
from ..schemas.time_to_target import TimeToTargetRequest, TimeToTargetResponse
from ..services.calculator_service import CalculatorService
from ..utils.logger import log_error, log_info
from ..utils.errors import get_error_detail

router = APIRouter(prefix="/calculate", tags=["calculators"])

@router.post("/growth", response_model=GrowthResponse)
async def calculate_growth(request: GrowthRequest) -> GrowthResponse:
    """
    Calculate compound growth with contributions.
    """
    try:
        log_info(f"Calculating growth with starting_amount={request.starting_amount}, annual_rate={request.annual_rate}%")
        
        # Validate inputs
        if request.starting_amount < 0:
            raise ValueError("Starting amount must be non-negative")
        if request.annual_rate < 0:
            raise ValueError("Annual rate must be non-negative")
        if request.contribution_amount < 0:
            raise ValueError("Contribution amount must be non-negative")
        
        result = CalculatorService.calculate_growth_plan(
            starting_amount=request.starting_amount,
            annual_rate=request.annual_rate,
            compounding_frequency=request.compounding_frequency,
            contribution_amount=request.contribution_amount,
            contribution_frequency=request.contribution_frequency,
            years=request.years,
            months=request.months,
            include_breakdown=request.include_breakdown,
        )
        log_info(f"Growth calculation successful: final_balance={result['summary']['final_balance']}")
        return GrowthResponse(**result)
    except ValueError as e:
        log_error("ERR_INVALID_AMOUNT", "Growth calculation failed", str(e))
        raise HTTPException(status_code=400, detail=get_error_detail("ERR_INVALID_AMOUNT", str(e)))
    except Exception as e:
        log_error("ERR_CALCULATION_FAILED", "Growth calculation error", str(e))
        raise HTTPException(status_code=500, detail=get_error_detail("ERR_CALCULATION_FAILED"))

@router.post("/withdrawal", response_model=WithdrawalResponse)
async def calculate_withdrawal(request: WithdrawalRequest) -> WithdrawalResponse:
    """
    Calculate when funds run out with periodic withdrawals.
    """
    try:
        log_info(f"Calculating withdrawal with starting_amount={request.starting_amount}, withdrawal_amount={request.withdrawal_amount}")
        
        # Validate inputs
        if request.starting_amount <= 0:
            raise ValueError("Starting amount must be greater than 0")
        if request.withdrawal_amount <= 0:
            raise ValueError("Withdrawal amount must be greater than 0")
        if request.annual_rate < 0:
            raise ValueError("Annual rate must be non-negative")
        
        result = CalculatorService.calculate_withdrawal_plan(
            starting_amount=request.starting_amount,
            annual_rate=request.annual_rate,
            compounding_frequency=request.compounding_frequency,
            withdrawal_amount=request.withdrawal_amount,
            withdrawal_frequency=request.withdrawal_frequency,
        )
        
        is_infinite = result['summary'].get('is_infinite', False)
        if is_infinite:
            log_info(f"Withdrawal calculation successful: funds never run out (infinite)")
        else:
            log_info(f"Withdrawal calculation successful: runout in {result['summary']['runout_years']}y {result['summary']['runout_months']}m")
        
        return WithdrawalResponse(**result)
    except ValueError as e:
        log_error("ERR_INVALID_AMOUNT", "Withdrawal calculation failed", str(e))
        raise HTTPException(status_code=400, detail=get_error_detail("ERR_INVALID_AMOUNT", str(e)))
    except Exception as e:
        log_error("ERR_CALCULATION_FAILED", "Withdrawal calculation error", str(e))
        raise HTTPException(status_code=500, detail=get_error_detail("ERR_CALCULATION_FAILED"))

@router.post("/time-to-target", response_model=TimeToTargetResponse)
async def calculate_time_to_target(request: TimeToTargetRequest) -> TimeToTargetResponse:
    """
    Calculate time needed to reach a target portfolio using the 4% rule.
    Uses 4% safe withdrawal rate: required_portfolio = (desired_monthly_withdrawal * 12) / 0.04
    """
    try:
        log_info(f"Calculating time to target with desired_monthly_withdrawal={request.desired_monthly_withdrawal}, annual_rate={request.annual_rate}%")
        
        # Validate inputs
        if request.starting_amount < 0:
            raise ValueError("Starting amount must be non-negative")
        if request.desired_monthly_withdrawal <= 0:
            raise ValueError("Desired monthly withdrawal must be greater than 0")
        if request.annual_rate < 0:
            raise ValueError("Annual rate must be non-negative")
        if request.contribution_amount < 0:
            raise ValueError("Contribution amount must be non-negative")
        
        result = CalculatorService.calculate_time_to_target_plan(
            starting_amount=request.starting_amount,
            annual_rate=request.annual_rate,
            compounding_frequency=request.compounding_frequency,
            contribution_amount=request.contribution_amount,
            contribution_frequency=request.contribution_frequency,
            desired_monthly_withdrawal=request.desired_monthly_withdrawal,
        )
        log_info(f"Time to target calculation successful: {result['summary']['years_to_target']}y {result['summary']['months_to_target']}m")
        return TimeToTargetResponse(**result)
    except ValueError as e:
        log_error("ERR_INVALID_AMOUNT", "Time to target calculation failed", str(e))
        raise HTTPException(status_code=400, detail=get_error_detail("ERR_INVALID_AMOUNT", str(e)))
    except Exception as e:
        log_error("ERR_CALCULATION_FAILED", "Time to target calculation error", str(e))
        raise HTTPException(status_code=500, detail=get_error_detail("ERR_CALCULATION_FAILED"))
