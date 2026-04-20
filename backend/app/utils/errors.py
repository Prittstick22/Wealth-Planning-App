"""Error codes and custom exception classes"""

class CalculationError(Exception):
    """Base calculation error"""
    def __init__(self, code: str, message: str, user_message: str):
        self.code = code
        self.message = message
        self.user_message = user_message
        super().__init__(self.message)

class InvalidInputError(CalculationError):
    """Invalid input parameters"""
    pass

class CalculationFailedError(CalculationError):
    """Calculation process failed"""
    pass

# Error codes and messages
ERROR_CODES = {
    "ERR_INVALID_AMOUNT": {
        "message": "Invalid amount provided",
        "user_message": "Please enter a valid amount (must be a positive number)"
    },
    "ERR_INVALID_RATE": {
        "message": "Invalid interest rate",
        "user_message": "Interest rate must be between 0% and 100%"
    },
    "ERR_INVALID_FREQUENCY": {
        "message": "Invalid frequency specified",
        "user_message": "Frequency must be 'monthly', 'quarterly', or 'annually'"
    },
    "ERR_INVALID_DURATION": {
        "message": "Invalid duration",
        "user_message": "Years must be non-negative, and months must be between 0-11"
    },
    "ERR_ZERO_WITHDRAWAL": {
        "message": "Withdrawal amount cannot be zero",
        "user_message": "Please enter a withdrawal amount greater than 0"
    },
    "ERR_ZERO_CONTRIBUTION": {
        "message": "Contribution amount is zero",
        "user_message": "Contribution can be zero, but consider entering an amount to reach your goal faster"
    },
    "ERR_CALCULATION_FAILED": {
        "message": "Calculation could not be completed",
        "user_message": "An error occurred during calculation. Please check your inputs and try again"
    },
    "ERR_INTERNAL": {
        "message": "Internal server error",
        "user_message": "An unexpected error occurred. Please try again later or contact support"
    }
}

def get_error_detail(code: str, details: str = ""):
    """Get error detail for a given code"""
    error_info = ERROR_CODES.get(code, ERROR_CODES["ERR_INTERNAL"])
    result = {
        "code": code,
        "message": error_info["user_message"],
        "help": f"Need help? Check that all values are valid and positive."
    }
    if details:
        result["details"] = details
    return result
