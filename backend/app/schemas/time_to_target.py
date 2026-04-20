from pydantic import BaseModel, Field
from typing import List, Dict, Any

class TimeToTargetRequest(BaseModel):
    starting_amount: float = Field(..., ge=0, description="Current investment amount")
    annual_rate: float = Field(..., ge=0, description="Annual interest rate (%) - can be any positive value")
    compounding_frequency: str = Field(
        ...,
        description="Compounding frequency: 'monthly', 'quarterly', or 'annually'"
    )
    contribution_amount: float = Field(..., ge=0, description="Contribution amount per period")
    contribution_frequency: str = Field(
        ...,
        description="Contribution frequency: 'monthly', 'quarterly', or 'annually'"
    )
    desired_monthly_withdrawal: float = Field(
        ...,
        gt=0,
        description="Desired monthly withdrawal amount in retirement"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "starting_amount": 50000,
                "annual_rate": 6,
                "compounding_frequency": "monthly",
                "contribution_amount": 1000,
                "contribution_frequency": "monthly",
                "desired_monthly_withdrawal": 5000,
            }
        }

class TimeToTargetResponse(BaseModel):
    summary: Dict[str, Any]
    chart_data: List[Dict[str, Any]]
