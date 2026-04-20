import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .config import settings
from .routes.calculators import router as calculator_router
from .utils.logger import log_info, log_error

app = FastAPI(title=settings.API_TITLE, version=settings.API_VERSION)

# Log startup
log_info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with user-friendly messages"""
    errors = exc.errors()
    
    # Extract first error for user-friendly message
    first_error = errors[0] if errors else {}
    field = first_error.get("loc", [None])[-1] if first_error.get("loc") else "unknown"
    error_type = first_error.get("type", "unknown")
    
    # Map specific field/error combinations to user-friendly messages
    field_specific_messages = {
        ("starting_amount", "greater_than"): "Starting amount must be greater than 0 (you need money to withdraw)",
        ("starting_amount", "greater_than_equal"): "Starting amount must be greater than 0 (you need money to withdraw)",
        ("withdrawal_amount", "greater_than"): "Withdrawal amount must be greater than 0",
        ("withdrawal_amount", "greater_than_equal"): "Withdrawal amount must be greater than 0",
        ("desired_monthly_withdrawal", "greater_than"): "Desired monthly withdrawal must be greater than 0",
        ("desired_monthly_withdrawal", "greater_than_equal"): "Desired monthly withdrawal must be greater than 0",
    }
    
    # Special handling for starting_amount in any error context
    if field == "starting_amount":
        user_message = "Starting amount must be greater than 0 (you need money to withdraw)"
    else:
        # Check for field-specific message first
        user_message = field_specific_messages.get((field, error_type))
        if not user_message:
            # Map error types to user-friendly messages
            error_messages = {
                "greater_than": f"'{field}' must be greater than 0",
                "greater_than_equal": f"'{field}' must be a positive number or 0",
                "less_than_equal": f"'{field}' must be less than or equal to the maximum value",
                "type_error": f"'{field}' must be a valid number",
            }
            user_message = error_messages.get(error_type, f"Invalid value for '{field}'")
    
    log_error("ERR_VALIDATION", "Request validation failed", f"Field: {field}, Type: {error_type}, Errors: {str(errors)}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": [
                {
                    "loc": list(first_error.get("loc", [])),
                    "msg": user_message,
                    "type": error_type,
                }
            ],
            "code": "ERR_VALIDATION",
            "message": user_message,
            "help": "Please check your input values. All fields must be filled with valid positive numbers.",
        },
    )

# Include routes
app.include_router(calculator_router)

@app.get("/")
async def root():
    return {"message": "Wealth Planning API", "status": "running"}

@app.get("/health")
async def health_check():
    log_info("Health check requested")
    return {"status": "ok"}
