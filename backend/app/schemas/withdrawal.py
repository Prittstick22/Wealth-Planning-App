from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WithdrawalRequest(BaseModel):
    starting_amount: float = Field(..., ge=0.01, description="Starting portfolio amount (must be greater than 0)")
    annual_rate: float = Field(..., ge=0, description="Annual interest rate (%) - can be any positive value")
    compounding_frequency: str = Field(
        ...,
        description="Compounding frequency: 'monthly', 'quarterly', or 'annually'"
    )
    withdrawal_amount: float = Field(..., gt=0, description="Withdrawal amount per period (must be greater than 0)")
    withdrawal_frequency: str = Field(
        ...,
        description="Withdrawal frequency: 'monthly', 'quarterly', or 'annually'"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "starting_amount": 500000,
                "annual_rate": 5,
                "compounding_frequency": "monthly",
                "withdrawal_amount": 2000,
                "withdrawal_frequency": "monthly",
            }
        }

class WithdrawalResponse(BaseModel):
    summary: Dict[str, Any]
    chart_data: List[Dict[str, Any]]
