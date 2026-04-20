from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class GrowthRequest(BaseModel):
    starting_amount: float = Field(..., ge=0, description="Starting investment amount (can be 0)")
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
    years: int = Field(..., ge=0, description="Years for growth")
    months: int = Field(default=0, ge=0, le=11, description="Additional months")
    include_breakdown: bool = Field(default=False, description="Include yearly breakdown")

    class Config:
        json_schema_extra = {
            "example": {
                "starting_amount": 10000,
                "annual_rate": 5,
                "compounding_frequency": "monthly",
                "contribution_amount": 500,
                "contribution_frequency": "monthly",
                "years": 10,
                "months": 0,
                "include_breakdown": False,
            }
        }

class GrowthResponse(BaseModel):
    summary: Dict[str, Any]
    chart_data: List[Dict[str, Any]]
    breakdown: Optional[List[Dict[str, Any]]] = None
